import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const donations = db.getDonations();
  const totalRaised = donations.reduce((acc, d) => acc + d.amount, 0);
  return NextResponse.json({ donations, totalRaised });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donorName, amount, allocatedCause } = body;
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid donation amount is required' }, { status: 400 });
    }

    const numAmount = Number(amount);
    let impactMetric = `${Math.floor(numAmount / 25)} Emergency Rations & Blankets Delivered`;
    if (numAmount >= 1000) {
      impactMetric = `${Math.floor(numAmount / 150)} Clean Water Filtration Kits Deployed`;
    }

    const created = db.createDonation({
      donorName: donorName || 'Anonymous Supporter',
      amount: numAmount,
      currency: 'USD',
      allocatedCause: allocatedCause || 'Immediate Lifesaving Trauma & Water Aid',
      impactMetric,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
  }
}
