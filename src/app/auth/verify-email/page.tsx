'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [targetDashboard, setTargetDashboard] = useState('/dashboard/citizen');
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchDevOtp = async (targetEmail: string) => {
    if (process.env.NODE_ENV === 'production') return;
    try {
      const res = await fetch(`/api/auth/dev-outbox?email=${encodeURIComponent(targetEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.latest?.otpCode) {
          setDevOtpHint(data.latest.otpCode);
        }
      }
    } catch {}
  };

  const handleTokenVerification = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed');
      } else {
        setVerified(true);
        if (data.dashboardUrl) setTargetDashboard(data.dashboardUrl);
        await refreshUser();
      }
    } catch {
      setError('Network error contacting verification service.');
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  // If token is in URL (legacy or test link), auto-verify
  useEffect(() => {
    if (initialToken) {
      handleTokenVerification(initialToken);
    }
  }, [initialToken, handleTokenVerification]);

  // Fetch latest OTP hint for testing if email is provided (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && email) {
      fetchDevOtp(email);
    }
  }, [email]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const char = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      const fullOtp = newDigits.join('');
      submitOtp(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      if (pasted.length === 6) {
        submitOtp(pasted);
      } else {
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      }
    }
  };

  const submitOtp = async (otpCode: string) => {
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid or expired verification code.');
      } else {
        setVerified(true);
        if (data.dashboardUrl) setTargetDashboard(data.dashboardUrl);
        await refreshUser();
      }
    } catch {
      setError('Network error contacting verification service.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter your email address to resend code.');
      return;
    }

    if (resendCooldown > 0) return;

    setError(null);
    setResendStatus('Dispatching fresh verification code...');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'email_verification' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend code.');
        if (data.retryAfterSeconds) {
          setResendCooldown(data.retryAfterSeconds);
        }
        setResendStatus(null);
      } else {
        setResendStatus('A fresh 6-digit code has been dispatched to your email.');
        setResendCooldown(60);
        if (data.otpPreview) {
          setDevOtpHint(data.otpPreview);
        } else if (process.env.NODE_ENV !== 'production') {
          fetchDevOtp(email);
        }
        setTimeout(() => setResendStatus(null), 5000);
      }
    } catch {
      setError('Network error requesting new code.');
      setResendStatus(null);
    }
  };

  const fillDevOtp = () => {
    if (!devOtpHint) return;
    const newDigits = devOtpHint.split('').slice(0, 6);
    setDigits(newDigits);
    submitOtp(devOtpHint);
  };

  return (
    <FadeIn className="relative max-w-md mx-auto px-4 py-12 space-y-6">
      <HeroAmbientBeams className="opacity-70" />
      <div className="relative z-10 text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600 shadow-xs">
          <MailCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify Your Email Address
        </h1>
        <span className="block text-teal-700 font-bangla text-lg font-bold">
          ৬-সংখ্যার ইমেল যাচাইকরণ কোড (OTP)
        </span>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We have sent a secure 6-digit verification code to your registered email address.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 shadow-xs">
        {verified ? (
          <div className="space-y-5 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Email Successfully Verified!</h2>
              <p className="text-xs text-slate-600">
                Your account is now activated on the Relief AI National Emergency Grid.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={() => router.push(targetDashboard)}
                className="btn-shine w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
              >
                <span>Proceed to Authorized Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resendStatus && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resendStatus}</span>
              </div>
            )}

            {/* Email Address Confirmation Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Registered Email Address</span>
                <span className="text-[10px] text-slate-400 font-normal">Check spam folder if needed</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. your.email@example.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
              />
            </div>

            {/* 6-Digit OTP Boxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block text-center">
                Enter 6-Digit Code (যাচাইকরণ কোড)
              </label>

              <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 shadow-xs transition"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center space-x-1 text-xs text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Codes are valid for 10 minutes</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={loading || digits.some((d) => d === '')}
              onClick={() => submitOtp(digits.join(''))}
              className="btn-shine w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Activate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-blue-600 hover:underline font-bold disabled:text-slate-400 disabled:no-underline flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>

            {/* Development / Testing Quick Fill Helper (dev only) */}
            {process.env.NODE_ENV !== 'production' && devOtpHint && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Dispatched OTP Code:</span>
                  </span>
                  <button
                    type="button"
                    onClick={fillDevOtp}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <div className="font-mono text-base font-black text-blue-700 tracking-widest text-center py-0.5 bg-white rounded-lg border border-slate-200">
                  {devOtpHint}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 text-center text-xs text-slate-500">
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-bold">
          ← Return to Sign In
        </Link>
      </div>
    </FadeIn>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">Loading Email Verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
