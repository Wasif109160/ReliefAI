'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Plus,
  Clock,
  Droplets,
  Bot,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import TacticalMap from '@/components/TacticalMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

interface DistributionItem {
  id: string;
  itemName: string;
  itemCategory: string;
  quantityDistributed: number;
  unit: string;
  targetZone: string;
  dispatchedAt: string;
  status: 'in_transit' | 'delivered';
  verifiedBy?: string;
}

const INITIAL_DISTRIBUTIONS: DistributionItem[] = [
  {
    id: 'DIST-901',
    itemName: '10L Drinking Water Jerrycans',
    itemCategory: 'Water',
    quantityDistributed: 1500,
    unit: 'cans',
    targetZone: 'Sylhet Govt High School Center',
    dispatchedAt: '10:30 AM',
    status: 'delivered',
    verifiedBy: 'BDRCS Field Unit 04',
  },
  {
    id: 'DIST-902',
    itemName: 'Emergency Dry Rations & High-Energy Biscuits',
    itemCategory: 'Rations',
    quantityDistributed: 800,
    unit: 'packs',
    targetZone: 'Sunamganj Cyclone Shelter 04',
    dispatchedAt: '11:15 AM',
    status: 'in_transit',
  },
  {
    id: 'DIST-903',
    itemName: 'Water Purification Tablets (Halazone)',
    itemCategory: 'Medical',
    quantityDistributed: 10000,
    unit: 'strips',
    targetZone: 'Gowainghat River Outpost',
    dispatchedAt: '12:00 PM',
    status: 'in_transit',
  },
];

const LOGISTICS_SUPPLY_DATA = [
  { category: 'Water', distributed: 8400, target: 12000 },
  { category: 'Rations', distributed: 6200, target: 8000 },
  { category: 'Medical', distributed: 15400, target: 18000 },
  { category: 'Tents', distributed: 1200, target: 2000 },
];

const CONVOY_TIMELINE = [
  { time: '12:40 PM', title: 'Convoy #08 Arrived at Sunamganj High Ground', desc: '1,500 water jerrycans transferred to local volunteers', status: 'CONFIRMED' },
  { time: '11:20 AM', title: 'BDRCS Speedboat #03 Departed Kanaighat Pier', desc: 'Medical trauma kits and ORS packets en route to isolated island village', status: 'IN TRANSIT' },
  { time: '09:45 AM', title: 'Relief Logistics Hub #01 Stock Requisition Approved', desc: 'Dispatched 5MT fortified rice from Sylhet Central Warehouse', status: 'DISPATCHED' },
];

