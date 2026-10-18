import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from '@/lib/server/cookies';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/server/jwt';

const ALLOWED_VOLUNTEER_ROLES = ['volunteer', 'admin'];

export const instant = false;

export default async function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

  let role: string | null = null;
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload?.role) role = payload.role;
  }
  if (!role && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload?.role) role = refreshPayload.role;
  }

  if (!role) {
    redirect('/auth/login?redirect=/dashboard/volunteer');
  }

  if (!ALLOWED_VOLUNTEER_ROLES.includes(role)) {
    redirect('/403');
  }

  return <>{children}</>;
}
