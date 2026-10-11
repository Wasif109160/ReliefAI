import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const responders = db.getResponders();
  return NextResponse.json(responders);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { teamId, status } = body;
    if (!teamId || !status) {
      return NextResponse.json({ error: 'Missing teamId or status' }, { status: 400 });
    }
    const updated = db.updateResponderStatus(teamId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update responder status' }, { status: 500 });
  }
}
