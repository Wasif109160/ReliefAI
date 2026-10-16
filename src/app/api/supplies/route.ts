import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';

export async function GET() {
  try {
    const supplies = await db.getSupplies();
    return NextResponse.json(supplies);
  } catch (err) {
    console.error('Error fetching supplies:', err);
    return NextResponse.json({ error: 'Failed to fetch supplies' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth(['ngo', 'admin', 'government', 'commander']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const { action, id, quantity } = body;
    if (!id || !quantity || !action) {
      return NextResponse.json({ error: 'Missing action, id, or quantity' }, { status: 400 });
    }

    let updated;
    if (action === 'dispatch') {
      updated = await db.dispatchSupply(id, Number(quantity));
    } else if (action === 'restock') {
      updated = await db.restockSupply(id, Number(quantity));
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be dispatch or restock' }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: 'Supply item not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update supply' }, { status: 500 });
  }
}
