'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  AlertOctagon,
  Radio,
  FileCheck,
  Send,
  CheckCircle2,
  Activity,
  Layers,
  MapPin,
  ShieldAlert,
  BarChart2,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/lib/assets';

const NATIONAL_SENSORS = [
  { id: 'BWDB-SYL-01', location: 'Surma River at Kanaighat, Sylhet', metric: 'Water Level', value: '14.22m', dangerLevel: '13.20m', status: 'CRITICAL_HIGH', image: ASSETS.padmaRiver },
  { id: 'BWDB-SUN-02', location: 'Kushiyara River at Sherpur, Sunamganj', metric: 'Water Level', value: '9.45m', dangerLevel: '9.00m', status: 'WARNING', image: ASSETS.flood },
  { id: 'BWDB-CTG-03', location: 'Meghna Estuary Radar 4, Chittagong', metric: 'Storm Surge Gust', value: '78 km/h', dangerLevel: '85 km/h', status: 'MONITORING', image: ASSETS.cycloneShelter },
  { id: 'BWDB-RNG-04', location: 'Teesta Barrage Sluice Gate, Rangpur', metric: 'Discharge Flow', value: '118,000 cusecs', dangerLevel: '120,000 cusecs', status: 'STABLE', image: ASSETS.greenAreas },
];

export default function GovernmentDashboard() {
  const { user } = useAuth();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTargetZone, setBroadcastTargetZone] = useState('Sylhet Division & Sunamganj Basin (Surma-Kushiyara Basin)');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [emergencyLevel, setEmergencyLevel] = useState<'RED' | 'ORANGE' | 'YELLOW'>('RED');

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sovereign National EOC Header with Dhaka Megacity Backdrop */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-900/50 p-6 sm:p-10 shadow-2xl bg-gradient-to-r from-blue-950/80 via-slate-950/90 to-indigo-950/70">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
          <Image
            src={ASSETS.dhakaCity}
            alt="Dhaka National Operations Center"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-500/50 text-xs font-mono text-blue-300 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>MINISTRY OF DISASTER MANAGEMENT & RELIEF • NATIONAL EOC</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              National Civil Defense Command
              <span className="block text-blue-400 font-bangla text-xl sm:text-2xl font-bold mt-1">
                জাতীয় দুর্যোগ ব্যবস্থাপনা ও ইওসি কমান্ড সেন্টার
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Supervising Officer: <strong className="text-white">{user?.name || 'Secretary Tariq Rahman'}</strong> • Agency:{' '}
              <span className="text-cyan-400 font-semibold">{user?.organization || 'National Disaster Management Agency (NDMA)'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-4 py-2 rounded-2xl bg-red-950 border border-red-700 text-red-300 font-mono text-xs font-bold flex items-center space-x-2 animate-pulse shadow-lg shadow-red-950">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>STATE EMERGENCY DECLARATION: ACTIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* National High-Level Defense Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">AFFECTED POPULATION</span>
          <div className="text-2xl font-black text-white">1,420,000</div>
          <span className="text-[10px] text-red-400 font-semibold">18 Flood-Impacted Upazilas</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CYCLONE & FLOOD SHELTERS</span>
          <div className="text-2xl font-black text-cyan-400">482 Active</div>
          <span className="text-[10px] text-emerald-400 font-semibold">89,400 Citizens Admitted</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ARMED FORCES & POLICE FLEET</span>
          <div className="text-2xl font-black text-emerald-400">14 Speedboat Platoons</div>
          <span className="text-[10px] text-slate-400">Army, Navy & Police Units</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">STATE RELIEF DISBURSED</span>
          <div className="text-2xl font-black text-amber-400">৳ 25.0 Crore</div>
          <span className="text-[10px] text-slate-400">GR Cash & 1,500 MT Rice</span>
        </div>
      </div>

      {/* Emergency Cell Broadcast Gateway & Hydrological Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cell Broadcast Gateway */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-blue-900/40 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-700 flex items-center justify-center text-blue-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Emergency Cell Broadcast Gateway</h2>
                <span className="text-[11px] text-blue-400 font-bangla">মোবাইল গ্রাহকদের সরাসরি জরুরি সাইরেন বার্তা</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-blue-300 font-bold">
              BTRC CAP-v1.2
            </span>
          </div>

          {broadcastSent && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cellular Alert Pushed to 1,280,000 Active Mobile Subscribers</span>
              </div>
              <p className="text-[11px] text-emerald-200">
                All cellular towers in {broadcastTargetZone} have overridden ringers with acoustic emergency sirens.
              </p>
            </div>
          )}

          <form onSubmit={handleBroadcastAlert} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Geospatial Target Sector</label>
              <select
                value={broadcastTargetZone}
                onChange={(e) => setBroadcastTargetZone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Sylhet Division & Sunamganj Basin (Surma-Kushiyara Basin)">
                  Sylhet Division & Sunamganj Basin (Surma-Kushiyara Basin)
                </option>
                <option value="Chittagong Coastal Belt & Cox's Bazar">
                  Chittagong Coastal Belt & Cox&apos;s Bazar (Cyclone Danger)
                </option>
                <option value="Rangpur Division & Teesta Corridor">
                  Rangpur Division & Teesta River Basin (Flash Flood)
                </option>
                <option value="National All 64 Districts">
                  National All 64 Districts (Cabinet Directive)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Warning Siren Protocol</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'RED', label: 'Evacuate Red', color: 'border-red-600 bg-red-950 text-red-300' },
                  { level: 'ORANGE', label: 'Severe Alert', color: 'border-orange-600 bg-orange-950 text-orange-300' },
                  { level: 'YELLOW', label: 'Advisory Info', color: 'border-yellow-600 bg-yellow-950 text-yellow-300' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setEmergencyLevel(item.level as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      emergencyLevel === item.level ? item.color : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Bilingual Broadcast Payload (Handset Screen Override)</label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="[জরুরি বন্যা সতর্কতা] সুরমা নদীর পানি বিপদসীমার উপরে প্রবাহিত হচ্ছে। অবিলম্বে নিকটস্থ সাইক্লোন/বন্যা আশ্রয়কেন্দ্রে আশ্রয় নিন। (Emergency Flash Flood Warning: Evacuate immediately)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-950 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast National Emergency Alert</span>
            </button>
          </form>
        </div>

        {/* Real-time BWDB River Telemetry with Image */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">BWDB Hydrological Sensor Grid</h2>
                <span className="text-[11px] text-slate-400 font-bangla">পানি উন্নয়ন বোর্ড নদী জরিপ</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">100% ONLINE</span>
          </div>

          <div className="space-y-3">
            {NATIONAL_SENSORS.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{s.location}</span>
                    <span className="text-[10px] font-mono text-slate-500">{s.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    {s.metric}: <strong className="text-white font-mono">{s.value}</strong>{' '}
                    <span className="text-slate-400">(Danger Mark: {s.dangerLevel})</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    s.status === 'CRITICAL_HIGH'
                      ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                      : s.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bangabandhu Satellite-1 Telemetry Active</span>
            </span>
            <Link href="/map" className="text-cyan-400 hover:underline font-semibold">
              Open Hydrological Map →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
