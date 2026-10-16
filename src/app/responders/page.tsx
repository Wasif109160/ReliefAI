'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  Radio,
  ShieldCheck,
  Compass,
  Award,
  Zap,
  RefreshCw,
  LifeBuoy,
} from 'lucide-react';
import { ResponderTeam, TeamStatus } from '@/lib/types';
import { ASSETS } from '@/lib/assets';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn } from '@/components/ui/motion-wrapper';

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
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Light Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <HeroAmbientBeams className="opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-wider w-max shadow-2xs">
              <LifeBuoy className="w-3.5 h-3.5 text-teal-600" />
              <span>SPECIALIZED TASK FORCES & SAR DEPLOYMENT // যৌথ উদ্ধার বাহিনী</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Responders & Volunteer Forces
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD), বাংলাদেশ রেড ক্রিসেন্ট (BDRCS), সশস্ত্র বাহিনী এবং প্রশিক্ষিত স্বেচ্ছাসেবক বাহিনীর লাইভ মোতায়েন ও মিশন কোঅর্ডিনেশন।
            </p>
          </div>
          <div className="relative w-full md:w-72 lg:w-80 h-40 sm:h-44 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm shrink-0 bg-slate-100">
            <Image
              src={ASSETS.rescueOperation}
              alt="Bangladesh Disaster Rescue Operations"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200/80 text-[11px] font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
              <span className="truncate">Surma Basin SAR Force</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="flex items-center gap-1.5">
            ACTIVE FIELD UNITS:
            <span className="text-blue-600 font-extrabold flex items-baseline gap-1">
              <AnimatedCounter value={responders.length} /> BATTALIONS SYNCED
            </span>
          </span>
        </div>

        <button
          onClick={loadResponders}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Feeds</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Task Forces Roster (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Active Response Units</span>
          </h2>

          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">রেসপন্ডার ডেটা লোড হচ্ছে...</p>
              </div>
            ) : responders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">কোনো রেসপন্ডার দল পাওয়া যায়নি</p>
              </div>
            ) : (
              responders.map((team) => (
                <div
                  key={team.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <span>{team.name}</span>
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                          {team.type.replace('_', ' ')}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Command Lead: <strong className="text-slate-800">{team.leadName}</strong> • {team.membersCount} Certified Personnel
                      </p>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={team.status}
                      onChange={(e) => handleStatusChange(team.id, e.target.value as TeamStatus)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition shadow-xs ${
                        team.status === 'dispatched'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : team.status === 'on_scene'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : team.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="available" className="bg-white text-emerald-700">AVAILABLE</option>
                      <option value="dispatched" className="bg-white text-amber-700">DISPATCHED</option>
                      <option value="on_scene" className="bg-white text-blue-700">ON SCENE</option>
                      <option value="en_route" className="bg-white text-teal-700">EN ROUTE</option>
                      <option value="off_duty" className="bg-white text-slate-500">OFF DUTY</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">TACTICAL RADIO FREQUENCY</span>
                      <span className="font-mono font-bold text-amber-600 flex items-center space-x-1.5">
                        <Radio className="w-3.5 h-3.5 text-amber-600" />
                        <span>{team.radioFreq}</span>
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">CURRENT ASSIGNED SECTOR</span>
                      <span className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        <span>{team.currentLocation.zoneName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Equipped Gear:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.equipment.map((eq: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Volunteer Skill Registration & Deployment Board */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Volunteer Skills Registry</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Register medical, rescue, logistical, or linguistic skills to be assigned to high-priority disaster zones automatically.
            </p>

            <form onSubmit={handleRegisterVolunteer} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Volunteer Full Name</label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="যেমন: Dr. Alex Morgan"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Certified Skillset</label>
                <select
                  value={volunteerSkill}
                  onChange={(e) => setVolunteerSkill(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
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
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Register for Mission Dispatch</span>
              </button>
            </form>

            {/* List of recent volunteers */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recently Mobilized Volunteers:</span>
              <div className="space-y-2">
                {registeredVolunteers.map((vol, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{vol.name}</div>
                      <div className="text-xs text-teal-700 font-medium">{vol.skill}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{vol.registeredAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
