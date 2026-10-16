'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneCall, Radio, Heart, Trees, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-14 px-4 sm:px-6 lg:px-8 mt-24 shadow-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
        {/* Col 1: Platform Identity */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base tracking-tight">
                Relief<span className="text-blue-600">AI</span>
              </span>
              <span className="block text-[10px] font-bangla text-teal-700 -mt-0.5 font-bold">
                বাংলাদেশ জাতীয় দুর্যোগ ও পরিবেশ সুরক্ষা
              </span>
            </div>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Sovereign AI-driven crisis intelligence grid for Bangladesh. Multimodal flood prediction, cyclone evacuation telemetry, and rapid Fire Service SAR dispatch.
          </p>
          <div className="inline-flex items-center space-x-2 text-[11px] text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold tracking-wide">NATIONAL MESH: 99.99% UPTIME (BWDB CONNECTED)</span>
          </div>
        </div>

        {/* Col 2: National Emergency Hotlines */}
        <div>
          <h4 className="text-slate-900 font-black mb-3.5 tracking-wider uppercase text-[11px] font-mono">
            National Emergency Hotlines
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 shadow-xs">
              <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>National Emergency: <strong className="text-red-700 font-mono font-bold">999</strong> (24/7 Toll-Free)</span>
            </li>
            <li className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
              <PhoneCall className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Fire Service & Civil Defence: <strong className="text-amber-700 font-mono font-bold">102</strong></span>
            </li>
            <li className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 shadow-xs">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Disaster Early Warning: <strong className="text-blue-700 font-mono font-bold">1090</strong></span>
            </li>
            <li className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 shadow-xs">
              <Radio className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>BWDB Flood Hotline: <strong className="text-teal-700 font-mono font-bold">10655</strong></span>
            </li>
          </ul>
        </div>

        {/* Col 3: Operational Sectors */}
        <div>
          <h4 className="text-slate-900 font-black mb-3.5 tracking-wider uppercase text-[11px] font-mono">
            Operational Sectors
          </h4>
          <ul className="space-y-2 text-slate-600">
            <li>
              <Link href="/map" className="hover:text-blue-600 transition flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Bangladesh Tactical Crisis Map</span>
              </Link>
            </li>
            <li>
              <Link href="/environment" className="hover:text-teal-600 transition flex items-center gap-1.5 font-medium">
                <Trees className="w-3.5 h-3.5 text-teal-600" />
                <span>Environment & River Watch (নদী রক্ষা)</span>
              </Link>
            </li>
            <li>
              <Link href="/shelters" className="hover:text-blue-600 transition font-medium">
                Cyclone & Flood Safe Shelters
              </Link>
            </li>
            <li>
              <Link href="/dashboard/citizen" className="hover:text-blue-600 transition font-medium">
                Citizen Safety Hub (নাগরিক ড্যাশবোর্ড)
              </Link>
            </li>
            <li>
              <Link href="/dashboard/rescue" className="hover:text-amber-600 transition font-medium">
                Rescue & USAR Operations Deck
              </Link>
            </li>
            <li>
              <Link href="/distribution" className="hover:text-blue-600 transition font-medium">
                Relief Mesh & Supply Tracking
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Sovereign Compliance */}
        <div className="space-y-3">
          <h4 className="text-slate-900 font-black mb-3.5 tracking-wider uppercase text-[11px] font-mono">
            Sovereign Architecture
          </h4>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>MoDMR & BWDB Inter-Op</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Directly aligned with Flood Forecasting and Warning Centre (FFWC) and National Disaster Management EOC telemetry.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span>Built with devotion for Bangladesh</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
        <div>
          © 2026 ReliefAI Bangladesh. All rights reserved. Sovereign Emergency Platform.
        </div>
        <div className="flex items-center space-x-6 text-[11px]">
          <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-slate-900 transition">Privacy & Data Sovereignty</Link>
          <Link href="/settings" className="hover:text-slate-900 transition">System Status</Link>
        </div>
      </div>
    </footer>
  );
}
