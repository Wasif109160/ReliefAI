'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LifeBuoy,
  AlertTriangle,
  MapPin,
  Home,
  Mic,
  Radio,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Volume2,
  Navigation,
  Compass,
  Droplets,
  Clock,
  Bot,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/lib/assets';
import StatCard from '@/components/StatCard';
import TacticalMap from '@/components/TacticalMap';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

const NEARBY_SHELTERS = [
  {
    id: 'sh-1',
    name: 'Sylhet Government High School Safe Center',
    banglaName: 'সিলেট সরকারি উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র',
    distance: '0.8 km',
    capacity: '850/1,200',
    percent: 71,
    status: 'OPEN',
    supplies: 'Clean Drinking Water, Dry Food, Paramedic Staff',
    image: ASSETS.cycloneShelter,
  },
  {
    id: 'sh-2',
    name: 'Sunamganj Cyclone & Flood Shelter 04',
    banglaName: 'সুনামগঞ্জ বন্যা ও সাইক্লোন শেল্টার ৪',
    distance: '2.1 km',
    capacity: '420/500',
    percent: 84,
    status: 'LIMITED CAPACITY',
    supplies: 'Infant Formula, Solar Power Generator',
    image: ASSETS.cycloneShelter,
  },
  {
    id: 'sh-3',
    name: 'Metropolitan Community College Safe Haven',
    banglaName: 'মেট্রোপলিটন কমিউনিটি কলেজ নিরাপদ আশ্রয়',
    distance: '3.4 km',
    capacity: '210/800',
    percent: 26,
    status: 'OPEN',
    supplies: 'Blankets, Emergency First Aid, High Ground',
    image: ASSETS.cycloneShelter,
  },
];

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency Service', bangla: 'জাতীয় জরুরি সেবা', number: '999', label: 'Toll-Free 24/7' },
  { name: 'Fire Service & Civil Defence', bangla: 'ফায়ার সার্ভিস কন্ট্রোল', number: '102', label: 'Rescue & SAR' },
  { name: 'Disaster Early Warning Center', bangla: 'দুর্যোগ আগাম বার্তা', number: '1090', label: 'Cyclone & Flood Info' },
  { name: 'BWDB Flood Hotline', bangla: 'বন্যা পূর্বাভাস হটলাইন', number: '10655', label: 'River Water Levels' },
];

const WATER_LEVEL_DATA = [
  { time: '06:00', level: 12.8, danger: 13.2 },
  { time: '08:00', level: 13.1, danger: 13.2 },
  { time: '10:00', level: 13.7, danger: 13.2 },
  { time: '12:00', level: 14.35, danger: 13.2 },
  { time: '14:00', level: 14.22, danger: 13.2 },
];

