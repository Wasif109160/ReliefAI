'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trees,
  Droplets,
  Trash2,
  Wind,
  CheckCircle2,
  ShieldCheck,
  Send,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import AnimatedCounter from '@/components/ui/animated-counter';
import { FadeIn, FadeInStagger, StaggerItem } from '@/components/ui/motion-wrapper';
import HeroAmbientBeams from '@/components/ui/hero-ambient-beams';

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
  { city: 'Dhaka Metropolitan', aqi: 172, category: 'Unhealthy', color: 'text-red-700 bg-red-50 border-red-200' },
  { city: 'Chittagong Port Zone', aqi: 94, category: 'Moderate', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { city: 'Sylhet Green Basin', aqi: 42, category: 'Good (Clean)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  { city: 'Rajshahi Silk Corridor', aqi: 118, category: 'Unhealthy for Sensitive', color: 'text-amber-800 bg-amber-50 border-amber-200' },
];

export default function EnvironmentPage() {
  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('Buriganga River Bank, Postogola');
  const [reportCategory, setReportCategory] = useState<'water' | 'waste' | 'air'>('water');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState('DOE-7492');

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    setIncidentId(`DOE-${Math.floor(1000 + Math.random() * 9000)}`);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportTitle('');
      setReportDescription('');
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner - Bright Premium Light Theme with Ambient Effect */}
      <FadeIn>
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-8 sm:p-12 shadow-xs bg-white">
          <HeroAmbientBeams />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 uppercase tracking-wide">
              <Trees className="w-3.5 h-3.5 text-teal-600" />
              <span>NATIONAL ENVIRONMENTAL PROTECTION & RIVER INTELLIGENCE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bangladesh River & Ecological Sentinel{' '}
              <span className="block text-teal-700 font-bangla text-2xl sm:text-3xl font-bold mt-1">
                (জাতীয় নদী ও পরিবেশ সুরক্ষা গ্রিড)
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Autonomous multi-sensor monitoring of Bangladesh&apos;s 700+ rivers, mangrove buffer belts, urban canal chokepoints, and industrial effluent discharges. Real-time community reporting empowers citizens and enforcement agencies to combat waterlogging and toxic runoff.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-700">
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 shadow-xs">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>
                  <AnimatedCounter value={42} /> Rivers Monitored by IoT
                </span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 shadow-xs">
                <Trees className="w-4 h-4 text-emerald-600" />
                <span>
                  <AnimatedCounter value="142,500" /> Mangrove Saplings Planted
                </span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 shadow-xs">
                <Trash2 className="w-4 h-4 text-amber-600" />
                <span>
                  <AnimatedCounter value={89} /> Canal Chokepoints Cleared
                </span>
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Real-Time Air Quality Index (AQI) Row */}
      <FadeIn delay={0.1}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-teal-600 animate-pulse" />
              <h2 className="text-lg font-extrabold text-slate-900">Live National Air Quality Index (AQI) Telemetry</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Department of Environment (DoE) Sensor Feed</span>
          </div>

          <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AQI_CITIES.map((c) => (
              <StaggerItem key={c.city}>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-3 shadow-xs hover:border-slate-300 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.city}</h3>
                      <span className="text-xs text-slate-500">Continuous PM2.5 Station</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs uppercase tracking-wide ${c.color}`}>
                      {c.category}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono">
                      <AnimatedCounter value={c.aqi} />
                    </span>
                    <span className="text-xs text-slate-500 font-bold">AQI</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </FadeInStagger>
        </div>
      </FadeIn>

      {/* River Basin Water Quality Telemetry Cards - 100% High Contrast Light Mode */}
      <FadeIn delay={0.15}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-teal-600" />
                <span>Major River Basin Water Quality & Effluent Telemetry</span>
              </h2>
              <p className="text-xs text-slate-500">Continuous optical & chemical probe readouts across arterial rivers</p>
            </div>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
              PROBES ONLINE: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RIVER_WATER_TELEMETRY.map((item) => (
              <div
                key={item.river}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition overflow-hidden shadow-xs flex flex-col justify-between group"
              >
                {/* Clear Bright Image Header - No dark overlays */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.river}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs uppercase tracking-wide ${
                        item.status === 'CRITICAL_POLLUTED'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.status === 'WARNING_EFFLUENT'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Card Body with High Contrast Black/Deep Navy Heading on Pure White */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {item.river}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">pH Balance</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{item.ph}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Dissolved O₂</span>
                      <span className="text-sm font-extrabold text-teal-700 font-mono">{item.dissolvedOxygen}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Turbidity</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{item.turbidity}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-medium">Enforcement Status:</span>
                    <span className="font-bold text-emerald-700 text-xs">{item.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Citizen Environmental Hazard Reporting Module */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Report Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Report Environmental Hazard / Illegal Dumping</h2>
                  <span className="text-xs text-teal-700 font-bangla font-semibold">পরিবেশ দূষণ ও খাল ভরাট রিপোর্ট করুন</span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold uppercase tracking-wider">
                AI Triage
              </span>
            </div>

            {reportSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">Environmental Incident Logged!</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Thank you for safeguarding Bangladesh&apos;s natural heritage. Incident #{incidentId} has been dispatched to the Department of Environment (DoE) Field Squad and Dhaka North City Corporation Drainage Task Force.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hazard Title / Incident Name</label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Factory dumping untreated dark effluent into canal"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Hazard Category</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value as 'water' | 'waste' | 'air')}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 shadow-xs"
                    >
                      <option value="water">River / Water Pollution (নদী দূষণ)</option>
                      <option value="waste">Canal Garbage Chokepoint (খাল ভরাট)</option>
                      <option value="air">Toxic Industrial Air Emission (বায়ু দূষণ)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Location / Landmark</label>
                    <input
                      type="text"
                      value={reportLocation}
                      onChange={(e) => setReportLocation(e.target.value)}
                      placeholder="e.g. Hazaribagh Tannery Canal, Dhaka"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Description of Violation</label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe severity, chemical color, water flow blockage, or health hazards..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Submit Verified Environmental Report</span>
                </button>
              </form>
            )}
          </div>

          {/* Impact Infographic Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bangladesh Climate & Delta Plan 2100</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                ReliefAI actively feeds continuous geospatial environmental data into the National Delta Plan 2100 framework to prioritize embankment dredging, urban stormwater retention basins, and mangrove afforestation.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Mangrove Embankment Resilience:</span>
                  <span className="font-extrabold text-emerald-700 font-mono">82% COMPLETE</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[82%]" />
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/map"
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <span>View Full Environmental GIS Layer on Tactical Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
