'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Radio, ShieldAlert } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <aside
      aria-label="National emergency broadcast alerts"
      className="w-full bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-b border-red-600/40 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between z-50 sticky top-0 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold uppercase tracking-wider text-[10px] animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>NATIONAL ALERT</span>
        </span>
        <div className="flex items-center space-x-2 truncate">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="truncate text-xs">
            <span className="font-bold text-red-300 font-bangla">সুরমা-কুশিয়ারা অববাহিকা জরুরি বন্যা সতর্কতা:</span>{' '}
            <span className="text-slate-300">Sylhet & Sunamganj Basin +1.15m above danger mark. Fire Service SAR Units deployed.</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 shrink-0 pl-2">
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-300 font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>BWDB SENSOR #SYL-04</span>
        </div>
        <Link
          href="/sos"
          id="banner-sos-link"
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-xl text-xs font-bold transition shadow-md shadow-red-950 flex items-center space-x-1"
        >
          <span>SOS BEACON</span>
        </Link>
      </div>
    </aside>
  );
}
