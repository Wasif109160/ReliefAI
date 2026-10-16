import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, TokenPayload } from './lib/server/jwt';
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from './lib/server/cookies';

const ROLE_DASHBOARDS: Record<string, string> = {
  citizen: '/dashboard/citizen',
  rescue_team: '/dashboard/rescue',
  ngo: '/dashboard/ngo',
  government: '/dashboard/government',
  admin: '/dashboard/admin',
};

// Route permission requirements
const PROTECTED_ROUTE_ROLES: { prefix: string; roles: string[] }[] = [
  { prefix: '/dashboard/citizen', roles: ['citizen', 'admin'] },
  { prefix: '/dashboard/rescue', roles: ['rescue_team', 'admin'] },
  { prefix: '/dashboard/ngo', roles: ['ngo', 'admin'] },
  { prefix: '/dashboard/government', roles: ['government', 'admin'] },
  { prefix: '/dashboard/admin', roles: ['admin'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get tokens from cookies
  const accessToken = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value;

  let userPayload: TokenPayload | null = accessToken ? await verifyAccessToken(accessToken) : null;

  // If access token is expired/missing, check if refresh token is valid
  if (!userPayload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload?.userId) {
      userPayload = {
        userId: refreshPayload.userId,
        email: refreshPayload.email || '',
        role: refreshPayload.role || 'citizen',
        name: refreshPayload.name || '',
        sessionId: refreshPayload.sessionId,
      };
    }
  }

  const isAuthenticated = Boolean(userPayload);

  // 2. Redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const target = (userPayload && ROLE_DASHBOARDS[userPayload.role]) || '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Handle base /dashboard redirect based on role
  if (pathname === '/dashboard') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = userPayload?.role || 'citizen';
    const target = ROLE_DASHBOARDS[role] || '/dashboard/citizen';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 4. Role-based Dashboard Route Protection
  for (const { prefix, roles } of PROTECTED_ROUTE_ROLES) {
    if (pathname.startsWith(prefix)) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (!userPayload || !roles.includes(userPayload.role)) {
        // Forbidden - insufficient role
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
  }

  // 5. Generic Authenticated Pages (/profile, /settings)
  if (pathname.startsWith('/profile') || pathname.startsWith('/settings')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 6. Admin API Route Protection
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (userPayload?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }
  }

  // Attach user headers for downstream server components if available
  const response = NextResponse.next();
  if (userPayload) {
    response.headers.set('x-user-id', userPayload.userId);
    response.headers.set('x-user-role', userPayload.role);
    response.headers.set('x-user-email', userPayload.email);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/register',
    '/api/admin/:path*',
  ],
};
