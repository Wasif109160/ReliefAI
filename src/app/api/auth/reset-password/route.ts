import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';

const ResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

    const { token, password } = result.data;

    // Verify token validity
    const tokenRecord = authDb.findValidPasswordResetToken(token);
    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    authDb.updateUserPassword(tokenRecord.userId, passwordHash);

    // Invalidate the reset token
    authDb.markPasswordResetTokenUsed(token);

    // Revoke all existing sessions and refresh tokens for security
    authDb.deleteUserSessions(tokenRecord.userId);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new credentials.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
