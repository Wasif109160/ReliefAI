'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Home,
  Check,
  X,
  Phone,
  MapPin,
  Users,
  Search,
  Filter,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Droplets,
  HeartPulse,
} from 'lucide-react';
import { Shelter } from '@/lib/types';
import { ASSETS } from '@/lib/assets';

const BANGLADESH_DEFAULT_SHELTERS: Shelter[] = [
  {
    id: 'sh-01',
    name: 'Sylhet Government High School Safe Center',
    address: 'Zindabazar Corridor, Sylhet Sadar',
    lat: 24.8949,
    lng: 91.8687,
    capacity: 1200,
    currentOccupancy: 850,
    status: 'open',
    hasMedical: true,
    hasSupplies: true,
    isPetFriendly: true,
    contactNumber: '+880 1712-998877',
    updatedAt: '10m ago',
  },
  {
    id: 'sh-02',
    name: 'Teknaf Coastal Multi-Purpose Cyclone Shelter',
    address: 'Marine Drive Sector 02, Teknaf, Cox&apos;s Bazar',
    lat: 20.8654,
    lng: 92.2983,
    capacity: 1000,
    currentOccupancy: 720,
    status: 'open',
    hasMedical: true,
    hasSupplies: true,
    isPetFriendly: false,
    contactNumber: '+880 1819-445566',
    updatedAt: '15m ago',
  },
  {
    id: 'sh-03',
    name: 'Sunamganj Haor Elevated Flood Shelter 04',
    address: 'Shalla Upazila High Ground, Sunamganj',
    lat: 25.0715,
    lng: 91.3992,
    capacity: 500,
    currentOccupancy: 480,
    status: 'open',
    hasMedical: false,
    hasSupplies: true,
    isPetFriendly: true,
    contactNumber: '+880 1711-223344',
    updatedAt: '25m ago',
  },
  {
    id: 'sh-04',
    name: 'Chittagong Port Coastal Community Refuge',
    address: 'Patenga Beach Approach, Chittagong',
    lat: 22.2354,
    lng: 91.7915,
    capacity: 1500,
    currentOccupancy: 340,
    status: 'open',
    hasMedical: true,
    hasSupplies: true,
    isPetFriendly: false,
    contactNumber: '+880 1912-334455',
    updatedAt: '1h ago',
  },
  {
    id: 'sh-05',
    name: 'Kurigram Teesta Flood Embankment Safe Camp',
    address: 'Rajarhat Upazila Center, Kurigram',
    lat: 25.8072,
    lng: 89.6295,
    capacity: 800,
    currentOccupancy: 790,
    status: 'full',
    hasMedical: true,
    hasSupplies: false,
    isPetFriendly: true,
    contactNumber: '+880 1715-667788',
    updatedAt: '5m ago',
  },
];

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>(BANGLADESH_DEFAULT_SHELTERS);
  const [search, setSearch] = useState('');
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterSupplies, setFilterSupplies] = useState(false);

  useEffect(() => {
    fetch('/api/shelters')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShelters(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateOccupancy = (id: string, delta: number) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newCount = Math.max(0, Math.min(s.capacity, s.currentOccupancy + delta));
        return {
          ...s,
          currentOccupancy: newCount,
          status: newCount >= s.capacity ? 'full' : 'open',
        };
      })
    );
  };

  const filtered = shelters.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.address.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterMedical && !s.hasMedical) return false;
    if (filterSupplies && !s.hasSupplies) return false;
    return true;
  });

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Header with Coastal Cyclone Shelter Asset */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-900/40 p-6 sm:p-10 shadow-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950/90 to-cyan-950/70">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <Image
            src={ASSETS.cycloneShelter}
            alt="Bangladesh Coastal Cyclone Shelter"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-xs font-mono text-emerald-300 uppercase tracking-widest">
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>MINISTRY OF DISASTER MANAGEMENT & RELIEF • SHELTER GRID</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Emergency Shelters Directory
              <span className="block text-emerald-400 font-bangla text-xl sm:text-2xl font-bold mt-1">
                ঘূর্ণিঝড় ও বন্যা আশ্রয়কেন্দ্র নেটওয়ার্ক
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Live capacity monitoring across verified high-ground cyclone shelters and elevated haor safe centers.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-4 shrink-0 shadow-xl">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Headcount Occupancy</div>
              <div className="text-xl font-black text-white">
                {totalOccupied.toLocaleString()}{' '}
                <span className="text-slate-500 text-sm">/ {totalCapacity.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs font-mono">
              {totalCapacity > 0 ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by facility name, upazila, or district..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
              filterMedical
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Medical Team On-Site (চিকিৎসা দল)
          </button>

          <button
            onClick={() => setFilterSupplies(!filterSupplies)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
              filterSupplies
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Clean Water & Food Reserves
          </button>
        </div>
      </div>

      {/* Shelters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => {
          const occupancyRate = Math.round((s.currentOccupancy / s.capacity) * 100);
          const isFull = s.status === 'full' || occupancyRate >= 100;

          return (
            <div
              key={s.id}
              className="glass-panel rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition overflow-hidden shadow-xl flex flex-col justify-between group"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={ASSETS.cycloneShelter}
                  alt={s.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                      isFull
                        ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {isFull ? 'CAPACITY FULL (পূর্ণ)' : 'ADMITTING CITIZENS (উন্মুক্ত)'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{s.address}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                    <span>Occupancy:</span>
                    <span className="font-bold text-white">
                      {s.currentOccupancy} / {s.capacity} beds ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyRate)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    {s.hasMedical && (
                      <span className="flex items-center space-x-0.5 text-emerald-400">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Medical</span>
                      </span>
                    )}
                    {s.hasSupplies && (
                      <span className="flex items-center space-x-0.5 text-cyan-400">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Water</span>
                      </span>
                    )}
                  </div>

                  {/* Occupancy Adjustment Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleUpdateOccupancy(s.id, -5)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Discharge 5 citizens"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleUpdateOccupancy(s.id, 5)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      title="Admit 5 citizens"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {s.contactNumber && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Emergency Hotline:</span>
                    <a href={`tel:${s.contactNumber}`} className="text-cyan-400 font-mono font-bold hover:underline">
                      {s.contactNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
