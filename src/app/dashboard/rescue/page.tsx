'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  Activity,
  Shield,
  Phone,
  Layers,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SARMission {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
  victimsCount: number;
  timeElapsed: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
  details: string;
}

const INITIAL_MISSIONS: SARMission[] = [
  {
    id: 'SAR-901',
    title: 'Surma River Basin Flash Flood Evacuation',
    severity: 'CRITICAL',
    location: 'Sector 4, Gowainghat Water Corridor',
    victimsCount: 6,
    timeElapsed: '14m ago',
    status: 'DISPATCHED',
    details: 'Elderly couple and four children trapped on tin roof. Water level +1.2m rising.',
  },
  {
    id: 'SAR-902',
    title: 'Building Masonry Collapse Extraction',
    severity: 'HIGH',
    location: 'Pioneer Annex Lane 3, Amberkhana',
    victimsCount: 2,
    timeElapsed: '32m ago',
    status: 'EN_ROUTE',
    details: 'Hydraulic spreader required. Tactical radio channel Alpha-2 active.',
  },
  {
    id: 'SAR-903',
    title: 'Medical Evacuation & Trauma Stabilization',
    severity: 'MEDIUM',
    location: 'Kazirbazar Safe Shelter Point B',
    victimsCount: 1,
    timeElapsed: '1h ago',
    status: 'ON_SCENE',
    details: 'Patient with severe fracture and hypothermia awaiting ambulance transfer.',
  },
];

export default function RescueDashboard() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<SARMission[]>(INITIAL_MISSIONS);
  const [radioChatter, setRadioChatter] = useState([
    { id: 1, sender: 'Incident Commander', time: '12:54', text: 'Task Force 1, maintain radio silence on tactical net Alpha except for emergency traffic.' },
    { id: 2, sender: 'SAR Unit 03 (Morales)', time: '12:56', text: 'Zodiac boat 2 launched at Surma bridge. En route to SAR-901 coordinates.' },
  ]);
  const [newChat, setNewChat] = useState('');

  const updateMissionStatus = (id: string, newStatus: SARMission['status']) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  const handleSendRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChat.trim()) return;
    setRadioChatter((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: user?.name || 'Rescue Officer',
        time: 'Just now',
        text: newChat.trim(),
      },
    ]);
    setNewChat('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>TACTICAL URBAN SEARCH & RESCUE (USAR) COMMAND</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Rescue Operations Deck
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Operator: <strong className="text-white">{user?.name || 'Rescue Officer'}</strong> • Badge:{' '}
            <span className="font-mono text-cyan-400 font-semibold">{user?.badgeNumber || 'SAR-7701'}</span> • Sector:{' '}
            <span className="text-slate-300">{user?.assignedZone || 'Mobile USAR Unit Alpha'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs text-white font-bold transition shadow-lg shadow-orange-950"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Tactical Map HUD</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Active SAR Dispatches</span>
          <div className="text-2xl font-black text-white">{missions.filter((m) => m.status !== 'RESOLVED').length}</div>
          <span className="text-[10px] text-orange-400 font-semibold">Priority 1 In Progress</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Victims Under Evacuation</span>
          <div className="text-2xl font-black text-cyan-400">9 Civilians</div>
          <span className="text-[10px] text-emerald-400 font-semibold">0 Casualties Recorded</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Equipment Readiness</span>
          <div className="text-2xl font-black text-emerald-400">98% OPTIMAL</div>
          <span className="text-[10px] text-slate-400">Boats & Drones Green</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Radio Tactical Net</span>
          <div className="text-2xl font-black text-amber-400">CH-ALPHA-02</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Encrypted Relay Active</span>
        </div>
      </div>

      {/* Missions Grid + Tactical Radio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Missions Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span>Assigned SAR Missions</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Sorted by Severity</span>
          </div>

          <div className="space-y-4">
            {missions.map((m) => (
              <div
                key={m.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        m.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                          : m.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {m.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{m.id}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{m.timeElapsed}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{m.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{m.details}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{m.location}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {m.status === 'DISPATCHED' && (
                      <button
                        onClick={() => updateMissionStatus(m.id, 'EN_ROUTE')}
                        className="py-1.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition"
                      >
                        Accept & En Route
                      </button>
                    )}
                    {m.status === 'EN_ROUTE' && (
                      <button
                        onClick={() => updateMissionStatus(m.id, 'ON_SCENE')}
                        className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition"
                      >
                        Mark On-Scene
                      </button>
                    )}
                    {m.status === 'ON_SCENE' && (
                      <button
                        onClick={() => updateMissionStatus(m.id, 'RESOLVED')}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition"
                      >
                        Complete Rescue Mission
                      </button>
                    )}
                    {m.status === 'RESOLVED' && (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold font-mono text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>MISSION ACCOMPLISHED</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Radio Chatter Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Tactical Radio Stream
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                LIVE NET
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {radioChatter.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-cyan-400">{c.sender}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-slate-200 leading-snug">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendRadio} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newChat}
                onChange={(e) => setNewChat(e.target.value)}
                placeholder="Broadcast on tactical net..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
