import { NextResponse } from 'next/server';
import { authDb } from '@/lib/server/auth-db';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const tokenRecord = authDb.findValidEmailVerificationToken(token);
    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'This email verification link is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Mark user verified
    const user = authDb.findUserById(tokenRecord.userId);
    if (user) {
      user.isEmailVerified = true;
    }

    // Invalidate verification token
    authDb.markEmailVerificationTokenUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Email address has been successfully verified.',
      user: user ? authDb.sanitizeUser(user) : null,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const tokenRecord = authDb.findValidEmailVerificationToken(token);
  if (!tokenRecord) {
    return NextResponse.json({ valid: false, error: 'Token is expired or invalid' }, { status: 400 });
  }

  return NextResponse.json({ valid: true, message: 'Token is valid' });
}
