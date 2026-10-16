'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Home,
  Check,
  MapPin,
  Search,
  Plus,
  Minus,
  Droplets,
  HeartPulse,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Shelter } from '@/lib/types';
import { ASSETS } from '@/lib/assets';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn } from '@/components/ui/motion-wrapper';

const BANGLADESH_DEFAULT_SHELTERS: Shelter[] = [
  {
    id: 'she-001',
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
    id: 'she-002',
    name: 'Teknaf Coastal Multi-Purpose Cyclone Shelter',
    address: 'Marine Drive Sector 02, Teknaf, Cox\'s Bazar',
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
    id: 'she-003',
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
    id: 'she-004',
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
    id: 'she-005',
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
  const [updatingShelterId, setUpdatingShelterId] = useState<string | null>(null);
  const [occupancyError, setOccupancyError] = useState<string | null>(null);
  const [occupancySuccess, setOccupancySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/shelters')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShelters(data);
        }
      })
      .catch((err) => console.error('Failed to fetch live shelters:', err));
  }, []);

  const handleUpdateOccupancy = async (id: string, delta: number) => {
    setOccupancyError(null);
    setOccupancySuccess(null);
    setUpdatingShelterId(id);

    const currentShelter = shelters.find((s) => s.id === id);
    if (!currentShelter) {
      setUpdatingShelterId(null);
      return;
    }

    const previousShelter = { ...currentShelter };
    const targetOccupancy = Math.max(0, Math.min(currentShelter.capacity, currentShelter.currentOccupancy + delta));

    // Optimistic UI update
    setShelters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, currentOccupancy: targetOccupancy } : s))
    );

    try {
      const res = await fetch('/api/shelters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, currentOccupancy: targetOccupancy }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Update failed (${res.status})`);
      }

      const updated: Shelter = await res.json();
      setShelters((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
      );
      setOccupancySuccess(`Updated ${currentShelter.name}: ${updated.currentOccupancy}/${updated.capacity} citizens sheltered.`);
    } catch (err: unknown) {
      // Rollback to prior state
      setShelters((prev) =>
        prev.map((s) => (s.id === id ? previousShelter : s))
      );
      const errMsg = err instanceof Error ? err.message : 'Failed to persist occupancy change. Authorization may be required.';
      setOccupancyError(errMsg);
      setTimeout(() => setOccupancyError(null), 6000);
    } finally {
      setUpdatingShelterId(null);
    }
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
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      {/* Visual Header with Coastal Cyclone Shelter Asset */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-10 shadow-xs bg-white">
        <HeroAmbientBeams className="opacity-70" />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply">
          <Image
            src={ASSETS.cycloneShelter}
            alt="Bangladesh Coastal Cyclone Shelter"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-mono text-blue-700 uppercase font-semibold shadow-2xs">
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span>MINISTRY OF DISASTER MANAGEMENT & RELIEF • SHELTER GRID</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Emergency Shelters Directory
              <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold mt-1">
                ঘূর্ণিঝড় ও বন্যা আশ্রয়কেন্দ্র নেটওয়ার্ক
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Live capacity monitoring across verified high-ground cyclone shelters and elevated haor safe centers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center space-x-4 shrink-0 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Total Headcount Occupancy</div>
              <div className="text-xl font-extrabold text-slate-900 font-mono flex items-baseline justify-end gap-1">
                <AnimatedCounter value={totalOccupied} />
                <span className="text-slate-400 text-sm">/ {totalCapacity.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-xs font-mono shadow-2xs">
              {totalCapacity > 0 ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Persistence Feedback Alerts */}
      {occupancyError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center space-x-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{occupancyError}</span>
        </div>
      )}
      {occupancySuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center space-x-3 shadow-xs animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{occupancySuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by facility name, upazila, or district..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-xs ${
              filterMedical
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Medical Team On-Site (চিকিৎসা দল)
          </button>

          <button
            onClick={() => setFilterSupplies(!filterSupplies)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-xs ${
              filterSupplies
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
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
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={ASSETS.cycloneShelter}
                  alt={s.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold border shadow-xs ${
                      isFull
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isFull ? 'CAPACITY FULL (পূর্ণ)' : 'ADMITTING CITIZENS (উন্মুক্ত)'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{s.address}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Occupancy:</span>
                    <span className="font-bold text-slate-900">
                      {s.currentOccupancy} / {s.capacity} beds ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        occupancyRate > 90 ? 'bg-red-600' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, occupancyRate)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                    {s.hasMedical && (
                      <span className="flex items-center space-x-0.5 text-emerald-700 font-semibold">
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Medical</span>
                      </span>
                    )}
                    {s.hasSupplies && (
                      <span className="flex items-center space-x-0.5 text-blue-700 font-semibold">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        <span>Water</span>
                      </span>
                    )}
                  </div>

                  {/* Occupancy Adjustment Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleUpdateOccupancy(s.id, -5)}
                      disabled={updatingShelterId === s.id || s.currentOccupancy <= 0}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
                      title="Discharge 5 citizens"
                    >
                      {updatingShelterId === s.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateOccupancy(s.id, 5)}
                      disabled={updatingShelterId === s.id || s.currentOccupancy >= s.capacity}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-xs"
                      title="Admit 5 citizens"
                    >
                      {updatingShelterId === s.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {s.contactNumber && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Emergency Contact:</span>
                    <a href={`tel:${s.contactNumber}`} className="text-blue-600 font-mono font-bold hover:underline">
                      {s.contactNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
