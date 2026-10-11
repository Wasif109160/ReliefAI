import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies } from '@/lib/server/cookies';
import { UserRole } from '@/lib/types';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['citizen', 'rescue_team', 'ngo', 'government', 'admin'] as const),
  phone: z.string().optional(),
  organization: z.string().optional(),
  badgeNumber: z.string().optional(),
  assignedZone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone, organization, badgeNumber, assignedZone } = result.data;

    // Check if user already exists
    const existingUser = authDb.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const user = authDb.createUser({
      name,
      displayName: name,
      email,
      passwordHash,
      role: role as UserRole,
      phone: phone || '',
      organization: organization || '',
      badgeNumber: badgeNumber || '',
      assignedZone: assignedZone || 'Dhaka Metropolitan Zone',
      skills: role === 'rescue_team' ? ['First Aid', 'SAR Certified'] : [],
      isEmailVerified: false,
    });

    // Create email verification token
    const verificationToken = crypto.randomBytes(24).toString('hex');
    authDb.createEmailVerificationToken(user.id, verificationToken);

    // Create session
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';
    const session = authDb.createSession(user.id, ipAddress, userAgent);

    // Create Refresh Token Family
    const familyId = `fam-${crypto.randomUUID()}`;
    const refreshToken = await signRefreshToken({
      userId: user.id,
      familyId,
      sessionId: session.id,
    });
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    authDb.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    // Sign Access Token
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
      message: 'Registration successful! Verification email generated.',
      user: sanitizedUser,
      verificationUrl: `/auth/verify-email?token=${verificationToken}`,
      verificationToken,
    }, { status: 201 });

    // Set secure HttpOnly cookies
    return setAuthCookies(response, {
      accessToken,
      refreshToken,
      rememberMe: false,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}
