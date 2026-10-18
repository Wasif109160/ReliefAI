import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies } from '@/lib/server/cookies';
import { securityUtils, getClientIp } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

const ROLE_DASHBOARDS: Record<string, string> = {
  citizen: '/dashboard/citizen',
  rescue_team: '/dashboard/rescue',
  responder: '/dashboard/rescue',
  commander: '/command',
  volunteer: '/dashboard/volunteer',
  ngo: '/dashboard/ngo',
  government: '/dashboard/government',
  admin: '/dashboard/admin',
};

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/verify-email');
  if (showcaseBlock) return showcaseBlock;

  // Rate limiting: max 10 verification attempts per 60s per client IP
  const clientIp = getClientIp(req);
  const rateLimit = await securityUtils.checkPublicRateLimit(clientIp, 'VERIFY_EMAIL', 10, 60 * 1000);
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
    const { email, otp, token } = body;

    let targetUserId: string | null = null;
    let targetOtpId: string | null = null;

    // 1. Verify via 6-digit numeric OTP (Primary production mechanism)
    if (email && otp) {
      const cleanEmail = String(email).toLowerCase().trim();
      const cleanOtp = String(otp).trim();

      const activeOtp = await authDb.findActiveEmailVerificationOtp(cleanEmail);
      if (!activeOtp || (activeOtp.attempts !== undefined && activeOtp.attempts >= 5)) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code. If you continue having trouble, please request a new code.' },
          { status: 400 }
        );
      }

      if (activeOtp.otp !== cleanOtp) {
        const { isLockedOut } = await authDb.incrementEmailVerificationOtpAttempts(cleanEmail);
        if (isLockedOut) {
          return NextResponse.json(
            { error: 'Maximum verification attempts exceeded. For security, this verification code has been invalidated. Please request a new code.' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: 'Invalid or expired verification code. Please check the code or request a new one.' },
          { status: 400 }
        );
      }

      targetUserId = activeOtp.userId;
      targetOtpId = activeOtp.id;
    }
    // 2. Fallback to legacy token if provided
    else if (token) {
      const tokenRecord = await authDb.findValidEmailVerificationToken(token);
      if (!tokenRecord) {
        return NextResponse.json(
          { error: 'This verification token is invalid or has expired.' },
          { status: 400 }
        );
      }
      targetUserId = tokenRecord.userId;
      await authDb.markEmailVerificationTokenUsed(token);
    } else {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Invalid or expired verification request.' }, { status: 400 });
    }

    // Mark user email verified in database
    await authDb.verifyUserEmail(targetUserId);
    if (targetOtpId) {
      await authDb.markEmailVerificationOtpUsed(targetOtpId);
    }

    const user = await authDb.findUserById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Dispatch official Welcome Email
    await emailService.sendWelcomeEmail(user.email, user.name, user.role);

    // Issue Session & HttpOnly Dual Tokens
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';
    const session = await authDb.createSession(user.id, ipAddress, userAgent);

    const familyId = `fam-${crypto.randomUUID()}`;
    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      familyId,
      sessionId: session.id,
    });
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await authDb.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId: session.id,
    });

    const targetDashboard = ROLE_DASHBOARDS[user.role] || '/dashboard/citizen';
    const sanitized = authDb.sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: 'Email successfully verified! Your operational account is activated.',
      user: sanitized,
      dashboardUrl: targetDashboard,
    });

    return setAuthCookies(response, {
      accessToken,
      refreshToken,
      rememberMe: false,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email address. Please try again.' },
      { status: 500 }
    );
  }
}
