import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';

export async function GET() {
  try {
    const disasters = await db.getDisasters();
    const stats = await db.getStats();
    return NextResponse.json({ disasters, stats });
  } catch (err) {
    console.error('Error fetching disasters:', err);
    return NextResponse.json({ error: 'Failed to fetch disasters' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth(['admin', 'government', 'commander']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    if (!body.title || !body.type || !body.severity) {
      return NextResponse.json({ error: 'Missing required incident fields' }, { status: 400 });
    }
    const created = await db.createDisaster(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 500 });
  }
}
