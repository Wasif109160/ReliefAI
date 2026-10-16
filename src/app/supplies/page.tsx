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
  ShieldCheck,
  Search,
} from 'lucide-react';
import { SupplyItem } from '@/lib/types';
import { ASSETS } from '@/lib/assets';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn } from '@/components/ui/motion-wrapper';

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
  const totalAllocated = supplies.reduce((acc, s) => acc + s.allocated, 0);

  return (
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Light Premium Visual Logistics Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <HeroAmbientBeams className="opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-wider w-max shadow-2xs">
              <Package className="w-3.5 h-3.5 text-teal-600" />
              <span>CENTRAL STRATEGIC WAREHOUSING // জাতীয় দুর্যোগ ত্রাণ ভাণ্ডার</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Supplies & Strategic Stockpiles
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              তেজগাঁও কেন্দ্রীয় ডিপো, সিলেট রিভার ঘাট ও চট্টগ্রাম বন্দর ওয়্যারহাউজের ওষুধ, স্পিডবোট, অ্যাকুয়াট্যাব ও জরুরি ত্রাণ সরঞ্জামের লাইভ ইনভেন্টরি।
            </p>
          </div>
          <div className="relative w-full md:w-72 lg:w-80 h-40 sm:h-44 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm shrink-0 bg-slate-100">
            <Image
              src={ASSETS.ambulance}
              alt="Emergency Medical and Resource Logistics Bangladesh"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200/80 text-[11px] font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
              <span className="truncate">Tejgaon Central Depot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট সামগ্রী ক্যাটাগরি</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <AnimatedCounter value={supplies.length} />
              <span className="text-sm font-semibold text-slate-600">কৌশলগত আইটেম</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">জাতীয় জরুরি রিজার্ভ মনিটর</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">জরুরি পুনঃমজুদ সতর্কবার্তা</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5 flex items-baseline gap-1.5">
              <AnimatedCounter value={criticalItemsCount} />
              <span className="text-sm font-semibold text-amber-700">Critical / Low</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">তাৎক্ষণিক অধিযাচন প্রয়োজন</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মাঠপর্যায়ে মোতায়েন</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5 flex items-baseline gap-1.5">
              <AnimatedCounter value={totalAllocated} />
              <span className="text-sm font-semibold text-emerald-700">ইউনিট</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">সরাসরি বিতরণ চলমান</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
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
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'medical', 'water', 'rations', 'vehicles', 'power', 'shelter_gear'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize tracking-wide transition border shadow-xs ${
                selectedCategory === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Supplies Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">ইনভেন্টরি ডেটা লোড হচ্ছে...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Box className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">কোনো সামগ্রী পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">অন্য কোনো ক্যাটাগরি বা সার্চ কিওয়ার্ড ব্যবহার করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isCritical = item.status === 'critical';
            const isLow = item.status === 'low';

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 transition-all space-y-4 shadow-xs hover:border-slate-300 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{item.name}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isLow
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <Box className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate font-medium">{item.warehouseLocation}</span>
                  </div>

                  {/* Quantitative Metric */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">AVAILABLE STOCK</span>
                      <span className="text-xl font-extrabold text-slate-900 font-mono">
                        {item.quantity.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">{item.unit}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">ALLOCATED IN FIELD</span>
                      <span className="text-xl font-extrabold text-emerald-700 font-mono">
                        {item.allocated.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">{item.unit}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Dispatch or Restock */}
                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction(item.id, 'dispatch', item.category === 'vehicles' || item.category === 'power' ? 1 : 25)}
                    disabled={item.quantity <= 0}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs tracking-wide transition flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Send className="w-3 h-3 text-white" />
                    <span>Dispatch Unit</span>
                  </button>

                  <button
                    onClick={() => handleAction(item.id, 'restock', item.category === 'vehicles' || item.category === 'power' ? 2 : 50)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide transition flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FadeIn>
  );
}
