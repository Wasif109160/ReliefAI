import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { securityUtils, getClientIp } from '@/lib/server/security';

export async function GET() {
  try {
    const donations = await db.getDonations();
    const totalRaised = donations.reduce((acc, d) => acc + d.amount, 0);
    return NextResponse.json({ donations, totalRaised });
  } catch (err) {
    console.error('Error fetching donations:', err);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate limiting: max 15 donation attempts per 60s per client IP
  const clientIp = getClientIp(req);
  const rateLimit = await securityUtils.checkPublicRateLimit(clientIp, 'POST_DONATIONS', 15, 60 * 1000);
  if (!rateLimit.allowed) {
    const statusCode = rateLimit.status || (rateLimit.isBackendError ? 503 : 429);
    return NextResponse.json(
      {
        error: rateLimit.message,
        code: rateLimit.isBackendError ? 'RATE_LIMITER_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
      },
      {
        status: statusCode,
        headers: rateLimit.retryAfterSeconds
          ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
          : undefined,
      }
    );
  }

  try {
    const body = await req.json();
    const { donorName, amount, allocatedCause, currency } = body;
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid donation amount is required' }, { status: 400 });
    }

    const numAmount = Number(amount);
    let impactMetric = `${Math.floor(numAmount / 250)} Emergency Dry Rations & Oral Saline Delivered`;
    if (numAmount >= 10000) {
      impactMetric = `${Math.floor(numAmount / 1500)} Clean Water Filtration Kits Deployed`;
    }

    const created = await db.createDonation({
      donorName: donorName || 'Anonymous Humanitarian',
      amount: numAmount,
      currency: currency || 'BDT',
      allocatedCause: allocatedCause || 'Immediate Lifesaving Trauma & Water Aid (Sylhet & Sunamganj)',
      impactMetric,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
  }
}
