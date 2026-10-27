import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server/rbac';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/prisma';

const EmailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid new email address'),
});

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/request-email-change');
  if (showcaseBlock) return showcaseBlock;

  const auth = await requireAuth();
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const result = EmailChangeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Valid new email is required', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { newEmail } = result.data;
    const cleanEmail = newEmail.toLowerCase().trim();

    if (cleanEmail === auth.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'The new email address cannot be identical to your current email address.' },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existing = await authDb.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Rate limiting check
    const rateCheck = securityUtils.checkOtpRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = securityUtils.generateNumericOtp();
    await authDb.createEmailVerificationOtp(auth.user.userId, cleanEmail, otp, 'email_change', 10);

    // Send email change OTP to the new email address
    await emailService.sendEmailChangeOtpEmail(cleanEmail, auth.user.name, otp, 10);

    return NextResponse.json({
      success: true,
      message: `A 6-digit confirmation code has been dispatched to ${cleanEmail}. Please enter it to verify.`,
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Email change request error:', error);
    return NextResponse.json({ error: 'Failed to request email change' }, { status: 500 });
  }
}
