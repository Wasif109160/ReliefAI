'use client';

import React from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { db } from '@/lib/db';
import { SOSTrendChart } from '@/components/analytics/CrisisAnalyticsChart';

export default function HomePage() {
  const stats = db.getStats();
  const disasters = db.getDisasters();
  const sosRequests = db.getSOSRequests().slice(0, 4);

  return (
    <div className="flex flex-col space-y-16 pb-16">
      {/* Hero Section with Framer Motion */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono uppercase tracking-wider shadow-lg shadow-red-950/50"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping-slow" />
            <span>LEVEL 1 RESPONSE DEPLOYED: CASCADIA SECTOR 4</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
          >
            Autonomous AI for <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              Disaster Response & Relief
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Empowering citizens, volunteers, NGOs, and incident commanders with Gemini multimodal damage vision, live radar tracking, and transparent relief logistics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/sos"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wide shadow-xl shadow-red-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2"
            >
              <LifeBuoy className="w-5 h-5 animate-pulse" />
              <span>Broadcast Emergency SOS</span>
            </Link>

            <Link
              href="/map"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-bold text-sm tracking-wide shadow-lg transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Launch Live Tactical Map</span>
            </Link>

            <Link
              href="/shelters"
              className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-slate-800/80 text-slate-200 font-bold text-sm tracking-wide transition flex items-center space-x-2"
            >
              <Home className="w-5 h-5 text-emerald-400" />
              <span>Shelter Finder</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Real-Time Metrics Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Active Disasters"
            value={stats.activeDisastersCount}
            subtitle="Floods, Seismology & Fire"
            icon={ShieldAlert}
            variant="danger"
            trend="+1 New Zone"
          />
          <StatCard
            title="Population at Risk"
            value={`${(stats.totalAffected / 1000).toFixed(1)}k`}
            subtitle="Under Evacuation Orders"
            icon={Users}
            variant="warning"
          />
          <StatCard
            title="Critical SOS Queue"
            value={stats.criticalSOSCount}
            subtitle="Awaiting Rapid Extraction"
            icon={Zap}
            variant="danger"
            trend="Avg ETA: 9m"
          />
          <StatCard
            title="Safe Sheltered"
            value={stats.totalSheltered.toLocaleString()}
            subtitle="Housed Across Safe Zones"
            icon={Home}
            variant="success"
            trend="76% Capacity"
          />
          <StatCard
            title="Verified Aid"
            value={`$${(stats.totalAidRaised / 1000).toFixed(0)}k`}
            subtitle="Public Ledger Verified"
            icon={HeartHandshake}
            variant="info"
            trend="100% Allocated"
          />
        </div>
      </section>

      {/* Live Operational Feed & Recharts Analytics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Disasters Overview */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-wide">Live Disaster Hazard Zones</h2>
              </div>
              <Link href="/map" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
                <span>View Tactical Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {disasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          disaster.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {disaster.severity}
                      </span>
                      <h3 className="font-bold text-white text-sm">{disaster.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl">{disaster.description}</p>
                    <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Perimeter: {disaster.location.radiusKm} km</span>
                      <span>•</span>
                      <span>Responders: {disaster.respondersDeployed} personnel</span>
                    </div>
                  </div>

                  <Link
                    href="/map"
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 text-center transition"
                  >
                    Track Perimeter
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Live Triage Stream */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white">Live Triage Queue</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                GEMINI VISION
              </span>
            </div>

            <div className="space-y-3">
              {sosRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200">{req.reporterName}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        req.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {req.urgencyScore}/100 [{req.priority}]
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{req.details}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <span className="truncate max-w-[160px]">{req.location.address}</span>
                    <span className="text-cyan-400 uppercase font-bold">{req.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/sos"
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs text-center block transition"
            >
              Report Emergency Incident →
            </Link>
          </div>
        </div>
      </section>

      {/* Role Workspaces Navigation Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Multi-Stakeholder Portals</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Unified Personas</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Access role-tailored dashboards for citizens, volunteers, NGOs, and emergency incident commanders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Citizen */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-red-500/40 transition group flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Citizen / Victim</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-tap SOS dispatch, upload disaster photos for Gemini damage detection, and find safe evacuation shelters with food and water.
              </p>
            </div>
            <Link
              href="/sos"
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs text-center transition"
            >
              Submit SOS Report →
            </Link>
          </div>

          {/* Volunteer */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition group flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Volunteer Worker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Claim field missions, verify on-scene GPS location, assist sandbagging berms, and provide crisis translation and CPR aid.
              </p>
            </div>
            <Link
              href="/dashboard/volunteer"
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs text-center transition"
            >
              Volunteer Dashboard →
            </Link>
          </div>

          {/* NGO */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition group flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">NGO & Logistics Lead</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dispatch humanitarian relief convoys, manage depot inventories, and verify delivery signatures directly from shelters.
              </p>
            </div>
            <Link
              href="/dashboard/ngo"
              className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold text-xs text-center transition"
            >
              NGO Operations Hub →
            </Link>
          </div>

          {/* Admin / Commander */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition group flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Admin / Commander</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recharts analytics on rescue rates and shelter capacities, ICS-400 audit logs, and autonomous dispatch authorizations.
              </p>
            </div>
            <Link
              href="/dashboard/admin"
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs text-center transition"
            >
              Admin Command →
            </Link>
          </div>
        </div>
      </section>

      {/* AI Intelligence Architecture Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-elevated border border-slate-800 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
              <Bot className="w-3.5 h-3.5" />
              <span>POWERED BY GEMINI MULTIMODAL API</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Instant AI Vision & Automated Triage
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              When disaster strikes, photo evidence uploaded by victims is processed by Gemini AI in sub-second latency to detect structural collapse, floodwater depth, trapped survivors, and allocate specialized rescue squads without delay.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multimodal photo damage classification</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated severity scoring (0-100)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Situational SITREP generation</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Resilient offline mesh fallback</span>
              </div>
            </div>

            <div className="pt-4 flex items-center space-x-3">
              <Link
                href="/sos"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-950"
              >
                <Camera className="w-4 h-4" />
                <span>Test AI Damage Scanning</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
