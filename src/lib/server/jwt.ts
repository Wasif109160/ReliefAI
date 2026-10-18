import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { UserRole } from '../types';

export function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL CONFIGURATION ERROR: JWT_ACCESS_SECRET must be configured in production.');
    }
    return new TextEncoder().encode('reliefai-development-only-jwt-access-secret-key-32chars+');
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('FATAL CONFIGURATION ERROR: JWT_ACCESS_SECRET must be at least 32 characters long in production.');
  }
  return new TextEncoder().encode(secret);
}

export function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL CONFIGURATION ERROR: JWT_REFRESH_SECRET must be configured in production.');
    }
    return new TextEncoder().encode('reliefai-development-only-jwt-refresh-secret-key-32chars+');
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('FATAL CONFIGURATION ERROR: JWT_REFRESH_SECRET must be at least 32 characters long in production.');
  }
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && accessSecret && secret === accessSecret) {
    throw new Error('FATAL CONFIGURATION ERROR: JWT_REFRESH_SECRET must be distinct from JWT_ACCESS_SECRET in production.');
  }
  return new TextEncoder().encode(secret);
}


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
  role?: UserRole;
  email?: string;
  name?: string;
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
    .sign(getAccessSecret());
}

/**
 * Sign a Refresh Token (valid for 7 days, or 30 days if rememberMe is true)
 */
export async function signRefreshToken(
  payload: {
    userId: string;
    familyId: string;
    sessionId: string;
    role?: UserRole;
    email?: string;
    name?: string;
  },
  rememberMe: boolean = false
): Promise<string> {
  const expiry = rememberMe ? '30d' : '7d';
  return await new SignJWT({
    userId: payload.userId,
    familyId: payload.familyId,
    sessionId: payload.sessionId,
    role: payload.role,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('reliefai-auth')
    .setAudience('reliefai-app')
    .setExpirationTime(expiry)
    .sign(getRefreshSecret());
}

/**
 * Verify an Access Token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      issuer: 'reliefai-auth',
      audience: 'reliefai-app',
    });
    return payload as TokenPayload;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('FATAL CONFIGURATION ERROR')) {
      console.error('[ReliefAI Security Configuration Alert] Access Secret Error:', err.message);
    }
    return null;
  }
}

/**
 * Verify a Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      issuer: 'reliefai-auth',
      audience: 'reliefai-app',
    });
    return payload as RefreshPayload;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('FATAL CONFIGURATION ERROR')) {
      console.error('[ReliefAI Security Configuration Alert] Refresh Secret Error:', err.message);
    }
    return null;
  }
}
