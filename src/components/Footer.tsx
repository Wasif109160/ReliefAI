import React from 'react';
import Link from 'next/link';
import { ShieldCheck, PhoneCall, Radio, Globe2, Heart, Trees, Compass, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#040810] text-slate-400 text-xs py-14 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
        {/* Col 1 */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-lg shadow-red-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div>
              <span className="font-black text-white text-base">
                Relief<span className="text-red-500">AI</span>
              </span>
              <span className="block text-[10px] font-bangla text-emerald-400 -mt-1 font-semibold">
                বাংলাদেশ জাতীয় দুর্যোগ ও পরিবেশ সুরক্ষা
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Sovereign AI-driven crisis intelligence grid for Bangladesh. Multimodal flood prediction, cyclone evacuation telemetry, and rapid Fire Service SAR dispatch.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NATIONAL MESH: 99.99% UPTIME (BWDB CONNECTED)</span>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">
            National Emergency Hotlines
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center space-x-2 text-red-300">
              <PhoneCall className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>National Emergency Line: <strong className="text-white font-mono">999</strong> (24/7)</span>
            </li>
            <li className="flex items-center space-x-2 text-amber-300">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Fire Service & Civil Defence: <strong className="text-white font-mono">102</strong></span>
            </li>
            <li className="flex items-center space-x-2 text-cyan-300">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Disaster Early Warning: <strong className="text-white font-mono">1090</strong> (Toll-Free)</span>
            </li>
            <li className="flex items-center space-x-2 text-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>BWDB Flood Sensor Hotline: <strong className="text-white font-mono">10655</strong></span>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">
            Operational Sectors
          </h4>
          <ul className="space-y-2">
            <li><Link href="/map" className="hover:text-cyan-400 transition flex items-center gap-1.5"><Compass className="w-3 h-3 text-cyan-400" /><span>Bangladesh Tactical Crisis Map</span></Link></li>
            <li><Link href="/environment" className="hover:text-emerald-400 transition flex items-center gap-1.5"><Trees className="w-3 h-3 text-emerald-400" /><span>Environment & River Watch (নদী রক্ষা)</span></Link></li>
            <li><Link href="/shelters" className="hover:text-cyan-400 transition">Cyclone & Flood Safe Shelters</Link></li>
            <li><Link href="/dashboard/citizen" className="hover:text-cyan-400 transition">Citizen Safety Hub (নাগরিক ড্যাশবোর্ড)</Link></li>
            <li><Link href="/dashboard/rescue" className="hover:text-orange-400 transition">Rescue & USAR Operations Deck</Link></li>
            <li><Link href="/dashboard/government" className="hover:text-blue-400 transition">Civil Defense EOC Command</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">
            Inter-Agency Framework
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Integrated with Ministry of Disaster Management & Relief (MoDMR), Bangladesh Red Crescent Society (BDRCS), and Armed Forces Division (AFD).
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Bangabandhu Satellite-1 telemetry sync</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
        <div>
          © 2026 ReliefAI Bangladesh. Built for national resilience and life-saving humanitarian readiness.
        </div>
        <div className="flex items-center space-x-1 mt-2 sm:mt-0 font-bangla text-slate-400">
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ দুর্যোগ ব্যবস্থাপনা ও উদ্ধার প্ল্যাটফর্ম</span>
        </div>
      </div>
    </footer>
  );
}
