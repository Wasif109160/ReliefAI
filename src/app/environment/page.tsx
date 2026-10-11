'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trees,
  Droplets,
  Trash2,
  Wind,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Send,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';

const RIVER_WATER_TELEMETRY = [
  {
    river: 'Buriganga River (বুড়িগঙ্গা নদী)',
    location: 'Sadarghat Point, Dhaka',
    ph: '7.8',
    dissolvedOxygen: '1.2 mg/L',
    turbidity: '84 NTU',
    status: 'CRITICAL_POLLUTED',
    action: 'Bio-remediation Aerators Active',
    image: ASSETS.waterPollution,
  },
  {
    river: 'Karnaphuli River (কর্ণফুলী নদী)',
    location: 'Kalurghat Heavy Industrial Belt, Chittagong',
    ph: '6.9',
    dissolvedOxygen: '3.8 mg/L',
    turbidity: '42 NTU',
    status: 'WARNING_EFFLUENT',
    action: 'Effluent Treatment Plant (ETP) Audit Enforced',
    image: ASSETS.wasteDumping,
  },
  {
    river: 'Surma River (সুরমা নদী)',
    location: 'Kazirbazar Reach, Sylhet',
    ph: '7.2',
    dissolvedOxygen: '6.4 mg/L',
    turbidity: '18 NTU',
    status: 'HEALTHY_NATURAL',
    action: 'Flash Flood Siltation Monitoring',
    image: ASSETS.padmaRiver,
  },
  {
    river: 'Sundarbans Delta Mangrove Estuary',
    location: 'Karatia Channel, Khulna',
    ph: '7.5',
    dissolvedOxygen: '7.1 mg/L',
    turbidity: '12 NTU',
    status: 'HEALTHY_NATURAL',
    action: 'Mangrove Biosphere Protected',
    image: ASSETS.greenAreas,
  },
];

const AQI_CITIES = [
  { city: 'Dhaka Metropolitan', aqi: 172, category: 'Unhealthy', color: 'text-red-400 bg-red-950/60 border-red-800' },
  { city: 'Chittagong Port Zone', aqi: 94, category: 'Moderate', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
  { city: 'Sylhet Green Basin', aqi: 42, category: 'Good (Clean)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
  { city: 'Rajshahi Silk Corridor', aqi: 118, category: 'Unhealthy for Sensitive', color: 'text-orange-400 bg-orange-950/60 border-orange-800' },
];

export default function EnvironmentPage() {
  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('Buriganga River Bank, Postogola');
  const [reportCategory, setReportCategory] = useState<'water' | 'waste' | 'air'>('water');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportTitle('');
      setReportDescription('');
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-900/40 p-8 sm:p-12 shadow-2xl bg-gradient-to-br from-emerald-950/70 via-slate-950/90 to-cyan-950/60">
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <Image
            src={ASSETS.greenAreas}
            alt="Bangladesh Green Ecology"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-xs font-mono text-emerald-300 uppercase tracking-widest">
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            <span>NATIONAL ENVIRONMENTAL PROTECTION & RIVER INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Bangladesh River & Ecological Sentinel{' '}
            <span className="block text-emerald-400 font-bangla text-2xl sm:text-3xl font-bold mt-1">
              (জাতীয় নদী ও পরিবেশ সুরক্ষা গ্রিড)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Autonomous multi-sensor monitoring of Bangladesh&apos;s 700+ rivers, mangrove buffer belts, urban canal chokepoints, and industrial effluent discharges. Real-time community reporting empowers citizens and enforcement agencies to combat waterlogging and toxic runoff.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-300">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center space-x-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>42 Rivers Monitored by IoT</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center space-x-1.5">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>142,500 Mangrove Saplings Planted</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center space-x-1.5">
              <Trash2 className="w-4 h-4 text-amber-400" />
              <span>89 Urban Canal Chokepoints Cleared</span>
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Air Quality Index (AQI) Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">Live National Air Quality Index (AQI) Telemetry</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Department of Environment (DoE) Sensor Feed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AQI_CITIES.map((c) => (
            <div key={c.city} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">{c.city}</h3>
                  <span className="text-[11px] text-slate-400">Continuous PM2.5 Station</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${c.color}`}>
                  {c.category}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">{c.aqi}</span>
                <span className="text-xs font-mono text-slate-400">AQI</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* River Basin Water Quality Telemetry Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span>Major River Basin Water Quality & Effluent Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400">Continuous optical & chemical probe readouts across arterial rivers</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 font-bold">
            PROBES ONLINE: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {RIVER_WATER_TELEMETRY.map((item) => (
            <div
              key={item.river}
              className="glass-panel rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition overflow-hidden shadow-xl flex flex-col justify-between group"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.river}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'CRITICAL_POLLUTED'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : item.status === 'WARNING_EFFLUENT'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-bold text-white">{item.river}</h3>
                  <p className="text-xs text-slate-300 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">pH Balance</span>
                    <span className="text-sm font-bold text-white">{item.ph}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Dissolved O₂</span>
                    <span className="text-sm font-bold text-cyan-400">{item.dissolvedOxygen}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Turbidity</span>
                    <span className="text-sm font-bold text-slate-300">{item.turbidity}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Enforcement Status:</span>
                  <span className="font-semibold text-emerald-400 text-[11px]">{item.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Environmental Hazard Reporting Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Report Form */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Report Environmental Hazard / Illegal Dumping</h2>
                <span className="text-[11px] text-emerald-400 font-bangla">পরিবেশ দূষণ ও খাল ভরাট রিপোর্ট করুন</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
              AI Triage
            </span>
          </div>

          {reportSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">Environmental Incident Logged!</h3>
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                Thank you for safeguarding Bangladesh&apos;s natural heritage. Incident #{Math.floor(1000 + Math.random() * 9000)} has been dispatched to the Department of Environment (DoE) Field Squad and Dhaka North City Corporation Drainage Task Force.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Hazard Title / Incident Name</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Factory dumping untreated dark effluent into canal"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Hazard Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="water">River / Water Pollution (নদী দূষণ)</option>
                    <option value="waste">Canal Garbage Chokepoint (খাল ভরাট)</option>
                    <option value="air">Toxic Industrial Air Emission (বায়ু দূষণ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Location / Landmark</label>
                  <input
                    type="text"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder="e.g. Hazaribagh Tannery Canal, Dhaka"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Description of Violation</label>
                <textarea
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe severity, chemical color, water flow blockage, or health hazards..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Verified Environmental Report</span>
              </button>
            </form>
          )}
        </div>

        {/* Impact Infographic Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bangladesh Climate & Delta Plan 2100</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ReliefAI actively feeds continuous geospatial environmental data into the National Delta Plan 2100 framework to prioritize embankment dredging, urban stormwater retention basins, and mangrove afforestation.
            </p>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between items-center">
                <span>Mangrove Embankment Resilience:</span>
                <span className="font-bold text-emerald-400 font-mono">82% COMPLETE</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[82%]" />
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/map"
                className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>View Full Environmental GIS Layer on Tactical Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
