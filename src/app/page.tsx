'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Compass,
  Activity,
  Users,
  Home,
  Bot,
  Zap,
  ArrowRight,
  Radio,
  LifeBuoy,
  HeartHandshake,
  CheckCircle2,
  Camera,
  Layers,
  Truck,
  Flame,
  Building2,
  Trees,
  PhoneCall,
  MapPin,
  Sparkles,
  Droplets,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { SOSTrendChart, ShelterOccupancyChart } from '@/components/analytics/CrisisAnalyticsChart';

const CRISIS_MODULES = [
  {
    id: 'flood',
    title: 'Surma-Jamuna River Basin Flash Flood Inundation',
    banglaTitle: 'সুরমা-যমুনা নদী অববাহিকা আকস্মিক বন্যা',
    tag: 'ACTIVE SURGE',
    tagColor: 'bg-red-950 text-red-300 border-red-700',
    description: 'Real-time telemetry tracking river gages across Sylhet, Sunamganj, and Kurigram with autonomous evacuation warnings.',
    image: ASSETS.flood,
    href: '/map',
    stat: '+1.15m Above Danger Level',
  },
  {
    id: 'cyclone',
    title: 'Coastal Reinforced Cyclone Shelters',
    banglaTitle: 'উপকূলীয় বহুমুখী ঘূর্ণিঝড় আশ্রয়কেন্দ্র',
    tag: '482 SHELTERS OPEN',
    tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    description: 'High-ground shelter network across Cox&apos;s Bazar, Chittagong, and Barisal equipped with solar power and emergency food reserves.',
    image: ASSETS.cycloneShelter,
    href: '/shelters',
    stat: '89,400 Citizens Sheltered',
  },
  {
    id: 'rescue',
    title: 'Bangladesh Fire Service & USAR Fleet',
    banglaTitle: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স উদ্ধার দল',
    tag: 'TACTICAL SAR',
    tagColor: 'bg-orange-950 text-orange-300 border-orange-700',
    description: 'Specialized zodiac speedboats, drone thermal scanners, and paramedic dive squads deployed for rooftop extractions.',
    image: ASSETS.rescueOperation,
    href: '/dashboard/rescue',
    stat: '184 Speedboats Deployed',
  },
  {
    id: 'environment',
    title: 'Buriganga & River Ecological Protection',
    banglaTitle: 'বুড়িগঙ্গা-কর্ণফুলী নদী দূষণ ও বর্জ্য প্রতিরোধ',
    tag: 'ECO WATCH',
    tagColor: 'bg-teal-950 text-teal-300 border-teal-700',
    description: 'Continuous IoT optical water quality probes, canal chokepoint clearance, and industrial runoff monitoring.',
    image: ASSETS.waterPollution,
    href: '/environment',
    stat: '42 Rivers Monitored',
  },
  {
    id: 'medevac',
    title: 'Emergency Medevac & Hospital Stabilization',
    banglaTitle: 'জরুরি ট্রমা ও অ্যাম্বুলেন্স চিকিৎসা বহর',
    tag: 'CRITICAL CARE',
    tagColor: 'bg-blue-950 text-blue-300 border-blue-700',
    description: 'Rapid GPS-dispatched emergency ambulances and trauma triage units routing critical casualties to district hospitals.',
    image: ASSETS.ambulance,
    href: '/dashboard/citizen',
    stat: '98% Response Readiness',
  },
  {
    id: 'logistics',
    title: 'Rural Road Relief Convoys & Last-Mile Aid',
    banglaTitle: 'গ্রামীণ দুর্গম এলাকা ত্রাণ সরবরাহ কনভয়',
    tag: 'RELIEF MESH',
    tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-700',
    description: 'Bangladesh Red Crescent and NGO convoy fleets transporting water purification bladders and rations to cut-off upazilas.',
    image: ASSETS.ruralRoad,
    href: '/distribution',
    stat: '25.0 Tonnes Dispatched Today',
  },
];

