'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertOctagon,
  Radio,
  Send,
  CheckCircle2,
  Activity,
  ShieldAlert,
  Users,
  ShieldCheck,
  Bot,
  Compass,
  ArrowRight,
  Clock,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import TacticalMap from '@/components/TacticalMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';
import { DemoModeBanner } from '@/components/ui/demo-mode-indicator';

const NATIONAL_SENSORS = [
  { id: 'BWDB-SYL-01', location: 'Surma River at Kanaighat, Sylhet', metric: 'Water Level', value: '14.22m', dangerLevel: '13.20m', status: 'CRITICAL_HIGH' },
  { id: 'BWDB-SUN-02', location: 'Kushiyara River at Sherpur, Sunamganj', metric: 'Water Level', value: '9.45m', dangerLevel: '9.00m', status: 'WARNING' },
  { id: 'BWDB-CTG-03', location: 'Meghna Estuary Radar 4, Chittagong', metric: 'Storm Surge Gust', value: '78 km/h', dangerLevel: '85 km/h', status: 'MONITORING' },
  { id: 'BWDB-RNG-04', location: 'Teesta Barrage Sluice Gate, Rangpur', metric: 'Discharge Flow', value: '118,000 cusecs', dangerLevel: '120,000 cusecs', status: 'STABLE' },
];

const DIVISION_DAMAGE_DATA = [
  { division: 'Sylhet', affected: 1420, evacuated: 89 },
  { division: 'Chittagong', affected: 850, evacuated: 42 },
  { division: 'Barisal', affected: 520, evacuated: 31 },
  { division: 'Rangpur', affected: 310, evacuated: 14 },
];

