import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authDb } from '@/lib/server/auth-db';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/server/jwt';
import { clearAuthCookies, COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from '@/lib/server/cookies';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload?.sessionId) {
        await authDb.deleteSession(payload.sessionId);
      }
    } else if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.sessionId) {
        await authDb.deleteSession(payload.sessionId);
      }
      if (payload?.familyId) {
        await authDb.revokeTokenFamily(payload.familyId);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    return clearAuthCookies(response);
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
    });
    return clearAuthCookies(response);
  }
}
