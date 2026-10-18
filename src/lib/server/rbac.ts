import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { COOKIE_ACCESS_TOKEN } from './cookies';
import { UserRole } from '../types';

export interface AuthCheckResult {
  authenticated: boolean;
  user: TokenPayload | null;
  errorResponse?: NextResponse;
}

/**
 * Validates request authorization and ensures caller possesses required role(s).
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthCheckResult> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authHeader = headerStore.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value || bearerToken;

  if (!token) {
    return {
      authenticated: false,
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Authentication required. Please sign in.', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return {
      authenticated: false,
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Session token has expired. Please sign in again.', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(payload.role) && payload.role !== 'super_admin') {
    return {
      authenticated: false,
      user: payload,
      errorResponse: NextResponse.json(
        {
          error: `Forbidden: This operation requires one of the following clearance levels: ${allowedRoles.join(', ')}`,
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    };
  }

  return { authenticated: true, user: payload };
}
