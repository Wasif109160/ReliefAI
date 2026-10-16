import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies } from '@/lib/server/cookies';

const ROLE_DASHBOARDS: Record<string, string> = {
  citizen: '/dashboard/citizen',
  rescue_team: '/dashboard/rescue',
  ngo: '/dashboard/ngo',
  government: '/dashboard/government',
  admin: '/dashboard/admin',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, token } = body;

    let targetUserId: string | null = null;
    let targetOtpId: string | null = null;

    // 1. Verify via 6-digit numeric OTP (Primary production mechanism)
    if (email && otp) {
      const cleanEmail = String(email).toLowerCase().trim();
      const cleanOtp = String(otp).trim();

      const otpRecord = await authDb.findValidEmailVerificationOtp(cleanEmail, cleanOtp);
      if (!otpRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired 6-digit verification code. Please double-check the code or click Resend.' },
          { status: 400 }
        );
      }

      targetUserId = otpRecord.userId;
      targetOtpId = otpRecord.id;
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
      return NextResponse.json({ error: 'User could not be identified' }, { status: 404 });
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
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email address. Please try again.' },
      { status: 500 }
    );
  }
}
