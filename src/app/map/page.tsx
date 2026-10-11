'use client';

import React, { useState, useEffect } from 'react';
import GoogleLiveMap from '@/components/maps/GoogleLiveMap';
import {
  Compass,
  Radio,
  Wind,
  Droplets,
  CloudRain,
  RefreshCw,
  CheckCircle2,
  Waves,
} from 'lucide-react';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';

export default function MapPage() {
  const { addNotification } = useNotifications();
  const [disasters, setDisasters] = useState<DisasterIncident[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [responders, setResponders] = useState<ResponderTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDisasters, resSOS, resShelters, resResponders] = await Promise.all([
        fetch('/api/disasters').then((r) => r.json()).catch(() => ({})),
        fetch('/api/sos').then((r) => r.json()).catch(() => []),
        fetch('/api/shelters').then((r) => r.json()).catch(() => []),
        fetch('/api/responders').then((r) => r.json()).catch(() => []),
      ]);

      if (resDisasters?.disasters) setDisasters(resDisasters.disasters);
      if (Array.isArray(resSOS)) setSosRequests(resSOS);
      if (Array.isArray(resShelters)) setShelters(resShelters);
      if (Array.isArray(resResponders)) setResponders(resResponders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatchSOS = async (sosId: string) => {
    try {
      const res = await fetch(`/api/sos/${sosId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: 'team-02',
          teamName: 'Bangladesh Fire Service Task Force 01',
        }),
      });
      if (res.ok) {
        setToastMsg(`Fire Service rescue speedboat dispatched to SOS #${sosId}!`);
        addNotification({
          targetRole: 'all',
          title: `FIRE SERVICE SPEEDBOAT DISPATCHED: SOS #${sosId}`,
          message: 'Sylhet Division USAR Zodiac Unit 2 en route. ETA 8 mins.',
          type: 'urgent',
          link: '/map',
        });
        setTimeout(() => setToastMsg(null), 4000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-white shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>SOVEREIGN BANGLADESH GEOSPATIAL INTELLIGENCE // BWDB TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Bangladesh Tactical Crisis Map
            <span className="block text-emerald-400 font-bangla text-lg sm:text-xl font-bold mt-0.5">
              বাংলাদেশ জাতীয় দুর্যোগ মানচিত্র ও উদ্ধার পর্যবেক্ষণ
            </span>
          </h1>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry Stream</span>
        </button>
      </div>

      {/* Environmental & Hazard Sensor Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Surma River Gage</div>
            <div className="text-sm font-bold text-white font-mono">
              14.22 m <span className="text-[10px] text-red-400 font-mono">(CRITICAL +1.15m)</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Bay of Bengal Wind</div>
            <div className="text-sm font-bold text-white font-mono">
              82 km/h <span className="text-[10px] text-amber-400 font-mono">(Signal 4)</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Meghalaya Runoff Rain</div>
            <div className="text-sm font-bold text-white font-mono">148 mm / 24h</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Mesh Latency</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">12 ms (99.99%)</div>
          </div>
        </div>
      </div>

      {/* Google Live Map / TacticalMap Component */}
      <GoogleLiveMap
        disasters={disasters}
        sosRequests={sosRequests}
        shelters={shelters}
        responders={responders}
        onDispatchSOS={handleDispatchSOS}
      />
    </div>
  );
}
