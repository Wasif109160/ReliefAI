'use client';

import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Bell,
  CheckCircle2,
  AlertCircle,
  LogOut,
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Security & Platform Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your cryptographic credentials, authentication sessions, and crisis relay preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Password & Session Security */}
        <div className="lg:col-span-7 space-y-6">
          {/* Change Password Panel */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white space-y-5 shadow-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500 font-medium">Ensure a strong, unique passkey</p>
              </div>
            </div>

            {passMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passMessage}</span>
              </div>
            )}

            {passError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">New Password (Min 8 Characters)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{changingPass ? 'Verifying & Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Session Invalidation */}
          <div className="p-6 rounded-3xl border border-red-200 bg-red-50/50 space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Session Security & Logout</h3>
                <p className="text-xs text-slate-600">Revoke your active JWT credentials and cookies</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              If you suspect token compromise or are leaving a shared command post terminal, terminate your session immediately.
            </p>
            <button
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-red-50 border border-red-300 text-red-700 font-bold text-xs uppercase tracking-wider transition flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Sign Out Everywhere</span>
            </button>
          </div>
        </div>

        {/* Right Column: Tactical Notifications & Preferences */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white space-y-5 shadow-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Crisis Notifications</h2>
                <p className="text-xs text-slate-500 font-medium">Operational alerts & tactical dispatch</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-start justify-between cursor-pointer space-x-3 p-2.5 rounded-2xl hover:bg-slate-50 transition">
                <div>
                  <span className="font-bold text-slate-900 block">Emergency SOS Push Broadcast</span>
                  <span className="text-slate-500 text-xs">Real-time push alerts for high-risk disasters in your sector</span>
                </div>
                <input
                  type="checkbox"
                  checked={emergencyAlerts}
                  onChange={(e) => setEmergencyAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 shrink-0 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer space-x-3 p-2.5 rounded-2xl hover:bg-slate-50 transition">
                <div>
                  <span className="font-bold text-slate-900 block">SMS Mesh Relay Fallback</span>
                  <span className="text-slate-500 text-xs">Receive cellular SMS dispatch when data network drops</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsRelay}
                  onChange={(e) => setSmsRelay(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 shrink-0 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer space-x-3 p-2.5 rounded-2xl hover:bg-slate-50 transition">
                <div>
                  <span className="font-bold text-slate-900 block">Continuous Location Heartbeat</span>
                  <span className="text-slate-500 text-xs">Allow Incident Command to geolocate your tactical position</span>
                </div>
                <input
                  type="checkbox"
                  checked={gpsHeartbeat}
                  onChange={(e) => setGpsHeartbeat(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 shrink-0 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer space-x-3 p-2.5 rounded-2xl hover:bg-slate-50 transition">
                <div>
                  <span className="font-bold text-slate-900 block">Audible High-Priority Siren</span>
                  <span className="text-slate-500 text-xs">Audible acoustic ping when severe flood or fire alert triggers</span>
                </div>
                <input
                  type="checkbox"
                  checked={highPrioritySound}
                  onChange={(e) => setHighPrioritySound(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 shrink-0 accent-blue-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-blue-900 font-bold">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Cryptographic Session Status</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              User ID: <span className="font-mono text-slate-900 font-bold">{user?.id || 'Anonymous'}</span>
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Refresh Token Policy: <span className="text-emerald-700 font-mono font-bold">Single-Use Rotation</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
