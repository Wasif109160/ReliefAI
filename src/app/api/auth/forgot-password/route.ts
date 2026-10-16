import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';

const ForgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = ForgotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Valid email is required', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Rate Limiting Check
    const rateCheck = securityUtils.checkOtpRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message || 'Please wait before requesting another reset code.' },
        { status: 429 }
      );
    }

    const user = await authDb.findUserByEmail(cleanEmail);

    // If user not found, return generic success to prevent email scraping / enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email address, a 6-digit password reset code has been dispatched.',
      });
    }

    // 2. Generate 6-digit numeric OTP (10 minutes expiry)
    const otp = securityUtils.generateNumericOtp();
    await authDb.createPasswordResetOtp(user.id, user.email, otp, 10);

    // 3. Dispatch Password Reset OTP Email
    await emailService.sendPasswordResetOtpEmail(user.email, user.name, otp, 10);

    return NextResponse.json({
      success: true,
      email: user.email,
      message: 'A 6-digit password reset code has been dispatched to your email address.',
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