const ROLES_PREVIEWS = [
  {
    role: 'Citizen',
    bangla: 'নাগরিক',
    desc: '1-Touch SOS Beacon, Bengali voice disaster reporting, live shelter locator, and family safe check-in.',
    href: '/dashboard/citizen',
    color: 'border-emerald-500/40 from-emerald-950/40 to-slate-900/80 text-emerald-400',
    icon: LifeBuoy,
  },
  {
    role: 'Rescue Team',
    bangla: 'উদ্ধারকারী দল',
    desc: 'Tactical SAR missions, Fire Service equipment telemetry, triage pipeline, and live tactical radio net.',
    href: '/dashboard/rescue',
    color: 'border-orange-500/40 from-orange-950/40 to-slate-900/80 text-orange-400',
    icon: Flame,
  },
  {
    role: 'NGO Logistics',
    bangla: 'এনজিও ও রেড ক্রিসেন্ট',
    desc: 'Supply warehouse stock, water bladder allocation, relief convoy routing, and verified aid delivery.',
    href: '/dashboard/ngo',
    color: 'border-cyan-500/40 from-cyan-950/40 to-slate-900/80 text-cyan-400',
    icon: Truck,
  },
  {
    role: 'Government EOC',
    bangla: 'সিভিল ডিফেন্স কমান্ড',
    desc: 'National EOC bunker, BWDB hydrological sensor grid, BTRC emergency cell SMS siren broadcast.',
    href: '/dashboard/government',
    color: 'border-blue-500/40 from-blue-950/40 to-slate-900/80 text-blue-400',
    icon: Building2,
  },
  {
    role: 'Admin Commander',
    bangla: 'প্রধান সমন্বয়ক',
    desc: 'Full ICS-400 operational authority, multi-agency RBAC user governance, and crisis analytics.',
    href: '/dashboard/admin',
    color: 'border-amber-500/40 from-amber-950/40 to-slate-900/80 text-amber-400',
    icon: Activity,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-20 pb-20">
      {/* Flagship Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-slate-800/80 bg-gradient-to-b from-[#060b13] via-[#091322] to-[#060b13]">
        {/* Background Bangladesh Map Artwork & River Gradient */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-screen">
          <Image
            src={ASSETS.mapArtwork}
            alt="Bangladesh Sovereign Tactical Map"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b13]/80 via-transparent to-[#060b13]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase tracking-widest shadow-xl shadow-emerald-950/40 backdrop-blur-md"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bangla text-white font-semibold">গণপ্রজাতন্ত্রী বাংলাদেশ</span>
            <span>• NATIONAL DISASTER & RIVER INTELLIGENCE GRID</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]"
          >
            Autonomous Crisis Intelligence for{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Bangladesh
            </span>
            <span className="block text-2xl sm:text-4xl font-bangla text-slate-200 font-bold mt-2">
              (বাংলাদেশ জাতীয় দুর্যোগ নিয়ন্ত্রণ ও পরিবেশ সুরক্ষা ব্যবস্থা)
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            A sovereign, multi-agency disaster management platform powering rapid Search & Rescue extractions, multimodal satellite flood detection, coastal cyclone shelter coordination, and river pollution protection.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/sos"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider transition shadow-2xl shadow-red-950 flex items-center justify-center space-x-2.5 hover:scale-105 active:scale-95"
            >
              <LifeBuoy className="w-5 h-5 animate-spin" />
              <span>BROADCAST EMERGENCY SOS</span>
              <span className="font-bangla font-semibold text-xs text-amber-200">(জরুরি সাহায্য)</span>
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm tracking-wide transition shadow-xl flex items-center justify-center space-x-2.5 hover:border-cyan-500"
            >
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Explore Bangladesh Tactical Map</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </motion.div>

          {/* Real-time National Sovereign Ticker */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Surma & Jamuna Rivers</span>
                <div className="text-sm font-bold text-red-400 font-mono">+1.15m Flood Surge</div>
                <span className="text-[10px] text-slate-500">Sylhet Basin Warning</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Bay of Bengal Cyclone</span>
                <div className="text-sm font-bold text-amber-400 font-mono">Deep Depression 03</div>
                <span className="text-[10px] text-slate-500">Signal No. 4 Alert</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Active SAR Speedboats</span>
                <div className="text-sm font-bold text-emerald-400 font-mono">184 Fleet Units</div>
                <span className="text-[10px] text-slate-500">Fire Service & Navy</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Safe Shelters Ready</span>
                <div className="text-sm font-bold text-cyan-400 font-mono">482 Centers Open</div>
                <span className="text-[10px] text-slate-500">89,400 Housed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Bangladesh Crisis Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>DISASTER MODULES • জাতীয় দুর্যোগ ও উদ্ধার মডিউল</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Field-Tested Crisis Operations for Bangladesh
            </h2>
          </div>
          <Link
            href="/map"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Operational Zones on Live Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CRISIS_MODULES.map((mod) => (
            <div
              key={mod.id}
              className="glass-panel rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition duration-300 overflow-hidden shadow-2xl flex flex-col justify-between group"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={mod.image}
                  alt={mod.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${mod.tagColor}`}>
                    {mod.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[11px] font-bangla text-emerald-300 font-semibold block">
                    {mod.banglaTitle}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 font-bold">{mod.stat}</span>
                  <Link
                    href={mod.href}
                    className="inline-flex items-center space-x-1 text-slate-300 group-hover:text-white font-semibold transition"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Distinct RBAC Role Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400 uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>ROLE-BASED COMMAND ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Tailored Dashboards for Every Agency
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedicated operational interfaces tailored with role-specific widgets, permissions, and security protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {ROLES_PREVIEWS.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.role}
                href={r.href}
                className={`glass-panel p-5 rounded-3xl border bg-gradient-to-b ${r.color} hover:-translate-y-1 transition duration-200 space-y-3 flex flex-col justify-between shadow-xl`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950/90 border border-slate-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{r.role}</h3>
                    <span className="text-[11px] font-bangla text-slate-300 font-semibold block">{r.bangla}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{r.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI Damage Triage & National Analytics Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>MULTIMODAL AI SATELLITE & DAMAGE TRIAGE ENGINE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Real-Time Crisis Telemetry & Resource Extraction
              </h2>
            </div>

            <Link
              href="/ai-copilot"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Copilot (বাংলা চ্যাট)</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Incoming SOS Rate vs. Rescue Extractions</h4>
                <span className="text-[10px] font-mono text-cyan-400">SURMA BASIN HOURLY</span>
              </div>
              <SOSTrendChart />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Coastal Shelter Occupancy vs. Capacity</h4>
                <span className="text-[10px] font-mono text-emerald-400">482 SHELTERS ONLINE</span>
              </div>
              <ShelterOccupancyChart />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
