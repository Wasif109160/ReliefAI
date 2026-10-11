'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Radio, ShieldAlert } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <aside aria-label="Emergency broadcast alerts" className="w-full bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border-b border-red-700/60 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between z-50 sticky top-0 shadow-lg">
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-600/80 text-white font-bold uppercase tracking-wider text-[10px] animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Active Crisis</span>
        </span>
        <div className="flex items-center space-x-2 truncate">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="truncate">
            <span className="font-semibold text-red-200">SECTOR 4 FLASH FLOOD:</span> Emergency Evacuations active in Cascadia River Basin. Seek high ground immediately.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 shrink-0 pl-2">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-red-200">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Radio: 154.28 MHz</span>
        </div>
        <Link
          href="/sos"
          id="banner-sos-link"
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold transition shadow-sm hover:shadow-red-500/50 flex items-center space-x-1"
        >
          <span>Request SOS</span>
        </Link>
      </div>
    </aside>
  );
}
