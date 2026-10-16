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
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDashboardForRole = (roleName: string) => {
    switch (roleName) {
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
      if (res.code === 'EMAIL_NOT_VERIFIED' || res.requiresVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(res.email || email)}&unverified=true`);
        return;
      }
      setError(res.error || 'Invalid credentials. Please verify and try again.');
      setLoading(false);
      return;
    }

    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      const meRes = await fetch('/api/auth/me');
      const data = await meRes.json();
      const target = getDashboardForRole(data.user?.role || 'citizen');
      router.push(target);
    }
  };

  return (
    <FadeIn className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-900">
      {/* Light Ambient Beams Atmosphere */}
      <HeroAmbientBeams className="opacity-70" />

      {/* Page Title */}
      <div className="relative z-10 text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 uppercase tracking-widest shadow-xs">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ • PRODUCTION RBAC ACCESS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          ReliefAI Operational Portal
          <span className="block text-teal-700 font-bangla text-2xl sm:text-3xl font-bold mt-1">
            জাতীয় দুর্যোগ ও উদ্ধার নিয়ন্ত্রণ পোর্টালে প্রবেশ
          </span>
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Secure access control with HttpOnly token rotation and multi-tier role authorization.
        </p>
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        {/* Secure Login Form Card */}
        <div className="bg-white p-6 sm:p-9 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden space-y-6 text-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sign In to Crisis Command</h2>
              <p className="text-xs text-slate-500">Enter your official response credentials</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov.bd or email@domain.com"
                  autoComplete="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Remember me (30 days session)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Security...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration & NGO Navigation */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs text-slate-600">
            <div>
              <span>Don&apos;t have an account yet? </span>
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 hover:underline font-bold">
                Register Citizen Account
              </Link>
            </div>
            <div className="pt-1">
              <Link
                href="/auth/apply-ngo"
                className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-teal-700 font-medium transition"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>NGO / Humanitarian Agency Accreditation Application &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Production Security Protocols Badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Production Security Protocols Enforced</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Passwords secured with salted bcrypt. Session authentication protected via HttpOnly SameSite=Lax JWT cookies and single-use token rotation to prevent replay attacks.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-500">Loading Portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
