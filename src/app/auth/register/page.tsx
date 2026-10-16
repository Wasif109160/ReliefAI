'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  LifeBuoy,
  Truck,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationName, setLocationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          locationName: locationName || 'Bangladesh National Grid',
          password,
          role: 'citizen', // Enforced: Only Citizens can self-register!
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to complete registration.');
        setLoading(false);
        return;
      }

      // Redirect directly to the Email Verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&registered=true`);
    } catch {
      setError('Network error connecting to registration service. Please try again.');
      setLoading(false);
    }
  };

  return (
    <FadeIn className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-slate-900">
      {/* Light Ambient Beams Atmosphere */}
      <HeroAmbientBeams className="opacity-70" />

      {/* Header */}
      <div className="relative z-10 text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 uppercase shadow-xs font-semibold">
          <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ • CITIZEN DISASTER REGISTRATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Join the Relief AI National Grid
        </h1>
        <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold">
          নাগরিক জরুরি দুর্যোগ সহায়তা নেটওয়ার্কে নিবন্ধন
        </span>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Public self-registration is reserved for Citizens. Verified accounts receive real-time flood telemetry, shelter alerts, and 1-Touch emergency SOS dispatch.
        </p>
      </div>

      {/* Institutional Role Notice Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NGO Accreditation CTA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>NON-GOVERNMENTAL ORGANIZATIONS (NGO)</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">Are you a Relief NGO or Humanitarian Charity?</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public self-registration is disabled for organizations. Submit an official accreditation application with your NGO Affairs Bureau license for admin verification.
            </p>
          </div>
          <div className="pt-3">
            <Link
              href="/auth/apply-ngo"
              className="inline-flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Apply for NGO Accreditation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Rescue Team & Government Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>OFFICIAL CLEARANCE & FIRST RESPONDERS</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">Rescue Team, Government & Admin Personnel</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fire Service (FSCD), USAR units, and Civil Defense officers cannot self-register. Accounts are created manually by Emergency Command Administration using official credentials.
            </p>
          </div>
          <div className="pt-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              <span>Already provisioned? Sign in to authorized terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Citizen Registration Form Card */}
      <div className="relative z-10 bg-white p-6 sm:p-9 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Citizen Registration Form</h2>
            <p className="text-xs text-slate-500">Provide your verified contact information for safety notices</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-700 font-bold uppercase">
            ROLE: CITIZEN
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name (নাম)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rafiqul Islam / রফিকুল ইসলাম"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address (ইমেল)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rafiqul@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mobile Phone Number (মোবাইল নম্বর)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +880 1712-345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-500">Used for disaster SMS alerts and SOS rescue contact</p>
            </div>

            {/* Location / District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Location / Upazila (এলাকা / উপজেলা)</label>
              <div className="relative">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Sylhet Sadar / Gowainghat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password (পাসওয়ার্ড)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Security Strength:</span>
                    <span className="font-bold text-slate-700">{strengthLabels[passwordStrength]}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex space-x-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          passwordStrength >= step ? strengthColors[passwordStrength] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm Password (পুনরায় পাসওয়ার্ড লিখুন)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Upon clicking Register, a <strong>6-digit email verification code (OTP)</strong> will be sent to your email address. You will verify this code before your first login to activate your account.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-shine w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <span>Generating Verification Code...</span>
            ) : (
              <>
                <span>Register Citizen Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
            Sign In to Existing Account
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
