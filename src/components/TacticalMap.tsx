'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Home,
  Compass,
  Radio,
  Flame,
  Droplets,
  Trees,
  Wind,
  HeartHandshake,
  LifeBuoy,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';

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
    title: 'Sunamganj Haor Flash Inundation Zone',
    banglaTitle: 'সুনামগঞ্জ হাওর আকস্মিক প্লাবন অঞ্চল',
    type: 'flood',
    district: 'Sunamganj (সুনামগঞ্জ)',
    lat: 25.0658,
    lng: 91.3950,
    severity: 'CRITICAL',
    status: 'Haor Water Rising 5 cm/hr',
    details: 'Taharpur and Bishwamvarpur severed from road connectivity. Inflatable dinghies dispatched with dry food packets.',
    image: ASSETS.flood,
    metric: 'River Flow: 3.4 m/s',
    contact: 'DC Control Room: 01700-000000',
  },
  {
    id: 'M-COX-03',
    title: 'Bay of Bengal Cyclone Early Warning & Shelters',
    banglaTitle: 'বঙ্গোপসাগর ঘূর্ণিঝড় পূর্বাভাস ও আশ্রয়কেন্দ্র',
    type: 'cyclone',
    district: 'Cox\'s Bazar (কক্সবাজার)',
    lat: 21.4272,
    lng: 92.0058,
    severity: 'HIGH',
    status: 'Signal No. 4 Alert Active',
    details: 'Deep depression in Bay of Bengal expected to make landfall near Kutubdia island within 24 hours. Coastal fishing boats called to port.',
    image: ASSETS.cycloneShelter,
    metric: 'Max Wind: 88 km/h',
    contact: 'Cyclone Warning: 1090',
  },
  {
    id: 'M-DHK-04',
    title: 'Dhaka Fire Service USAR Headquarters',
    banglaTitle: 'ঢাকা ফায়ার সার্ভিস ও সিভিল ডিফেন্স সদর দফতর',
    type: 'fire',
    district: 'Dhaka Central (ঢাকা)',
    lat: 23.8103,
    lng: 90.4125,
    severity: 'SAFE',
    status: 'Standby for Nationwide Air-Lift',
    details: 'Specialized Urban Search and Rescue squads equipped with satellite communication gear, ready for deployment on MI-17 helicopters.',
    image: ASSETS.fireService,
    metric: 'Readiness: 100% Operational',
    contact: 'Fire Service HQ: 02-9555555',
  },
  {
    id: 'M-SHL-05',
    title: 'Banshkhalo Reinforced Multi-Purpose Shelter',
    banglaTitle: 'বাঁশখালী বহুমুখী সাইক্লোন শেল্টার',
    type: 'shelter',
    district: 'Chittagong Coastal (চট্টগ্রাম)',
    lat: 22.0400,
    lng: 91.9500,
    severity: 'SAFE',
    status: 'Open • 420 Capacity (80 Occupied)',
    details: 'Three-story elevated concrete structure with rooftop rainwater harvesting tanks and dedicated livestock refuge on ground level.',
    image: ASSETS.cycloneShelter,
    metric: 'Solar Power: 100% Battery',
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

export interface TacticalMapProps {
  disasters?: DisasterIncident[];
  sosRequests?: SOSRequest[];
  shelters?: Shelter[];
  responders?: ResponderTeam[];
  isLoading?: boolean;
}

function isValidBangladeshCoord(lat?: number, lng?: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= 20.0 && lat <= 27.0 && lng >= 88.0 && lng <= 93.0;
}

export default function TacticalMap({
  disasters,
  sosRequests,
  shelters,
  responders,
  isLoading = false,
}: TacticalMapProps = {}) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const isLiveMode = Boolean(disasters || sosRequests || shelters || responders);

  const liveMarkers: BangladeshMarker[] = React.useMemo(() => {
    if (!isLiveMode) return [];
    const list: BangladeshMarker[] = [];

    if (disasters && Array.isArray(disasters)) {
      for (const d of disasters) {
        if (d.location && isValidBangladeshCoord(d.location.lat, d.location.lng)) {
          list.push({
            id: d.id,
            title: d.title,
            banglaTitle: d.title,
            type: d.type === 'hurricane' ? 'cyclone' : d.type === 'wildfire' || d.type === 'industrial' ? 'fire' : 'flood',
            district: d.location.name || 'Disaster Incident Zone',
            lat: d.location.lat,
            lng: d.location.lng,
            severity: d.severity === 'critical' ? 'CRITICAL' : d.severity === 'high' ? 'HIGH' : 'MEDIUM',
            status: `${d.severity?.toUpperCase() || 'ACTIVE'} • ${d.affectedPopulation ? `${d.affectedPopulation.toLocaleString()} Affected` : 'Active Hazard'}`,
            details: d.description || (d.activeHazards && d.activeHazards.join(', ')) || 'Active disaster incident reported.',
            image: d.type === 'flood' ? ASSETS.flood : d.type === 'hurricane' ? ASSETS.cycloneShelter : ASSETS.fireService,
            metric: `Responders: ${d.respondersDeployed ?? 0} | Evac Radius: ${d.recommendedEvacuationRadiusKm ?? 10}km`,
            contact: 'National Disaster Helpline: 1090',
          });
        }
      }
    }

    if (sosRequests && Array.isArray(sosRequests)) {
      for (const s of sosRequests) {
        if (s.status !== 'resolved' && s.status !== 'cancelled' && s.location && isValidBangladeshCoord(s.location.lat, s.location.lng)) {
          list.push({
            id: s.id,
            title: `SOS: ${s.reporterName} (${s.trappedCount} citizens)`,
            banglaTitle: `জরুরি উদ্ধার সংকেত: ${s.reporterName}`,
            type: 'rescue',
            district: s.location.address || 'Field Rescue Coordinates',
            lat: s.location.lat,
            lng: s.location.lng,
            severity: s.priority === 'CRITICAL' ? 'CRITICAL' : s.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
            status: `STATUS: ${s.status?.toUpperCase()} • PRIORITY: ${s.priority}`,
            details: s.details || (s.specialNeeds && s.specialNeeds.join(', ')) || 'Emergency assistance requested.',
            image: ASSETS.rescueOperation,
            metric: `Trapped: ${s.trappedCount} citizens | Urgent Score: ${s.urgencyScore ?? 0}`,
            contact: s.phone ? `Caller: ${s.phone}` : 'Emergency Hotline: 999',
          });
        }
      }
    }

    if (shelters && Array.isArray(shelters)) {
      for (const sh of shelters) {
        if (isValidBangladeshCoord(sh.lat, sh.lng)) {
          list.push({
            id: sh.id,
            title: sh.name,
            banglaTitle: sh.name,
            type: 'shelter',
            district: sh.address,
            lat: sh.lat,
            lng: sh.lng,
            severity: sh.status === 'full' ? 'CRITICAL' : sh.status === 'nearing_capacity' ? 'HIGH' : 'SAFE',
            status: `OCCUPANCY: ${sh.currentOccupancy} / ${sh.capacity} (${sh.status.toUpperCase()})`,
            details: `Medical Support: ${sh.hasMedical ? 'Yes' : 'No'} • Supplies: ${sh.hasSupplies ? 'Available' : 'None'} • Pets: ${sh.isPetFriendly ? 'Allowed' : 'No'}`,
            image: ASSETS.cycloneShelter,
            metric: `Capacity Utilized: ${Math.round((sh.currentOccupancy / (sh.capacity || 1)) * 100)}%`,
            contact: sh.contactPhone || 'Disaster Shelter Cell',
          });
        }
      }
    }

    if (responders && Array.isArray(responders)) {
      for (const r of responders) {
        if (r.currentLocation && isValidBangladeshCoord(r.currentLocation.lat, r.currentLocation.lng)) {
          list.push({
            id: r.id,
            title: r.name,
            banglaTitle: `${r.name} (${r.type})`,
            type: 'rescue',
            district: r.currentLocation.zoneName || 'Operational Zone',
            lat: r.currentLocation.lat,
            lng: r.currentLocation.lng,
            severity: r.status === 'dispatched' || r.status === 'on_scene' ? 'HIGH' : 'SAFE',
            status: `UNIT STATUS: ${r.status.toUpperCase()} • ${r.membersCount} PERSONNEL`,
            details: `Lead: ${r.leadName} | Freq: ${r.radioFreq} • Equipment: ${r.equipment?.join(', ') || 'Standard Kit'}`,
            image: ASSETS.rescueOperation,
            metric: `Comms: ${r.radioFreq} | Incident: ${r.currentIncidentId || 'Standby'}`,
            contact: `Radio Net: ${r.radioFreq}`,
          });
        }
      }
    }

    return list;
  }, [isLiveMode, disasters, sosRequests, shelters, responders]);

  const activeMarkers = isLiveMode ? liveMarkers : BANGLADESH_MARKERS;

  const filteredMarkers = activeMarkers.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.type === activeFilter;
  });

  const selectedMarker = filteredMarkers.find((m) => m.id === selectedMarkerId) || filteredMarkers[0] || null;

  return (
    <div className="relative w-full rounded-2xl bg-white overflow-hidden border border-slate-200/90 shadow-xs flex flex-col xl:flex-row h-[740px] text-slate-900">
      {/* Main Map View Area */}
      <div className="relative flex-1 bg-slate-100/90 overflow-hidden flex items-center justify-center select-none">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/85 flex items-center justify-center">
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-md text-xs font-mono text-slate-800">
              <Radio className="w-4 h-4 animate-spin text-blue-600" />
              <span>SYNCING SATELLITE & FIELD TELEMETRY...</span>
            </div>
          </div>
        )}

        {/* Real Bangladesh Tactical Map Vector Artwork Background */}
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply">
          <Image
            src={ASSETS.mapArtwork}
            alt="Bangladesh Sovereign Geographic Tactical Grid"
            fill
            sizes="100vw"
            className="object-contain object-center p-4"
            priority
          />
        </div>

        {/* Coordinate Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.04) 0%, transparent 60%), linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        />

        {/* Filter Bar Floating Pills */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-xl">
          {[
            { id: 'all', label: 'All Incidents (সকল)', icon: Compass },
            { id: 'flood', label: 'Floods (বন্যা)', icon: Droplets },
            { id: 'cyclone', label: 'Cyclones (ঘূর্ণিঝড়)', icon: Wind },
            { id: 'fire', label: 'Fire Service (ফায়ার)', icon: Flame },
            { id: 'shelter', label: 'Shelters (আশ্রয়)', icon: Home },
            { id: 'hospital', label: 'Hospitals (হাসপাতাল)', icon: HeartHandshake },
            { id: 'rescue', label: 'Rescue SAR (উদ্ধার)', icon: LifeBuoy },
            { id: 'environment', label: 'Environment (নদী)', icon: Trees },
          ].map((btn) => {
            const isSelected = activeFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 border shadow-xs ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Telemetry Badge */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-700 shadow-xs">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>GRID 23.68N / 90.35E (DHAKA)</span>
          <span className="text-slate-300">|</span>
          {isLiveMode ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" /> LIVE GRID ({filteredMarkers.length} ACTIVE)
            </span>
          ) : (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> DEMO SIMULATION
            </span>
          )}
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
                onClick={() => setSelectedMarkerId(marker.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
              >
                <div className="relative flex items-center justify-center">
                  {/* Pulse rings for critical / selected pins */}
                  {(isCritical || isSelected) && (
                    <span className="absolute w-10 h-10 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md border-2 transition-transform duration-200 group-hover:scale-125 ${
                      isSelected
                        ? 'scale-125 ring-2 ring-blue-600 border-white'
                        : 'border-white'
                    } ${
                      marker.type === 'flood'
                        ? 'bg-red-600 text-white'
                        : marker.type === 'cyclone'
                        ? 'bg-amber-600 text-white'
                        : marker.type === 'fire'
                        ? 'bg-orange-600 text-white'
                        : marker.type === 'shelter'
                        ? 'bg-emerald-600 text-white'
                        : marker.type === 'hospital'
                        ? 'bg-rose-600 text-white'
                        : marker.type === 'rescue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-teal-600 text-white'
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
                  <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center whitespace-nowrap bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-white font-mono shadow-md z-30 pointer-events-none">
                    <span className="font-bold">{marker.district}</span>
                    <span className="text-blue-300 font-semibold text-[9px]">{marker.status}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMarkers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md max-w-sm pointer-events-auto">
                <Compass className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">
                  {isLiveMode ? 'No Live Incidents in View' : 'No Markers Available'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isLiveMode
                    ? 'No active records match the current filter in the tactical grid.'
                    : 'Try selecting a different filter above.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right-Hand Inspection Drawer */}
      <div className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-slate-200 bg-white flex flex-col justify-between p-6 overflow-y-auto text-slate-900">
        {!isLiveMode ? (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Development Demo Telemetry</span>
              <span className="text-[11px] text-amber-700">Displaying offline sample markers for testing.</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 font-mono">
            <Radio className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
            <span className="font-bold">VERIFIED LIVE STREAM</span>
          </div>
        )}
        {selectedMarker ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold uppercase">
                {selectedMarker.id} • {selectedMarker.type.toUpperCase()}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  selectedMarker.severity === 'CRITICAL'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : selectedMarker.severity === 'HIGH'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {selectedMarker.severity || 'ACTIVE'}
              </span>
            </div>

            {/* Photo from assets */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
              <Image
                src={selectedMarker.image}
                alt={selectedMarker.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200/80 text-[11px] font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
                <span className="truncate">{selectedMarker.district}</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedMarker.title}</h3>
              <span className="text-xs font-bangla text-teal-700 font-bold block">
                {selectedMarker.banglaTitle}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{selectedMarker.details}</p>
            </div>

            {selectedMarker.metric && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase tracking-wider">LIVE TELEMETRY READOUT</span>
                <span className="text-slate-900 font-extrabold font-mono text-xs">{selectedMarker.metric}</span>
              </div>
            )}

            {selectedMarker.contact && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs flex justify-between items-center">
                <span className="text-slate-700 text-[11px] font-medium">Emergency Hotline:</span>
                <span className="text-red-700 font-bold font-mono">{selectedMarker.contact}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/sos"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider text-center transition shadow-xs"
              >
                Dispatch SAR Unit to this Grid
              </Link>
              <Link
                href="/dashboard/citizen"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs text-center font-bold transition shadow-xs"
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
