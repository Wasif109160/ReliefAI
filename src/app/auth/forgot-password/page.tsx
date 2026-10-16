'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, KeyRound, CheckCircle2, Clock } from 'lucide-react';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to request password reset');
      } else {
        setMessage(data.message || 'A 6-digit password reset code has been dispatched.');
        // Navigate to Reset Password page with email prefilled
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch {
      setError('Network error contacting reset service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn className="relative max-w-md mx-auto px-4 py-16 space-y-6">
      <HeroAmbientBeams className="opacity-70" />
      <div className="relative z-10 text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Forgot Your Password?
        </h1>
        <span className="block text-teal-700 font-bangla text-base font-bold">
          পাসওয়ার্ড রিসেট কোড (OTP) অনুরোধ
        </span>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your registered email address. We will dispatch a secure 6-digit OTP code to verify your identity.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Reset Code Dispatched!</h3>
              <p className="text-xs text-slate-600">{message}</p>
              <p className="text-xs text-teal-700 font-semibold pt-1">Redirecting to code entry page...</p>
            </div>

            <div className="pt-2">
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase transition shadow-xs"
              >
                <span>Enter Reset Code Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rafiqul@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs">Security codes expire in 10 minutes from dispatch.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Dispatching Code...</span>
              ) : (
                <>
                  <span>Send 6-Digit Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="relative z-10 text-center text-xs text-slate-500">
        <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 inline-flex items-center space-x-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </FadeIn>
  );
}
