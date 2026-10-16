import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';

const ResetSchema = z.object({
  email: z.string().email().optional(),
  otp: z.string().optional(),
  token: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(req: Request) {
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
      const otpRecord = await authDb.findValidPasswordResetOtp(cleanEmail, cleanOtp);

      if (!otpRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired 6-digit reset code. Please check your email or request a new code.' },
          { status: 400 }
        );
      }
      userId = otpRecord.userId;
      tokenId = otpRecord.id;
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
      return NextResponse.json({ error: 'User could not be identified' }, { status: 404 });
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
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