const CITIZEN_TIMELINE = [
  { time: '12:45 PM', title: 'Evacuation Convoy Assigned', desc: 'BDRCS Speedboat #02 dispatched to Gowainghat sector', tag: 'SAR ACTIVE' },
  { time: '11:30 AM', title: 'Surma River Reached +1.15m Surge', desc: 'BWDB automated flood alert sent to all registered mobile phones', tag: 'BWDB ALERT' },
  { time: '10:15 AM', title: 'Community Safe Shelter #01 Opened', desc: 'Sylhet High School shelter doors unlocked with emergency meal packs', tag: 'SHELTER OPEN' },
  { time: '08:00 AM', title: 'Heavy Rainfall Advisory', desc: '120mm torrential rainfall recorded in upstream Meghalaya hills', tag: 'WEATHER' },
];

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [bengaliText, setBengaliText] = useState('');
  const [familyCheckIn, setFamilyCheckIn] = useState(false);

  const handleTriggerSOS = () => {
    setSosActive(true);
    setTimeout(() => {
      setSosSent(true);
      setSosActive(false);
    }, 1500);
  };

  const handleVoiceSim = () => {
    setVoiceRecording(true);
    setTimeout(() => {
      setVoiceRecording(false);
      setBengaliText('পানি দ্রুত বাড়ছে, আমাদের ছাদে ৬ জন আটকে আছি, জরুরি উদ্ধার নৌকা এবং খাওয়ার পানি দরকার! (Water rising rapidly, 6 people trapped on rooftop, immediate zodiac rescue boat and drinking water needed!)');
    }, 2000);
  };

  return (
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Safety Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold tracking-wider text-slate-800 uppercase">CITIZEN SAFETY DECK</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
            Sylhet Basin Active
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-600">
          <Link href="/sos" className="hover:text-red-600 font-bold transition">1-Touch SOS</Link>
          <Link href="/shelters" className="hover:text-blue-600 font-semibold transition">Safe Shelters</Link>
          <Link href="/map" className="hover:text-blue-600 font-semibold transition">Live Map</Link>
          <Link href="/ai-copilot" className="hover:text-blue-600 font-semibold transition">AI Copilot</Link>
        </div>
      </div>

      {/* Citizen Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-8 shadow-xs bg-white">
        <HeroAmbientBeams className="opacity-70" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-teal-50/80 via-blue-50/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs text-teal-800 uppercase font-bold">
              <LifeBuoy className="w-3.5 h-3.5 text-teal-600 animate-spin" />
              <span>CITIZEN EMERGENCY PORTAL • নাগরিক জীবনরক্ষা সেবা</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user?.name || 'Citizen'}
              <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold mt-1">
                সুরক্ষিত নাগরিক ড্যাশবোর্ড ও জরুরি সেবা
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Assigned Zone:{' '}
              <strong className="text-slate-800">{user?.assignedZone || 'Sylhet Sadar & Surma River Corridor'}</strong> • Account Status:{' '}
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 text-xs">VERIFIED CITIZEN</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/shelters"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-xs text-slate-700 hover:text-slate-900 font-bold transition flex items-center justify-center space-x-2 shadow-xs hover:bg-slate-50"
            >
              <Home className="w-4 h-4 text-teal-600" />
              <span>Safe Shelters</span>
            </Link>
            <Link
              href="/map"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold transition shadow-xs flex items-center justify-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Evacuation Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Citizen Key Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Safe High Ground"
          value="0.8 km"
          subtitle="Sylhet Govt High School"
          icon={MapPin}
          variant="success"
          trend="Immediate Walk"
        />
        <StatCard
          title="Open Shelters"
          value="482"
          subtitle="Verified by Civil Defense"
          icon={Home}
          variant="info"
          trend="89,400 housed"
        />
        <StatCard
          title="Drinking Water"
          value="10,000 L"
          subtitle="Red Crescent Bladders"
          icon={Droplets}
          variant="default"
          trend="Supply Stable"
        />
        <StatCard
          title="SAR Speedboats"
          value="184 Units"
          subtitle="Active on Surma Corridor"
          icon={Activity}
          variant="warning"
          trend="Active Patrol"
        />
      </div>

      {/* High-Alert 1-Touch Emergency SOS Broadcast Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-red-200 shadow-xs relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">One-Touch Emergency SOS Broadcast</h2>
                <span className="text-xs text-red-600 font-bangla font-semibold">
                  এক চাপে উদ্ধারকারী দলের নিকট জরুরি সংকেত পাঠান
                </span>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold">
              PRIORITY-1
            </span>
          </div>

          {sosSent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Emergency Beacon Active • Response Dispatched</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Bangladesh Fire Service & Civil Defence Station #04 and BDRCS Volunteer Boat 2 have acknowledged your GPS beacon. Maintain elevated position on rooftop. Do not enter moving floodwater.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleTriggerSOS}
                disabled={sosActive}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-3 active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Radio className="w-5 h-5 animate-pulse" />
                <span>{sosActive ? 'Broadcasting Beacon...' : 'BROADCAST EMERGENCY SOS NOW'}</span>
              </button>
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Direct GPS beacon transmitted to national disaster mesh & SMS fallback.
              </span>
            </div>
          )}

          {/* Bengali Voice Report Support */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Mic className="w-4 h-4 text-teal-600" />
                <span className="font-bangla text-sm">বাংলা ভয়েস রিপোর্ট (Bengali Voice Emergency Reporting)</span>
              </div>
              <span className="text-xs text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 font-semibold">
                Gemini 2.5 Flash Audio AI
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleVoiceSim}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  voiceRecording
                    ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-500 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-bangla text-xs">
                  {voiceRecording ? 'রেকর্ড হচ্ছে... (Listening)' : 'কথা বলে রিপোর্ট করুন (Record Voice)'}
                </span>
              </button>
            </div>

            {bengaliText && (
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-teal-700 text-xs font-medium">
                  <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Transcribed & Translated to Incident Command:</span>
                </div>
                <p className="font-bangla text-sm text-slate-800 font-semibold leading-relaxed">{bengaliText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rapid Hotline Contacts & Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>National Crisis Hotlines</span>
            </h3>
            <div className="space-y-2.5">
              {EMERGENCY_CONTACTS.map((c) => (
                <div
                  key={c.number}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-blue-200 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{c.name}</div>
                    <div className="text-[11px] font-bangla text-teal-700 font-semibold">{c.bangla}</div>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition"
                  >
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe Family Check-In (পরিবারকে জানান)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Broadcast to relatives and rescue coordinators that you are safe in a designated evacuation center.
            </p>
            <button
              onClick={() => setFamilyCheckIn(!familyCheckIn)}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                familyCheckIn
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
              }`}
            >
              {familyCheckIn ? 'Status: Marked Safe Online (নিরাপদ চিহ্নিত)' : 'Mark Myself as Safe'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Citizen Safety Copilot Recommendation & River Surge Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gemini AI Recommendation Card */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-teal-700 font-bold uppercase">
            <Bot className="w-4 h-4 text-teal-600" />
            <span>GEMINI AI CITIZEN SAFETY COPILOT</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Personalized Flood Evacuation Guidance
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Based on current hydrological telemetry (+1.15m surge at Surma Gage #04), the following actions are recommended for households in your sector:
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Evacuate ground floors immediately to Sylhet Govt High School (0.8km away).</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pack dry food rations, clean water bottles, and national NID cards in waterproof bags.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Do not wade across open flood currents—electric poles and submerged ditches present hazards.</span>
            </div>
          </div>
        </div>

        {/* River Water Level Surge Timeline Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Surma River Water Level vs. Danger Mark</h3>
              <p className="text-xs text-slate-500">Live hourly readings from BWDB Kanaighat Gage</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
              CRITICAL FLOOD
            </span>
          </div>

          <div className="w-full h-48 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WATER_LEVEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="citizenFloodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[12, 15]} />
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
                <Area type="monotone" dataKey="level" name="Gage Level (m)" stroke="#2563eb" strokeWidth={2.5} fill="url(#citizenFloodGrad)" />
              </AreaChart>
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
              <span>Interactive Bangladesh Tactical Crisis Map</span>
            </h3>
            <p className="text-xs text-slate-500">Live evacuation safe zones, medical stations, and flood perimeters</p>
          </div>
          <Link href="/map" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>Open Fullscreen Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <TacticalMap />
        </div>
      </div>

      {/* Nearest Cyclone & Flood Shelters Grid with Images */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Home className="w-5 h-5 text-teal-600" />
              <span>Nearest Verified Emergency Shelters (নিকটস্থ আশ্রয়কেন্দ্র)</span>
            </h2>
            <p className="text-xs text-slate-500">Reinforced safe centers verified by Ministry of Disaster Management</p>
          </div>
          <Link href="/shelters" className="text-xs font-bold text-blue-600 hover:underline">
            View All Shelters →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEARBY_SHELTERS.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs hover:shadow-md overflow-hidden space-y-3"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      s.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>

              <div className="p-4 pt-1 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.name}</h4>
                <span className="text-xs font-bangla text-teal-700 font-semibold block">{s.banglaName}</span>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{s.distance}</span>
                  </span>
                  <span className="font-bold text-slate-800">{s.capacity}</span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${s.percent}%` }} />
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  Supplies: <span className="text-slate-700 font-medium">{s.supplies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Incident Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Local Sector Incident & Evacuation Timeline</span>
        </h3>
        <div className="space-y-3">
          {CITIZEN_TIMELINE.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                {item.time}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                    {item.tag}
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
