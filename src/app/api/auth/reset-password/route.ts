import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { securityUtils, getClientIp } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

const ResetSchema = z.object({
  email: z.string().email().optional(),
  otp: z.string().optional(),
  token: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/reset-password');
  if (showcaseBlock) return showcaseBlock;

  // Rate limiting: max 5 reset attempts per 60s per client IP
  const clientIp = getClientIp(req);
  const rateLimit = await securityUtils.checkPublicRateLimit(clientIp, 'RESET_PASSWORD', 5, 60 * 1000);
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
    const result = ResetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, otp, token, password } = result.data;
    let userId: string | null = null;
    let tokenId: string | null = null;

    // 1. Verify via 6-digit OTP
    if (email && otp) {
      const cleanEmail = email.toLowerCase().trim();
      const cleanOtp = otp.trim();

      const activeOtp = await authDb.findActivePasswordResetOtp(cleanEmail);
      if (!activeOtp || (activeOtp.attempts !== undefined && activeOtp.attempts >= 5)) {
        return NextResponse.json(
          { error: 'Invalid or expired reset code. Please request a new code.' },
          { status: 400 }
        );
      }

      if (activeOtp.otp !== cleanOtp && activeOtp.token !== cleanOtp) {
        const { isLockedOut } = await authDb.incrementPasswordResetOtpAttempts(cleanEmail);
        if (isLockedOut) {
          return NextResponse.json(
            { error: 'Maximum attempts exceeded. This reset code has been invalidated for security. Please request a new password reset.' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: 'Invalid or expired reset code. Please check your email or request a new code.' },
          { status: 400 }
        );
      }

      userId = activeOtp.userId;
      tokenId = activeOtp.id;
    }
    // 2. Fallback to legacy reset token
    else if (token) {
      const tokenRecord = await authDb.findValidPasswordResetToken(token);
      if (!tokenRecord) {
        return NextResponse.json(
          { error: 'This password reset link is invalid or has expired. Please request a new one.' },
          { status: 400 }
        );
      }
      userId = tokenRecord.userId;
      await authDb.markPasswordResetTokenUsed(token);
    } else {
      return NextResponse.json(
        { error: 'Email and 6-digit reset code are required.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired reset request.' }, { status: 400 });
    }

    // Update user password with bcrypt hashing
    await authDb.updateUserPassword(userId, password);

    // Invalidate reset code
    if (tokenId) {
      await authDb.markPasswordResetOtpUsed(tokenId);
    }

    // Revoke all existing sessions and refresh tokens for security
    await authDb.deleteUserSessions(userId);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new credentials.',
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
