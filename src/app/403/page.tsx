'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft, LogIn, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForbiddenPage() {
  const { user, role, logout } = useAuth();

  const getDashboardForRole = (currentRole: string) => {
    switch (currentRole) {
      case 'admin':
        return '/dashboard/admin';
      case 'government':
        return '/dashboard/government';
      case 'ngo':
        return '/dashboard/ngo';
      case 'commander':
        return '/command';
      case 'volunteer':
        return '/dashboard/volunteer';
      case 'rescue_team':
      case 'responder':
        return '/dashboard/rescue';
      case 'citizen':
      default:
        return '/dashboard/citizen';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8">
      <div className="relative inline-flex items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
          <ShieldX className="w-12 h-12" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-mono text-red-700 uppercase tracking-widest font-bold">
          <LockKeyhole className="w-3.5 h-3.5" />
          <span>ACCESS RESTRICTED (HTTP 403)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Insufficient Clearance Level</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium">
          Your authenticated account does not possess the Role-Based Access Control (RBAC) privileges required to inspect this operational sector.
        </p>
      </div>

      {user && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs max-w-md mx-auto text-xs text-left space-y-2.5">
          <div className="flex justify-between items-center text-slate-600">
            <span>Logged in as:</span>
            <span className="font-bold text-slate-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Your Assigned Role:</span>
            <span className="font-mono text-blue-700 uppercase font-bold">{role}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Organization:</span>
            <span className="text-slate-800 font-medium">{user.organization || 'Public Network'}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href={getDashboardForRole(role)}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to My Authorized Dashboard</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition border border-slate-200 shadow-xs cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-slate-500" />
          <span>Switch Account</span>
        </button>
      </div>
    </div>
  );
}
