'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performVerification = useCallback(async (tokenToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToVerify }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed or link expired.');
      } else {
        setVerified(true);
        refreshUser();
      }
    } catch {
      setError('Network error contacting verification service.');
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    if (token) {
      performVerification(token);
    }
  }, [token, performVerification]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
          <MailCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Email Address Verification</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Confirming your operational identity and activating crisis communications.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 text-center shadow-2xl">
        {loading && (
          <div className="py-8 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verifying security token...</p>
          </div>
        )}

        {verified && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Email Successfully Verified!</h2>
            <p className="text-xs text-slate-300">
              Your email is now verified. You have full authorized access to your operational dashboard.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950"
              >
                <span>Proceed to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Verification Link Invalid</h2>
            <p className="text-xs text-red-300">{error}</p>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center space-x-2 text-xs text-cyan-400 hover:underline font-semibold"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {!token && !loading && !verified && !error && (
          <div className="space-y-4 py-4">
            <p className="text-xs text-slate-400">
              No verification token was provided in the link. Please check the email sent to you or request a new verification link.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center space-x-2 text-xs text-cyan-400 hover:underline font-semibold"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">Loading Email Verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
