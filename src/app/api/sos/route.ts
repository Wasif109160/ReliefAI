import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AIService } from '@/lib/ai/ai-service';
import { securityUtils, getClientIp } from '@/lib/server/security';
import { requireAuth } from '@/lib/server/rbac';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/prisma';

export async function GET(req: Request) {
  const auth = await requireAuth(['admin', 'government', 'rescue_team', 'commander', 'responder', 'ngo']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    let requests = await db.getSOSRequests();
    if (priority) {
      requests = requests.filter((r) => r.priority === priority.toUpperCase());
    }
    if (status) {
      requests = requests.filter((r) => r.status === status.toLowerCase());
    }

    return NextResponse.json(requests);
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Error fetching SOS requests:', err);
    return NextResponse.json({ error: 'Failed to fetch SOS requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/sos');
  if (showcaseBlock) return showcaseBlock;

  // Rate limiting: max 10 SOS submissions per 60s per client IP
  const clientIp = getClientIp(req);
  const rateLimit = await securityUtils.checkPublicRateLimit(clientIp, 'POST_SOS', 10, 60 * 1000);
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

    if (!body.details || !body.reporterName) {
      return NextResponse.json({ error: 'Missing mandatory fields: details and reporterName' }, { status: 400 });
    }

    // Run AI Triage Engine on the SOS report
    const aiAnalysis = await AIService.analyzeSOS({
      details: body.details,
      trappedCount: Number(body.trappedCount || 0),
      injuriesCount: Number(body.injuriesCount || 0),
      specialNeeds: body.specialNeeds || [],
      hasRisingWater: Boolean(body.needsBoat),
    });

    const newSOS = await db.createSOS({
      reporterName: body.reporterName,
      phone: body.phone || '+880 1700-000000',
      disasterId: body.disasterId || 'dis-001',
      location: body.location || {
        address: body.address || 'Sylhet Division, Bangladesh',
        lat: body.lat || 24.8949,
        lng: body.lng || 91.8687,
      },
      urgencyScore: aiAnalysis.urgencyScore,
      priority: aiAnalysis.priority,
      details: body.details,
      trappedCount: Number(body.trappedCount || 0),
      injuriesCount: Number(body.injuriesCount || 0),
      specialNeeds: body.specialNeeds || [],
      needsBoat: Boolean(body.needsBoat || aiAnalysis.suggestedTeamType === 'swift_water'),
      needsMedical: Boolean(body.needsMedical || body.injuriesCount > 0),
      needsFoodWater: Boolean(body.needsFoodWater),
      aiTriageSummary: aiAnalysis.triageSummary,
    });

    return NextResponse.json({ sos: newSOS, aiAnalysis }, { status: 201 });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Error creating SOS:', err);
    return NextResponse.json({ error: 'Failed to process SOS request' }, { status: 500 });
  }
}
