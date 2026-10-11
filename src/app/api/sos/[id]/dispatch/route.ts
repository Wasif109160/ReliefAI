import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { teamId, teamName } = body;

    const updated = db.updateSOSStatus(id, 'dispatched', teamId, teamName);
    if (!updated) {
      return NextResponse.json({ error: 'SOS request not found' }, { status: 404 });
    }

    if (teamId) {
      db.dispatchResponder(teamId, updated.disasterId || 'dis-001', id);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Dispatch error:', err);
    return NextResponse.json({ error: 'Failed to dispatch team' }, { status: 500 });
  }
}
