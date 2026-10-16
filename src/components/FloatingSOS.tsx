'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, AlertTriangle, PhoneCall, X, ArrowRight, AlertOctagon } from 'lucide-react';

export default function FloatingSOS() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick Emergency Modal Popup */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick Emergency SOS Panel"
          className="mb-3 w-84 max-w-[calc(100vw-2rem)] p-5 rounded-2xl border border-slate-200 shadow-2xl bg-white text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                  EMERGENCY SOS BEACON
                </h3>
                <span className="text-[11px] text-red-600 font-bold font-bangla">
                  জাতীয় জরুরি বিপদ সংকেত
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close emergency beacon popover"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3.5 space-y-2.5 text-xs text-slate-600">
            <p className="leading-relaxed">
              Direct emergency satellite and cellular mesh dispatch to Bangladesh Fire Service (FSCD), Armed Forces, and local SAR task forces.
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 font-mono text-[11px]">
              <span className="text-slate-700 font-medium">Toll-Free Hotline:</span>
              <a href="tel:999" className="text-red-700 font-black hover:text-red-800 hover:underline">
                999 (National SOS)
              </a>
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-2.5">
            <Link
              href="/sos"
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2"
            >
              <AlertOctagon className="w-4 h-4 text-white" />
              <span>Full Emergency Dispatch Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="tel:999"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition flex items-center justify-center space-x-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Direct Hotline: Dial 999</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Beacon Button */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle Emergency SOS Beacon options"
          className="relative flex items-center space-x-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-5 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition shadow-lg hover:shadow-xl border-2 border-white focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
        >
          <LifeBuoy className="w-4 h-4 text-white" />
          <span>SOS BEACON</span>
          <span className="font-bangla text-xs text-red-100 font-bold">(জরুরি)</span>
        </button>
      </div>
    </div>
  );
}
