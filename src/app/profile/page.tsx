'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, role, updateProfile, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [assignedZone, setAssignedZone] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.name || '');
      setPhone(user.phone || user.phoneNumber || '');
      setOrganization(user.organization || '');
      setBadgeNumber(user.badgeNumber || '');
      setAssignedZone(user.assignedZone || '');
      setSkills(user.skills ? user.skills.join(', ') : '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await updateProfile({
      displayName,
      name: displayName,
      phone,
      organization,
      badgeNumber,
      assignedZone,
      skills: skillsArray,
    });

    if (res.success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-400">
        Loading personnel record...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-sm text-slate-400">You must be signed in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              {user.isEmailVerified ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Identity</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-400 font-mono">
                  <AlertCircle className="w-3 h-3" />
                  <span>Unverified Email</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Role Clearance:{' '}
              <span className="text-cyan-400 font-bold uppercase">{role}</span> • ID:{' '}
              <span className="text-slate-500">{user.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Active Session JWT</span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Personnel Record Details</span>
          </h2>
          <span className="text-xs text-slate-500">Edit fields to update credentials</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Display Name</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Registered Email (Read-Only)</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Contact Phone Number</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712-000000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Organization / Agency</label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="National Disaster Management"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Officer / Badge ID</label>
            <div className="relative">
              <BadgeCheck className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="ICS-4001"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Assigned Operational Sector</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={assignedZone}
                onChange={(e) => setAssignedZone(e.target.value)}
                placeholder="Dhaka North Command Sector"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Certifications & Specialties (Comma Separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Swift Water Rescue, EMT-Paramedic, Drone Reconnaissance"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Record...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
