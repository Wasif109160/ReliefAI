'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Truck,
  Plus,
  CheckCircle2,
  Building,
  Send,
  ShieldCheck,
  Package,
  Droplets,
  HeartHandshake,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReliefDistribution } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';
import { ASSETS } from '@/lib/assets';

const initialDistributions: ReliefDistribution[] = [
  {
    id: 'dist-101',
    ngoId: 'demo-ngo-3',
    ngoName: 'Bangladesh Red Crescent Alliance',
    itemCategory: 'water',
    itemName: 'Emergency Water Purification Bladders (10L)',
    quantityDistributed: 800,
    unit: 'units',
    targetZone: 'Gowainghat High School Safe Zone, Sylhet',
    dispatchedAt: '25m ago',
    status: 'in_transit',
  },
  {
    id: 'dist-102',
    ngoId: 'demo-ngo-3',
    ngoName: 'Bangladesh Red Crescent Alliance',
    itemCategory: 'medical',
    itemName: 'Combat Trauma Tourniquets & Anti-Septic Kits',
    quantityDistributed: 250,
    unit: 'kits',
    targetZone: 'Sunamganj Sadar Upazila Hospital Intake',
    dispatchedAt: '1h ago',
    status: 'delivered',
    verifiedBy: 'Dr. Tariqul Islam',
  },
  {
    id: 'dist-103',
    ngoId: 'demo-ngo-3',
    ngoName: 'Bangladesh Red Crescent Alliance',
    itemCategory: 'rations',
    itemName: 'Emergency High-Calorie Dry Food Packs & Rice',
    quantityDistributed: 3200,
    unit: 'meals',
    targetZone: 'Teknaf Coastal Cyclone Shelter 04',
    dispatchedAt: '2h ago',
    status: 'delivered',
  },
];

export default function NGODashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [distributions, setDistributions] = useState<ReliefDistribution[]>(initialDistributions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'water' | 'rations' | 'medical' | 'tents'>('water');
  const [quantity, setQuantity] = useState('500');
  const [targetZone, setTargetZone] = useState('Gowainghat Shelter Point');

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newDist: ReliefDistribution = {
      id: `dist-${Date.now()}`,
      ngoId: user?.uid || user?.id || 'demo-ngo-3',
      ngoName: user?.organization || 'Bangladesh Red Crescent Alliance',
      itemCategory,
      itemName,
      quantityDistributed: Number(quantity),
      unit: itemCategory === 'rations' ? 'meals' : 'units',
      targetZone,
      dispatchedAt: 'Just now',
      status: 'in_transit',
    };

    setDistributions([newDist, ...distributions]);
    setIsModalOpen(false);

    addNotification({
      targetRole: 'all',
      title: `NGO Relief Convoy Dispatched: ${itemName}`,
      message: `${quantity} units routed to ${targetZone} by ${user?.displayName || user?.name || 'NGO Lead'}.`,
      type: 'success',
      link: '/distribution',
    });
  };

  const markDelivered = (id: string) => {
    setDistributions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'delivered', verifiedBy: user?.displayName || user?.name || 'Red Crescent Field Lead' } : d))
    );
  };

  const totalDelivered = distributions
    .filter((d) => d.status === 'delivered')
    .reduce((acc, d) => acc + d.quantityDistributed, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Humanitarian Logistics Header with Rural Logistics Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-900/40 p-6 sm:p-10 shadow-2xl bg-gradient-to-r from-cyan-950/80 via-slate-950/90 to-teal-950/70">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <Image
            src={ASSETS.ruralRoad}
            alt="Bangladesh Rural Transport Logistics"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/50 text-xs font-mono text-cyan-300 uppercase tracking-widest">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>BANGLADESH RED CRESCENT & NGO RELIEF LOGISTICS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Humanitarian Supply Chain Hub
              <span className="block text-cyan-400 font-bangla text-xl sm:text-2xl font-bold mt-1">
                ত্রাণ সরবরাহ ও লজিস্টিকস ডিপো ব্যবস্থাপনা
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Coordinating NGO convoys, clean water distribution, and shelter supplies for{' '}
              <strong className="text-white">{user?.organization || 'Bangladesh Red Crescent Alliance'}</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-cyan-950 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Relief Convoy (নতুন ত্রাণ চালান)</span>
          </button>
        </div>
      </div>

      {/* Warehouse Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE CONVOYS IN-TRANSIT</span>
          <div className="text-2xl font-black text-cyan-400">
            {distributions.filter((d) => d.status === 'in_transit').length} Convoys
          </div>
          <span className="text-[10px] text-slate-400">Rural Corridors En Route</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">TOTAL RELIEF DELIVERED</span>
          <div className="text-2xl font-black text-emerald-400">{totalDelivered.toLocaleString()} Units</div>
          <span className="text-[10px] text-emerald-400">100% Chain-of-Custody Verified</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">WATER BLADDERS STOCKED</span>
          <div className="text-2xl font-black text-white">4,200 Packs</div>
          <span className="text-[10px] text-cyan-400">10L Purification Units</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">FIELD VOLUNTEERS MOBILIZED</span>
          <div className="text-2xl font-black text-amber-400">340 Workers</div>
          <span className="text-[10px] text-slate-400">Across 8 Regional Hubs</span>
        </div>
      </div>

      {/* Live Dispatches Table & Warehouse Visuals */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-cyan-400" />
              <span>Active Relief Shipments & Shelter Deliveries</span>
            </h2>
            <p className="text-xs text-slate-400">Live GPS convoy progression and receipt verification</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
            AUTO-SYNC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Consignment / Item</th>
                <th className="py-3 px-4">Destination Shelter</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dispatched</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {distributions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{d.itemName}</div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase">{d.itemCategory}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{d.targetZone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white font-mono">
                    {d.quantityDistributed} {d.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        d.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse'
                      }`}
                    >
                      {d.status === 'delivered' ? 'DELIVERED & VERIFIED' : 'IN TRANSIT (ON ROAD)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{d.dispatchedAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    {d.status === 'delivered' ? (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Signed: {d.verifiedBy || 'Field Lead'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => markDelivered(d.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase transition"
                      >
                        Confirm Delivery
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-cyan-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span>Dispatch New Relief Consignment</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Item Description</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. 10L Clean Water Bladders or Oral Rehydration Salts"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="water">Clean Water (পানি)</option>
                    <option value="rations">Rations / Dry Food (শুকনা খাবার)</option>
                    <option value="medical">Medical First Aid (ওষুধ ও স্যালাইন)</option>
                    <option value="tents">Tarpaulins & Blankets (ত্রাণ ও তাঁবু)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Shelter / Destination Upazila</label>
                <input
                  type="text"
                  required
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  placeholder="e.g. Sylhet High School Cyclone Center"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
