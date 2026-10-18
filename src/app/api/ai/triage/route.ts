import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';
import { requireAuth } from '@/lib/server/rbac';
import { securityUtils, getClientIp } from '@/lib/server/security';

export async function POST(req: Request) {
  const auth = await requireAuth(['admin', 'government', 'rescue_team', 'commander', 'responder', 'ngo']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  // Rate limiting per user / IP
  const rateLimitId = auth.user.userId || getClientIp(req);
  const rateLimit = await securityUtils.checkPublicRateLimit(rateLimitId, 'AI_TRIAGE', 15, 60 * 1000);
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
    const analysis = await AIService.analyzeSOS({
      details: body.details || '',
      trappedCount: Number(body.trappedCount || 0),
      injuriesCount: Number(body.injuriesCount || 0),
      specialNeeds: body.specialNeeds || [],
      hasRisingWater: Boolean(body.hasRisingWater),
    });
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('AI Triage error:', err);
    return NextResponse.json({ error: 'Failed to run triage analysis' }, { status: 500 });
  }
}
