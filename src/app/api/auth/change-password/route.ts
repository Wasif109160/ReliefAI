import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { verifyAccessToken } from '@/lib/server/jwt';
import { COOKIE_ACCESS_TOKEN } from '@/lib/server/cookies';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = ChangePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;
    const user = authDb.findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current password does not match' }, { status: 400 });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    authDb.updateUserPassword(user.id, newHash);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
