import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const shelters = db.getShelters();
  return NextResponse.json(shelters);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, currentOccupancy } = body;
    if (!id || currentOccupancy === undefined) {
      return NextResponse.json({ error: 'Missing shelter id or currentOccupancy' }, { status: 400 });
    }
    const updated = db.updateShelterOccupancy(id, Number(currentOccupancy));
    if (!updated) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update shelter' }, { status: 500 });
  }
}
