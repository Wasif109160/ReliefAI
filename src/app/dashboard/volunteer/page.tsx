'use client';

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Award,
  Zap,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { VolunteerTask } from '@/lib/types';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn } from '@/components/ui/motion-wrapper';

const initialTasks: VolunteerTask[] = [
  {
    id: 'tsk-01',
    title: 'Reinforce Sandbag Berms at Staging Ramp (বালির বাঁধ নির্মাণ)',
    description: 'সুরমা নদীর পানি বিপৎসীমার ৫০ সেমি উপরে। দক্ষিণ বাঁধে ২০০টি জরুরি বালির বস্তা মজবুতকরণে সহায়তা প্রয়োজন।',
    zone: 'সুনামগঞ্জ রিভার র‍্যাম্প ডক বি',
    priority: 'high',
    requiredSkill: 'Physical Logistics',
    status: 'open',
    createdAt: '15m ago',
  },
  {
    id: 'tsk-02',
    title: 'Distribute Infant Formula & Pediatric Water (শিশু খাদ্য বিতরণ)',
    description: 'গোয়াইনঘাট উপজেলা পরিষদ আশ্রয়কেন্দ্রে আশ্রিত ৩টি পরিবারের নবজাতক শিশুদের জন্য জরুরি ওরস্যালাইন ও শিশুখাদ্য পৌঁছে দিন।',
    zone: 'গোয়াইনঘাট ত্রাণ কেন্দ্র, সিলেট',
    priority: 'critical',
    requiredSkill: 'CPR / First Aid',
    assignedVolunteerId: 'demo-volunteer-2',
    assignedVolunteerName: 'সাকিব আল হাসান',
    status: 'in_progress',
    createdAt: '30m ago',
  },
  {
    id: 'tsk-03',
    title: 'Field Medical Translation & Intake Support (চিকিৎসা অনুবাদ)',
    description: 'সিলেট এমএজি ওসমানী মেডিকেল প্রতিনিধি দলের সাথে স্থানীয় জরুরি স্বাস্থ্য বুথে রোগী নিবন্ধন ও ফার্স্ট এইড ড্রাইভ।',
    zone: 'কোম্পানীগঞ্জ স্বাস্থ্য কমপ্লেক্স',
    priority: 'moderate',
    requiredSkill: 'Bilingual Translator',
    status: 'open',
    createdAt: '1h ago',
  },
  {
    id: 'tsk-04',
    title: 'Wellness Check on Vulnerable Households (নিরাপত্তা তল্লাশি)',
    description: 'চিলমারী ঘাটের নদীভাঙন ঝুঁকিতে থাকা ৬টি পরিবারের নিরাপদ আশ্রয়কেন্দ্রে স্থানান্তর নিশ্চিতকরণ।',
    zone: 'চিলমারী রিভার ঘাট, কুড়িগ্রাম',
    priority: 'moderate',
    requiredSkill: 'General Volunteer',
    assignedVolunteerId: 'demo-volunteer-2',
    assignedVolunteerName: 'সাকিব আল হাসান',
    status: 'completed',
    createdAt: '2h ago',
  },
];

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<VolunteerTask[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'open'>('all');
  const [checkInStatus, setCheckInStatus] = useState(false);

  const handleClaimTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'in_progress',
              assignedVolunteerId: user?.id || user?.uid || 'vol-1',
              assignedVolunteerName: user?.displayName || user?.name || 'Volunteer',
            }
          : t
      )
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
    );
  };

  const currentUserId = user?.id || user?.uid || 'demo-volunteer-2';
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'open') return t.status === 'open';
    if (activeTab === 'my') return t.assignedVolunteerId === currentUserId;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Light Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <HeroAmbientBeams className="opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 uppercase tracking-wider shadow-2xs">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>VOLUNTEER MOBILIZATION & FIELD OPERATIONS // মাঠপর্যায় স্বেচ্ছাসেবা</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Volunteer Operations Deck
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Logged in as <strong className="text-slate-900">{user?.displayName || user?.name || 'Volunteer Worker'}</strong> ({user?.organization || 'National Volunteer Corps'}).
            </p>
          </div>

          {/* GPS Check-in Toggle */}
          <button
            onClick={() => setCheckInStatus(!checkInStatus)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl border text-xs font-semibold transition shadow-xs cursor-pointer ${
              checkInStatus
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className={`w-4 h-4 ${checkInStatus ? 'text-white animate-pulse' : 'text-slate-400'}`} />
            <span>{checkInStatus ? 'ON-SCENE GPS ACTIVE' : 'CHECK IN ON-SCENE'}</span>
          </button>
        </div>
      </div>

      {/* Volunteer Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-1 shadow-xs hover:shadow-md transition">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MISSIONS COMPLETED</span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono flex items-baseline gap-1">
            <AnimatedCounter value={completedCount} />
            <span className="text-xs font-sans text-slate-500">Missions</span>
          </div>
          <p className="text-xs text-slate-500">Verified by Incident Command</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-1 shadow-xs hover:shadow-md transition">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ACTIVE DEPLOYMENTS</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono flex items-baseline gap-1">
            <AnimatedCounter value={inProgressCount} />
            <span className="text-xs font-sans text-amber-700">In Progress</span>
          </div>
          <p className="text-xs text-slate-500">Sector 4 Fluvial District</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-1 shadow-xs hover:shadow-md transition">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">VOLUNTEER HOURS</span>
          <div className="text-2xl font-extrabold text-blue-600 font-mono">18.5 hrs</div>
          <p className="text-xs text-slate-500">Operational Period 02</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-1 shadow-xs hover:shadow-md transition">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BADGE LEVEL</span>
          <div className="text-2xl font-extrabold text-teal-700 flex items-center space-x-1.5 font-mono">
            <Award className="w-5 h-5 text-teal-600" />
            <span>Tier II Lead</span>
          </div>
          <p className="text-xs text-slate-500">Certified Swift Water</p>
        </div>
      </div>

      {/* Mission Board Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {(['all', 'open', 'my'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? 'All Missions' : tab === 'open' ? 'Open for Claim' : 'My Assigned Missions'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const isCritical = task.priority === 'critical';
          const isMyTask = task.assignedVolunteerId === currentUserId;

          return (
            <div
              key={task.id}
              className={`bg-white p-6 rounded-2xl border transition-all space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isCritical ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      task.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : task.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {task.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate font-medium">{task.zone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate font-medium">{task.requiredSkill}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Posted {task.createdAt}</span>

                {task.status === 'open' && (
                  <button
                    onClick={() => handleClaimTask(task.id)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider transition shadow-xs flex items-center space-x-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Claim Mission</span>
                  </button>
                )}

                {task.status === 'in_progress' && isMyTask && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider transition shadow-xs flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {task.status === 'completed' && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> VERIFIED COMPLETE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
