'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Radio, ShieldAlert, ArrowRight, X } from 'lucide-react';

export default function EmergencyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="National emergency broadcast alerts"
      className="w-full bg-red-600 text-white border-b border-red-700 px-4 py-2.5 text-xs font-medium z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold uppercase tracking-wider text-[10px] shrink-0 border border-white/30">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>NATIONAL ALERT</span>
          </span>
          <div className="flex items-center space-x-2 truncate">
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" aria-hidden="true" />
            <p className="truncate text-xs text-white">
              <span className="font-bold font-bangla">সুরমা-কুশিয়ারা অববাহিকা জরুরি বন্যা সতর্কতা:</span>{' '}
              <span className="text-red-50">Sylhet & Sunamganj Basin +1.15m above danger level. FSCD units mobilized.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <div className="hidden md:flex items-center space-x-1.5 text-xs font-mono bg-red-700/80 border border-red-500 text-white px-2.5 py-0.5 rounded-full">
            <Radio className="w-3 h-3 text-amber-200 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wider">BWDB SENSOR #SYL-04</span>
          </div>
          <Link
            href="/sos"
            id="banner-sos-link"
            className="bg-white text-red-700 hover:bg-red-50 px-3.5 py-1 rounded-lg text-xs font-bold tracking-wider transition shadow-xs flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>SOS BEACON</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss national alert banner"
            className="p-1 rounded-lg text-red-100 hover:text-white hover:bg-red-700 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
