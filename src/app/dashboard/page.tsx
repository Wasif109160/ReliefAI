'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { role, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login?redirect=/dashboard');
      return;
    }

    switch (role) {
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      case 'government':
        router.replace('/dashboard/government');
        break;
      case 'ngo':
        router.replace('/dashboard/ngo');
        break;
      case 'commander':
        router.replace('/command');
        break;
      case 'volunteer':
        router.replace('/dashboard/volunteer');
        break;
      case 'rescue_team':
      case 'responder':
        router.replace('/dashboard/rescue');
        break;
      case 'citizen':
      default:
        router.replace('/dashboard/citizen');
        break;
    }
  }, [role, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-xs text-slate-500 font-semibold tracking-wide">
        Routing to Authorized Role Dashboard...
      </p>
    </div>
  );
}
