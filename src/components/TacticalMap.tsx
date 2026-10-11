'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Home,
  Users,
  Compass,
  Radio,
  ExternalLink,
  Phone,
  Flame,
  Waves,
  Zap,
  Droplets,
  Trees,
  Truck,
  Building2,
  CheckCircle2,
  X,
  Navigation,
  Wind,
  HeartHandshake,
  LifeBuoy,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';

export interface BangladeshMarker {
  id: string;
  title: string;
  banglaTitle: string;
  type: 'flood' | 'cyclone' | 'fire' | 'shelter' | 'hospital' | 'rescue' | 'environment';
  district: string;
  lat: number;
  lng: number;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
  status: string;
  details: string;
  image: string;
  metric?: string;
  contact?: string;
}

const BANGLADESH_MARKERS: BangladeshMarker[] = [
  {
    id: 'M-SYL-01',
    title: 'Surma-Kushiyara Basin Flash Flood Inundation',
    banglaTitle: 'সুরমা-কুশিয়ারা আকস্মিক বন্যা প্লাবন',
    type: 'flood',
    district: 'Sylhet (সিলেট)',
    lat: 24.8949,
    lng: 91.8687,
    severity: 'CRITICAL',
    status: '+1.15m Above Danger Level',
    details: 'Torrential mountain runoff from Meghalaya hills has submerged Gowainghat and Companiganj. Rooftop rescues active.',
    image: ASSETS.flood,
    metric: 'Surma Gage: 14.22m',
    contact: 'Fire Service Control: 102',
  },
  {
    id: 'M-SUN-02',
    title: 'Sunamganj Haor Basin Water Inundation',
    banglaTitle: 'সুনামগঞ্জ হাওর এলাকা জলমগ্নতা',
    type: 'flood',
    district: 'Sunamganj (সুনামগঞ্জ)',
    lat: 25.0715,
    lng: 91.3992,
    severity: 'CRITICAL',
    status: 'Severed Road Access',
    details: 'Tahrapur and Shalla upazilas disconnected by road. BDRCS motorized speedboats ferrying emergency rice and oral saline.',
    image: ASSETS.flood,
    metric: 'Haor Water Depth: 3.4m',
    contact: 'District EOC: 01712-000000',
  },
  {
    id: 'M-COX-03',
    title: 'Bay of Bengal Cyclone Storm Surge Warning',
    banglaTitle: 'বঙ্গোপসাগর ঘূর্ণিঝড় পূর্বাভাস সংকেত ৪',
    type: 'cyclone',
    district: 'Cox&apos;s Bazar (কক্সবাজার)',
    lat: 21.4272,
    lng: 91.9702,
    severity: 'HIGH',
    status: 'Signal No. 4 Alert',
    details: 'Deep depression tracking northward. Coastal fishing trawlers advised to stay anchored in St. Martin&apos;s channel.',
    image: ASSETS.cycloneShelter,
    metric: 'Gust: 82 km/h • Wave: 2.8m',
    contact: 'Cyclone Early Warning: 1090',
  },
  {
    id: 'M-DHK-04',
    title: 'Dhaka Metropolitan Fire Service & USAR HQ',
    banglaTitle: 'ফায়ার সার্ভিস কেন্দ্রীয় কমান্ড ও আরবান রেসকিউ',
    type: 'fire',
    district: 'Dhaka (ঢাকা)',
    lat: 23.8103,
    lng: 90.4125,
    severity: 'MEDIUM',
    status: 'Standby Rescue Readiness',
    details: 'Heavy hydraulic equipment and drone mapping units ready for urban structural collapse and industrial fire mitigation.',
    image: ASSETS.fireService,
    metric: '12 Heavy Squads Active',
    contact: 'FSCD Central: 999',
  },
  {
    id: 'M-SHL-05',
    title: 'Teknaf Coastal Multi-Purpose Cyclone Shelter',
    banglaTitle: 'টেকনাফ উপকূলীয় বহুমুখী ঘূর্ণিঝড় আশ্রয়কেন্দ্র',
    type: 'shelter',
    district: 'Teknaf (টেকনাফ)',
    lat: 20.8654,
    lng: 92.2983,
    severity: 'SAFE',
    status: 'OPEN (720 / 1,000 Capacity)',
    details: 'Reinforced 3-story concrete shelter with rooftop solar power, rainwater harvesting bladders, and gender-segregated safe dorms.',
    image: ASSETS.cycloneShelter,
    metric: 'Occupancy: 72%',
    contact: 'Shelter Warden: 01819-000000',
  },
  {
    id: 'M-HOS-06',
    title: 'Sylhet MAG Osmani Medical Trauma Center',
    banglaTitle: 'সিলেট এমএজি ওসমানী মেডিকেল কলেজ ও ট্রমা সেন্টার',
    type: 'hospital',
    district: 'Sylhet (সিলেট)',
    lat: 24.8998,
    lng: 91.8542,
    severity: 'HIGH',
    status: 'Critical Care Operational',
    details: 'Flood medevac casualties being admitted. Central oxygen bank online with backup diesel turbine generator.',
    image: ASSETS.hospital,
    metric: 'Bed Availability: 42 Beds',
    contact: 'Hospital Intake: 01713-000000',
  },
  {
    id: 'M-RSC-07',
    title: 'Bangladesh Navy & Coast Guard SAR Flotilla',
    banglaTitle: 'নৌবাহিনী ও কোস্ট গার্ড উদ্ধার বোট ফ্লোটিলা',
    type: 'rescue',
    district: 'Chittagong Port Channel (চট্টগ্রাম)',
    lat: 22.3384,
    lng: 91.8317,
    severity: 'HIGH',
    status: 'Patrolling Coastal Estuary',
    details: 'High-speed coastal interceptors and inflatable dive boats deployed for marine rescue and emergency escort.',
    image: ASSETS.rescueOperation,
    metric: '8 Speedboats Active',
    contact: 'Naval Radio: Ch-16 VHF',
  },
  {
    id: 'M-ENV-08',
    title: 'Buriganga River Effluent & Pollution Probe Grid',
    banglaTitle: 'বুড়িগঙ্গা নদী রাসায়নিক বর্জ্য সেন্সর গ্রিড',
    type: 'environment',
    district: 'Postogola, Dhaka (ঢাকা)',
    lat: 23.6931,
    lng: 90.4352,
    severity: 'CRITICAL',
    status: 'Critical Industrial Effluent',
    details: 'High turbidity and chemical contamination detected via IoT optical probe. Enforcement squad dispatched to inspect sluice gate.',
    image: ASSETS.waterPollution,
    metric: 'pH: 7.9 • DO: 1.1 mg/L',
    contact: 'Dept of Environment: 1090',
  },
  {
    id: 'M-KUR-09',
    title: 'Kurigram Brahmaputra River Basin Inundation',
    banglaTitle: 'কুড়িগ্রাম ব্রহ্মপুত্র নদী প্লাবন ও ভাঙন',
    type: 'flood',
    district: 'Kurigram (কুড়িগ্রাম)',
    lat: 25.8072,
    lng: 89.6295,
    severity: 'HIGH',
    status: 'Embankment Seepage Watch',
    details: 'Brahmaputra river rising near Chilmari port. Geobag reinforcement squads placing sandbags along embankment.',
    image: ASSETS.ruralRoad,
    metric: 'River Discharge: High',
    contact: 'BWDB Kurigram Office',
  },
  {
    id: 'M-KHU-10',
    title: 'Sundarbans Mangrove Buffer & Ecological Post',
    banglaTitle: 'সুন্দরবন ম্যানগ্রোভ প্রাকৃতিক সুরক্ষা বলয়',
    type: 'environment',
    district: 'Khulna (খুলনা)',
    lat: 22.3500,
    lng: 89.6000,
    severity: 'SAFE',
    status: 'Natural Buffer Intact',
    details: 'UNESCO World Heritage mangrove belt dampening incoming storm surge energy. Forest department patrol active.',
    image: ASSETS.greenAreas,
    metric: 'Tidal Swell: 1.6m',
    contact: 'Forest Patrol Station',
  },
];

