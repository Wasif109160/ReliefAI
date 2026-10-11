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
      case 'rescue_team':
      case 'volunteer':
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
        <div className="w-24 h-24 rounded-3xl bg-red-950/60 border border-red-600/50 flex items-center justify-center text-red-500 shadow-2xl shadow-red-950/80 animate-pulse">
          <ShieldX className="w-12 h-12" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800 text-xs font-mono text-red-400 uppercase tracking-widest">
          <LockKeyhole className="w-3.5 h-3.5" />
          <span>ACCESS RESTRICTED (HTTP 403)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Insufficient Clearance Level</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Your authenticated account does not possess the Role-Based Access Control (RBAC) privileges required to inspect this operational sector.
        </p>
      </div>

      {user && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto text-xs text-left space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Logged in as:</span>
            <span className="font-semibold text-white">{user.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Your Assigned Role:</span>
            <span className="font-mono text-cyan-400 uppercase font-bold">{role}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Organization:</span>
            <span className="text-slate-300">{user.organization || 'Public Network'}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href={getDashboardForRole(role)}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to My Authorized Dashboard</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700"
        >
          <LogIn className="w-4 h-4" />
          <span>Switch Account</span>
        </button>
      </div>
    </div>
  );
}
