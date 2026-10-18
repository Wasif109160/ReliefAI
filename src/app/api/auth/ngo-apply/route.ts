import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { emailService } from '@/lib/server/email-service';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

const NGOApplySchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  registrationNumber: z.string().min(3, 'Official registration or license number is required'),
  focalPersonName: z.string().min(2, 'Focal person name is required'),
  focalPersonEmail: z.string().email('Please enter a valid official email address'),
  focalPersonPhone: z.string().min(7, 'Contact phone number is required'),
  website: z.string().optional(),
  hqAddress: z.string().min(5, 'Headquarters address is required'),
  operationalDistricts: z.array(z.string()).min(1, 'Please select at least one operational district'),
  reliefCapabilities: z.array(z.string()).min(1, 'Please select at least one relief capability'),
  documentName: z.string().optional(),
  documentData: z.string().optional(),
});

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/ngo-apply');
  if (showcaseBlock) return showcaseBlock;

  try {
    const body = await req.json();
    const result = NGOApplySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const cleanEmail = data.focalPersonEmail.toLowerCase().trim();

    // Check if an existing user or active application already uses this email
    const existingUser = await authDb.findUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An operational user account with this email address already exists. Please log in or contact support.' },
        { status: 409 }
      );
    }

    // Create NGO application record in pending status
    const application = await authDb.createNGOApplication({
      organizationName: data.organizationName,
      registrationNumber: data.registrationNumber,
      focalPersonName: data.focalPersonName,
      focalPersonEmail: cleanEmail,
      focalPersonPhone: data.focalPersonPhone,
      website: data.website || '',
      hqAddress: data.hqAddress,
      operationalDistricts: data.operationalDistricts,
      reliefCapabilities: data.reliefCapabilities,
      documentName: data.documentName || 'Accreditation_Certificate.pdf',
      documentData: data.documentData,
    });

    // Send confirmation email to applicant with application tracking reference
    await emailService.sendNgoApplicationReceivedEmail(
      cleanEmail,
      data.focalPersonName,
      data.organizationName,
      application.id
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Accreditation application submitted successfully. It is currently under review by Command Administration.',
        applicationId: application.id,
        status: application.status,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('NGO apply error:', error);
    return NextResponse.json(
      { error: 'Failed to submit NGO application. Please try again.' },
      { status: 500 }
    );
  }
}
