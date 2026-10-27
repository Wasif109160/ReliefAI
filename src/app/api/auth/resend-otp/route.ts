import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/prisma';

const ResendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  type: z.enum(['email_verification', 'password_reset', 'login_verify', 'email_change']).optional().default('email_verification'),
});

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/resend-otp');
  if (showcaseBlock) return showcaseBlock;

  try {
    const body = await req.json();
    const result = ResendSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Valid email address is required', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, type } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Rate Limiting Check (Cooldown 60s, max 5 per 15 mins)
    const rateCheck = securityUtils.checkOtpRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.message || 'Please wait before requesting another verification code.',
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Locate User Record
    const user = await authDb.findUserByEmail(cleanEmail);
    if (!user) {
      // Return generic message to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification code has been dispatched.',
      });
    }

    if (user.isEmailVerified && type === 'email_verification') {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'This account has already been verified. You may proceed directly to login.',
      });
    }

    // 3. Generate New 6-Digit Numeric OTP (10 mins)
    const otp = securityUtils.generateNumericOtp();

    if (type === 'password_reset') {
      await authDb.createPasswordResetOtp(user.id, user.email, otp, 10);
      await emailService.sendPasswordResetOtpEmail(user.email, user.name, otp, 10);
    } else {
      await authDb.createEmailVerificationOtp(user.id, user.email, otp, type, 10);
      await emailService.sendVerificationOtpEmail(user.email, user.name, otp, 10);
    }

    return NextResponse.json({
      success: true,
      message: 'A fresh 6-digit verification code has been dispatched to your email.',
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch verification code. Please try again.' },
      { status: 500 }
    );
  }
}
