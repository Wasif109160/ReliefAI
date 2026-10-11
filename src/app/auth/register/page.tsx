'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, User, Mail, Lock, Phone, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [role, setRole] = useState<UserRole>('citizen');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(role);
    if (role === 'volunteer') router.push('/dashboard/volunteer');
    else if (role === 'ngo') router.push('/dashboard/ngo');
    else if (role === 'admin') router.push('/dashboard/admin');
    else router.push('/sos');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Join ReliefAI Crisis Mesh</h1>
        <p className="text-xs text-slate-400">
          Create a verified responder or civilian profile for unified crisis management.
        </p>
      </div>

      <form onSubmit={handleRegister} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Select Role</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'citizen', label: 'Citizen' },
              { id: 'volunteer', label: 'Volunteer' },
              { id: 'ngo', label: 'NGO Lead' },
              { id: 'admin', label: 'Commander' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as UserRole)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  role === r.id
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Full Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Marcus Vance"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="responder@domain.org"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {(role === 'ngo' || role === 'admin' || role === 'volunteer') && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Organization / Agency</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Red Cross Alliance / CJEMA"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center space-x-1.5"
        >
          <span>Complete Registration</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-center text-[11px] text-slate-400 pt-2">
          Already registered?{' '}
          <Link href="/auth/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In with Fast Persona
          </Link>
        </p>
      </form>
    </div>
  );
}
