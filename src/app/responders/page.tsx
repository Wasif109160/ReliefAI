'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Award,
  Zap,
  RefreshCw,
  Flame,
  LifeBuoy,
} from 'lucide-react';
import { ResponderTeam, TeamStatus } from '@/lib/types';
import { ASSETS } from '@/lib/assets';

type Volunteer = {
  name: string;
  skill: string;
  registeredAt: string;
};

export default function RespondersPage() {
  const [responders, setResponders] = useState<ResponderTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerSkill, setVolunteerSkill] = useState('স্পিডবোট চালক (Swift Water Boat Pilot)');
  const [registeredVolunteers, setRegisteredVolunteers] = useState<Volunteer[]>([
    { name: 'ডা. তানিয়া আহমেদ (Dr. Tania Ahmed)', skill: 'জরুরি ট্রমা সার্জন (MAG Osmani)', registeredAt: '১২ মিনিট আগে' },
    { name: 'কবীর হোসেন (Kabir Hossain)', skill: 'স্পিডবোট চালক (সুরমা রিভার ক্রাফট)', registeredAt: '২৪ মিনিট আগে' },
    { name: 'মুহাম্মদ ফারহান (M. Farhan)', skill: 'ড্রোন থার্মাল ম্যাপিং বিশেষজ্ঞ', registeredAt: '৪৫ মিনিট আগে' },
  ]);

  const loadResponders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/responders');
      const data = await res.json();
      if (Array.isArray(data)) setResponders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponders();
  }, []);

  const handleStatusChange = async (teamId: string, status: TeamStatus) => {
    try {
      await fetch('/api/responders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, status }),
      });
      loadResponders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName) return;
    setRegisteredVolunteers([
      { name: volunteerName, skill: volunteerSkill, registeredAt: 'এইমাত্র' },
      ...registeredVolunteers,
    ]);
    setVolunteerName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-56 sm:h-64">
        <Image
          src={ASSETS.rescueOperation}
          alt="Bangladesh Disaster Rescue Operations"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono uppercase tracking-wider w-max">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>SPECIALIZED TASK FORCES & SAR DEPLOYMENT // যৌথ উদ্ধার বাহিনী</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Responders & Volunteer Forces
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD), বাংলাদেশ রেড ক্রিসেন্ট (BDRCS), সশস্ত্র বাহিনী এবং প্রশিক্ষিত স্বেচ্ছাসেবক বাহিনীর লাইভ মোতায়েন ও মিশন কোঅর্ডিনেশন।
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ACTIVE FIELD UNITS: {responders.length} BATTALIONS SYNCED</span>
        </div>

        <button
          onClick={loadResponders}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Task Forces Roster (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Active Response Units</span>
          </h2>

          <div className="space-y-4">
            {responders.map((team) => (
              <div
                key={team.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>{team.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {team.type.replace('_', ' ')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Command Lead: <strong className="text-white">{team.leadName}</strong> • {team.membersCount} Certified Personnel
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={team.status}
                    onChange={(e) => handleStatusChange(team.id, e.target.value as TeamStatus)}
                    className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                      team.status === 'dispatched'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : team.status === 'on_scene'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : team.status === 'available'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <option value="available">AVAILABLE</option>
                    <option value="dispatched">DISPATCHED</option>
                    <option value="on_scene">ON SCENE</option>
                    <option value="en_route">EN ROUTE</option>
                    <option value="off_duty">OFF DUTY</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">TACTICAL RADIO FREQUENCY</span>
                    <span className="font-mono font-bold text-amber-400 flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>{team.radioFreq}</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">CURRENT ASSIGNED SECTOR</span>
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{team.currentLocation.zoneName}</span>
                    </span>
                  </div>
                </div>

                {/* Equipment */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Equipped Gear:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {team.equipment.map((eq: string, i: number) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-sans">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer Skill Registration & Deployment Board */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Volunteer Skills Registry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Register medical, rescue, logistical, or linguistic skills to be assigned to high-priority disaster zones automatically.
            </p>

            <form onSubmit={handleRegisterVolunteer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Volunteer Full Name</label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="e.g. Dr. Alex Morgan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Certified Skillset</label>
                <select
                  value={volunteerSkill}
                  onChange={(e) => setVolunteerSkill(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="স্পিডবোট চালক (Swift Water Boat Pilot)">স্পিডবোট চালক (Swift Water Boat Pilot)</option>
                  <option value="জরুরি ট্রমা ও প্যারামেডিক (EMT / Paramedic)">জরুরি ট্রমা ও প্যারামেডিক (EMT / Paramedic)</option>
                  <option value="ডুবুরি ও উদ্ধারকারী (SAR Certified Diver)">ডুবুরি ও উদ্ধারকারী (SAR Certified Diver)</option>
                  <option value="ড্রোন ও থার্মাল ম্যাপিং পাইলট (Drone Recon Pilot)">ড্রোন ও থার্মাল ম্যাপিং পাইলট (Drone Recon Pilot)</option>
                  <option value="রেডিও অপরেটর (VHF / HAM Radio Operator)">রেডিও অপরেটর (VHF / HAM Radio Operator)</option>
                  <option value="ত্রাণ বিতরণ লজিস্টিকস সমন্বয়কারী (Relief Logistics)">ত্রাণ বিতরণ লজিস্টিকস সমন্বয়কারী (Relief Logistics)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-950 flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Register for Mission Dispatch</span>
              </button>
            </form>

            {/* List of recent volunteers */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Recently Mobilized Volunteers:</span>
              <div className="space-y-2">
                {registeredVolunteers.map((vol, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{vol.name}</div>
                      <div className="text-[10px] text-emerald-400">{vol.skill}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{vol.registeredAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
