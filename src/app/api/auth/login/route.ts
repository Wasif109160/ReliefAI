import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies } from '@/lib/server/cookies';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

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

    // Find user
    const user = authDb.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';
    const session = authDb.createSession(user.id, ipAddress, userAgent);

    // Refresh Token Rotation - create new token family
    const familyId = `fam-${crypto.randomUUID()}`;
    const refreshToken = await signRefreshToken(
      {
        userId: user.id,
        familyId,
        sessionId: session.id,
      },
      rememberMe
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiryMs = (rememberMe ? 30 : 7) * 86400000;
    authDb.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + expiryMs).toISOString(),
    });

    // Sign Access Token (15m)
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId: session.id,
    });

    const sanitizedUser = authDb.sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: sanitizedUser,
    });

    return setAuthCookies(response, {
      accessToken,
      refreshToken,
      rememberMe,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal authentication error' },
      { status: 500 }
    );
  }
}
