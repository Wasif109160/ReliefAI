import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server/rbac';
import { authDb } from '@/lib/server/auth-db';

const VerifyEmailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const result = VerifyEmailChangeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Valid email and 6-digit code are required', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { newEmail, otp } = result.data;
    const cleanEmail = newEmail.toLowerCase().trim();

    const otpRecord = await authDb.findValidEmailVerificationOtp(cleanEmail, otp, 'email_change');
    if (!otpRecord || otpRecord.userId !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code for this email address.' },
        { status: 400 }
      );
    }

    // Invalidate OTP
    await authDb.markEmailVerificationOtpUsed(otpRecord.id);

    // Update user's email in database
    await authDb.updateUserProfile(auth.user.userId, {
      email: cleanEmail,
      isEmailVerified: true,
    });

    const updatedUser = await authDb.findUserById(auth.user.userId);

    return NextResponse.json({
      success: true,
      message: 'Your email address has been successfully updated.',
      user: updatedUser ? authDb.sanitizeUser(updatedUser) : null,
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    return NextResponse.json({ error: 'Failed to verify email change' }, { status: 500 });
  }
}
