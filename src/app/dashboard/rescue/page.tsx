'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Flame,
  Radio,
  MapPin,
  CheckCircle2,
  Clock,
  Compass,
  Activity,
  Send,
  Users,
  ArrowRight,
  Waves,
  Bot,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/lib/assets';
import StatCard from '@/components/StatCard';
import TacticalMap from '@/components/TacticalMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

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
    title: 'Sunamganj Submerged Village Medical Evacuation',
    banglaTitle: 'সুনামগঞ্জ প্লাবিত গ্রাম জরুরি চিকিৎসা স্থানান্তর',
    severity: 'HIGH',
    location: 'Tahirpur Haor Outpost, Sunamganj',
    victimsCount: 3,
    timeElapsed: '32m ago',
    status: 'EN_ROUTE',
    details: 'Pregnant mother and 2 children require emergency transfer to Upazila Health Complex.',
    image: ASSETS.flood,
  },
  {
    id: 'SAR-BD-903',
    title: 'Feni River Embankment Breach Sandbagging & Rescue',
    banglaTitle: 'ফেনী নদী বাঁধ ভাঙন মেরামত ও উদ্ধার সহায়তা',
    severity: 'MEDIUM',
    location: 'Chhagalnaiya Sector 2, Feni',
    victimsCount: 2,
    timeElapsed: '1h ago',
    status: 'ON_SCENE',
    details: 'FSCD divers deployed to reinforce breach while evacuating stranded livestock and farmers.',
    image: ASSETS.ruralRoad,
  },
];

const RESCUE_EXTRACTIONS_DATA = [
  { time: '06:00', extractions: 4 },
  { time: '08:00', extractions: 9 },
  { time: '10:00', extractions: 18 },
  { time: '12:00', extractions: 24 },
  { time: '14:00', extractions: 12 },
];

const RESCUE_TIMELINE = [
  { time: '13:10', title: 'Speedboat Zodiac-04 Docked at Sylhet High School', desc: '6 victims disembarked safely into paramedic triage', unit: 'TEAM ALPHA' },
  { time: '12:35', title: 'Life Jackets & Flotation Rings Airdropped', desc: 'BDRCS helicopter deployed 40 units over Gowainghat cluster', unit: 'AIR CORPS' },
  { time: '11:50', title: 'Emergency Breaching Alert in Feni Sector 2', desc: 'FSCD dive squad deployed with underwater sonar equipment', unit: 'DIVE SQ-3' },
  { time: '10:00', title: 'High-Frequency VHF Channel 16 Activated', desc: 'Encrypted relay established between FSCD HQ and naval boats', unit: 'COMMS HQ' },
];

