'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Search,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ReliefDistribution } from '@/lib/types';
import { ASSETS } from '@/lib/assets';

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
  const [convoys, setConvoys] = useState<ReliefDistribution[]>(mockConvoys);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Convoy Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-52 sm:h-64">
        <Image
          src={ASSETS.ruralRoad}
          alt="Rural Bangladesh Humanitarian Convoy Route"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono uppercase tracking-wider w-max">
            <Truck className="w-3.5 h-3.5" />
            <span>LAST-MILE HUMANITARIAN LOGISTICS // প্রান্তিক ত্রাণ বিতরণ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Relief Distribution Tracking & Logistics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time telemetry tracking humanitarian convoys traversing inundated rural corridors across Sylhet, Sunamganj, and the coastal belt.
          </p>
        </div>
      </div>

      {/* Global Delivered Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total Completed</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {totalDelivered} / {convoys.length} Delivered
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">En Route Convoy Fleets</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {inTransitCount} In Transit
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Verification Rate</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              100% Cryptographic
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
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
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'water', 'medical', 'rations', 'tents', 'generators'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition border ${
                activeCategory === cat
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
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
              className={`glass-panel p-6 rounded-3xl border transition space-y-4 shadow-xl flex flex-col justify-between ${
                isDelivered ? 'border-slate-800 hover:border-slate-700' : 'border-amber-500/40 shadow-amber-950/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                      {convoy.ngoName}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{convoy.itemName}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                      isDelivered
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    }`}
                  >
                    {convoy.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Quantity:</span>
                    <span className="font-bold text-white font-mono">
                      {convoy.quantityDistributed.toLocaleString()} {convoy.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-cyan-300 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{convoy.targetZone}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dispatched:</span>
                    <span className="font-mono text-slate-500">{convoy.dispatchedAt}</span>
                  </div>
                </div>

                {convoy.verifiedBy && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Received & Verified by <strong>{convoy.verifiedBy}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>CONVOY ID: {convoy.id.toUpperCase()}</span>
                <span>STATUS: {isDelivered ? 'COMPLETED' : 'IN-TRANSIT'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
