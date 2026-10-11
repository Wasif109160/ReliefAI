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
  User,
  Heart,
  Droplets,
  Bell,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/lib/assets';

const NEARBY_SHELTERS = [
  {
    id: 'sh-1',
    name: 'Sylhet Government High School Safe Center',
    banglaName: 'সিলেট সরকারি উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র',
    distance: '0.8 km',
    capacity: '850/1,200',
    status: 'OPEN',
    supplies: 'Clean Drinking Water, Dry Food, Medical Staff',
    image: ASSETS.cycloneShelter,
  },
  {
    id: 'sh-2',
    name: 'Sunamganj Cyclone & Flood Shelter 04',
    banglaName: 'সুনামগঞ্জ বন্যা ও সাইক্লোন শেল্টার ৪',
    distance: '2.1 km',
    capacity: '420/500',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Header with authentic Bangladesh Flood Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-900/40 p-6 sm:p-10 shadow-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950/90 to-cyan-950/70">
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <Image
            src={ASSETS.flood}
            alt="Bangladesh Flood Alert"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-xs font-mono text-emerald-300 uppercase tracking-widest">
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>CITIZEN EMERGENCY PORTAL • নাগরিক জীবনরক্ষা সেবা</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome, {user?.name || 'Citizen'}
              <span className="block text-emerald-400 font-bangla text-xl sm:text-2xl font-bold mt-1">
                সুরক্ষিত নাগরিক ড্যাশবোর্ড ও জরুরি সেবা
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Assigned Zone:{' '}
              <strong className="text-white font-mono">{user?.assignedZone || 'Sylhet Sadar & Surma River Corridor'}</strong> • Account Status:{' '}
              <span className="text-emerald-400 font-semibold font-mono">VERIFIED CITIZEN</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/shelters"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-xs text-white font-semibold transition flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Safe Shelters</span>
            </Link>
            <Link
              href="/map"
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold transition shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Evacuation Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-Alert 1-Touch Emergency SOS Broadcast Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-red-900/60 bg-gradient-to-br from-red-950/40 via-slate-950/80 to-slate-900/60 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">One-Touch Emergency SOS Broadcast</h2>
                <span className="text-xs text-red-400 font-bangla font-semibold">
                  এক চাপে উদ্ধারকারী দলের নিকট জরুরি সংকেত পাঠান
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-950 border border-red-800 text-red-300 font-bold">
              PRIORITY-1
            </span>
          </div>

          {sosSent ? (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Emergency Beacon Active • Response Dispatched</span>
              </div>
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                Bangladesh Fire Service & Civil Defence Station #04 and BDRCS Volunteer Boat 2 have acknowledged your GPS beacon. Maintain elevated position on rooftop. Do not enter moving floodwater.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleTriggerSOS}
                disabled={sosActive}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base uppercase tracking-wider transition shadow-2xl shadow-red-950 flex items-center justify-center space-x-3 hover:scale-105 active:scale-95"
              >
                <Radio className="w-5 h-5 animate-ping" />
                <span>{sosActive ? 'Broadcasting Beacon...' : 'BROADCAST EMERGENCY SOS NOW'}</span>
              </button>
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Direct GPS beacon transmitted to national disaster mesh & SMS fallback.
              </span>
            </div>
          )}

          {/* Bengali Voice Report Support */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span className="font-bangla text-sm">বাংলা ভয়েস রিপোর্ট (Bengali Voice Emergency Reporting)</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Gemini 2.5 Flash Audio AI</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleVoiceSim}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                  voiceRecording
                    ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-500'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="font-bangla text-xs">
                  {voiceRecording ? 'রেকর্ড হচ্ছে... (Listening)' : 'কথা বলে রিপোর্ট করুন (Record Voice)'}
                </span>
              </button>
            </div>

            {bengaliText && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-cyan-300 space-y-1.5 shadow-inner">
                <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[10px]">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Transcribed & Translated to Incident Command:</span>
                </div>
                <p className="font-bangla text-sm text-white leading-relaxed">{bengaliText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rapid Hotline Contacts & Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>National Crisis Hotlines</span>
            </h3>
            <div className="space-y-2.5">
              {EMERGENCY_CONTACTS.map((c) => (
                <div
                  key={c.number}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{c.name}</div>
                    <div className="text-[10px] font-bangla text-emerald-400">{c.bangla}</div>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold text-xs hover:bg-emerald-900 transition"
                  >
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Safe Family Check-In (পরিবারকে জানান)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Broadcast to relatives and rescue coordinators that you are safe in a designated evacuation center.
            </p>
            <button
              onClick={() => setFamilyCheckIn(!familyCheckIn)}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                familyCheckIn
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-white hover:border-slate-600'
              }`}
            >
              {familyCheckIn ? 'Status: Marked Safe Online (নিরাপদ চিহ্নিত)' : 'Mark Myself as Safe'}
            </button>
          </div>
        </div>
      </div>

      {/* Nearest Cyclone & Flood Shelters Grid with Images */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Home className="w-5 h-5 text-cyan-400" />
              <span>Nearest Verified Emergency Shelters (নিকটস্থ আশ্রয়কেন্দ্র)</span>
            </h2>
            <p className="text-xs text-slate-400">Reinforced safe centers verified by Ministry of Disaster Management</p>
          </div>
          <Link href="/shelters" className="text-xs font-bold text-cyan-400 hover:underline">
            View All Shelters →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEARBY_SHELTERS.map((s) => (
            <div
              key={s.id}
              className="glass-panel rounded-2xl border border-slate-800 hover:border-slate-700 transition overflow-hidden space-y-3 shadow-lg"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      s.status === 'OPEN'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>

              <div className="p-4 pt-1 space-y-2">
                <h4 className="text-xs font-bold text-white leading-snug">{s.name}</h4>
                <span className="text-[11px] font-bangla text-emerald-400 block">{s.banglaName}</span>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{s.distance}</span>
                  </span>
                  <span className="font-bold text-white">{s.capacity}</span>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  Supplies: <span className="text-slate-300">{s.supplies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
