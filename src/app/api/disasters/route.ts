import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const disasters = db.getDisasters();
  const stats = db.getStats();
  return NextResponse.json({ disasters, stats });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.type || !body.severity) {
      return NextResponse.json({ error: 'Missing required incident fields' }, { status: 400 });
    }
    const created = db.createDisaster(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 500 });
  }
}