const EOC_TIMELINE = [
  { time: '13:00', title: 'State Emergency Declaration Promulgated', agency: 'Cabinet Division', desc: 'Section 4 disaster protocols active across Sylhet and Sunamganj.' },
  { time: '11:45', title: 'Armed Forces Division (AFD) Mobilized', agency: 'Army & Navy', desc: '14 Speedboat platoons dispatched with high-capacity dewatering pumps.' },
  { time: '09:20', title: 'Cell Siren Blast Approved by BTRC', agency: 'BTRC & Telecom', desc: 'Push alert sent to 1.28M cellular handsets with audio override.' },
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
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Mode & Provenance Banner */}
      <DemoModeBanner compact mode="demo" />

      {/* Civil Defense Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-extrabold tracking-wider text-slate-800 uppercase">NATIONAL EOC COMMAND BUNKER</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            MoDMR Directive Live
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-600">
          <Link href="/command" className="hover:text-blue-600 font-semibold transition">EOC Command</Link>
          <Link href="/map" className="hover:text-blue-600 font-semibold transition">National Map</Link>
          <Link href="/shelters" className="hover:text-blue-600 font-semibold transition">Shelters Census</Link>
          <Link href="/distribution" className="hover:text-blue-600 font-semibold transition">State Aid Mesh</Link>
        </div>
      </div>

      {/* Sovereign National EOC Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-8 shadow-xs bg-white">
        <HeroAmbientBeams className="opacity-70" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-50/80 via-teal-50/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 uppercase font-bold">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>MINISTRY OF DISASTER MANAGEMENT & RELIEF • NATIONAL EOC</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              National Civil Defense Command
              <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold mt-1">
                জাতীয় দুর্যোগ ব্যবস্থাপনা ও ইওসি কমান্ড সেন্টার
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Supervising Officer: <strong className="text-slate-800">{user?.name || 'Secretary Tariq Rahman'}</strong> • Agency:{' '}
              <span className="text-blue-700 font-bold">{user?.organization || 'National Disaster Management Agency (NDMA)'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2 shadow-xs">
              <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
              <span>STATE EMERGENCY DECLARATION: ACTIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* National High-Level Defense Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Affected Population"
          value="1,420,000"
          subtitle="18 Flood-Impacted Upazilas"
          icon={Users}
          variant="danger"
          trend="Critical Surge"
        />
        <StatCard
          title="Shelters Admitted"
          value="89,400 People"
          subtitle="482 Safe Centers Open"
          icon={Landmark}
          variant="info"
          trend="Securely Housed"
        />
        <StatCard
          title="Armed Forces Fleet"
          value="14 Platoons"
          subtitle="Army, Navy & Police Speedboats"
          icon={ShieldAlert}
          variant="success"
          trend="Deployed"
        />
        <StatCard
          title="State Relief Disbursed"
          value="৳ 25.0 Crore"
          subtitle="GR Cash & 1,500 MT Rice"
          icon={Activity}
          variant="warning"
          trend="Disbursed"
        />
      </div>

      {/* Emergency Cell Broadcast Gateway & Hydrological Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cell Broadcast Gateway */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Emergency Cell Broadcast Gateway</h2>
                <span className="text-xs text-teal-700 font-bangla font-semibold">মোবাইল গ্রাহকদের সরাসরি জরুরি সাইরেন বার্তা</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
              BTRC CAP-v1.2
            </span>
          </div>

          {broadcastSent && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cellular Alert Pushed to 1,280,000 Active Mobile Subscribers</span>
              </div>
              <p className="text-xs text-emerald-700">
                All cellular towers in {broadcastTargetZone} have overridden ringers with acoustic emergency sirens.
              </p>
            </div>
          )}

          <form onSubmit={handleBroadcastAlert} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Geospatial Target Sector</label>
              <select
                value={broadcastTargetZone}
                onChange={(e) => setBroadcastTargetZone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
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
              <label className="text-xs font-bold text-slate-700">Warning Siren Protocol</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { level: 'RED', label: 'Evacuate Red', color: 'border-red-300 bg-red-50 text-red-700 font-bold' },
                    { level: 'ORANGE', label: 'Severe Alert', color: 'border-amber-300 bg-amber-50 text-amber-800 font-bold' },
                    { level: 'YELLOW', label: 'Advisory Info', color: 'border-yellow-300 bg-yellow-50 text-yellow-800 font-bold' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setEmergencyLevel(item.level)}
                    className={`py-2 rounded-xl text-xs border transition cursor-pointer ${
                      emergencyLevel === item.level ? item.color : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Bilingual Broadcast Payload (Handset Screen Override)</label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="[জরুরি বন্যা সতর্কতা] সুরমা নদীর পানি বিপদসীমার উপরে প্রবাহিত হচ্ছে। অবিলম্বে নিকটস্থ সাইক্লোন/বন্যা আশ্রয়কেন্দ্রে আশ্রয় নিন। (Emergency Flash Flood Warning: Evacuate immediately)"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast National Emergency Alert</span>
            </button>
          </form>
        </div>

        {/* Real-time BWDB River Telemetry */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">BWDB Hydrological Sensor Grid</h2>
                <span className="text-xs text-slate-500 font-bangla font-semibold">পানি উন্নয়ন বোর্ড নদী জরিপ</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              100% ONLINE
            </span>
          </div>

          <div className="space-y-3">
            {NATIONAL_SENSORS.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-blue-200 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{s.location}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{s.id}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {s.metric}: <strong className="text-slate-900 font-mono">{s.value}</strong>{' '}
                    <span className="text-slate-400">(Danger Mark: {s.dangerLevel})</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    s.status === 'CRITICAL_HIGH'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : s.status === 'WARNING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bangabandhu Satellite-1 Telemetry Active</span>
            </span>
            <Link href="/map" className="text-blue-600 hover:text-blue-700 font-bold">
              Open Hydrological Map →
            </Link>
          </div>
        </div>
      </div>

      {/* AI Disaster Impact Model & Division Damage Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gemini National Forecast Model */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-teal-700 font-bold uppercase">
            <Bot className="w-4 h-4 text-teal-600" />
            <span>GEMINI AI SOVEREIGN FLOOD DAMAGE IMPACT FORECAST</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            National Multi-River Basin Risk Projection
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Multi-modal satellite and hydrological telemetry indicates Surma and Kushiyara floodwaters will crest within 18 hours:
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Projected economic impact: ৳ 450 Crore in paddy crop loss across Gowainghat and Companiganj.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Recommend pre-authorizing additional 500 MT rice rations from Rangpur central silo.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Advise BTRC to maintain siren cell broadcast frequency every 4 hours for low-lying upazilas.</span>
            </div>
          </div>
        </div>

        {/* Division Damage Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Division-Level Population Impact (Thousands)</h3>
              <p className="text-xs text-slate-500">Affected vs. Safely Evacuated Citizens</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              EOC AUDIT
            </span>
          </div>

          <div className="w-full h-48 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DIVISION_DAMAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="division" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="affected" name="Affected (k)" fill="#dc2626" radius={[6, 6, 0, 0]} />
                <Bar dataKey="evacuated" name="Evacuated (k)" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Bangladesh Tactical Map Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>National Civil Defense Crisis & Boundary HUD</span>
            </h3>
            <p className="text-xs text-slate-500">Division command zones, military transport corridors, and flood perimeters</p>
          </div>
          <Link href="/map" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>View Fullscreen Strategic Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <TacticalMap />
        </div>
      </div>

      {/* National Civil Defense EOC Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>National EOC Command Directives Log</span>
        </h3>
        <div className="space-y-3">
          {EOC_TIMELINE.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                {item.time}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                    {item.agency}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
