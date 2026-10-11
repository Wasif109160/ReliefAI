'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Activity,
  Users,
  Home,
  LifeBuoy,
  Lock,
  ArrowRight,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { DEMO_USERS } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginRole = async (role: UserRole) => {
    setLoading(true);
    try {
      await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (role === 'admin' || role === 'commander') router.push('/dashboard/admin');
      else if (role === 'volunteer' || role === 'responder') router.push('/dashboard/volunteer');
      else if (role === 'ngo') router.push('/dashboard/ngo');
      else router.push('/sos');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLoginRole(selectedRole);
  };

  const personas = [
    {
      role: 'admin' as UserRole,
      title: 'Incident Commander',
      user: DEMO_USERS.admin,
      icon: Activity,
      desc: 'ICS-400 authority, automated IAP generation, triage dispatch.',
      accent: 'border-amber-500/40 text-amber-400 hover:border-amber-400',
    },
    {
      role: 'ngo' as UserRole,
      title: 'NGO Logistics Lead',
      user: DEMO_USERS.ngo,
      icon: Truck,
      desc: 'Relief supply convoys, warehouse depots, delivery verification.',
      accent: 'border-cyan-500/40 text-cyan-400 hover:border-cyan-400',
    },
    {
      role: 'volunteer' as UserRole,
      title: 'Field Volunteer',
      user: DEMO_USERS.volunteer,
      icon: Users,
      desc: 'Field extractions, medical triage, real-time tactical radio.',
      accent: 'border-emerald-500/40 text-emerald-400 hover:border-emerald-400',
    },
    {
      role: 'citizen' as UserRole,
      title: 'Affected Citizen',
      user: DEMO_USERS.citizen,
      icon: LifeBuoy,
      desc: 'Instant SOS broadcasting, shelter finder, survival first aid.',
      accent: 'border-red-500/40 text-red-400 hover:border-red-400',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400 uppercase">
          <Lock className="w-3.5 h-3.5" />
          <span>SECURE ACCESS PORTAL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          ReliefAI Operational Access
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Select a verified crisis response persona below to jump directly into the relevant dashboard with pre-configured credentials.
        </p>
      </div>

      {/* One-Click Fast Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.role}
              onClick={() => handleLoginRole(p.role)}
              className={`glass-panel p-6 rounded-3xl border transition cursor-pointer group hover:-translate-y-0.5 space-y-4 shadow-xl ${p.accent}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">{p.title}</h2>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{p.user.name}</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition" />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{p.user.organization || 'General Public'}</span>
                <span className="text-white font-semibold flex items-center space-x-1 group-hover:text-cyan-300">
                  <span>Enter as {p.user.name.split(' ')[0]}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Login Fallback */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md mx-auto space-y-4">
        <h2 className="text-base font-bold text-white text-center">Or Sign In with Credentials</h2>
        <form onSubmit={handleCustomLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="responder@relief.ai"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
