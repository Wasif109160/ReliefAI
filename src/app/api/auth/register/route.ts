import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(7, 'Please enter a valid contact phone number'),
  role: z.string().optional().default('citizen'),
  locationName: z.string().optional(),
});

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/register');
  if (showcaseBlock) return showcaseBlock;

  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role, locationName } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Enforce Role-Based Registration Governance
    // Only Citizens can self-register publicly!
    if (role && role !== 'citizen') {
      return NextResponse.json(
        {
          error:
            'Public registration is strictly permitted for Citizens only. Rescue Team, NGO, Government, and Admin accounts are provisioned exclusively through official administration channels or the NGO accreditation workflow.',
          code: 'FORBIDDEN_ROLE_REGISTRATION',
        },
        { status: 403 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await authDb.findUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in or reset your password.' },
        { status: 409 }
      );
    }

    // 3. Check rate limiting for OTP generation
    const rateCheck = securityUtils.checkOtpRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message || 'Too many verification requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 4. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Create Citizen user (unverified until OTP entered)
    const user = await authDb.createUser({
      name,
      displayName: name,
      email: cleanEmail,
      passwordHash,
      role: 'citizen',
      phone,
      isEmailVerified: false,
      assignedZone: locationName || 'Bangladesh National Grid',
    });

    // 6. Generate 6-digit numeric OTP (10 minutes validity)
    const otp = securityUtils.generateNumericOtp();
    await authDb.createEmailVerificationOtp(user.id, user.email, otp, 'email_verification', 10);

    // 7. Dispatch verification email via email service
    await emailService.sendVerificationOtpEmail(user.email, user.name, otp, 10);

    // 8. Return response requiring OTP verification before login
    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: user.email,
        message: 'Account created! A 6-digit verification code has been dispatched to your email address.',
        otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}
