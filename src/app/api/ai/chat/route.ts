import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';
import { securityUtils, getClientIp } from '@/lib/server/security';
import { isDatabaseUnavailableError } from '@/lib/prisma';

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  // Rate limiting per user / IP
  const rateLimitId = auth.user.userId || getClientIp(req);
  const rateLimit = await securityUtils.checkPublicRateLimit(rateLimitId, 'AI_CHAT', 20, 60 * 1000);
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
    const { prompt, mode } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Role check: command mode requires operational/command roles
    const operationalRoles = ['admin', 'government', 'commander', 'rescue_team'];
    if (mode === 'command' && !operationalRoles.includes(auth.user.role)) {
      return NextResponse.json(
        {
          error: 'Forbidden: Operational clearance required for command-level incident synthesis',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Enrich with live context data from DB
    const stats = await db.getStats();
    const disasters = await db.getDisasters();
    const context = `Active Disasters: ${disasters.map((d) => `${d.title} (${d.status}, ${d.severity})`).join('; ')}. Stats: ${JSON.stringify(stats)}`;

    const response = await AIService.generateResponse(prompt, mode || 'command', context);
    const provider = AIService.getActiveProvider();

    return NextResponse.json({
      reply: response,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
