'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Shelter } from '@/lib/types';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [search, setSearch] = useState('');
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterPets, setFilterPets] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadShelters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shelters');
      const data = await res.json();
      if (Array.isArray(data)) setShelters(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleUpdateOccupancy = async (id: string, delta: number) => {
    const s = shelters.find((item) => item.id === id);
    if (!s) return;
    const newCount = Math.max(0, s.currentOccupancy + delta);

    // Optimistic UI update
    setShelters((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currentOccupancy: newCount } : item))
    );

    try {
      await fetch('/api/shelters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentOccupancy: newCount }),
      });
    } catch (err) {
      console.error(err);
      loadShelters();
    }
  };

  const filtered = shelters.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.address.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterMedical && !s.hasMedical) return false;
    if (filterPets && !s.isPetFriendly) return false;
    return true;
  });

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <Home className="w-4 h-4" />
            <span>EVACUATION SAFE ZONES & SHELTERS DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Emergency Shelters
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time occupancy tracking, medical availability, and admission status across regional safe havens.
          </p>
        </div>

        {/* Global Occupancy Stat */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total Regional Capacity</div>
            <div className="text-xl font-black text-white">
              {totalOccupied.toLocaleString()} <span className="text-slate-500 text-sm">/ {totalCapacity.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs font-mono">
            {totalCapacity > 0 ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'}
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
            placeholder="Search by facility name or address..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              filterMedical
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Medical Team On-Site
          </button>

          <button
            onClick={() => setFilterPets(!filterPets)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              filterPets
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Pet-Friendly
          </button>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((shelter) => {
          const occupancyRate = (shelter.currentOccupancy / shelter.capacity) * 100;
          const isFull = shelter.status === 'full';
          const isNear = shelter.status === 'nearing_capacity';

          return (
            <div
              key={shelter.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-5 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{shelter.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{shelter.address}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isFull
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : isNear
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {shelter.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Headcount:</span>
                    <span className="font-mono font-bold text-white">
                      {shelter.currentOccupancy} / {shelter.capacity} ({Math.round(occupancyRate)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyRate >= 95 ? 'bg-red-500' : occupancyRate >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    {shelter.hasMedical ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Trauma Staff On-Site</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    {shelter.hasFood ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Warm Meals & Water</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    {shelter.hasPower ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Auxiliary Power Online</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    {shelter.isPetFriendly ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Pets Allowed</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Intake Coordinator Controls */}
              <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={`tel:${shelter.contactPhone}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{shelter.contactPhone}</span>
                </a>

                {/* Volunteer Intake Adjuster */}
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Intake:</span>
                  <button
                    onClick={() => handleUpdateOccupancy(shelter.id, -1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleUpdateOccupancy(shelter.id, 1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