export default function NgoDashboard() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState<DistributionItem[]>(INITIAL_DISTRIBUTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'water' | 'rations' | 'medical' | 'tents'>('water');
  const [quantity, setQuantity] = useState('500');
  const [targetZone, setTargetZone] = useState('Sylhet Govt High School Center');

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newDist: DistributionItem = {
      id: `DIST-${Math.floor(100 + Math.random() * 900)}`,
      itemName,
      itemCategory,
      quantityDistributed: parseInt(quantity) || 100,
      unit: itemCategory === 'water' ? 'liters' : 'packs',
      targetZone,
      dispatchedAt: 'Just now',
      status: 'in_transit',
    };

    setDistributions([newDist, ...distributions]);
    setIsModalOpen(false);
    setItemName('');
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
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* NGO Logistics Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-extrabold tracking-wider text-slate-800 uppercase">HUMANITARIAN RELIEF MESH</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            BDRCS Alliance Active
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-600">
          <Link href="/distribution" className="hover:text-blue-600 font-semibold transition">Distribution Ledger</Link>
          <Link href="/supplies" className="hover:text-blue-600 font-semibold transition">Warehouse Stock</Link>
          <Link href="/donations" className="hover:text-blue-600 font-semibold transition">Aid Funding</Link>
          <Link href="/map" className="hover:text-blue-600 font-semibold transition">Logistics Map</Link>
        </div>
      </div>

      {/* Humanitarian Logistics Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-8 shadow-xs bg-white">
        <HeroAmbientBeams className="opacity-70" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-50/80 via-teal-50/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 uppercase font-bold">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>BANGLADESH RED CRESCENT & NGO RELIEF LOGISTICS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Humanitarian Supply Chain Hub
              <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold mt-1">
                ত্রাণ সরবরাহ ও লজিস্টিকস ডিপো ব্যবস্থাপনা
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Coordinating NGO convoys, clean water distribution, and shelter supplies for{' '}
              <strong className="text-slate-800">{user?.organization || 'Bangladesh Red Crescent Alliance'}</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Relief Convoy (নতুন ত্রাণ চালান)</span>
          </button>
        </div>
      </div>

      {/* Warehouse Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Convoys"
          value={distributions.filter((d) => d.status === 'in_transit').length}
          subtitle="Rural Corridors En Route"
          icon={Truck}
          variant="info"
          trend="In Transit"
        />
        <StatCard
          title="Total Aid Delivered"
          value={`${totalDelivered.toLocaleString()} Units`}
          subtitle="Chain-of-Custody Verified"
          icon={CheckCircle2}
          variant="success"
          trend="100% Signed"
        />
        <StatCard
          title="Water Bladders"
          value="4,200 Packs"
          subtitle="10L Purification Stock"
          icon={Droplets}
          variant="default"
          trend="Sylhet Depot"
        />
        <StatCard
          title="Field Volunteers"
          value="340 Personnel"
          subtitle="Across 8 Regional Hubs"
          icon={Users}
          variant="warning"
          trend="Deployed"
        />
      </div>

      {/* Live Dispatches Table & Warehouse Visuals */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Active Relief Shipments & Shelter Deliveries</span>
            </h2>
            <p className="text-xs text-slate-500">Live GPS convoy progression and receipt verification</p>
          </div>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
            AUTO-SYNC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Consignment / Item</th>
                <th className="py-3 px-4">Destination Shelter</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dispatched</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{d.itemName}</div>
                    <div className="text-[10px] font-mono text-blue-600 uppercase font-semibold">{d.itemCategory}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{d.targetZone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    {d.quantityDistributed} {d.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        d.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {d.status === 'delivered' ? 'DELIVERED & VERIFIED' : 'IN TRANSIT (ON ROAD)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{d.dispatchedAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    {d.status === 'delivered' ? (
                      <span className="text-xs text-emerald-800 font-medium flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Signed: {d.verifiedBy || 'Field Lead'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => markDelivered(d.id)}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase transition shadow-xs cursor-pointer"
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

      {/* AI Supply Shortage Predictor & Category Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gemini AI Supply Shortage Predictor */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-teal-700 font-bold uppercase">
            <Bot className="w-4 h-4 text-teal-600" />
            <span>GEMINI AI SUPPLY CHAIN SHORTAGE PREDICTOR</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            12-Hour Critical Water Deficit Warning
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Machine learning forecast indicates that due to incoming evacuees at Sunamganj High School, clean water reserves will reach zero in 11.5 hours:
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Prioritize Convoy #10 with 1,200 units of 10L water bladders directly to Sunamganj.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Pre-stage 500 dry high-energy biscuit packets for Teknaf cyclone intake.</span>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Coordinate with Fire Service boat teams for water transport across severed road bridges.</span>
            </div>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Relief Supplies Delivered vs Target</h3>
              <p className="text-xs text-slate-500">Inventory progress for current emergency cycle</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              LOGISTICS SYNC
            </span>
          </div>

          <div className="w-full h-48 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LOGISTICS_SUPPLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="distributed" name="Delivered" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Bangladesh Tactical Map Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>National Supply Chain & Warehouse GIS Map</span>
            </h3>
            <p className="text-xs text-slate-500">Track relief truck convoys, river transit boats, and regional depots</p>
          </div>
          <Link href="/map" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>View Fullscreen Logistics HUD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <TacticalMap />
        </div>
      </div>

      {/* Convoy Transit Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Convoy Dispatch & Transit Timeline</span>
        </h3>
        <div className="space-y-3">
          {CONVOY_TIMELINE.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                {item.time}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Dispatch New Relief Consignment</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1 cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Item Description</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. 10L Clean Water Bladders or Oral Rehydration Salts"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as 'water' | 'rations' | 'medical' | 'tents')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                  >
                    <option value="water">Clean Water (পানি)</option>
                    <option value="rations">Rations / Dry Food (শুকনা খাবার)</option>
                    <option value="medical">Medical First Aid (ওষুধ ও স্যালাইন)</option>
                    <option value="tents">Tarpaulins & Blankets (ত্রাণ ও তাঁবু)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Target Shelter / Destination Upazila</label>
                <input
                  type="text"
                  required
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  placeholder="e.g. Sylhet High School Cyclone Center"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
