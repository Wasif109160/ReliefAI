'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  Send,
  LifeBuoy,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/lib/assets';

interface SARMission {
  id: string;
  title: string;
  banglaTitle: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
  victimsCount: number;
  timeElapsed: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
  details: string;
  image: string;
}

const INITIAL_MISSIONS: SARMission[] = [
  {
    id: 'SAR-BD-901',
    title: 'Surma River Basin Rooftop Flash Flood Extraction',
    banglaTitle: 'সুরমা নদী অববাহিকা ছাদ থেকে উদ্ধার অভিযান',
    severity: 'CRITICAL',
    location: 'Sector 4, Gowainghat Water Corridor, Sylhet',
    victimsCount: 6,
    timeElapsed: '14m ago',
    status: 'DISPATCHED',
    details: 'Elderly family trapped on tin roof. Water level +1.4m and rising fast. Zodiac speed boat required.',
    image: ASSETS.rescueOperation,
  },
  {
    id: 'SAR-BD-902',
    title: 'Chittagong Hillside Mudslide Collapse Search',
    banglaTitle: 'চট্টগ্রাম পাহাড়ধস অনুসন্ধান ও উদ্ধার',
    severity: 'HIGH',
    location: 'Lalkhan Bazar Hill Slope, Chittagong',
    victimsCount: 3,
    timeElapsed: '32m ago',
    status: 'EN_ROUTE',
    details: 'Heavy mudslide following torrential rain. Thermal imaging drone and acoustic listening disc active.',
    image: ASSETS.fireService,
  },
  {
    id: 'SAR-BD-903',
    title: 'Post-Cyclone Medevac & Patient Transfer',
    banglaTitle: 'সাইক্লোন পরবর্তী জরুরি রোগী স্থানান্তর',
    severity: 'MEDIUM',
    location: 'Teknaf Coastal Camp Primary Clinic',
    victimsCount: 2,
    timeElapsed: '1h ago',
    status: 'ON_SCENE',
    details: 'Two injured pregnant mothers transferred to district trauma unit via GPS ambulance unit.',
    image: ASSETS.ambulance,
  },
];

export default function RescueDashboard() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<SARMission[]>(INITIAL_MISSIONS);
  const [radioChatter, setRadioChatter] = useState([
    { id: 1, sender: 'FSCD Incident Commander', time: '12:54', text: 'Task Force USAR 1, maintain radio silence on VHF Ch-16 except for emergency traffic.' },
    { id: 2, sender: 'SAR Unit 03 (Morales)', time: '12:56', text: 'Zodiac boat 2 launched at Surma bridge. En route to SAR-BD-901 coordinates.' },
    { id: 3, sender: 'Air Reconnaissance Drone 4', time: '12:59', text: 'Thermal scan confirms 6 heat signatures on tin roof. Rooftop structurally stable.' },
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
      {/* Tactical SAR Header with Fire Service Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-orange-900/40 p-6 sm:p-10 shadow-2xl bg-gradient-to-r from-orange-950/80 via-slate-950/90 to-red-950/70">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
          <Image
            src={ASSETS.fireService}
            alt="Bangladesh Fire Service & Civil Defence"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950 border border-orange-500/50 text-xs font-mono text-orange-300 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>BANGLADESH FIRE SERVICE & CIVIL DEFENCE • USAR COMMAND</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tactical SAR Operations Deck
              <span className="block text-orange-400 font-bangla text-xl sm:text-2xl font-bold mt-1">
                উদ্ধার অভিযান ও ফিল্ড রেসপন্স ডেক
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Commanding Officer: <strong className="text-white">{user?.name || 'Lt. James Morales'}</strong> • Badge:{' '}
              <span className="font-mono text-cyan-400 font-semibold">{user?.badgeNumber || 'FSCD-7701'}</span> • Sector:{' '}
              <span className="text-slate-300">{user?.assignedZone || 'Sylhet Division Mobile USAR Fleet Alpha'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/map"
              className="px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-xs text-white font-bold transition shadow-xl shadow-orange-950 flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Tactical GIS Map HUD</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Fleet Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE SAR DISPATCHES</span>
          <div className="text-2xl font-black text-white">{missions.filter((m) => m.status !== 'RESOLVED').length} Operations</div>
          <span className="text-[10px] text-orange-400 font-semibold">Priority 1 Surge In Progress</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">VICTIMS UNDER EXTRACTION</span>
          <div className="text-2xl font-black text-cyan-400">11 Civilians</div>
          <span className="text-[10px] text-emerald-400 font-semibold">0 Casualties Recorded</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">SPEEDBOATS & ZODIACS</span>
          <div className="text-2xl font-black text-emerald-400">18 ACTIVE</div>
          <span className="text-[10px] text-slate-400">Fire Service & Navy Diving Team</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">TACTICAL RADIO NET</span>
          <div className="text-2xl font-black text-amber-400">VHF CH-16</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Encrypted Satellite Relay Live</span>
        </div>
      </div>

      {/* SAR Mission Pipeline + Tactical Radio Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Missions Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span>Assigned SAR Missions (জরুরি উদ্ধার অ্যাসাইনমেন্ট)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Sorted by Severity</span>
          </div>

          <div className="space-y-5">
            {missions.map((m) => (
              <div
                key={m.id}
                className="glass-panel rounded-3xl border border-slate-800 hover:border-orange-500/50 transition overflow-hidden shadow-2xl flex flex-col md:flex-row group"
              >
                {/* Mission Visual Image */}
                <div className="relative md:w-56 h-48 md:h-auto overflow-hidden shrink-0">
                  <Image
                    src={m.image}
                    alt={m.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/20 to-slate-950" />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        m.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                          : m.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {m.severity}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>{m.id}</span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Clock className="w-3 h-3" />
                        <span>{m.timeElapsed}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{m.title}</h3>
                    <span className="text-[11px] font-bangla text-orange-300 font-semibold block">{m.banglaTitle}</span>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{m.details}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{m.location}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      {m.status === 'DISPATCHED' && (
                        <button
                          onClick={() => updateMissionStatus(m.id, 'EN_ROUTE')}
                          className="py-1.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          Accept & Deploy
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
                          Complete Rescue
                        </button>
                      )}
                      {m.status === 'RESOLVED' && (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold font-mono text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>RESCUE ACCOMPLISHED</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Radio Stream Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Fire Service Tactical Radio
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                LIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {radioChatter.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-orange-400">{c.sender}</span>
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
                placeholder="Radio message on Ch-16..."
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
