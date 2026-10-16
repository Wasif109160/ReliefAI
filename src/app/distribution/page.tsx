'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Truck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ReliefDistribution } from '@/lib/types';
import { ASSETS } from '@/lib/assets';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn } from '@/components/ui/motion-wrapper';

const mockConvoys: ReliefDistribution[] = [
  {
    id: 'dist-01',
    ngoId: 'ngo-bdrcs',
    ngoName: 'Bangladesh Red Crescent Society (BDRCS) Logistics Wing',
    itemCategory: 'water',
    itemName: 'Emergency Water Purification Tablets & 10L Jerrycans (অ্যাকুয়াট্যাব)',
    quantityDistributed: 35000,
    unit: 'units',
    targetZone: 'Sunamganj Govt Jubilee High School Flood Shelter',
    dispatchedAt: '25m ago',
    status: 'in_transit',
  },
  {
    id: 'dist-02',
    ngoId: 'ngo-brac',
    ngoName: 'BRAC Humanitarian Crisis Fleet',
    itemCategory: 'rations',
    itemName: 'Family Emergency Dry Food Packs (চিঁড়া, গুড়, ওরস্যালাইন ও বিস্কুট)',
    quantityDistributed: 4200,
    unit: 'packs',
    targetZone: 'Gowainghat Upazila Parishad Relief Center, Sylhet',
    dispatchedAt: '45m ago',
    status: 'delivered',
    verifiedBy: 'Dr. Farhana Yasmin (Upazila Health Officer)',
  },
  {
    id: 'dist-03',
    ngoId: 'ngo-dcht',
    ngoName: 'Dhaka Community Hospital Trust (DCHT) Mobile Clinic',
    itemCategory: 'medical',
    itemName: 'Polyvalent Snake Antivenom & Pediatric Trauma Kits',
    quantityDistributed: 850,
    unit: 'kits',
    targetZone: 'Companiganj Upazila Health Complex, Sylhet',
    dispatchedAt: '1h 10m ago',
    status: 'delivered',
    verifiedBy: 'Dr. Kamal Hossain (Civil Surgeon Representative)',
  },
  {
    id: 'dist-04',
    ngoId: 'ngo-anjuman',
    ngoName: 'Anjuman Mufidul Islam Disaster Wing',
    itemCategory: 'tents',
    itemName: 'Reinforced Weatherproof Family Relief Tents (8-Person)',
    quantityDistributed: 280,
    unit: 'tents',
    targetZone: "Kutubdia Multi-Purpose Cyclone Shelter, Cox's Bazar",
    dispatchedAt: '1h 50m ago',
    status: 'in_transit',
  },
  {
    id: 'dist-05',
    ngoId: 'ngo-jaago',
    ngoName: 'JAAGO Foundation Youth Volunteer Corps',
    itemCategory: 'generators',
    itemName: 'Solar Mobile Inverter Generators & Water Desalination Skids',
    quantityDistributed: 12,
    unit: 'generators',
    targetZone: 'Chilmari River Ghat Embankment, Kurigram',
    dispatchedAt: '3h ago',
    status: 'delivered',
    verifiedBy: 'Korvi Rakshand (JAAGO Field Coordinator)',
  },
];

export default function DistributionPage() {
  const [convoys] = useState<ReliefDistribution[]>(mockConvoys);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = convoys.filter((c) => {
    if (activeCategory !== 'all' && c.itemCategory !== activeCategory) return false;
    if (search && !c.itemName.toLowerCase().includes(search.toLowerCase()) && !c.targetZone.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalDelivered = convoys.filter((c) => c.status === 'delivered').length;
  const inTransitCount = convoys.filter((c) => c.status === 'in_transit').length;

  return (
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Light Premium Convoy Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <HeroAmbientBeams className="opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-wider w-max shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-teal-600" />
              <span>LAST-MILE HUMANITARIAN LOGISTICS // প্রান্তিক ত্রাণ বিতরণ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Relief Distribution Tracking & Logistics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Real-time telemetry tracking humanitarian convoys traversing inundated rural corridors across Sylhet, Sunamganj, and the coastal belt.
            </p>
          </div>
          <div className="relative w-full md:w-72 lg:w-80 h-40 sm:h-44 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm shrink-0 bg-slate-100">
            <Image
              src={ASSETS.ruralRoad}
              alt="Rural Bangladesh Humanitarian Convoy Route"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200/80 text-[11px] font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
              <span className="truncate">Sylhet-Sunamganj Corridor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Global Delivered Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Completed</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5 flex items-baseline gap-1.5">
              <AnimatedCounter value={totalDelivered} />
              <span className="text-sm font-semibold text-slate-500">/ {convoys.length} Delivered</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Verified on-site by Local Upazila Leads</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Route Convoy Fleets</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5 flex items-baseline gap-1.5">
              <AnimatedCounter value={inTransitCount} />
              <span className="text-sm font-semibold text-amber-700">In Transit</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Live GPS beacon relay to command</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Rate</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-0.5 flex items-baseline gap-1">
              <AnimatedCounter value={100} />
              <span className="text-sm font-bold text-blue-600">% Cryptographic</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Zero intermediary leakage guarantee</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
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
            placeholder="Search items, target shelters, or convoy organizations..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'water', 'medical', 'rations', 'tents', 'generators'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize tracking-wide transition border shadow-xs ${
                activeCategory === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Convoys Ledger List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((convoy) => {
          const isDelivered = convoy.status === 'delivered';

          return (
            <div
              key={convoy.id}
              className={`bg-white p-6 rounded-2xl border transition-all space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isDelivered ? 'border-slate-200/90 hover:border-slate-300' : 'border-amber-200 hover:border-amber-300 ring-1 ring-amber-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] text-teal-700 font-semibold uppercase tracking-wider block">
                      {convoy.ngoName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">{convoy.itemName}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {convoy.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Total Quantity:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {convoy.quantityDistributed.toLocaleString()} {convoy.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Destination:</span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[220px]">{convoy.targetZone}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Dispatched:</span>
                    <span className="font-semibold text-slate-700">{convoy.dispatchedAt}</span>
                  </div>
                </div>

                {convoy.verifiedBy && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Received & Verified by <strong className="font-bold text-emerald-950">{convoy.verifiedBy}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-100">
                <span>CONVOY ID: {convoy.id.toUpperCase()}</span>
                <span className="font-bold text-slate-700">{isDelivered ? 'COMPLETED' : 'IN-TRANSIT'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
