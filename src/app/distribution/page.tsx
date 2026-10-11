'use client';

import React, { useState } from 'react';
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

const mockConvoys: ReliefDistribution[] = [
  {
    id: 'dist-01',
    ngoId: 'ngo-redcross',
    ngoName: 'Red Cross Logistics Task Force',
    itemCategory: 'water',
    itemName: 'Purification Water Bladders (10L)',
    quantityDistributed: 1200,
    unit: 'units',
    targetZone: 'Lincoln High Gymnasium Safe Zone',
    dispatchedAt: '25m ago',
    status: 'in_transit',
  },
  {
    id: 'dist-02',
    ngoId: 'ngo-doctors',
    ngoName: 'Doctors Without Borders Field Team',
    itemCategory: 'medical',
    itemName: 'Hemostatic Trauma Gauze & Tourniquets',
    quantityDistributed: 400,
    unit: 'kits',
    targetZone: 'Cascadia Civic Arena Main Triage',
    dispatchedAt: '50m ago',
    status: 'delivered',
    verifiedBy: 'Dr. Raymond Kim (Chief Medical Officer)',
  },
  {
    id: 'dist-03',
    ngoId: 'ngo-worldfood',
    ngoName: 'Global Food Relief Coalition',
    itemCategory: 'rations',
    itemName: 'Emergency Ready-to-Eat Ration Packs (MREs)',
    quantityDistributed: 4500,
    unit: 'meals',
    targetZone: 'Redwood Valley Evacuation Shelter',
    dispatchedAt: '1h 20m ago',
    status: 'delivered',
    verifiedBy: 'Sarah Chen (Shelter Lead)',
  },
  {
    id: 'dist-04',
    ngoId: 'ngo-humanity',
    ngoName: 'OpenHumanity Emergency Response',
    itemCategory: 'tents',
    itemName: 'All-Weather Disaster Family Tents (8-Person)',
    quantityDistributed: 150,
    unit: 'tents',
    targetZone: 'Fluvial District High Ground Staging',
    dispatchedAt: '1h 45m ago',
    status: 'in_transit',
  },
  {
    id: 'dist-05',
    ngoId: 'ngo-telecom',
    ngoName: 'Telecom Without Borders',
    itemCategory: 'generators',
    itemName: 'Mobile Solar Battery Inverters & Mesh Wi-Fi',
    quantityDistributed: 8,
    unit: 'units',
    targetZone: 'Transit Hall Auxiliary Command Post',
    dispatchedAt: '3h ago',
    status: 'delivered',
    verifiedBy: 'Specialist Mia Zhang',
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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>RELIEF SUPPLY CONVOYS & DISTRIBUTION AUDIT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Relief Distribution Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry on humanitarian supply convoys, route status, and recipient safe-zone confirmations.
          </p>
        </div>

        {/* Global Delivered Metric */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Convoy Completion</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {totalDelivered} / {convoys.length} Delivered
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
            {inTransitCount} En Route
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
