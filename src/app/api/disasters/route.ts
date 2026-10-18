import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/rbac';
import { db } from '@/lib/db';
import { disasterService, DisasterFilter } from '@/lib/services/disaster-service';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter: DisasterFilter = {
      dataSource: (searchParams.get('source') as any) || 'all',
      type: (searchParams.get('type') as any) || 'all',
      severity: (searchParams.get('severity') as any) || 'all',
      status: (searchParams.get('status') as any) || 'all',
      division: searchParams.get('division') || 'all',
      search: searchParams.get('search') || undefined,
      year: searchParams.get('year') ? Number(searchParams.get('year')) : 'all',
    };

    const disasters = await disasterService.getDisasters(filter);
    const stats = await disasterService.getStats();

    return NextResponse.json({
      disasters,
      stats,
      mode: stats.mode,
      isDemo: stats.mode === 'demo',
      provider: stats.providerName,
      liveApiStatusMessage: stats.liveApiStatusMessage,
      lastUpdated: stats.lastUpdated,
    });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Error fetching disasters:', err);
    return NextResponse.json({ error: 'Failed to fetch disasters' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/disasters');
  if (showcaseBlock) return showcaseBlock;

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
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 500 });
  }
}
