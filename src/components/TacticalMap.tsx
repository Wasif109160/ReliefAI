'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';

interface TacticalMapProps {
  disasters: DisasterIncident[];
  sosRequests: SOSRequest[];
  shelters: Shelter[];
  responders: ResponderTeam[];
  onDispatchSOS?: (sosId: string) => void;
}

export default function TacticalMap({
  disasters,
  sosRequests,
  shelters,
  responders,
  onDispatchSOS,
}: TacticalMapProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'sos' | 'shelters' | 'responders'>('all');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'disaster' | 'sos' | 'shelter' | 'responder';
    data: any;
  } | null>(null);

  // Map bounding box (covering Cascadia metro region roughly around lat 45.45-45.60, lng -122.75 - -122.50)
  const minLat = 45.45;
  const maxLat = 45.60;
  const minLng = -122.75;
  const maxLng = -122.50;

  // Convert lat/lng to percentage X/Y on SVG canvas
  const toMapCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // invert Y
    return {
      x: Math.min(Math.max(x, 5), 95),
      y: Math.min(Math.max(y, 5), 95),
    };
  };

  return (
    <div className="relative w-full rounded-2xl glass-panel-elevated overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col xl:flex-row h-[680px]">
      {/* Main Map Canvas Area */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center select-none">
        {/* Tactical Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 60px 60px, 60px 60px',
          }}
        />

        {/* Radar Sweep Effect */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[500px] h-[500px] rounded-full border border-cyan-500/10">
            <div className="absolute inset-4 rounded-full border border-cyan-500/10" />
            <div className="absolute inset-16 rounded-full border border-cyan-500/10" />
            {/* Rotating radar beam */}
            <div
              className="absolute inset-0 rounded-full animate-radar opacity-30"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(6, 182, 212, 0.3) 360deg)',
              }}
            />
          </div>
        </div>

        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: 'All Layers' },
              { id: 'sos', label: `Active SOS (${sosRequests.filter((s) => s.status !== 'rescued').length})` },
              { id: 'shelters', label: `Shelters (${shelters.length})` },
              { id: 'responders', label: `Responders (${responders.length})` },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition border shadow-sm ${
                activeFilter === btn.id
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-cyan-500/20'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Tactical Telemetry Badge */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-cyan-400">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>GRID 45.51N / -122.67W</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> SATELLITE SYNC
          </span>
        </div>

        {/* Interactive SVG Map Layers */}
        <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Simulated River Network */}
          <path
            d="M 15 25 Q 35 45 48 52 T 85 88"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeOpacity="0.4"
            strokeDasharray="4 2"
          />

          {/* Disaster Hazard Zones */}
          {disasters.map((disaster) => {
            const { x, y } = toMapCoords(disaster.location.lat, disaster.location.lng);
            const radius = (disaster.location.radiusKm / 35) * 20;

            return (
              <g
                key={disaster.id}
                className="cursor-pointer group"
                onClick={() => setSelectedItem({ type: 'disaster', data: disaster })}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={disaster.type === 'flood' ? '#0284c7' : disaster.type === 'wildfire' ? '#ea580c' : '#dc2626'}
                  fillOpacity="0.15"
                  stroke={disaster.type === 'flood' ? '#38bdf8' : disaster.type === 'wildfire' ? '#f97316' : '#ef4444'}
                  strokeWidth="0.75"
                  strokeDasharray="2 1"
                  className="animate-pulse"
                />
                <circle cx={x} cy={y} r="1.5" fill="#ef4444" />
              </g>
            );
          })}
        </svg>

        {/* HTML Markers Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* SOS Markers */}
          {(activeFilter === 'all' || activeFilter === 'sos') &&
            sosRequests.map((sos) => {
              if (sos.status === 'rescued') return null;
              const { x, y } = toMapCoords(sos.location.lat, sos.location.lng);
              const isCritical = sos.priority === 'CRITICAL';

              return (
                <div
                  key={sos.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => setSelectedItem({ type: 'sos', data: sos })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring for critical */}
                    {isCritical && (
                      <span className="absolute w-8 h-8 rounded-full bg-red-600/50 animate-ping-slow pointer-events-none" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 transition group-hover:scale-125 ${
                        isCritical
                          ? 'bg-red-600 border-white text-white shadow-red-600/50'
                          : 'bg-amber-500 border-white text-slate-950 shadow-amber-500/50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-slate-900/95 border border-slate-700 px-2 py-1 rounded text-[10px] text-white font-mono shadow-xl z-30">
                      {sos.reporterName}: {sos.priority} ({sos.urgencyScore}/100)
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Shelter Markers */}
          {(activeFilter === 'all' || activeFilter === 'shelters') &&
            shelters.map((shelter) => {
              const { x, y } = toMapCoords(shelter.lat, shelter.lng);
              const isFull = shelter.status === 'full';

              return (
                <div
                  key={shelter.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => setSelectedItem({ type: 'shelter', data: shelter })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md border transition group-hover:scale-125 ${
                      isFull
                        ? 'bg-slate-700 border-slate-500 text-slate-300'
                        : 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-600/40'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-slate-900/95 border border-slate-700 px-2 py-1 rounded text-[10px] text-emerald-300 font-mono shadow-xl z-30">
                    {shelter.name} ({shelter.currentOccupancy}/{shelter.capacity})
                  </div>
                </div>
              );
            })}

          {/* Responder Teams */}
          {(activeFilter === 'all' || activeFilter === 'responders') &&
            responders.map((team) => {
              const { x, y } = toMapCoords(team.currentLocation.lat, team.currentLocation.lng);

              return (
                <div
                  key={team.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => setSelectedItem({ type: 'responder', data: team })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white text-white flex items-center justify-center shadow-md shadow-cyan-600/40 transition group-hover:scale-125">
                    <Users className="w-3 h-3" />
                  </div>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-slate-900/95 border border-slate-700 px-2 py-1 rounded text-[10px] text-cyan-300 font-mono shadow-xl z-30">
                    {team.name} [{team.status}]
                  </div>
                </div>
              );
            })}
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>Critical SOS</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span>Safe Shelter</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
            <span>Responder Unit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-sky-400 bg-sky-500/20" />
            <span>Flood Zone</span>
          </div>
        </div>
      </div>

      {/* Side Inspector Panel */}
      <div className="w-full xl:w-96 bg-slate-900/95 border-t xl:border-t-0 xl:border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
        {selectedItem ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-semibold">
                Inspector // {selectedItem.type.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {/* SOS Details */}
            {selectedItem.type === 'sos' && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-white">{selectedItem.data.reporterName}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      selectedItem.data.priority === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {selectedItem.data.priority}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Urgency Score:</span>
                    <span className="font-mono font-bold text-red-400">{selectedItem.data.urgencyScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trapped Individuals:</span>
                    <span className="font-bold text-white">{selectedItem.data.trappedCount} persons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Injuries:</span>
                    <span className="font-bold text-amber-400">{selectedItem.data.injuriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-mono text-cyan-400 uppercase">{selectedItem.data.status}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Victim Situation:</p>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                    {selectedItem.data.details}
                  </p>
                </div>

                {selectedItem.data.aiTriageSummary && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs">
                    <p className="text-[10px] font-mono text-cyan-400 font-bold mb-1">AI Triage Recommendation:</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{selectedItem.data.aiTriageSummary}</p>
                  </div>
                )}

                {selectedItem.data.status === 'pending' && onDispatchSOS && (
                  <button
                    onClick={() => {
                      onDispatchSOS(selectedItem.data.id);
                      setSelectedItem(null);
                    }}
                    className="w-full mt-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-950 flex items-center justify-center space-x-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Dispatch Rescue Unit Immediately</span>
                  </button>
                )}
              </div>
            )}

            {/* Shelter Details */}
            {selectedItem.type === 'shelter' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">{selectedItem.data.name}</h3>
                <p className="text-xs text-slate-400">{selectedItem.data.address}</p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedItem.data.currentOccupancy} / {selectedItem.data.capacity} (
                      {Math.round((selectedItem.data.currentOccupancy / selectedItem.data.capacity) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedItem.data.currentOccupancy / selectedItem.data.capacity >= 0.9
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min((selectedItem.data.currentOccupancy / selectedItem.data.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
                    <span className={selectedItem.data.hasMedical ? 'text-emerald-400' : 'text-slate-500'}>
                      {selectedItem.data.hasMedical ? '✓ Medical Team' : '✗ No Medical'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
                    <span className={selectedItem.data.hasFood ? 'text-emerald-400' : 'text-slate-500'}>
                      {selectedItem.data.hasFood ? '✓ Rations Available' : '✗ Low Rations'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
                    <span className={selectedItem.data.hasPower ? 'text-emerald-400' : 'text-slate-500'}>
                      {selectedItem.data.hasPower ? '✓ Generator Online' : '✗ Off-Grid'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
                    <span className={selectedItem.data.isPetFriendly ? 'text-emerald-400' : 'text-slate-500'}>
                      {selectedItem.data.isPetFriendly ? '✓ Pets Welcome' : '✗ No Pets'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2 text-xs text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedItem.data.contactPhone}</span>
                </div>
              </div>
            )}

            {/* Responder Team Details */}
            {selectedItem.type === 'responder' && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-white">{selectedItem.data.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {selectedItem.data.status.toUpperCase()}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Lead:</span>
                    <span className="font-semibold text-white">{selectedItem.data.leadName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Personnel:</span>
                    <span className="font-bold text-cyan-400">{selectedItem.data.membersCount} Specialists</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Radio Frequency:</span>
                    <span className="font-mono text-amber-400">{selectedItem.data.radioFreq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zone:</span>
                    <span className="text-slate-300">{selectedItem.data.currentLocation.zoneName}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Specialized Equipment:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.data.equipment.map((eq: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disaster Incident Details */}
            {selectedItem.type === 'disaster' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {selectedItem.data.type === 'flood' ? (
                    <Waves className="w-5 h-5 text-sky-400" />
                  ) : selectedItem.data.type === 'wildfire' ? (
                    <Flame className="w-5 h-5 text-orange-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="text-base font-bold text-white">{selectedItem.data.title}</h3>
                </div>
                <p className="text-xs text-slate-300">{selectedItem.data.description}</p>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Population:</span>
                    <span className="font-bold text-white">{selectedItem.data.affectedPopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Casualties Reported:</span>
                    <span className="font-bold text-red-400">{selectedItem.data.casualtiesReported}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Responders Deployed:</span>
                    <span className="font-bold text-cyan-400">{selectedItem.data.respondersDeployed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evacuation Perimeter:</span>
                    <span className="font-bold text-amber-400">{selectedItem.data.recommendedEvacuationRadiusKm} km</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Active Hazards:</p>
                  <ul className="space-y-1">
                    {selectedItem.data.activeHazards.map((h: string, idx: number) => (
                      <li key={idx} className="text-[11px] text-red-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Tactical Reconnaissance</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Click any marker on the map to inspect victim reports, shelters, disaster perimeters, or dispatch teams.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center font-mono">
          <span>ReliefAI RADAR v3.2</span>
          <span>LATENCY: 12ms</span>
        </div>
      </div>
    </div>
  );
}
