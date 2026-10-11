import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const supplies = db.getSupplies();
  return NextResponse.json(supplies);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, quantity } = body;
    if (!id || !quantity || !action) {
      return NextResponse.json({ error: 'Missing action, id, or quantity' }, { status: 400 });
    }

    let updated;
    if (action === 'dispatch') {
      updated = db.dispatchSupply(id, Number(quantity));
    } else if (action === 'restock') {
      updated = db.restockSupply(id, Number(quantity));
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
