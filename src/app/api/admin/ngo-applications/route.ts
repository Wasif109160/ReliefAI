import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/rbac';
import { authDb } from '@/lib/server/auth-db';
import { isDatabaseUnavailableError } from '@/lib/prisma';

export async function GET(req: Request) {
  const auth = await requireAuth(['admin']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;

    const applications = await authDb.listNGOApplications(status || undefined);
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to list applications' }, { status: 500 });
  }
}
