import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, getUserForRole } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export async function GET() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value as UserRole | undefined;
  const role: UserRole = roleCookie || 'admin';
  const user = getUserForRole(role);
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role } = body as { role: UserRole };
    if (!role || !['citizen', 'volunteer', 'ngo', 'admin', 'commander', 'responder'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, role, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    const user = getUserForRole(role);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed to update user session' }, { status: 500 });
  }
}
