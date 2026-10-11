import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { UserRole } from '../types';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'reliefai-super-secure-production-jwt-access-secret-key-32chars+'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'reliefai-super-secure-production-jwt-refresh-secret-key-32chars+'
);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  sessionId?: string;
}

export interface RefreshPayload extends JWTPayload {
  userId: string;
  familyId: string;
  sessionId?: string;
}

/**
 * Sign an Access Token (valid for 15 minutes)
 */
export async function signAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  sessionId: string;
}): Promise<string> {
  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    sessionId: payload.sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('reliefai-auth')
    .setAudience('reliefai-app')
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET);
}

/**
 * Sign a Refresh Token (valid for 7 days, or 30 days if rememberMe is true)
 */
export async function signRefreshToken(
  payload: {
    userId: string;
    familyId: string;
    sessionId: string;
  },
  rememberMe: boolean = false
): Promise<string> {
  const expiry = rememberMe ? '30d' : '7d';
  return await new SignJWT({
    userId: payload.userId,
    familyId: payload.familyId,
    sessionId: payload.sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('reliefai-auth')
    .setAudience('reliefai-app')
    .setExpirationTime(expiry)
    .sign(REFRESH_SECRET);
}

/**
 * Verify an Access Token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      issuer: 'reliefai-auth',
      audience: 'reliefai-app',
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify a Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      issuer: 'reliefai-auth',
      audience: 'reliefai-app',
    });
    return payload as RefreshPayload;
  } catch {
    return null;
  }
}
