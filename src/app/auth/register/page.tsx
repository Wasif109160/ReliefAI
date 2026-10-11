'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Mail,
  Lock,
  Phone,
  Building,
  ArrowRight,
  BadgeCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  LifeBuoy,
  Truck,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

const ROLES: { id: UserRole; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'citizen', title: 'Citizen', desc: 'Disaster SOS & safe shelters', icon: LifeBuoy },
  { id: 'rescue_team', title: 'Rescue Team', desc: 'First responder & tactical SAR', icon: Flame },
  { id: 'ngo', title: 'NGO Logistics', desc: 'Relief inventory & distribution', icon: Truck },
  { id: 'government', title: 'Government', desc: 'Civil defense & state alerts', icon: Building2 },
  { id: 'admin', title: 'Admin Commander', desc: 'Full tactical platform control', icon: ShieldCheck },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [assignedZone, setAssignedZone] = useState('Dhaka Central Sector');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const res = await register({
      name,
      email,
      password,
      role,
      phone,
      organization: organization || undefined,
      badgeNumber: badgeNumber || undefined,
      assignedZone,
    });

    if (!res.success) {
      setError(res.error || 'Registration failed');
      setLoading(false);
      return;
    }

    if (res.verificationUrl) {
      setVerificationNotice(res.verificationUrl);
    } else {
      routeToRoleDashboard(role);
    }
  };

  const routeToRoleDashboard = (targetRole: UserRole) => {
    switch (targetRole) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'government':
        router.push('/dashboard/government');
        break;
      case 'ngo':
        router.push('/dashboard/ngo');
        break;
      case 'rescue_team':
        router.push('/dashboard/rescue');
        break;
      case 'citizen':
      default:
        router.push('/dashboard/citizen');
        break;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400 uppercase">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>PERSONNEL REGISTRATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Join the ReliefAI Crisis Network</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Create your verified identity with role-based permissions and secure credential encryption.
        </p>
      </div>

      {verificationNotice ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/50 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Account Created Successfully!</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Your cryptographic profile has been registered. An email verification token has been issued.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-left">
            <span className="text-slate-400 font-mono text-[11px] block uppercase">Verification Link (Development Mode):</span>
            <Link
              href={verificationNotice}
              className="text-cyan-400 font-mono underline break-all hover:text-cyan-300 block"
            >
              {verificationNotice}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={verificationNotice}
              className="py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Verify Email Now
            </Link>
            <button
              onClick={() => routeToRoleDashboard(role)}
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Proceed to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Your Operational Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{r.title}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Vance"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.org"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1712-000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password (Min 8 Characters)</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          {(role === 'ngo' || role === 'government' || role === 'admin' || role === 'rescue_team') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Organization / Agency</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Bangladesh Red Crescent / Fire Service"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Badge / Officer ID</label>
                <div className="relative">
                  <BadgeCheck className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="e.g. FSCD-9821"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Assigned Operational Sector</label>
            <input
              type="text"
              value={assignedZone}
              onChange={(e) => setAssignedZone(e.target.value)}
              placeholder="e.g. Sylhet Sadar Flood Relief Zone"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Encrypted Profile...' : 'Complete Registration & Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-slate-400">
            Already have an active account?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:underline font-semibold">
              Sign In to Command Portal
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
