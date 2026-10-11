import { NextResponse } from 'next/server';

export const COOKIE_ACCESS_TOKEN = 'reliefai_access_token';
export const COOKIE_REFRESH_TOKEN = 'reliefai_refresh_token';

const IS_PROD = process.env.NODE_ENV === 'production';

export interface CookieOptions {
  accessToken: string;
  refreshToken: string;
  rememberMe?: boolean;
}

/**
 * Attach HttpOnly security cookies to a NextResponse
 */
export function setAuthCookies(
  response: NextResponse,
  tokens: CookieOptions
): NextResponse {
  const refreshMaxAge = tokens.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days

  response.cookies.set(COOKIE_ACCESS_TOKEN, tokens.accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set(COOKIE_REFRESH_TOKEN, tokens.refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshMaxAge,
  });

  return response;
}

/**
 * Remove auth cookies upon logout
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_ACCESS_TOKEN, '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(COOKIE_REFRESH_TOKEN, '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
