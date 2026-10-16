import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/server/rbac';
import { authDb } from '@/lib/server/auth-db';

const VALID_STATUSES = ['available', 'dispatched', 'en_route', 'on_scene', 'off_duty'] as const;

export async function GET() {
  try {
    const responders = await db.getResponders();
    return NextResponse.json(responders);
  } catch (err) {
    console.error('Error fetching responders:', err);
    return NextResponse.json({ error: 'Failed to fetch responders' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(['rescue_team', 'commander', 'responder', 'admin', 'government']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const { teamId, status } = body;
    if (!teamId || !status) {
      return NextResponse.json({ error: 'Missing teamId or status' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid responder status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const team = await db.getResponder(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Role-based ownership check:
    // Privileged command roles (admin, government, commander) can update any team.
    // Ordinary operational roles (rescue_team, responder) may only update their explicitly assigned team.
    const privilegedRoles = ['admin', 'government', 'commander'];
    if (!privilegedRoles.includes(auth.user.role)) {
      const userProfile = await authDb.findUserById(auth.user.userId);
      // Deny safely if account has no assigned team or if assigned team does not match the target team ID
      if (!userProfile?.assignedTeamId || userProfile.assignedTeamId !== team.id) {
        return NextResponse.json(
          {
            error: 'Forbidden: You are not authorized to update this responder team unit. Operational units may only update their explicitly assigned team.',
            code: 'FORBIDDEN_RESOURCE_OWNERSHIP',
          },
          { status: 403 }
        );
      }
    }

    const updated = await db.updateResponderStatus(teamId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update responder status' }, { status: 500 });
  }
}
