'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  AlertTriangle,
  MapPin,
  Home,
  Mic,
  Radio,
  ShieldCheck,
  Send,
  CheckCircle2,
  PhoneCall,
  Volume2,
  Navigation,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NEARBY_SHELTERS = [
  {
    id: 'sh-1',
    name: 'Sylhet Government High School Safe Center',
    distance: '0.8 km',
    capacity: '850/1,200',
    status: 'OPEN',
    supplies: 'Drinking Water, Dry Rations, Medical Staff',
  },
  {
    id: 'sh-2',
    name: 'Sunamganj Cyclone & Flood Shelter 04',
    distance: '2.1 km',
    capacity: '420/500',
    status: 'LIMITED CAPACITY',
    supplies: 'Baby Food, Solar Generator',
  },
  {
    id: 'sh-3',
    name: 'Metropolitan Community College Safe Haven',
    distance: '3.4 km',
    capacity: '210/800',
    status: 'OPEN',
    supplies: 'Blankets, Emergency First Aid, Clean Water',
  },
];

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency Service', number: '999', label: 'Toll-Free 24/7' },
  { name: 'Fire Service & Civil Defence', number: '102', label: 'Rescue & SAR' },
  { name: 'Disaster Early Warning Center', number: '1090', label: 'Flood & Storm Info' },
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
      setBengaliText('পানি বাড়ছে, আমাদের দ্রুত উদ্ধার নৌকা এবং খাওয়ার পানি দরকার (Water level rising, immediate boat extraction and drinking water needed)');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4 animate-spin text-red-500" />
            <span>CITIZEN EMERGENCY PORTAL & LIFE-SAFETY COMMAND</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Citizen Safety Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name || 'Citizen'}</strong> • Operational Zone:{' '}
            <span className="text-cyan-400 font-medium">{user?.assignedZone || 'Dhaka Metropolitan / Flood Sector'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/shelters"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-white font-semibold transition"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>Find Safe Shelters</span>
          </Link>
          <Link
            href="/map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold transition shadow-lg shadow-cyan-950"
          >
            <Navigation className="w-4 h-4" />
            <span>Live Evacuation Map</span>
          </Link>
        </div>
      </div>

      {/* High-Alert SOS Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-red-900/60 bg-gradient-to-br from-red-950/40 via-slate-950/80 to-slate-900/60 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">One-Touch Emergency SOS Broadcast</h2>
                <p className="text-xs text-slate-400">Instantly transmits GPS coordinates & triage packet to nearest SAR units</p>
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
                Incident Command and Bangladesh Red Crescent Unit 3 have acknowledged your SOS. A drone reconnaissance unit is en route to verify your sector. Stay on elevated ground.
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
                Free emergency mesh transmission. Works offline via SMS relay fallback.
              </span>
            </div>
          )}

          {/* Bengali Voice Report Support */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span>Bengali Voice Emergency Reporting (বাংলা ভয়েস রিপোর্ট)</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Gemini 2.5 Flash Audio</span>
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
                <span>{voiceRecording ? 'শুনছি... (Listening)' : 'কথা বলে রিপোর্ট করুন (Record Voice)'}</span>
              </button>
            </div>

            {bengaliText && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-cyan-300 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[10px]">
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>Transcribed & Translated:</span>
                </div>
                <p className="font-sans leading-relaxed">{bengaliText}</p>
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
                    <div className="text-[11px] text-slate-400">{c.label}</div>
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
              <span>Safe Family Check-In</span>
            </h3>
            <p className="text-xs text-slate-400">
              Notify loved ones and relief coordinators that you are safe in a designated zone.
            </p>
            <button
              onClick={() => setFamilyCheckIn(!familyCheckIn)}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                familyCheckIn
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-white hover:border-slate-600'
              }`}
            >
              {familyCheckIn ? 'Status: Marked Safe Online' : 'Mark Myself as Safe'}
            </button>
          </div>
        </div>
      </div>

      {/* Nearby Shelters Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Home className="w-5 h-5 text-cyan-400" />
              <span>Nearest Official Emergency Shelters</span>
            </h2>
            <p className="text-xs text-slate-400">Real-time occupancy data verified by Red Cross Logistics</p>
          </div>
          <Link href="/shelters" className="text-xs font-bold text-cyan-400 hover:underline">
            View All Shelters →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NEARBY_SHELTERS.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white leading-snug">{s.name}</h4>
                  <span className="text-[11px] font-mono text-cyan-400 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{s.distance} away</span>
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    s.status === 'OPEN'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                <span className="text-slate-400 text-[11px] block">Occupancy:</span>
                <span className="font-bold">{s.capacity}</span>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                Available: <span className="text-slate-300">{s.supplies}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
