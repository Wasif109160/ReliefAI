import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/rbac';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { securityUtils } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/admin/ngo-applications/review');
  if (showcaseBlock) return showcaseBlock;

  const auth = await requireAuth(['admin']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  let application;
  try {
    application = await authDb.findNGOApplicationById(id);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to find application' }, { status: 500 });
  }

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  try {
    const { action, adminNotes } = await req.json();

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 });
    }

    if (action === 'approve') {
      // 1. Generate secure credentials & 6-digit activation OTP
      const tempPassword = `Ngo@${Math.floor(100000 + Math.random() * 900000)}`;
      const activationOtp = securityUtils.generateNumericOtp();

      // 2. Check if user already exists
      let user = await authDb.findUserByEmail(application.focalPersonEmail);
      if (!user) {
        user = await authDb.createUser({
          name: application.focalPersonName,
          displayName: `${application.focalPersonName} (${application.organizationName})`,
          email: application.focalPersonEmail,
          password: tempPassword,
          role: 'ngo',
          organization: application.organizationName,
          phone: application.focalPersonPhone,
          assignedZone: application.operationalDistricts.join(', '),
          skills: application.reliefCapabilities,
          isEmailVerified: false, // Requires first-login OTP verification!
        });
      }

      // Store OTP for first-login verification
      await authDb.createEmailVerificationOtp(user.id, user.email, activationOtp, 'activation', 1440); // 24 hours

      // 3. Dispatch official Approval & Activation Email
      await emailService.sendNgoApprovedEmail(
        application.focalPersonEmail,
        application.focalPersonName,
        application.organizationName,
        tempPassword,
        activationOtp
      );

      // 4. Update application status
      const updated = await authDb.updateNGOApplication(id, {
        status: 'approved',
        adminNotes: adminNotes || 'Approved by Command Authority. Credentials dispatched.',
        reviewedBy: auth.user.name,
        reviewedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: `NGO application for ${application.organizationName} approved. Credentials and activation OTP dispatched.`,
        application: updated,
        provisionedEmail: user.email,
        tempPasswordPreview: process.env.NODE_ENV !== 'production' ? tempPassword : undefined,
      });
    } else {
      // Reject application
      const updated = await authDb.updateNGOApplication(id, {
        status: 'rejected',
        adminNotes: adminNotes || 'Application rejected by Command Authority.',
        reviewedBy: auth.user.name,
        reviewedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: `NGO application for ${application.organizationName} rejected.`,
        application: updated,
      });
    }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Review NGO application error:', error);
    return NextResponse.json({ error: 'Failed to review application' }, { status: 500 });
  }
}
