'use client';

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  Award,
  Zap,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { VolunteerTask, SeverityLevel } from '@/lib/types';

const initialTasks: VolunteerTask[] = [
  {
    id: 'tsk-01',
    title: 'Reinforce Sandbag Berms at Staging Ramp',
    description: 'River crest expected in 3 hours. Assist engineering squad in laying 200 heavy gravel sandbags along south levee.',
    zone: 'River Staging Ramp Dock B',
    priority: 'high',
    requiredSkill: 'Physical Logistics',
    status: 'open',
    createdAt: '15m ago',
  },
  {
    id: 'tsk-02',
    title: 'Distribute Infant Formula & Pediatric Water',
    description: '3 families with infants evacuated to Lincoln High Gymnasium require specialty pediatric formula and blankets.',
    zone: 'Lincoln Safe Zone (Annex)',
    priority: 'critical',
    requiredSkill: 'CPR / First Aid',
    assignedVolunteerId: 'demo-volunteer-2',
    assignedVolunteerName: 'Chloe Dubois',
    status: 'in_progress',
    createdAt: '30m ago',
  },
  {
    id: 'tsk-03',
    title: 'Spanish-English Crisis Intake Translation',
    description: 'Elderly non-English speaking family admitted to Cascadia Civic Arena needing medical intake assessment.',
    zone: 'Cascadia Civic Arena Intake Hall',
    priority: 'moderate',
    requiredSkill: 'Bilingual Translator',
    status: 'open',
    createdAt: '1h ago',
  },
  {
    id: 'tsk-04',
    title: 'Wellness Check on Elmira St Block 11',
    description: 'Confirm 6 residences have evacuated to high ground before nightfall.',
    zone: 'Fluvial District Sector 4',
    priority: 'moderate',
    requiredSkill: 'General Volunteer',
    assignedVolunteerId: 'demo-volunteer-2',
    assignedVolunteerName: 'Chloe Dubois',
    status: 'completed',
    createdAt: '2h ago',
  },
];

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<VolunteerTask[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'open'>('all');
  const [checkInStatus, setCheckInStatus] = useState(false);

  const handleClaimTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'in_progress',
              assignedVolunteerId: user?.id || user?.uid || 'vol-1',
              assignedVolunteerName: user?.displayName || user?.name || 'Volunteer',
            }
          : t
      )
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
    );
  };

  const currentUserId = user?.id || user?.uid || 'demo-volunteer-2';
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'open') return t.status === 'open';
    if (activeTab === 'my') return t.assignedVolunteerId === currentUserId;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>VOLUNTEER MOBILIZATION & FIELD OPERATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Volunteer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.displayName || user?.name || 'Volunteer Worker'}</strong> ({user?.organization || 'Independent Volunteer'}).
          </p>
        </div>

        {/* GPS Check-in Toggle */}
        <button
          onClick={() => setCheckInStatus(!checkInStatus)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-lg ${
            checkInStatus
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-950'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MapPin className={`w-4 h-4 ${checkInStatus ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{checkInStatus ? 'ON-SCENE GPS ACTIVE' : 'CHECK IN ON-SCENE'}</span>
        </button>
      </div>

      {/* Volunteer Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">MISSIONS COMPLETED</span>
          <div className="text-2xl font-black text-emerald-400">{completedCount} Missions</div>
          <p className="text-[11px] text-slate-500">Verified by Incident Command</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE DEPLOYMENTS</span>
          <div className="text-2xl font-black text-amber-400">{inProgressCount} In Progress</div>
          <p className="text-[11px] text-slate-500">Sector 4 Fluvial District</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">VOLUNTEER HOURS</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">18.5 hrs</div>
          <p className="text-[11px] text-slate-500">Operational Period 02</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">BADGE LEVEL</span>
          <div className="text-2xl font-black text-purple-400 flex items-center space-x-1.5">
            <Award className="w-5 h-5 text-purple-400" />
            <span>Tier II Lead</span>
          </div>
          <p className="text-[11px] text-slate-500">Certified Swift Water</p>
        </div>
      </div>

      {/* Mission Board Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {(['all', 'open', 'my'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Missions' : tab === 'open' ? 'Open for Claim' : 'My Assigned Missions'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const isCritical = task.priority === 'critical';
          const isMyTask = task.assignedVolunteerId === currentUserId;

          return (
            <div
              key={task.id}
              className={`glass-panel p-6 rounded-3xl border transition space-y-4 shadow-xl flex flex-col justify-between ${
                isCritical ? 'border-red-500/40 shadow-red-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white">{task.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      task.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : task.status === 'in_progress'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {task.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{task.zone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{task.requiredSkill}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Posted {task.createdAt}</span>

                {task.status === 'open' && (
                  <button
                    onClick={() => handleClaimTask(task.id)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-950 flex items-center space-x-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Claim Mission</span>
                  </button>
                )}

                {task.status === 'in_progress' && isMyTask && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-950 flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {task.status === 'completed' && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-4 h-4" /> VERIFIED COMPLETE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
