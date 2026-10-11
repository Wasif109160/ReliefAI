'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ShieldAlert,
  BarChart3,
  Users,
  Settings,
  AlertTriangle,
  Radio,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  ShieldCheck,
  UserCheck,
  Edit2,
  Save,
  X,
  Mail,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SOSTrendChart, ShelterOccupancyChart } from '@/components/analytics/CrisisAnalyticsChart';
import { User, UserRole } from '@/lib/types';

const systemLogs = [
  { id: 'log-1', timestamp: '12:54:10', type: 'DISPATCH', event: 'Task Force USAR 1 deployed to Pioneer Annex stairwell collapse' },
  { id: 'log-2', timestamp: '12:48:22', type: 'AI_TRIAGE', event: 'Incoming SOS #sos-101 classified as CRITICAL (96/100) - Water 4ft deep' },
  { id: 'log-3', timestamp: '12:35:05', type: 'CONVOY', event: 'Red Cross Alliance dispatched 800 water purification bladders to Lincoln' },
  { id: 'log-4', timestamp: '12:20:18', type: 'WEATHER', event: 'River gage sensor reading updated: 19.4 ft (Critical flood stage exceeded)' },
  { id: 'log-5', timestamp: '12:05:44', type: 'SHELTER', event: 'Cascadia Civic Arena admitted 42 citizens from Sector 4 River corridor' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: selectedRole }),
      });
      if (res.ok) {
        setMessage('User RBAC role updated successfully.');
        setEditingUserId(null);
        fetchUsers();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      console.error('Failed to update role');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>EXECUTIVE CRISIS COMMAND & RBAC GOVERNANCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Admin Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overseeing unified operations for <strong className="text-white">{user?.organization || 'National Crisis Command'}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-400">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>MESH SYNC: 100% OPERATIONAL</span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* RBAC User Management Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Role-Based Access Control (RBAC) User Governance</span>
            </h2>
            <p className="text-xs text-slate-400">Manage user clearance levels, roles, and cryptographic accounts</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or role..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Personnel</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Assigned Sector</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isEditing = editingUserId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.organization || 'General Public'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="bg-slate-950 border border-cyan-500 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="citizen">citizen</option>
                          <option value="rescue_team">rescue_team</option>
                          <option value="ngo">ngo</option>
                          <option value="government">government</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span
                          className={`font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : u.role === 'government'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : u.role === 'ngo'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : u.role === 'rescue_team'
                              ? 'bg-orange-950 text-orange-400 border border-orange-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.isEmailVerified ? (
                        <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-mono text-[11px]">Unverified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {u.assignedZone || 'Metropolitan Sector'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleUpdateRole(u.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setSelectedRole(u.role);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] uppercase font-semibold transition"
                        >
                          Edit Role
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts Row (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOS Trend Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">Incoming SOS vs. Rescue Rate</h3>
              <p className="text-xs text-slate-400">Real-time hourly triage extraction tracking</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
              HOURLY RUN
            </span>
          </div>
          <SOSTrendChart />
        </div>

        {/* Shelter Occupancy Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">Safe Shelter Bed Capacities</h3>
              <p className="text-xs text-slate-400">Current occupancy versus total shelter ceiling</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              HEADCOUNT
            </span>
          </div>
          <ShelterOccupancyChart />
        </div>
      </div>

      {/* System Telemetry & ICS-400 Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Command Audit Log */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Real-Time Incident Command Audit Log</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">ICS-400 COMPLIANT</span>
          </div>

          <div className="space-y-2.5">
            {systemLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3 text-xs"
              >
                <span className="font-mono text-[10px] text-slate-500 shrink-0 pt-0.5">{log.timestamp}</span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                    log.type === 'DISPATCH'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : log.type === 'AI_TRIAGE'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : log.type === 'CONVOY'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-slate-300 leading-relaxed font-sans">{log.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Administration Control Matrix */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Operational Authority Controls</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 block text-[10px] font-mono">AUTOMATED AI DISPATCH ENGINE</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> ACTIVE & STREAMING
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Autonomous triage threshold: 85/100</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 block text-[10px] font-mono">AIRSPACE COORDINATION</span>
              <span className="font-bold text-cyan-400">CLASS G AIRSPACE RESTRICTED</span>
              <p className="text-[11px] text-slate-400 mt-1">Authorized drone & medevac flights only</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 block text-[10px] font-mono">MEMBER ROSTER AUTHORIZATION</span>
              <span className="font-bold text-white">{usersList.length} Registered Accounts</span>
              <p className="text-[11px] text-slate-400 mt-1">Multi-tier RBAC authorization enforced</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Authorized Incident Commander credentials verified.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
