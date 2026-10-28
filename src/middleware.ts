import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, TokenPayload } from './lib/server/jwt';
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from './lib/server/cookies';
import { isShowcaseMutationBlocked } from './lib/server/demo-policy';

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin: '/dashboard/admin',
  citizen: '/dashboard/citizen',
  rescue_team: '/dashboard/rescue',
  responder: '/dashboard/rescue',
  commander: '/command',
  volunteer: '/dashboard/volunteer',
  ngo: '/dashboard/ngo',
  government: '/dashboard/government',
  admin: '/dashboard/admin',
};

// Route permission requirements
const PROTECTED_ROUTE_ROLES: { prefix: string; roles: string[] }[] = [
  { prefix: '/dashboard/citizen', roles: ['citizen', 'admin', 'super_admin'] },
  { prefix: '/dashboard/rescue', roles: ['rescue_team', 'commander', 'responder', 'admin', 'super_admin'] },
  { prefix: '/dashboard/ngo', roles: ['ngo', 'admin', 'super_admin'] },
  { prefix: '/dashboard/government', roles: ['government', 'admin', 'super_admin'] },
  { prefix: '/dashboard/admin', roles: ['admin', 'super_admin'] },
  { prefix: '/dashboard/volunteer', roles: ['volunteer', 'admin', 'super_admin'] },
  { prefix: '/command', roles: ['super_admin', 'admin', 'government', 'commander', 'rescue_team'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // These old handlers use a different identity database, not the NestJS authority.
  const legacyAuthPaths = [
    '/api/auth/bootstrap', '/api/auth/dev-outbox', '/api/auth/forgot-password',
    '/api/auth/reset-password', '/api/auth/resend-otp', '/api/auth/verify-email',
    '/api/auth/request-email-change', '/api/auth/verify-email-change',
  ];
  if (legacyAuthPaths.includes(pathname)) {
    return NextResponse.json({ error: 'This account workflow is unavailable until migrated to the authentication service.', code: 'AUTH_WORKFLOW_UNAVAILABLE' }, { status: 503 });
  }
  const origin = request.headers.get('origin');
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isOriginAllowed =
    !origin ||
    origin === request.nextUrl.origin ||
    allowedOrigins.includes(origin);

  const corsOrigin = isOriginAllowed ? (origin || '*') : allowedOrigins[0] || '*';

  // 0. Handle CORS preflight for API requests
  if (request.method === 'OPTIONS' && (pathname.startsWith('/api/') || pathname.startsWith('/health'))) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With, Accept, X-User-Role, X-Mesh-Node-ID, X-Api-Version',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Helper to set CORS headers on API responses
  const withCors = (res: NextResponse) => {
    if (pathname.startsWith('/api/') || pathname.startsWith('/health')) {
      res.headers.set('Access-Control-Allow-Origin', corsOrigin);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
      res.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, X-User-Role, X-Mesh-Node-ID, X-Api-Version'
      );
    }
    return res;
  };

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

  // 4. Role-based Dashboard & Command Route Protection
  let matchedProtection = false;
  for (const { prefix, roles } of PROTECTED_ROUTE_ROLES) {
    if (pathname.startsWith(prefix)) {
      matchedProtection = true;
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

  // Deny-by-default for any other dashboard path
  if (!matchedProtection && (pathname.startsWith('/dashboard/') || pathname.startsWith('/command'))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL('/403', request.url));
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
      return withCors(NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 }));
    }
    if (userPayload?.role !== 'admin' && userPayload?.role !== 'super_admin') {
      return withCors(NextResponse.json({ error: 'Forbidden: Admin access required', code: 'FORBIDDEN' }, { status: 403 }));
    }
  }

  // 7. Showcase Mode Mutation Protection (Blocks credential tampering during evaluations)
  const showcaseCheck = isShowcaseMutationBlocked(pathname, request.method);
  if (showcaseCheck.blocked) {
    return withCors(
      NextResponse.json(
        { error: showcaseCheck.reason, code: 'SHOWCASE_MUTATION_RESTRICTED' },
        { status: 403 }
      )
    );
  }

  // Attach user headers for downstream server components if available
  const response = NextResponse.next();
  if (userPayload) {
    response.headers.set('x-user-id', userPayload.userId);
    response.headers.set('x-user-role', userPayload.role);
    response.headers.set('x-user-email', userPayload.email);
  }

  return withCors(response);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/command',
    '/command/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/register',
    '/api/:path*',
  ],
};
