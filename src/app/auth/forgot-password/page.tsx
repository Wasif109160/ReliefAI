'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
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
        setMessage(data.message || 'If an account exists, a reset link has been dispatched.');
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      }
    } catch {
      setError('Network error contacting reset service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Reset Account Password</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your registered email address to receive a secure password reset link.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs space-y-3">
            <div className="flex items-center space-x-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
            {resetUrl && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] space-y-1">
                <span className="text-slate-400 font-mono block">Dev Direct Reset Link:</span>
                <Link href={resetUrl} className="text-cyan-400 underline font-mono break-all hover:text-cyan-300">
                  {resetUrl}
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Account Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@relief.ai"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Generating Reset Token...' : 'Dispatch Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
