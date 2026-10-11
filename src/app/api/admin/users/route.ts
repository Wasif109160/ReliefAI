import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authDb } from '@/lib/server/auth-db';
import { verifyAccessToken } from '@/lib/server/jwt';
import { COOKIE_ACCESS_TOKEN } from '@/lib/server/cookies';

async function checkAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const users = authDb.getAllUsers();
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { userId, role, isEmailVerified, assignedZone } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updated = authDb.updateUser(userId, {
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
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
