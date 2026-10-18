import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['admin', 'government', 'rescue_team', 'commander', 'responder', 'ngo']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const sos = await db.getSOS(id);
    if (!sos) {
      return NextResponse.json({ error: 'SOS request not found' }, { status: 404 });
    }
    return NextResponse.json(sos);
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Error fetching SOS request:', err);
    return NextResponse.json({ error: 'Failed to fetch SOS request' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/sos');
  if (showcaseBlock) return showcaseBlock;

  const auth = await requireAuth(['rescue_team', 'commander', 'responder', 'admin', 'government', 'ngo']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, teamId, teamName } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await db.updateSOSStatus(id, status, teamId, teamName);
    if (!updated) {
      return NextResponse.json({ error: 'SOS request not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Error updating SOS status:', err);
    return NextResponse.json({ error: 'Failed to update SOS status' }, { status: 500 });
  }
}
