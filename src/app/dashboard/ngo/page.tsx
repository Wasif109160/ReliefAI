'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  Building,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReliefDistribution } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';

const initialDistributions: ReliefDistribution[] = [
  {
    id: 'dist-101',
    ngoId: 'demo-ngo-3',
    ngoName: 'Red Cross Alliance',
    itemCategory: 'water',
    itemName: 'Emergency Water Purification Bladders (10L)',
    quantityDistributed: 800,
    unit: 'units',
    targetZone: 'Lincoln High Gymnasium Safe Zone',
    dispatchedAt: '25m ago',
    status: 'in_transit',
  },
  {
    id: 'dist-102',
    ngoId: 'demo-ngo-3',
    ngoName: 'Red Cross Alliance',
    itemCategory: 'medical',
    itemName: 'Combat Trauma Tourniquets & Chest Seals',
    quantityDistributed: 250,
    unit: 'kits',
    targetZone: 'Cascadia Civic Arena Intake',
    dispatchedAt: '1h ago',
    status: 'delivered',
    verifiedBy: 'Dr. Elena Rostova',
  },
  {
    id: 'dist-103',
    ngoId: 'demo-ngo-3',
    ngoName: 'Red Cross Alliance',
    itemCategory: 'rations',
    itemName: 'Emergency High-Calorie Meal Packs (MREs)',
    quantityDistributed: 3200,
    unit: 'meals',
    targetZone: 'Redwood Valley Evacuation Shelter',
    dispatchedAt: '2h ago',
    status: 'delivered',
  },
];

export default function NGODashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [distributions, setDistributions] = useState<ReliefDistribution[]>(initialDistributions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [itemName, setItemName] = useState('Clean Water Bladders (10L)');
  const [itemCategory, setItemCategory] = useState<ReliefDistribution['itemCategory']>('water');
  const [quantity, setQuantity] = useState('500');
  const [targetZone, setTargetZone] = useState('Lincoln Safe Zone');

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newDist: ReliefDistribution = {
      id: `dist-${Date.now()}`,
      ngoId: user?.uid || user?.id || 'demo-ngo-3',
      ngoName: user?.organization || 'NGO Task Force',
      itemCategory,
      itemName,
      quantityDistributed: Number(quantity),
      unit: itemCategory === 'rations' ? 'meals' : 'units',
      targetZone,
      dispatchedAt: 'Just now',
      status: 'dispatched',
    };

    setDistributions([newDist, ...distributions]);
    setIsModalOpen(false);

    addNotification({
      targetRole: 'all',
      title: `NGO Convoy Dispatched: ${itemName}`,
      message: `${quantity} units routed to ${targetZone} by ${user?.displayName || user?.name || 'NGO Lead'}.`,
      type: 'success',
      link: '/distribution',
    });
  };

  const markDelivered = (id: string) => {
    setDistributions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'delivered', verifiedBy: user?.displayName || user?.name || 'NGO Officer' } : d))
    );
  };

  const totalDelivered = distributions
    .filter((d) => d.status === 'delivered')
    .reduce((acc, d) => acc + d.quantityDistributed, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>NGO DISASTER LOGISTICS & RESOURCE TRACKING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            NGO Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Coordinating humanitarian relief supply chain, convoys, and shelter fulfillments for <strong className="text-white">{user?.organization || 'Red Cross Alliance'}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Relief Convoy</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE CONVOYS</span>
          <div className="text-2xl font-black text-amber-400">
            {distributions.filter((d) => d.status !== 'delivered').length} En Route
          </div>
          <p className="text-[11px] text-slate-500">Live GPS tracking active</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">UNITS DELIVERED</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {totalDelivered.toLocaleString()} Units
          </div>
          <p className="text-[11px] text-slate-500">Received by shelter staff</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">TARGET SAFE ZONES</span>
          <div className="text-2xl font-black text-cyan-400">4 Shelters</div>
          <p className="text-[11px] text-slate-500">Fluvial District perimeter</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CHAIN OF CUSTODY</span>
          <div className="text-2xl font-black text-purple-400 flex items-center space-x-1.5 font-mono">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>100% Verified</span>
          </div>
          <p className="text-[11px] text-slate-500">Audit trail backed</p>
        </div>
      </div>

      {/* Dispatches Table / Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Relief Convoy Dispatch Ledger</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{distributions.length} Total Convoys</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {distributions.map((item) => (
            <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.status === 'delivered'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-white text-sm">{item.itemName}</h3>
                </div>
                <div className="text-xs text-slate-400 flex items-center space-x-4 pt-0.5">
                  <span>Target: <strong className="text-slate-200">{item.targetZone}</strong></span>
                  <span>•</span>
                  <span>Quantity: <strong className="text-cyan-400 font-mono">{item.quantityDistributed.toLocaleString()} {item.unit}</strong></span>
                  <span>•</span>
                  <span className="text-slate-500 font-mono">{item.dispatchedAt}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {item.status !== 'delivered' ? (
                  <button
                    onClick={() => markDelivered(item.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-950 flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Shelter Delivery</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> VERIFIED BY RECEIVER
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Dispatch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel-elevated p-6 rounded-3xl border border-slate-700 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Authorize Relief Convoy Dispatch</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xs text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 capitalize"
                >
                  <option value="water">Clean Water Bladders</option>
                  <option value="medical">Medical & Trauma Supplies</option>
                  <option value="rations">Nutritional Rations (MRE)</option>
                  <option value="tents">Emergency Heavy Tents</option>
                  <option value="generators">Mobile Solar Inverters</option>
                  <option value="infant_kits">Pediatric & Infant Kits</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Evacuation Zone / Shelter</label>
                <select
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Cascadia Civic Arena Safe Zone">Cascadia Civic Arena Safe Zone</option>
                  <option value="Lincoln High Gymnasium Safe Zone">Lincoln High Gymnasium Safe Zone</option>
                  <option value="Redwood Valley Community Safe Zone">Redwood Valley Community Safe Zone</option>
                  <option value="Transit Hall Auxiliary Station">Transit Hall Auxiliary Station</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-950 mt-2 flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Convoy Dispatch</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
