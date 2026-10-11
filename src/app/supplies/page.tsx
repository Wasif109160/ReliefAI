'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  AlertTriangle,
  Send,
  Plus,
  RefreshCw,
  Box,
  Truck,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { SupplyItem, ResourceCategory } from '@/lib/types';
import { ASSETS } from '@/lib/assets';

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/supplies');
      const data = await res.json();
      if (Array.isArray(data)) setSupplies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplies();
  }, []);

  const handleAction = async (id: string, action: 'dispatch' | 'restock', quantity: number) => {
    try {
      await fetch('/api/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, quantity }),
      });
      loadSupplies();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = supplies.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.warehouseLocation.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const criticalItemsCount = supplies.filter((s) => s.status === 'critical' || s.status === 'low').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Logistics Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-52 sm:h-60">
        <Image
          src={ASSETS.ambulance}
          alt="Emergency Medical and Resource Logistics Bangladesh"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono uppercase tracking-wider w-max">
            <Package className="w-3.5 h-3.5" />
            <span>CENTRAL STRATEGIC WAREHOUSING // জাতীয় দুর্যোগ ত্রাণ ভাণ্ডার</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Supplies & Strategic Stockpiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            তেজগাঁও কেন্দ্রীয় ডিপো, সিলেট রিভার ঘাট ও চট্টগ্রাম বন্দর ওয়্যারহাউজের ওষুধ, স্পিডবোট, অ্যাকুয়াট্যাব ও জরুরি ত্রাণ সরঞ্জামের লাইভ ইনভেন্টরি।
          </p>
        </div>
      </div>

      {/* Critical Alerts Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">মোট সামগ্রী ক্যাটাগরি</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {supplies.length} কৌশলগত আইটেম
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">জরুরি পুনঃমজুদ সতর্কবার্তা</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {criticalItemsCount} Critical / Low
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">মাঠপর্যায়ে মোতায়েন</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {supplies.reduce((acc, s) => acc + s.allocated, 0).toLocaleString()} ইউনিট
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
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
            placeholder="Search resources, medicines, generators, warehouses..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'medical', 'water', 'rations', 'vehicles', 'power', 'shelter_gear'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition border ${
                selectedCategory === cat
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isCritical = item.status === 'critical';
          const isLow = item.status === 'low';

          return (
            <div
              key={item.id}
              className={`glass-panel p-6 rounded-3xl border transition space-y-4 shadow-xl flex flex-col justify-between ${
                isCritical
                  ? 'border-red-500/40 shadow-red-950/20'
                  : isLow
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-tight">{item.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isCritical
                        ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                        : isLow
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                  <Box className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.warehouseLocation}</span>
                </div>

                {/* Quantitative Metric */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">AVAILABLE STOCK</span>
                    <span className="text-xl font-black text-white font-mono">
                      {item.quantity.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{item.unit}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">ALLOCATED IN FIELD</span>
                    <span className="text-xl font-black text-cyan-400 font-mono">
                      {item.allocated.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{item.unit}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Dispatch or Restock */}
              <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction(item.id, 'dispatch', item.category === 'vehicles' || item.category === 'power' ? 1 : 25)}
                  disabled={item.quantity <= 0}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Dispatch Unit</span>
                </button>

                <button
                  onClick={() => handleAction(item.id, 'restock', item.category === 'vehicles' || item.category === 'power' ? 2 : 50)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Restock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
