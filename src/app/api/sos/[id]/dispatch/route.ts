import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['admin', 'government', 'rescue_team', 'commander', 'ngo']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { teamId, teamName } = body;

    const updated = await db.updateSOSStatus(id, 'dispatched', teamId, teamName);
    if (!updated) {
      return NextResponse.json({ error: 'SOS request not found' }, { status: 404 });
    }

    if (teamId) {
      await db.dispatchResponder(teamId, updated.disasterId || 'dis-001', id);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Dispatch error:', err);
    return NextResponse.json({ error: 'Failed to dispatch team' }, { status: 500 });
  }
}
