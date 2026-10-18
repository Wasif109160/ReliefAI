'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  LifeBuoy,
  Flame,
  Building2,
  Truck,
  Activity,
  Sparkles,
  Bot,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { SOSTrendChart, ShelterOccupancyChart } from '@/components/analytics/CrisisAnalyticsChart';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn, FadeInStagger, StaggerItem } from '@/components/ui/motion-wrapper';

const CRISIS_MODULES = [
  {
    id: 'flood',
    title: 'Surma-Jamuna River Basin Flash Flood Inundation',
    banglaTitle: 'সুরমা-যমুনা নদী অববাহিকা আকস্মিক বন্যা',
    tag: 'ACTIVE SURGE',
    tagColor: 'bg-red-50 text-red-700 border-red-200',
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
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: "High-ground shelter network across Cox's Bazar, Chittagong, and Barisal equipped with solar power and emergency food reserves.",
    image: ASSETS.cycloneShelter,
    href: '/shelters',
    stat: '89,400 Citizens Sheltered',
  },
  {
    id: 'rescue',
    title: 'Bangladesh Fire Service & USAR Fleet',
    banglaTitle: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স উদ্ধার দল',
    tag: 'TACTICAL SAR',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
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
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
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
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
    border: 'border-slate-200 hover:border-emerald-300',
    bg: 'bg-white hover:bg-slate-50',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    icon: LifeBuoy,
  },
  {
    role: 'Rescue Team',
    bangla: 'উদ্ধারকারী দল',
    desc: 'Tactical SAR missions, Fire Service equipment telemetry, triage pipeline, and live tactical radio net.',
    href: '/dashboard/rescue',
    border: 'border-slate-200 hover:border-amber-300',
    bg: 'bg-white hover:bg-slate-50',
    text: 'text-amber-700',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    icon: Flame,
  },
  {
    role: 'NGO Logistics',
    bangla: 'এনজিও ও রেড ক্রিসেন্ট',
    desc: 'Supply warehouse stock, water bladder allocation, relief convoy routing, and verified aid delivery.',
    href: '/dashboard/ngo',
    border: 'border-slate-200 hover:border-blue-300',
    bg: 'bg-white hover:bg-slate-50',
    text: 'text-blue-700',
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: Truck,
  },
  {
    role: 'Government EOC',
    bangla: 'সিভিল ডিফেন্স কমান্ড',
    desc: 'National EOC bunker, BWDB hydrological sensor grid, BTRC emergency cell SMS siren broadcast.',
    href: '/dashboard/government',
    border: 'border-slate-200 hover:border-indigo-300',
    bg: 'bg-white hover:bg-slate-50',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    icon: Building2,
  },
  {
    role: 'Admin Commander',
    bangla: 'প্রধান সমন্বয়ক',
    desc: 'Full ICS-400 operational authority, multi-agency RBAC user governance, and crisis analytics.',
    href: '/dashboard/admin',
    border: 'border-slate-200 hover:border-purple-300',
    bg: 'bg-white hover:bg-slate-50',
    text: 'text-purple-700',
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
    icon: Activity,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-24 pb-24 text-slate-900">
      {/* Flagship Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
        <HeroAmbientBeams className="opacity-70" />
        {/* Subtle Background Bangladesh Map Artwork */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply">
          <Image
            src={ASSETS.mapArtwork}
            alt="Bangladesh Sovereign Tactical Map"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bangla font-bold">গণপ্রজাতন্ত্রী বাংলাদেশ</span>
            <span className="text-blue-300">•</span>
            <span className="font-semibold text-blue-700">SOVEREIGN DISASTER & RIVER INTELLIGENCE GRID</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12]"
          >
            Autonomous Crisis Intelligence for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Bangladesh
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-bangla text-slate-700 font-bold mt-2">
              (বাংলাদেশ জাতীয় দুর্যোগ নিয়ন্ত্রণ ও পরিবেশ সুরক্ষা ব্যবস্থা)
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            A sovereign, multi-agency disaster management platform powering rapid Search & Rescue extractions, multimodal satellite flood detection, coastal cyclone shelter coordination, and river pollution telemetry.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/sos"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center space-x-2.5"
            >
              <LifeBuoy className="w-5 h-5 text-white" />
              <span>BROADCAST EMERGENCY SOS</span>
              <span className="font-bangla font-bold text-xs text-red-100">(জরুরি সাহায্য)</span>
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm tracking-wide transition shadow-xs hover:shadow flex items-center justify-center space-x-2.5"
            >
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Explore Bangladesh Tactical Map</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </motion.div>

          {/* Real-time National Ticker Card */}
          <div className="pt-8 max-w-5xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-mono px-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider">SOVEREIGN NATIONAL BENCHMARKS</span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                CALIBRATION BENCHMARK • SIMULATED METRICS
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="space-y-1 border-r border-slate-100 pr-3 last:border-r-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Surma & Jamuna Rivers</span>
                <div className="text-base sm:text-lg font-extrabold text-red-600 font-mono flex items-baseline gap-1">
                  <AnimatedCounter value={1.15} decimals={2} prefix="+" suffix="m" />
                  <span className="text-xs font-semibold text-red-700">Flood Surge</span>
                </div>
                <span className="text-[11px] text-slate-500">Sylhet Basin Warning</span>
              </div>
              <div className="space-y-1 border-r border-slate-100 pr-3 last:border-r-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Bay of Bengal Cyclone</span>
                <div className="text-base sm:text-lg font-extrabold text-amber-600 font-mono">Deep Depression 03</div>
                <span className="text-[11px] text-slate-500">Signal No. 4 Alert</span>
              </div>
              <div className="space-y-1 border-r border-slate-100 pr-3 last:border-r-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Active SAR Speedboats</span>
                <div className="text-base sm:text-lg font-extrabold text-emerald-600 font-mono flex items-baseline gap-1">
                  <AnimatedCounter value={184} />
                  <span className="text-xs font-semibold text-emerald-700">Fleet Units</span>
                </div>
                <span className="text-[11px] text-slate-500">Fire Service & Navy</span>
              </div>
              <div className="space-y-1 pr-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Safe Shelters Ready</span>
                <div className="text-base sm:text-lg font-extrabold text-blue-600 font-mono flex items-baseline gap-1">
                  <AnimatedCounter value={482} />
                  <span className="text-xs font-semibold text-blue-700">Centers Open</span>
                </div>
                <span className="text-[11px] text-slate-500">89,400 Housed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Bangladesh Crisis Modules Grid */}
      <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>DISASTER MODULES • জাতীয় দুর্যোগ ও উদ্ধার মডিউল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Field-Tested Crisis Operations for Bangladesh
            </h2>
          </div>
          <Link
            href="/map"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1.5 transition"
          >
            <span>View All Operational Zones on Live Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CRISIS_MODULES.map((mod) => (
            <StaggerItem key={mod.id}>
              <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between group h-full">
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={mod.image}
                    alt={mod.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${mod.tagColor}`}>
                      {mod.tag}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bangla text-teal-700 font-bold block">
                      {mod.banglaTitle}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-900 font-extrabold">{mod.stat}</span>
                    <Link
                      href={mod.href}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-bold transition"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </FadeInStagger>
      </FadeIn>

      {/* 5 Distinct RBAC Role Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 uppercase font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>ROLE-BASED COMMAND ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tailored Dashboards for Every Agency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
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
                className={`p-5 rounded-2xl border ${r.border} ${r.bg} hover:-translate-y-0.5 transition duration-200 space-y-3 flex flex-col justify-between shadow-xs hover:shadow-md`}
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl ${r.iconBg} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{r.role}</h3>
                    <span className="text-[11px] font-bangla text-slate-500 font-medium block">{r.bangla}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{r.desc}</p>
                </div>

                <div className={`pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold ${r.text}`}>
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
        <div className="p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs bg-white space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>MULTIMODAL AI SATELLITE & DAMAGE TRIAGE ENGINE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Crisis Telemetry & Resource Extraction
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visualizing multi-agency triage volume and facility intake during simulated flood and cyclone drills.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/disasters"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Disaster Archive</span>
              </Link>
              <Link
                href="/ai-copilot"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
              >
                <Bot className="w-4 h-4" />
                <span>Launch AI Copilot (বাংলা চ্যাট)</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Incoming SOS Rate vs. Rescue Extractions</h4>
                <span className="text-[10px] font-mono text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">SURMA BASIN HOURLY</span>
              </div>
              <SOSTrendChart />
            </div>

            <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Coastal Shelter Occupancy vs. Capacity</h4>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">482 SHELTERS ONLINE</span>
              </div>
              <ShelterOccupancyChart />
            </div>
          </div>
        </div>
      </section>

      {/* Key Sovereign Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1.5">
            <div className="text-3xl sm:text-4xl font-extrabold text-red-600 font-mono">&lt; 4 min</div>
            <div className="text-xs font-bold text-slate-900">SAR Dispatch Latency</div>
            <p className="text-[11px] text-slate-500">Fire Service automated boat alert</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1.5">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono flex items-center justify-center">
              <AnimatedCounter value={482} />
            </div>
            <div className="text-xs font-bold text-slate-900">Shelters Telemetry</div>
            <p className="text-[11px] text-slate-500">Solar & drinking water verified</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1.5">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono flex items-center justify-center gap-1.5">
              <AnimatedCounter value={42} />
              <span className="text-xl sm:text-2xl font-bold">Rivers</span>
            </div>
            <div className="text-xs font-bold text-slate-900">Optical IoT Probes</div>
            <p className="text-[11px] text-slate-500">Continuous chemical runoff watch</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1.5">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 font-mono">100% Free</div>
            <div className="text-xs font-bold text-slate-900">Open Public Access</div>
            <p className="text-[11px] text-slate-500">Bengali voice recognition built-in</p>
          </div>
        </div>
      </section>
    </div>
  );
}