// Bangladesh Geographic Coordinate Bounding Box
const minLat = 20.4;
const maxLat = 26.8;
const minLng = 88.0;
const maxLng = 92.8;

// Accurate projection onto SVG map plane
const toMapCoords = (lat: number, lng: number) => {
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert latitude
  return {
    x: Math.min(Math.max(x, 4), 96),
    y: Math.min(Math.max(y, 4), 96),
  };
};

export default function TacticalMap() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedMarker, setSelectedMarker] = useState<BangladeshMarker | null>(BANGLADESH_MARKERS[0]);

  const filteredMarkers = BANGLADESH_MARKERS.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.type === activeFilter;
  });

  return (
    <div className="relative w-full rounded-3xl glass-panel-elevated overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col xl:flex-row h-[740px]">
      {/* Main Map View Area */}
      <div className="relative flex-1 bg-[#050a12] overflow-hidden flex items-center justify-center select-none">
        {/* Real Bangladesh Tactical Map Vector Artwork Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
          <Image
            src={ASSETS.mapArtwork}
            alt="Bangladesh Sovereign Geographic Tactical Grid"
            fill
            className="object-contain object-center p-4"
            priority
          />
        </div>

        {/* Tactical Coordinate Radar & Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.2) 0%, transparent 60%), linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        />

        {/* Filter Bar Floating Pills */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-xl">
          {[
            { id: 'all', label: 'All Incidents (সকল)', icon: Compass },
            { id: 'flood', label: 'Floods (বন্যা)', icon: Droplets, color: 'text-cyan-400' },
            { id: 'cyclone', label: 'Cyclones (ঘূর্ণিঝড়)', icon: Wind, color: 'text-amber-400' },
            { id: 'fire', label: 'Fire Service (ফায়ার)', icon: Flame, color: 'text-orange-400' },
            { id: 'shelter', label: 'Shelters (আশ্রয়)', icon: Home, color: 'text-emerald-400' },
            { id: 'hospital', label: 'Hospitals (হাসপাতাল)', icon: HeartHandshake, color: 'text-blue-400' },
            { id: 'rescue', label: 'Rescue SAR (উদ্ধার)', icon: LifeBuoy, color: 'text-rose-400' },
            { id: 'environment', label: 'Environment (নদী)', icon: Trees, color: 'text-teal-400' },
          ].map((btn) => {
            const isSelected = activeFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 border shadow-md ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-cyan-950/60'
                    : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tactical Coordinate Telemetry Badge */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-cyan-400 shadow-lg">
          <Compass className="w-3.5 h-3.5 animate-spin" />
          <span>GRID 23.68N / 90.35E (DHAKA DATUM)</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> BWDB LIVE
          </span>
        </div>

        {/* Animated Pins Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {filteredMarkers.map((marker) => {
            const { x, y } = toMapCoords(marker.lat, marker.lng);
            const isSelected = selectedMarker?.id === marker.id;
            const isCritical = marker.severity === 'CRITICAL';

            return (
              <div
                key={marker.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setSelectedMarker(marker)}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
              >
                <div className="relative flex items-center justify-center">
                  {/* Pulse rings for critical / selected pins */}
                  {(isCritical || isSelected) && (
                    <span className="absolute w-10 h-10 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-transform duration-200 group-hover:scale-125 ${
                      isSelected
                        ? 'scale-125 ring-2 ring-cyan-400 border-white'
                        : ''
                    } ${
                      marker.type === 'flood'
                        ? 'bg-blue-600 border-white text-white'
                        : marker.type === 'cyclone'
                        ? 'bg-amber-600 border-white text-white'
                        : marker.type === 'fire'
                        ? 'bg-orange-600 border-white text-white'
                        : marker.type === 'shelter'
                        ? 'bg-emerald-600 border-white text-white'
                        : marker.type === 'hospital'
                        ? 'bg-red-700 border-white text-white'
                        : marker.type === 'rescue'
                        ? 'bg-rose-600 border-white text-white'
                        : 'bg-teal-600 border-white text-white'
                    }`}
                  >
                    {marker.type === 'flood' && <Droplets className="w-4 h-4" />}
                    {marker.type === 'cyclone' && <Wind className="w-4 h-4" />}
                    {marker.type === 'fire' && <Flame className="w-4 h-4" />}
                    {marker.type === 'shelter' && <Home className="w-4 h-4" />}
                    {marker.type === 'hospital' && <HeartHandshake className="w-4 h-4" />}
                    {marker.type === 'rescue' && <LifeBuoy className="w-4 h-4" />}
                    {marker.type === 'environment' && <Trees className="w-4 h-4" />}
                  </div>

                  {/* Marker Tooltip label */}
                  <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center whitespace-nowrap bg-slate-950/95 border border-slate-700 px-2.5 py-1 rounded-xl text-[10px] text-white font-mono shadow-2xl z-30 pointer-events-none">
                    <span className="font-bold">{marker.district}</span>
                    <span className="text-cyan-400 text-[9px]">{marker.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right-Hand Inspection Drawer */}
      <div className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-slate-800 bg-[#070e1a]/95 flex flex-col justify-between p-6 overflow-y-auto">
        {selectedMarker ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 font-bold uppercase">
                {selectedMarker.id} • {selectedMarker.type.toUpperCase()}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  selectedMarker.severity === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                    : selectedMarker.severity === 'HIGH'
                    ? 'bg-orange-950 text-orange-400 border-orange-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}
              >
                {selectedMarker.severity || 'ACTIVE'}
              </span>
            </div>

            {/* Photo from assets */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
              <Image
                src={selectedMarker.image}
                alt={selectedMarker.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 text-xs text-white font-bold truncate">
                {selectedMarker.district}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white leading-snug">{selectedMarker.title}</h3>
              <span className="text-xs font-bangla text-emerald-400 font-semibold block">
                {selectedMarker.banglaTitle}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">{selectedMarker.details}</p>
            </div>

            {selectedMarker.metric && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] font-mono">LIVE TELEMETRY READOUT</span>
                <span className="text-white font-bold font-mono text-xs">{selectedMarker.metric}</span>
              </div>
            )}

            {selectedMarker.contact && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Emergency Hotline:</span>
                <span className="text-emerald-400 font-bold font-mono">{selectedMarker.contact}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/sos"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider text-center transition shadow-lg shadow-red-950"
              >
                Dispatch SAR Unit to this Grid
              </Link>
              <Link
                href="/dashboard/citizen"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs text-center font-semibold transition"
              >
                View Nearby Shelter Route
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xs">
            Select any marker on the map to inspect incident telemetry.
          </div>
        )}
      </div>
    </div>
  );
}
