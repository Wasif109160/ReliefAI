import React from 'react';
import Link from 'next/link';
import { ShieldCheck, PhoneCall, Radio, Globe2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white font-black text-xs">
              R
            </div>
            <span className="font-bold text-white text-base">
              Relief<span className="text-red-500">AI</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Autonomous multi-modal disaster coordination platform connecting affected citizens, emergency responders, and command staff in real-time.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OPERATIONAL MESH: 99.98% UPTIME</span>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">Emergency Channels</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center space-x-2 text-red-300">
              <PhoneCall className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>National SOS Line: <strong>911 / 112</strong></span>
            </li>
            <li className="flex items-center space-x-2 text-amber-300">
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Mesh VHF: <strong>154.280 MHz</strong></span>
            </li>
            <li className="flex items-center space-x-2 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>SMS Emergency Gateway: <strong>880-RELIEF</strong></span>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">Operations & Portals</h4>
          <ul className="space-y-2">
            <li><Link href="/map" className="hover:text-cyan-400 transition">Tactical Crisis Map</Link></li>
            <li><Link href="/command" className="hover:text-cyan-400 transition">Incident Command System</Link></li>
            <li><Link href="/shelters" className="hover:text-cyan-400 transition">Evacuation Safe Zones</Link></li>
            <li><Link href="/supplies" className="hover:text-cyan-400 transition">Logistics & Supply Depot</Link></li>
            <li><Link href="/responders" className="hover:text-cyan-400 transition">Volunteer & Responder Board</Link></li>
            <li><Link href="/donate" className="hover:text-cyan-400 transition">Transparent Aid Ledger</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">AI Safety & Protocols</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Triage algorithms adhere to FEMA ICS and WHO humanitarian guidelines. In life-threatening emergencies, always seek immediate physical cover.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted satellite telemetry enabled</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
        <div>© 2026 ReliefAI Platform. Built for humanitarian mission readiness.</div>
        <div className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Designed with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5" />
          <span>for rapid crisis relief</span>
        </div>
      </div>
    </footer>
  );
}
