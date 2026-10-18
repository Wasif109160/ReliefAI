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
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';
import { DemoModeBanner, DataStateWrapper } from '@/components/ui/demo-mode-indicator';

export default function MapPage() {
  const { addNotification } = useNotifications();
  const [disasters, setDisasters] = useState<DisasterIncident[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [responders, setResponders] = useState<ResponderTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [serviceMeta, setServiceMeta] = useState<{
    provider: string;
    mode: 'demo' | 'live';
    liveApiStatus: string;
  }>({
    provider: 'demo',
    mode: 'demo',
    liveApiStatus: 'STANDBY_NOT_CONFIGURED',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [resDisasters, resSOS, resShelters, resResponders] = await Promise.all([
        fetch('/api/disasters').then((r) => r.json()).catch(() => ({})),
        fetch('/api/sos', { credentials: 'include' }).then((r) => r.json()).catch(() => []),
        fetch('/api/shelters').then((r) => r.json()).catch(() => []),
        fetch('/api/responders').then((r) => r.json()).catch(() => []),
      ]);

      if (resDisasters?.disasters) {
        setDisasters(resDisasters.disasters);
        setServiceMeta({
          provider: resDisasters.provider || 'demo',
          mode: resDisasters.mode || 'demo',
          liveApiStatus: resDisasters.liveApiStatus || 'STANDBY_NOT_CONFIGURED',
        });
      }
      if (Array.isArray(resSOS)) setSosRequests(resSOS);
      if (Array.isArray(resShelters)) setShelters(resShelters);
      if (Array.isArray(resResponders)) setResponders(resResponders);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to synchronize geospatial crisis telemetry stream. Please check network connectivity.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900">
      {/* Prominent Demo Mode & Provenance Banner */}
      <DemoModeBanner mode={serviceMeta.mode} />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-white border border-emerald-500 text-slate-900 shadow-xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>SOVEREIGN BANGLADESH GEOSPATIAL INTELLIGENCE // BWDB TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bangladesh Tactical Crisis Map
            <span className="block text-teal-700 font-bangla text-lg sm:text-xl font-bold mt-0.5">
              বাংলাদেশ জাতীয় দুর্যোগ মানচিত্র ও উদ্ধার পর্যবেক্ষণ
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/disasters"
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-bold text-blue-800 transition shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Historical Disaster Archive</span>
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-xs font-mono font-bold text-slate-700 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span>Refresh Telemetry Stream</span>
          </button>
        </div>
      </div>

      {/* Environmental & Hazard Sensor Telemetry Bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-700 uppercase">
              Sensor Feeds & Hydro-Stations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
              CALIBRATION BENCHMARKS // NOT LIVE SENSOR STREAM
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Telemetry will connect to BWDB & BMD telemetry servers in Live Integration mode
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Surma River Gage (Simulated)</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                14.22 m <span className="text-[10px] text-red-600 font-mono font-bold">(+1.15m Surge)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Bay of Bengal Wind (Simulated)</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                82 km/h <span className="text-[10px] text-amber-600 font-mono font-bold">(Signal 4)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Meghalaya Runoff (Simulated)</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">148 mm / 24h</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Mesh Latency</div>
              <div className="text-sm font-extrabold text-emerald-700 font-mono">12 ms (99.99%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Live Map / TacticalMap Component wrapped in DataStateWrapper */}
      <DataStateWrapper
        isLoading={loading && disasters.length === 0}
        error={errorMsg}
        isEmpty={!loading && disasters.length === 0 && sosRequests.length === 0 && shelters.length === 0 && responders.length === 0}
        onRetry={fetchData}
        emptyTitle="No Geospatial Records Available"
        emptyDescription="No disaster incidents, shelters, or responders were found in the current operational grid."
      >
        <GoogleLiveMap
          disasters={disasters}
          sosRequests={sosRequests}
          shelters={shelters}
          responders={responders}
          onDispatchSOS={handleDispatchSOS}
          isLoading={loading}
        />
      </DataStateWrapper>
    </div>
  );
}
