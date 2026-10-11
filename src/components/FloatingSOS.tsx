'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, AlertTriangle, PhoneCall, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function FloatingSOS() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Emergency Modal Popup */}
      {open && (
        <div className="mb-3 w-80 glass-panel-elevated p-5 rounded-3xl border border-red-500/50 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  EMERGENCY SOS BEACON
                </h3>
                <span className="text-[10px] text-red-400 font-semibold font-bangla">
                  জরুরি বিপদ সংকেত
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs text-slate-300">
            <p className="leading-snug">
              Direct emergency satellite and cellular mesh dispatch to Bangladesh Fire Service, Armed Forces, and nearest SAR units.
            </p>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
              <span className="text-slate-400">Toll-Free Hotline:</span>
              <a href="tel:999" className="text-emerald-400 font-bold hover:underline">
                999 (National SOS)
              </a>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sos"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Full Emergency Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/citizen"
              onClick={() => setOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-center font-bold text-[11px] transition"
            >
              Open Citizen Safety Hub (নাগরিক ড্যাশবোর্ড)
            </Link>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition shadow-2xl shadow-red-950 border border-red-400/40 hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-200" />
        </span>
        <LifeBuoy className="w-4 h-4 animate-spin text-white" />
        <span className="tracking-widest">SOS REPORT</span>
        <span className="hidden sm:inline font-bangla text-amber-200 font-semibold text-[11px]">
          (জরুরি সাহায্য)
        </span>
      </button>
    </div>
  );
}
