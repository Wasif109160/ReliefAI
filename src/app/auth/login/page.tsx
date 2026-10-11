'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  LifeBuoy,
  Flame,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

const DEMO_PRESETS = [
  {
    role: 'admin' as UserRole,
    title: 'Admin / Commander',
    email: 'admin@relief.ai',
    pass: 'Admin@123456',
    name: 'Cmdr. Elena Vance',
    icon: ShieldCheck,
    badge: 'National EOC',
    color: 'from-amber-500/20 to-red-500/20 border-amber-500/40 text-amber-300',
    target: '/dashboard/admin',
  },
  {
    role: 'government' as UserRole,
    title: 'Government Agency',
    email: 'gov@relief.ai',
    pass: 'Gov@123456',
    name: 'Sec. Tariq Rahman',
    icon: Building2,
    badge: 'Ministry of Relief',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
    target: '/dashboard/government',
  },
  {
    role: 'ngo' as UserRole,
    title: 'NGO Logistics Lead',
    email: 'ngo@relief.ai',
    pass: 'Ngo@123456',
    name: 'Sarah Chen',
    icon: Truck,
    badge: 'Red Cross Alliance',
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-300',
    target: '/dashboard/ngo',
  },
  {
    role: 'rescue_team' as UserRole,
    title: 'Rescue & SAR Team',
    email: 'rescue@relief.ai',
    pass: 'Rescue@123456',
    name: 'Lt. James Morales',
    icon: Flame,
    badge: 'USAR Alpha Unit',
    color: 'from-orange-500/20 to-amber-500/20 border-orange-500/40 text-orange-300',
    target: '/dashboard/rescue',
  },
  {
    role: 'citizen' as UserRole,
    title: 'Citizen / Community',
    email: 'citizen@relief.ai',
    pass: 'Citizen@123456',
    name: 'Marcus Vance',
    icon: LifeBuoy,
    badge: 'Dhaka Sector 4',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300',
    target: '/dashboard/citizen',
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardForRole = (role: string) => {
    switch (role) {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, rememberMe);
    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify and try again.');
      setLoading(false);
      return;
    }

    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      // Fetch latest profile or route to default
      const meRes = await fetch('/api/auth/me');
      const data = await meRes.json();
      const target = getDashboardForRole(data.user?.role || 'citizen');
      router.push(target);
    }
  };

  const fillCredentials = (preset: typeof DEMO_PRESETS[0]) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>PRODUCTION RBAC AUTHENTICATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          ReliefAI Operational Access
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Secure JWT access control with HttpOnly token rotation and multi-tier role authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Login Form */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Sign In to Crisis Command</h2>
              <p className="text-xs text-slate-400">Enter your official response credentials</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@relief.ai"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span>Remember me (30 days session)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm tracking-wide uppercase transition shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Security...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Don't have an account yet? </span>
            <Link href="/auth/register" className="text-cyan-400 hover:underline font-semibold">
              Register Role Account
            </Link>
          </div>
        </div>

        {/* Right Side: Quick Role Pre-sets for Instant Demo Testing */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
              Quick-Fill Test Accounts (5 RBAC Roles)
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">Click to Pre-fill</span>
          </div>

          <div className="space-y-3">
            {DEMO_PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  onClick={() => fillCredentials(p)}
                  className={`p-4 rounded-2xl border bg-gradient-to-r ${p.color} hover:scale-[1.01] transition-transform cursor-pointer flex items-center justify-between group shadow-lg`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{p.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-mono">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300/80">
                        {p.email} • <span className="font-mono text-slate-400">{p.pass}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 opacity-80 group-hover:opacity-100">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Use</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Security Protocols Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Passwords hashed with salted bcrypt (cost 10). Session authentication is protected with HttpOnly SameSite=Lax JWT cookies and single-use refresh token rotation to prevent replay attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">Loading Portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
