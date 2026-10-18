import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { authDb } from '@/lib/server/auth-db';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies, clearAuthCookies, COOKIE_REFRESH_TOKEN } from '@/lib/server/cookies';
import { isDatabaseUnavailableError } from '@/lib/mongodb';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    // 1. Verify Refresh Token Cryptographically
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId || !payload.familyId) {
      const response = NextResponse.json(
        { error: 'Refresh token expired or invalid', code: 'EXPIRED_TOKEN' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }

    // 2. Hash token to look up in persistent DB
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const tokenRecord = await authDb.findRefreshToken(tokenHash);

    // 3. Token Reuse Detection (OWASP Recommendation)
    if (!tokenRecord) {
      const response = NextResponse.json(
        { error: 'Unknown refresh token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }

    if (tokenRecord.isRevoked) {
      // Replay attack detected! Revoke the whole family and purge sessions.
      await authDb.revokeTokenFamily(tokenRecord.familyId);
      await authDb.deleteUserSessions(tokenRecord.userId);

      const response = NextResponse.json(
        {
          error: 'Security alert: Refresh token reuse detected. All active sessions invalidated.',
          code: 'TOKEN_REUSE_DETECTED',
        },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }

    // 4. Mark current token as revoked (one-time use)
    tokenRecord.isRevoked = true;

    // 5. Look up user
    const user = await authDb.findUserById(tokenRecord.userId);
    if (!user) {
      const response = NextResponse.json(
        { error: 'User associated with session not found', code: 'USER_NOT_FOUND' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }

    // 6. Generate new session/verify existing
    const sessionId = payload.sessionId || `sess-${Date.now()}`;

    // 7. Issue new rotated Refresh Token within the same family
    const newRefreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      familyId: tokenRecord.familyId,
      sessionId,
    });

    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await authDb.storeRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      familyId: tokenRecord.familyId,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    // 8. Issue new Access Token (15m)
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId,
    });

    const sanitizedUser = authDb.sanitizeUser(user);
    const response = NextResponse.json({
      success: true,
      user: sanitizedUser,
    });

    return setAuthCookies(response, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }
    console.error('Refresh token error:', error);
    const response = NextResponse.json(
      { error: 'Internal refresh token error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
    return clearAuthCookies(response);
  }
}
