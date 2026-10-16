import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server/rbac';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';
import { UserRole } from '@/lib/types';
import { db } from '@/lib/db';

const ProvisionSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid official email address'),
  role: z.enum(['rescue_team', 'government', 'admin'] as const),
  organization: z.string().min(2, 'Official agency or unit name is required'),
  badgeNumber: z.string().optional(),
  assignedTeamId: z.string().optional(),
  assignedZone: z.string().min(2, 'Assigned operational zone is required'),
  phone: z.string().optional(),
  temporaryPassword: z.string().min(8).optional(),
});

export async function POST(req: Request) {
  const auth = await requireAuth(['admin']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const result = ProvisionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, role, organization, badgeNumber, assignedTeamId, assignedZone, phone, temporaryPassword } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Validate assignedTeamId references an existing responder team
    if (assignedTeamId && assignedTeamId.trim()) {
      const cleanTeamId = assignedTeamId.trim();
      const existingTeam = await db.getResponder(cleanTeamId);
      if (!existingTeam) {
        return NextResponse.json(
          {
            error: `Invalid team assignment: Responder team '${cleanTeamId}' does not exist.`,
            code: 'INVALID_TEAM_ASSIGNMENT',
          },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existing = await authDb.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this official email address already exists.' },
        { status: 409 }
      );
    }

    // Generate credentials & 6-digit first-login verification code
    const initialPass = temporaryPassword || `${role === 'rescue_team' ? 'Rescue' : 'Gov'}@${Math.floor(100000 + Math.random() * 900000)}`;
    const otp = securityUtils.generateNumericOtp();

    // Create user in database (isEmailVerified: false -> requires email OTP before dashboard access)
    const newUser = await authDb.createUser({
      name,
      displayName: `${name} (${organization})`,
      email: cleanEmail,
      password: initialPass,
      role: role as UserRole,
      organization,
      badgeNumber: badgeNumber || `BD-${role.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      assignedTeamId,
      assignedZone,
      phone: phone || '',
      isEmailVerified: false,
    });

    // Store first-login OTP
    await authDb.createEmailVerificationOtp(newUser.id, newUser.email, otp, 'activation', 1440); // 24 hours

    // Dispatch official account creation notification email
    await emailService.sendAccountProvisionedEmail(
      newUser.email,
      newUser.name,
      newUser.role,
      newUser.badgeNumber || organization,
      initialPass,
      otp
    );

    return NextResponse.json(
      {
        success: true,
        message: `Official ${role.toUpperCase()} credentials provisioned for ${name}. Verification email dispatched.`,
        user: authDb.sanitizeUser(newUser),
        temporaryPasswordPreview: process.env.NODE_ENV !== 'production' ? initialPass : undefined,
        otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Provision user error:', error);
    return NextResponse.json(
      { error: 'Failed to provision official personnel account' },
      { status: 500 }
    );
  }
}
