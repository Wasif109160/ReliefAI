import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/prisma';

export async function GET() {
  try {
    const shelters = await db.getShelters();
    return NextResponse.json(shelters);
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Error fetching shelters:', err);
    return NextResponse.json({ error: 'Failed to fetch shelters' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/shelters');
  if (showcaseBlock) return showcaseBlock;

  const auth = await requireAuth(['ngo', 'government', 'admin', 'rescue_team', 'commander']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const { id, currentOccupancy } = body;
    if (!id || currentOccupancy === undefined || currentOccupancy === null) {
      return NextResponse.json({ error: 'Missing shelter id or currentOccupancy' }, { status: 400 });
    }
    const occupancyNum = Number(currentOccupancy);
    if (!Number.isFinite(occupancyNum) || occupancyNum < 0) {
      return NextResponse.json({ error: 'currentOccupancy must be a non-negative finite number' }, { status: 400 });
    }
    const updated = await db.updateShelterOccupancy(id, Math.floor(occupancyNum));
    if (!updated) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to update shelter' }, { status: 500 });
  }
}
