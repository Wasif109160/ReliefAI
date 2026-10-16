import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const disaster = await db.getDisaster(id);
    if (!disaster) {
      return NextResponse.json({ error: 'Disaster incident not found' }, { status: 404 });
    }
    return NextResponse.json(disaster);
  } catch (err) {
    console.error('Error fetching disaster:', err);
    return NextResponse.json({ error: 'Failed to fetch disaster' }, { status: 500 });
  }
}
