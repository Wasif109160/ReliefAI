import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { authDb } from '@/lib/server/auth-db';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/server/jwt';
import { setAuthCookies, COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from '@/lib/server/cookies';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    // 1. Try verifying Access Token
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload?.userId) {
        const user = authDb.findUserById(payload.userId);
        if (user) {
          return NextResponse.json({ user: authDb.sanitizeUser(user) });
        }
      }
    }

    // 2. Access Token expired/missing; attempt transparent refresh if Refresh Token is valid
    if (refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload?.userId) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const tokenRecord = authDb.findRefreshToken(tokenHash);

        if (tokenRecord && !tokenRecord.isRevoked) {
          const user = authDb.findUserById(tokenRecord.userId);
          if (user) {
            // Rotate refresh token
            tokenRecord.isRevoked = true;
            const sessionId = refreshPayload.sessionId || `sess-${Date.now()}`;

            const newRefreshToken = await signRefreshToken({
              userId: user.id,
              familyId: tokenRecord.familyId,
              sessionId,
            });

            const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
            authDb.storeRefreshToken({
              userId: user.id,
              tokenHash: newTokenHash,
              familyId: tokenRecord.familyId,
              expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
            });

            const newAccessToken = await signAccessToken({
              userId: user.id,
              email: user.email,
              role: user.role,
              name: user.name,
              sessionId,
            });

            const response = NextResponse.json({ user: authDb.sanitizeUser(user) });
            return setAuthCookies(response, {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            });
          }
        }
      }
    }

    // User is unauthenticated
    const url = new URL(req.url);
    if (url.searchParams.get('strict') === 'true') {
      return NextResponse.json({ error: 'Unauthorized', user: null }, { status: 401 });
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(req: Request) {
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
    const allowedUpdates = {
      name: body.name,
      displayName: body.displayName,
      phone: body.phone,
      organization: body.organization,
      badgeNumber: body.badgeNumber,
      assignedZone: body.assignedZone,
      skills: body.skills,
    };

    const updatedUser = authDb.updateUser(payload.userId, allowedUpdates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: authDb.sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
