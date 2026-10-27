import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { isDatabaseConfigured, checkDatabaseHealth, isDatabaseUnavailableError } from '@/lib/prisma';
import { securityUtils, getClientIp } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';

const BootstrapSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please provide a valid official email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  bootstrapSecret: z.string().optional(),
});

/**
 * Timing-safe string comparison to prevent timing attacks on bootstrap tokens.
 * Computes SHA-256 digests first to ensure equal length buffers and zero length-leakage.
 */
function constantTimeEquals(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/bootstrap');
  if (showcaseBlock) return showcaseBlock;

  const clientIp = getClientIp(req);

  // 1. Rate limiting: strictly max 3 attempts per minute per IP
  const rateLimit = await securityUtils.checkPublicRateLimit(clientIp, 'ADMIN_BOOTSTRAP', 3, 60 * 1000);
  if (!rateLimit.allowed) {
    const statusCode = rateLimit.status || (rateLimit.isBackendError ? 503 : 429);
    return NextResponse.json(
      {
        error: rateLimit.message,
        code: rateLimit.isBackendError ? 'RATE_LIMITER_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
      },
      { status: statusCode }
    );
  }

  // 2. Secret Gating: Check that ADMIN_BOOTSTRAP_SECRET is configured in environment
  const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!configuredSecret || configuredSecret.trim().length < 16) {
    return NextResponse.json(
      {
        error: 'Admin bootstrap is disabled on this deployment. Configure ADMIN_BOOTSTRAP_SECRET in environment to activate.',
        code: 'BOOTSTRAP_DISABLED',
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const result = BootstrapSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, bootstrapSecret } = result.data;
    const headerSecret = req.headers.get('x-bootstrap-secret');
    const providedSecret = (headerSecret || bootstrapSecret || '').trim();

    // 3. Verify Secret with constant-time equality
    if (!providedSecret || !constantTimeEquals(providedSecret, configuredSecret.trim())) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid bootstrap secret token.', code: 'INVALID_BOOTSTRAP_SECRET' },
        { status: 401 }
      );
    }

    // 4. If PostgreSQL is configured, ensure persistent storage is healthy before bootstrapping
    if (isDatabaseConfigured()) {
      try {
        const health = await checkDatabaseHealth();
        if (!health.healthy) {
          return NextResponse.json(
            { error: 'Database service is unavailable. Bootstrap aborted to preserve persistence integrity.', code: 'DATABASE_UNAVAILABLE' },
            { status: 503 }
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: `Database connection failure: ${err.message || 'Unable to reach PostgreSQL'}`, code: 'DATABASE_CONNECTION_ERROR' },
          { status: 503 }
        );
      }
    }

    // 5. One-time check: Enforce that NO administrator currently exists
    const hasAdmin = await authDb.hasAdminUser();
    if (hasAdmin) {
      return NextResponse.json(
        {
          error: 'An administrator account already exists on this platform. Bootstrap is permanently locked.',
          code: 'ADMIN_ALREADY_EXISTS',
        },
        { status: 409 }
      );
    }

    // 5. Check if user already exists with this email
    const cleanEmail = email.toLowerCase().trim();
    const existing = await authDb.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.', code: 'USER_EXISTS' },
        { status: 409 }
      );
    }

    // 6. Create root administrator account with bcrypt hashed password
    const adminUser = await authDb.createUser({
      name,
      displayName: name,
      email: cleanEmail,
      password, // Hashed using bcrypt in authDb.createUser
      role: 'admin',
      isEmailVerified: true,
      organization: 'ReliefAI Command & Control Authority',
      badgeNumber: `BD-ADM-ROOT-${Date.now().toString().slice(-4)}`,
      assignedZone: 'National Incident Operations Center (EOC)',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Initial platform administrator account successfully bootstrapped! You may now log in to the admin portal.',
        user: authDb.sanitizeUser(adminUser),
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('[ReliefAI Bootstrap Error]:', error);
    return NextResponse.json(
      { error: 'Failed to complete admin bootstrap.' },
      { status: 500 }
    );
  }
}