export default function RescueDashboard() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<SARMission[]>(INITIAL_MISSIONS);
  const [radioChatter, setRadioChatter] = useState([
    { id: 1, sender: 'FSCD-Central', time: '13:02', text: 'Zodiac-02, report status on Surma bridge passage.' },
    { id: 2, sender: 'Zodiac-02 (Capt. Tanvir)', time: '13:04', text: 'Water clearance 0.4m below girder. Proceeding with caution at 6 knots.' },
    { id: 3, sender: 'Paramedic Lead Sylhet', time: '13:08', text: 'Triage tent at Govt School has 8 saline drips ready for rooftop evacuees.' },
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
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Rescue Tactical Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-extrabold tracking-wider text-slate-800 uppercase">FSCD TACTICAL SAR COMMAND</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Fleet Alpha Active
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-600">
          <Link href="/map" className="hover:text-blue-600 font-semibold transition">Tactical HUD</Link>
          <Link href="/responders" className="hover:text-blue-600 font-semibold transition">Fleet Units</Link>
          <Link href="/sos" className="hover:text-red-600 font-bold transition">Emergency Triage</Link>
          <Link href="/ai-copilot" className="hover:text-blue-600 font-semibold transition">AI Guidance</Link>
        </div>
      </div>

      {/* Tactical SAR Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-8 shadow-xs bg-white">
        <HeroAmbientBeams className="opacity-70" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-50/80 via-blue-50/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 uppercase font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>BANGLADESH FIRE SERVICE & CIVIL DEFENCE • USAR COMMAND</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tactical SAR Operations Deck
              <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold mt-1">
                উদ্ধার অভিযান ও ফিল্ড রেসপন্স ডেক
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Commanding Officer: <strong className="text-slate-800">{user?.name || 'Lt. James Morales'}</strong> • Badge:{' '}
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-xs font-bold border border-slate-200">{user?.badgeNumber || 'FSCD-7701'}</span> • Sector:{' '}
              <span className="text-slate-700 font-medium">{user?.assignedZone || 'Sylhet Division Mobile USAR Fleet Alpha'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/map"
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold uppercase tracking-wider transition shadow-xs flex items-center space-x-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Tactical GIS Map HUD</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Fleet Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active SAR Missions"
          value={missions.filter((m) => m.status !== 'RESOLVED').length}
          subtitle="Priority 1 Surge Active"
          icon={Flame}
          variant="warning"
          trend="Immediate Action"
        />
        <StatCard
          title="Victims Under Extraction"
          value="11 Citizens"
          subtitle="0 Casualties Logged"
          icon={Users}
          variant="danger"
          trend="In Progress"
        />
        <StatCard
          title="Speedboats & Zodiacs"
          value="18 Active"
          subtitle="FSCD & Navy Divers"
          icon={Waves}
          variant="success"
          trend="Patrol Ready"
        />
        <StatCard
          title="Tactical Radio Net"
          value="VHF CH-16"
          subtitle="Encrypted Satellite Relay"
          icon={Radio}
          variant="info"
          trend="Live Frequency"
        />
      </div>

      {/* SAR Mission Pipeline + Tactical Radio Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Missions Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Assigned SAR Missions (জরুরি উদ্ধার অ্যাসাইনমেন্ট)</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sorted by Priority</span>
          </div>

          <div className="space-y-4">
            {missions.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs hover:shadow-md overflow-hidden flex flex-col md:flex-row group"
              >
                {/* Mission Visual Image */}
                <div className="relative md:w-56 h-48 md:h-auto overflow-hidden shrink-0">
                  <Image
                    src={m.image}
                    alt={m.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 250px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${
                        m.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : m.severity === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {m.severity}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-bold text-blue-600 font-mono">{m.id}</span>
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.timeElapsed}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{m.title}</h3>
                    <span className="text-xs font-bangla text-teal-700 font-semibold block">{m.banglaTitle}</span>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.details}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 flex items-center gap-1 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{m.location}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      {m.status === 'DISPATCHED' && (
                        <button
                          onClick={() => updateMissionStatus(m.id, 'EN_ROUTE')}
                          className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
                        >
                          Accept & Deploy
                        </button>
                      )}
                      {m.status === 'EN_ROUTE' && (
                        <button
                          onClick={() => updateMissionStatus(m.id, 'ON_SCENE')}
                          className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
                        >
                          Mark On-Scene
                        </button>
                      )}
                      {m.status === 'ON_SCENE' && (
                        <button
                          onClick={() => updateMissionStatus(m.id, 'RESOLVED')}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
                        >
                          Complete Rescue
                        </button>
                      )}
                      {m.status === 'RESOLVED' && (
                        <span className="inline-flex items-center space-x-1 text-emerald-800 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Fire Service Tactical Radio
                </h3>
              </div>
              <span className="text-[10px] text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 font-bold">
                LIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {radioChatter.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-bold text-slate-800">{c.sender}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-slate-700 leading-snug font-medium">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendRadio} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newChat}
                onChange={(e) => setNewChat(e.target.value)}
                placeholder="Radio message on Ch-16..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
              />
              <button
                type="submit"
                aria-label="Send radio message"
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shrink-0 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Tactical SAR Triage Card & Rescue Extractions Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gemini Tactical SAR Triage */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-teal-700 font-bold uppercase">
            <Bot className="w-4 h-4 text-teal-600" />
            <span>GEMINI AI TACTICAL TRIAGE & ROUTING</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Zodiac Speedboat Path Optimization
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI thermal scan analysis from Drone 4 reports water flow speed 3.2 m/s downstream. Recommendation for Unit 03:
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Approach rooftop from North-East eddy to avoid river main channel vortex.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Deploy 4 flotation rings to stabilize tin structure before boarding.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Transfer elderly victim first; infant is secure in mother&apos;s thermal wrap.</span>
            </div>
          </div>
        </div>

        {/* Hourly Extractions Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Hourly Rescue Extractions by USAR Alpha</h3>
              <p className="text-xs text-slate-500">Number of citizens successfully extracted today</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              67 RESCUED TODAY
            </span>
          </div>

          <div className="w-full h-48 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RESCUE_EXTRACTIONS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
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
                <Bar dataKey="extractions" name="Citizens Rescued" fill="#0d9488" radius={[6, 6, 0, 0]} />
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
              <span>Tactical GIS Fleet & Incident HUD</span>
            </h3>
            <p className="text-xs text-slate-500">Live positions of Fire Service speedboats, dive teams, and extraction markers</p>
          </div>
          <Link href="/map" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>Open Tactical Map HUD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <TacticalMap />
        </div>
      </div>

      {/* Field SAR Incident Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Operational Incident & Dispatch Log</span>
        </h3>
        <div className="space-y-3">
          {RESCUE_TIMELINE.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                {item.time}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                    {item.unit}
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
