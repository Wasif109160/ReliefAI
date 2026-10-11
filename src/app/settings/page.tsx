'use client';

import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Bell,
  Radio,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Smartphone,
  Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Preference toggles
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [smsRelay, setSmsRelay] = useState(true);
  const [gpsHeartbeat, setGpsHeartbeat] = useState(true);
  const [highPrioritySound, setHighPrioritySound] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassMessage(null);

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password confirmation does not match');
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPassError(data.error || 'Failed to update password');
      } else {
        setPassMessage('Password changed successfully! Keep your credentials secure.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPassError('Network error updating password.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Security & Platform Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your cryptographic credentials, authentication sessions, and crisis relay preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Password & Session Security */}
        <div className="lg:col-span-7 space-y-6">
          {/* Change Password Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Change Password</h2>
                <p className="text-xs text-slate-400">Ensure a strong, unique passkey</p>
              </div>
            </div>

            {passMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passMessage}</span>
              </div>
            )}

            {passError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">New Password (Min 8 Characters)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center space-x-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{changingPass ? 'Verifying & Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Session Invalidation */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Session Security & Logout</h3>
                <p className="text-xs text-slate-400">Revoke your active JWT credentials and cookies</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you suspect token compromise or are leaving a shared command post terminal, terminate your session immediately.
            </p>
            <button
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold text-xs uppercase tracking-wider transition flex items-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out Everywhere</span>
            </button>
          </div>
        </div>

        {/* Right Column: Tactical Notifications & Preferences */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Crisis Notifications</h2>
                <p className="text-xs text-slate-400">Operational alerts & tactical dispatch</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-start justify-between cursor-pointer space-x-3">
                <div>
                  <span className="font-semibold text-white block">Emergency SOS Push Broadcast</span>
                  <span className="text-slate-400 text-[11px]">Real-time push alerts for high-risk disasters in your sector</span>
                </div>
                <input
                  type="checkbox"
                  checked={emergencyAlerts}
                  onChange={(e) => setEmergencyAlerts(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer space-x-3">
                <div>
                  <span className="font-semibold text-white block">SMS Mesh Relay Fallback</span>
                  <span className="text-slate-400 text-[11px]">Receive cellular SMS dispatch when data network drops</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsRelay}
                  onChange={(e) => setSmsRelay(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer space-x-3">
                <div>
                  <span className="font-semibold text-white block">Continuous Location Heartbeat</span>
                  <span className="text-slate-400 text-[11px]">Allow Incident Command to geolocate your tactical position</span>
                </div>
                <input
                  type="checkbox"
                  checked={gpsHeartbeat}
                  onChange={(e) => setGpsHeartbeat(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer space-x-3">
                <div>
                  <span className="font-semibold text-white block">Audible High-Priority Siren</span>
                  <span className="text-slate-400 text-[11px]">Audible acoustic ping when severe flood or fire alert triggers</span>
                </div>
                <input
                  type="checkbox"
                  checked={highPrioritySound}
                  onChange={(e) => setHighPrioritySound(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5 shrink-0"
                />
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>Cryptographic Session Status</span>
            </div>
            <p className="text-[11px] text-slate-400">
              User ID: <span className="font-mono text-slate-300">{user?.id || 'Anonymous'}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Refresh Token Policy: <span className="text-emerald-400 font-mono">Single-Use Rotation</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
