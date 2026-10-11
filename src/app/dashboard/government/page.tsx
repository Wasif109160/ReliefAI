'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NATIONAL_SENSORS = [
  { id: 'SEN-01', location: 'Surma River at Kanaighat', metric: 'Water Level', value: '14.22m', dangerLevel: '13.20m', status: 'CRITICAL_HIGH' },
  { id: 'SEN-02', location: 'Kushiyara River at Sherpur', metric: 'Water Level', value: '9.45m', dangerLevel: '9.00m', status: 'WARNING' },
  { id: 'SEN-03', location: 'Meghna Estuary Radar 4', metric: 'Wind Gust', value: '68 km/h', dangerLevel: '80 km/h', status: 'MONITORING' },
  { id: 'SEN-04', location: 'Teesta Barrage Reservoir', metric: 'Discharge Rate', value: '112,000 cusecs', dangerLevel: '120,000 cusecs', status: 'STABLE' },
];

export default function GovernmentDashboard() {
  const { user } = useAuth();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTargetZone, setBroadcastTargetZone] = useState('Sylhet Division & Sunamganj Basin');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [emergencyLevel, setEmergencyLevel] = useState<'RED' | 'ORANGE' | 'YELLOW'>('RED');

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>MINISTRY OF DISASTER MANAGEMENT & RELIEF • NATIONAL EOC</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            National Civil Defense Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervisory Officer: <strong className="text-white">{user?.name || 'Director General'}</strong> • Agency:{' '}
            <span className="text-cyan-400 font-semibold">{user?.organization || 'National Disaster Management Agency (NDMA)'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-xl bg-red-950 border border-red-700 text-red-300 font-mono text-xs font-bold flex items-center space-x-2 animate-pulse">
            <AlertOctagon className="w-4 h-4" />
            <span>STATE EMERGENCY DECLARATION: ACTIVE</span>
          </span>
        </div>
      </div>

      {/* High-Level Civil Defense Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Affected Population</span>
          <div className="text-2xl font-black text-white">1,420,000</div>
          <span className="text-[10px] text-red-400 font-semibold">Across 18 Upazilas</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">State Shelters Active</span>
          <div className="text-2xl font-black text-cyan-400">482 Shelters</div>
          <span className="text-[10px] text-emerald-400 font-semibold">89,400 Citizens Housed</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Armed Forces Deployment</span>
          <div className="text-2xl font-black text-emerald-400">14 Speedboat Platoons</div>
          <span className="text-[10px] text-slate-400">Army & Navy SAR</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Emergency Relief Allocated</span>
          <div className="text-2xl font-black text-amber-400">৳ 25.0 Crore</div>
          <span className="text-[10px] text-slate-400">GR Cash & 1,500 MT Rice</span>
        </div>
      </div>

      {/* Emergency Cell Broadcast Dispatcher & National Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cell Broadcast Gateway */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-blue-900/40 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-700 flex items-center justify-center text-blue-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Emergency Cell Broadcast Gateway</h2>
                <p className="text-xs text-slate-400">Direct cellular tower emergency push to mobile handsets</p>
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
                <span>Cellular Alert Pushed to 1,280,000 Registered SIMs</span>
              </div>
              <p className="text-[11px] text-emerald-200">
                All telecom base stations in {broadcastTargetZone} have transmitted siren override alerts.
              </p>
            </div>
          )}

          <form onSubmit={handleBroadcastAlert} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Geospatial Polygon / Division</label>
              <select
                value={broadcastTargetZone}
                onChange={(e) => setBroadcastTargetZone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Sylhet Division & Sunamganj Basin">Sylhet Division & Sunamganj Basin (Surma-Kushiyara Basin)</option>
                <option value="Chittagong Coastal Belt">Chittagong Coastal Belt & Cox's Bazar</option>
                <option value="Rangpur & Teesta Basin">Rangpur Division & Teesta Flood Corridor</option>
                <option value="National All Sectors">National Broadcast (All 64 Districts)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Alert Severity & Siren Protocol</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'RED', label: 'Critical Evacuate', color: 'border-red-600 bg-red-950 text-red-300' },
                  { level: 'ORANGE', label: 'Severe Warning', color: 'border-orange-600 bg-orange-950 text-orange-300' },
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
              <label className="text-xs font-medium text-slate-300">Bilingual Alert Message (SMS Handset Override)</label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="[জরুরি বন্যা সতর্কতা] সুরমা নদীর পানি বিপদসীমার উপরে প্রবাহিত হচ্ছে। অবিলম্বে নিকটস্থ সাইক্লোন/বন্যা আশ্রয়কেন্দ্রে আশ্রয় নিন। (Emergency Flash Flood Warning: Evacuate to nearest shelter immediately)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-950 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast National Emergency Alert</span>
            </button>
          </form>
        </div>

        {/* Real-time National Hydrological Sensor Mesh */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">BWDB Telemetry Sensor Grid</h2>
                <p className="text-xs text-slate-400">Real-time river level & discharge monitoring</p>
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
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {s.metric}: <strong className="text-white">{s.value}</strong> (Danger Mark: {s.dangerLevel})
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
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
            <span>Bangladesh Water Development Board API</span>
            <Link href="/map" className="text-cyan-400 hover:underline font-semibold">
              Open Hydrological Map →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
