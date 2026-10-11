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
} from 'lucide-react';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';

export default function MapPage() {
  const { addNotification } = useNotifications();
  const [disasters, setDisasters] = useState<DisasterIncident[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [responders, setResponders] = useState<ResponderTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDisasters, resSOS, resShelters, resResponders] = await Promise.all([
        fetch('/api/disasters').then((r) => r.json()),
        fetch('/api/sos').then((r) => r.json()),
        fetch('/api/shelters').then((r) => r.json()),
        fetch('/api/responders').then((r) => r.json()),
      ]);

      if (resDisasters.disasters) setDisasters(resDisasters.disasters);
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
          teamName: 'Cascadia Swift Water Rescue Unit B',
        }),
      });
      if (res.ok) {
        setToastMsg(`Rescue unit dispatched to SOS #${sosId}! Team en route.`);
        addNotification({
          targetRole: 'all',
          title: `RESCUE TASK FORCE EN ROUTE: SOS #${sosId}`,
          message: 'Cascadia Swift Water Rescue Unit B dispatched. ETA 7 mins.',
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
            <span>GOOGLE MAPS & TACTICAL RADAR // LIVE TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Live Geospatial Map
          </h1>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Radar Streams</span>
        </button>
      </div>

      {/* Environmental & Hazard Sensor Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">River Crest Gauge</div>
            <div className="text-sm font-bold text-white">19.4 ft <span className="text-[10px] text-red-400 font-mono">(CRITICAL)</span></div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Surface Wind</div>
            <div className="text-sm font-bold text-white">38 kts NW <span className="text-[10px] text-amber-400 font-mono">(Gale)</span></div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Rain Accumulation</div>
            <div className="text-sm font-bold text-white">4.8 in / 6h</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Mesh Latency</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">14 ms (99.98%)</div>
          </div>
        </div>
      </div>

      {/* Google Live Map Component */}
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
