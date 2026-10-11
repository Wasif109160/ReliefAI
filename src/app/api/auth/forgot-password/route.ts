import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';

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
    const user = authDb.findUserByEmail(email);

    // If user not found, return generic success to prevent email scraping / enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    authDb.createPasswordResetToken(user.id, rawToken);

    const resetUrl = `/auth/reset-password?token=${rawToken}`;

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetUrl,
      resetToken: rawToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
