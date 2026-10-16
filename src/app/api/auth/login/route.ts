import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies } from '@/lib/server/cookies';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';

const LoginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

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
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid login details', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Account Lockout Protection (Checks for 5 consecutive failed attempts)
    const lockoutStatus = securityUtils.checkAccountLockout(cleanEmail);
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        {
          error: lockoutStatus.message || 'Account temporarily locked. Please try again later.',
          code: 'ACCOUNT_LOCKED',
          remainingMinutes: lockoutStatus.remainingMinutes,
        },
        { status: 423 }
      );
    }

    // 2. Locate User Record
    const user = await authDb.findUserByEmail(cleanEmail);
    if (!user) {
      const failInfo = securityUtils.recordFailedLogin(cleanEmail);
      return NextResponse.json(
        {
          error: failInfo.isLockedNow
            ? failInfo.message
            : 'Invalid email or password. Please verify credentials.',
          code: failInfo.isLockedNow ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // 3. Verify Password via bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      const failInfo = securityUtils.recordFailedLogin(cleanEmail);
      return NextResponse.json(
        {
          error: failInfo.message || 'Invalid email or password.',
          code: failInfo.isLockedNow ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS',
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Credentials Verified -> Reset Failed Attempts Counter
    securityUtils.recordSuccessfulLogin(cleanEmail);

    // 4. Email Verification Check
    // "If the email is not verified, redirect to Email Verification. Allow login only after email verification."
    if (!user.isEmailVerified) {
      // Generate a fresh 6-digit OTP
      const otp = securityUtils.generateNumericOtp();
      await authDb.createEmailVerificationOtp(user.id, user.email, otp, 'login_verify', 10);
      await emailService.sendVerificationOtpEmail(user.email, user.name, otp, 10);

      return NextResponse.json(
        {
          error:
            'Email verification is required before accessing your operational dashboard. A 6-digit verification code has been dispatched to your email address.',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
          requiresVerification: true,
          otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
        },
        { status: 403 }
      );
    }

    // 5. Create Session
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';
    const session = await authDb.createSession(user.id, ipAddress, userAgent);

    // 6. Refresh Token Rotation (Family-based Revocation)
    const familyId = `fam-${crypto.randomUUID()}`;
    const refreshToken = await signRefreshToken(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        familyId,
        sessionId: session.id,
      },
      rememberMe
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiryMs = (rememberMe ? 30 : 7) * 86400000;
    await authDb.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + expiryMs).toISOString(),
    });

    // 7. Sign Access Token (15m validity)
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId: session.id,
    });

    const sanitizedUser = authDb.sanitizeUser(user);
    const targetDashboard = ROLE_DASHBOARDS[user.role] || '/dashboard/citizen';

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Access granted.',
      user: sanitizedUser,
      dashboardUrl: targetDashboard,
    });

    // 8. Attach Secure HttpOnly Cookies
    return setAuthCookies(response, {
      accessToken,
      refreshToken,
      rememberMe,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal authentication error. Please try again.' },
      { status: 500 }
    );
  }
}
