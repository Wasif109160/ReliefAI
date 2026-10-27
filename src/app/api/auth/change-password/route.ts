import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authDb } from '@/lib/server/auth-db';
import { verifyAccessToken, signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { COOKIE_ACCESS_TOKEN, setAuthCookies } from '@/lib/server/cookies';
import { getClientIp } from '@/lib/server/security';
import { assertShowcaseMutation } from '@/lib/server/demo-policy';
import { isDatabaseUnavailableError } from '@/lib/prisma';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(req: Request) {
  const showcaseBlock = assertShowcaseMutation(req, '/api/auth/change-password');
  if (showcaseBlock) return showcaseBlock;

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
    const user = await authDb.findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current password does not match' }, { status: 400 });
    }

    // Hash new password
    await authDb.updateUserPassword(user.id, newPassword);

    // Invalidate all existing sessions and refresh tokens globally
    await authDb.deleteUserSessions(user.id);

    // Re-issue a fresh session for the current client to prevent sudden session disruption
    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Browser';
    const newSession = await authDb.createSession(user.id, ipAddress, userAgent);

    const familyId = `fam-${crypto.randomUUID()}`;
    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      familyId,
      sessionId: newSession.id,
    });
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await authDb.storeRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId: newSession.id,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully. All previous sessions have been revoked.',
    });

    return setAuthCookies(response, {
      accessToken: newAccessToken,
      refreshToken,
      rememberMe: false,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
