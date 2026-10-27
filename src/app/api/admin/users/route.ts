import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authDb } from '@/lib/server/auth-db';
import { verifyAccessToken } from '@/lib/server/jwt';
import { COOKIE_ACCESS_TOKEN } from '@/lib/server/cookies';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/prisma';

async function checkAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) return null;
  return payload;
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const users = await authDb.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/admin/users');
  if (showcaseBlock) return showcaseBlock;

  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { userId, role, isEmailVerified, assignedZone } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updated = await authDb.updateUser(userId, {
      role,
      isEmailVerified,
      assignedZone,
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: authDb.sanitizeUser(updated),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please try again shortly.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/admin/users');
  if (showcaseBlock) return showcaseBlock;

  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Safety: Prevent self-deletion of current administrator
    if (userId === admin.userId) {
      return NextResponse.json({ error: 'Cannot delete own account' }, { status: 400 });
    }

    const deleted = await authDb.deleteUser(userId);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User successfully deleted',
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please try again shortly.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
