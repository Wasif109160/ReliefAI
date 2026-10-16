'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldAlert,
  Users,
  Radio,
  FileText,
  CheckCircle2,
  Save,
  X,
  Search,
  Bot,
  Compass,
  ArrowRight,
  Zap,
  Truck,
  FileCheck,
  PlusCircle,
  Check,
  Ban,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SOSTrendChart, ShelterOccupancyChart } from '@/components/analytics/CrisisAnalyticsChart';
import { User, UserRole, NGOApplication } from '@/lib/types';
import StatCard from '@/components/StatCard';
import TacticalMap from '@/components/TacticalMap';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

const systemLogs = [
  { id: 'log-1', timestamp: '12:54:10', type: 'DISPATCH', event: 'FSCD Task Force USAR 1 deployed to Sylhet Gowainghat rooftop extraction' },
  { id: 'log-2', timestamp: '12:48:22', type: 'AI_TRIAGE', event: 'Gemini Satellite Triage classified Sylhet Sector as CRITICAL FLOOD (96/100)' },
  { id: 'log-3', timestamp: '12:35:05', type: 'CONVOY', event: 'Bangladesh Red Crescent convoy dispatched 800 water purification bladders' },
  { id: 'log-4', timestamp: '12:20:18', type: 'WEATHER', event: 'BWDB Surma gage updated: 14.22m (Critical +1.15m above danger level)' },
  { id: 'log-5', timestamp: '12:05:44', type: 'SHELTER', event: 'Sylhet Government High School Shelter admitted 42 citizens from water corridor' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [message, setMessage] = useState<string | null>(null);

  // NGO Accreditation state
  const [ngoApps, setNgoApps] = useState<NGOApplication[]>([]);
  const [loadingNgoApps, setLoadingNgoApps] = useState(true);

  // Provisioning Modal state
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provRole, setProvRole] = useState<'rescue_team' | 'government'>('rescue_team');
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provOrg, setProvOrg] = useState('Fire Service & Civil Defence (FSCD)');
  const [provBadge, setProvBadge] = useState('');
  const [provZone, setProvZone] = useState('Sylhet Division Riverine Sector 1');
  const [provPhone, setProvPhone] = useState('');
  const [provLoading, setProvLoading] = useState(false);

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

  const fetchNgoApps = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ngo-applications');
      if (res.ok) {
        const data = await res.json();
        setNgoApps(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch NGO applications:', err);
    } finally {
      setLoadingNgoApps(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchNgoApps();
  }, [fetchUsers, fetchNgoApps]);

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

  const handleReviewNGO = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/ngo-applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || `Application ${action}d successfully.`);
        fetchNgoApps();
        fetchUsers();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage(data.error || 'Failed to review application');
      }
    } catch {
      setMessage('Network error processing review');
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvLoading(true);
    try {
      const res = await fetch('/api/admin/users/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: provName,
          email: provEmail,
          role: provRole,
          organization: provOrg,
          badgeNumber: provBadge || undefined,
          assignedZone: provZone,
          phone: provPhone || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Official account provisioned. Verification email dispatched.');
        setShowProvisionModal(false);
        setProvName('');
        setProvEmail('');
        setProvBadge('');
        setProvPhone('');
        fetchUsers();
        setTimeout(() => setMessage(null), 4000);
      } else {
        alert(data.error || 'Provisioning failed');
      }
    } catch {
      alert('Network error provisioning user');
    } finally {
      setProvLoading(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Sub-navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-bold text-slate-900">EXECUTIVE INCIDENT COMMAND</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-blue-600">ICS-400 UNIFIED COMMAND</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <Link href="/command" className="hover:text-blue-600 font-semibold transition">ICS Center</Link>
          <Link href="/map" className="hover:text-blue-600 font-semibold transition">Tactical HUD</Link>
          <Link href="/settings" className="hover:text-blue-600 font-semibold transition">System RBAC</Link>
          <Link href="/ai-copilot" className="hover:text-blue-600 font-semibold transition">Gemini Copilot</Link>
        </div>
      </div>

      {/* Sovereign Admin Command Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-10 shadow-xs bg-white">
        <HeroAmbientBeams className="opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-xs text-blue-800 font-semibold uppercase tracking-wide">
              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>EXECUTIVE CRISIS COMMAND & RBAC GOVERNANCE (ICS-400)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Incident Command Center
              <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold mt-1">
                প্রধান দুর্যোগ কমান্ড ও নিরাপত্তা পর্যবেক্ষণ
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Commander: <strong className="text-slate-900">{user?.name || 'Cmdr. Elena Vance'}</strong> • Authority:{' '}
              <span className="text-blue-700 font-semibold">{user?.organization || 'National Disaster Management Agency (NDMA)'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
            <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
            <span>NATIONAL MESH: <strong className="text-emerald-700">100% SECURE</strong></span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Admin Executive Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Personnel"
          value={usersList.length || 5}
          subtitle="Multi-Agency Registered"
          icon={Users}
          variant="default"
          trend="Active"
        />
        <StatCard
          title="Active Missions"
          value="18 Ops"
          subtitle="Fire Service & Armed Forces"
          icon={ShieldAlert}
          variant="danger"
          trend="In Progress"
        />
        <StatCard
          title="Platform Uptime"
          value="99.99%"
          subtitle="MongoDB & Socket Relay"
          icon={Activity}
          variant="success"
          trend="Operational"
        />
        <StatCard
          title="AI Gemini Latency"
          value="240 ms"
          subtitle="Flash Triage Model"
          icon={Zap}
          variant="warning"
          trend="Optimal"
        />
      </div>

      {/* NGO Accreditation & Applications Review Queue */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] uppercase font-bold mb-1">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>ACCREDITATION REVIEW DESK</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>NGO Accreditation Applications & Verification</span>
            </h2>
            <p className="text-xs text-slate-500">
              Review institutional relief applications, inspect legal registration certificates, and grant authorized NGO Logistics clearance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              {ngoApps.filter((a) => a.status === 'pending').length} PENDING APPROVAL
            </span>
          </div>
        </div>

        {loadingNgoApps ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading accreditation queue...</div>
        ) : ngoApps.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No applications currently in queue.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ngoApps.map((app) => {
              const isPending = app.status === 'pending';
              const isApproved = app.status === 'approved';
              return (
                <div
                  key={app.id}
                  className={`p-5 rounded-xl border transition space-y-3 ${
                    isPending
                      ? 'border-amber-200 bg-amber-50/30'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 opacity-70 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{app.organizationName}</div>
                      <div className="text-[11px] font-mono text-slate-500">Reg: {app.registrationNumber}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Focal Representative:</span>
                      <strong className="text-slate-800">{app.focalPersonName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Official Email:</span>
                      <strong className="text-slate-800">{app.focalPersonEmail}</strong>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Relief Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {app.reliefCapabilities.map((cap, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-medium">
                          {cap.split('(')[0].trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {app.documentName && (
                    <div className="flex items-center space-x-1.5 text-xs text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-medium">Certificate: {app.documentName}</span>
                    </div>
                  )}

                  {isPending && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleReviewNGO(app.id, 'reject')}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition flex items-center space-x-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewNGO(app.id, 'approve')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve & Provision</span>
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <div className="text-xs text-emerald-800 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Approved by {app.reviewedBy || 'Command Administration'} • Account Provisioned</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RBAC Multi-Tier User Governance Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Multi-Agency RBAC Clearance & Personnel Governance</span>
            </h2>
            <p className="text-xs text-slate-500">Authorize clearance for Citizens, Rescue Teams, NGOs, and Government Officials</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowProvisionModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Provision Official Account</span>
            </button>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personnel or role..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Personnel</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Assigned Sector</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isEditing = editingUserId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{u.email}</div>
                      <div className="text-xs text-slate-500">{u.organization || 'General Public'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="bg-white border border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-900"
                        >
                          <option value="citizen">citizen</option>
                          <option value="rescue_team">rescue_team</option>
                          <option value="ngo">ngo</option>
                          <option value="government">government</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span
                          className={`font-semibold text-[10px] px-2.5 py-0.5 rounded-full uppercase border shadow-xs ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'government'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : u.role === 'ngo'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : u.role === 'rescue_team'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.isEmailVerified ? (
                        <span className="text-emerald-700 text-xs font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 text-xs font-semibold">Unverified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {u.assignedZone || 'Metropolitan Sector'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleUpdateRole(u.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
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
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-xs"
                        >
                          Modify
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

      {/* AI Commander Triage Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs text-blue-600 font-bold uppercase tracking-wider">
          <Bot className="w-4 h-4 text-blue-600" />
          <span>GEMINI AI MULTI-AGENCY INCIDENT COMMAND COPILOT</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Cross-Agency Resource Orchestration Summary
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          Autonomous telemetry analysis recommends shifting 4 inflatable pontoons from Dhaka reserve to Sunamganj corridor to maintain hospital bridge connectivity:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">SAR Fleet Alpha</span>
            <div className="text-xs font-bold text-slate-900">92% Operational Readiness</div>
            <p className="text-xs text-slate-500">All 18 speedboats manned with paramedics</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">NGO Relief Mesh</span>
            <div className="text-xs font-bold text-slate-900">25.0 MT Aid En Route</div>
            <p className="text-xs text-slate-500">Water purification convoy approaching Sylhet</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Coastal Shelters</span>
            <div className="text-xs font-bold text-slate-900">482 Verified Online</div>
            <p className="text-xs text-slate-500">Solar generation active on all high grounds</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Incoming SOS vs. Rescue Rate</h3>
              <p className="text-xs text-slate-500">Hourly tactical triage extractions in Sylhet Basin</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide">
              HOURLY
            </span>
          </div>
          <SOSTrendChart />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Safe Shelter Bed Capacities</h3>
              <p className="text-xs text-slate-500">Headcount across 482 active shelters</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              HEADCOUNT
            </span>
          </div>
          <ShelterOccupancyChart />
        </div>
      </div>

      {/* Interactive Bangladesh Tactical Map Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Full Sovereign Tactical Crisis Map HUD</span>
            </h3>
            <p className="text-xs text-slate-500">Multi-agency tactical operational view across all 64 districts</p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>Open Map HUD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <TacticalMap />
        </div>
      </div>

      {/* Command Audit Log */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Real-Time Incident Command Audit Log (ICS-400)</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">TAMPER-PROOF MESH</span>
        </div>

        <div className="space-y-2.5">
          {systemLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3 text-xs"
            >
              <span className="font-mono text-xs text-slate-500 shrink-0 pt-0.5">{log.timestamp}</span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase border shadow-xs ${
                  log.type === 'DISPATCH'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : log.type === 'AI_TRIAGE'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : log.type === 'CONVOY'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {log.type}
              </span>
              <span className="text-slate-800 leading-relaxed font-normal">{log.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Provision Official Personnel Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provision Official Personnel Account</h3>
                <p className="text-xs text-slate-500">Authorized command creation of Rescue Team or Government credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Clearance Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProvRole('rescue_team');
                      setProvOrg('Fire Service & Civil Defence (FSCD)');
                      setProvZone('Sylhet Division Riverine Sector 1');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      provRole === 'rescue_team'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🚒 Rescue Team (SAR)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProvRole('government');
                      setProvOrg('Ministry of Disaster Management & Relief');
                      setProvZone('National EOC Secretariat Dhaka');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      provRole === 'government'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🏛️ Government Agency
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Officer Name</label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={(e) => setProvName(e.target.value)}
                    placeholder="e.g. Capt. Tanvir Ahmed"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Official Email</label>
                  <input
                    type="email"
                    required
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    placeholder="e.g. officer@fscd.gov.bd"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Agency / Department</label>
                  <input
                    type="text"
                    required
                    value={provOrg}
                    onChange={(e) => setProvOrg(e.target.value)}
                    placeholder="e.g. FSCD Sylhet Division"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Badge / ID Number</label>
                  <input
                    type="text"
                    value={provBadge}
                    onChange={(e) => setProvBadge(e.target.value)}
                    placeholder="e.g. FSCD-SAR-9081"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assigned Operational Zone</label>
                  <input
                    type="text"
                    required
                    value={provZone}
                    onChange={(e) => setProvZone(e.target.value)}
                    placeholder="e.g. Surma Riverine Sector 1"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Official Contact Phone</label>
                  <input
                    type="tel"
                    value={provPhone}
                    onChange={(e) => setProvPhone(e.target.value)}
                    placeholder="e.g. +880 1611-004455"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold">Automated Security Workflow:</div>
                <div>• Initial secure credentials and a 6-digit first-login verification OTP will be generated.</div>
                <div>• An official activation email will be dispatched to the officer&apos;s registered email.</div>
                <div>• The officer must complete email verification on first login before dashboard access is unlocked.</div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition shadow-xs flex items-center space-x-1.5"
                >
                  {provLoading ? (
                    <span>Provisioning...</span>
                  ) : (
                    <>
                      <span>Provision & Dispatch Activation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
