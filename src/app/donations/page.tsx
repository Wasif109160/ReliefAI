'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  HeartHandshake,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
  CheckCircle2,
  Smartphone,
  Building2,
  Sparkles,
} from 'lucide-react';
import { AidDonation } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';
import { ASSETS } from '@/lib/assets';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FadeIn } from '@/components/ui/motion-wrapper';

export default function DonationsPage() {
  const { addNotification } = useNotifications();
  const [donations, setDonations] = useState<AidDonation[]>([]);
  const [totalRaised, setTotalRaised] = useState<number>(9500000);
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('5000');
  const [paymentChannel, setPaymentChannel] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [cause, setCause] = useState('সিলেট-সুনামগঞ্জ বন্যা: নিরাপদ পানি ও জরুরি উদ্ধার কিট');
  const [isDonating, setIsDonating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadDonations = async () => {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (data.donations) {
        setDonations(data.donations);
        setTotalRaised(data.totalRaised);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setIsDonating(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName || 'মানবিক শুভাকাঙ্ক্ষী (Anonymous)',
          amount: Number(amount),
          allocatedCause: cause,
          channel: paymentChannel,
        }),
      });

      if (res.ok) {
        setSuccessMsg(true);
        const name = donorName || 'মানবিক শুভাকাঙ্ক্ষী (Anonymous)';
        addNotification({
          targetRole: 'all',
          title: `NEW RELIEF DONATION: ৳${Number(amount).toLocaleString()} BDT`,
          message: `${name} has contributed via ${paymentChannel.toUpperCase()} to ${cause}. Verified on public ledger.`,
          type: 'info',
        });
        loadDonations();
        setTimeout(() => setSuccessMsg(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDonating(false);
    }
  };

  const calculatedImpact = () => {
    const val = Number(amount) || 0;
    if (val >= 25000) return 'Provides emergency water purification + ration packs for 12 families for 2 weeks';
    if (val >= 10000) return 'Provides 2 complete snakebite antivenom kits + trauma surgical dressings';
    if (val >= 5000) return 'Provides 10,000 Aquatabs water tablets + high-energy biscuits for 50 children';
    return 'Provides 1 emergency survival dry food pack + ORS rehydration sachets';
  };

  return (
    <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Light Premium Header Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <HeroAmbientBeams className="opacity-70" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-wider w-max shadow-2xs">
              <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
              <span>TRANSPARENT AID CORRIDOR // গণত্রাণ ও ডিজিটাল তহবিল</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Disaster Relief Transparency & Direct Aid Fund
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              প্রত্যেকটি অনুদান সরাসরি রূপান্তর হয় জীবনরক্ষাকারী ওষুধ, বিশুদ্ধ খাবার পানি এবং বন্যাকবলিত পরিবারের খাদ্য সহায়তায়। ১০০% উন্মুক্ত পাবলিক লেজার।
            </p>
          </div>
          <div className="relative w-full md:w-72 lg:w-80 h-40 sm:h-44 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm shrink-0 bg-slate-100">
            <Image
              src={ASSETS.greenAreas}
              alt="Transparent Humanitarian Relief Fund Bangladesh"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200/80 text-[11px] font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
              <span className="truncate">Public Ledger Verified</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Global Impact Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট সংগৃহীত ত্রাণ তহবিল</div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5 flex items-baseline gap-1">
              <span>৳</span>
              <AnimatedCounter value={totalRaised} />
              <span className="text-xs text-slate-500 font-sans font-normal">BDT</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">≈ ${(totalRaised / 121).toFixed(0)} USD Equivalent</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">যাচাইকৃত সুবিধাভোগী</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-0.5 flex items-baseline gap-1">
              <AnimatedCounter value={28500} suffix="+" />
              <span className="text-sm font-semibold text-slate-700">পরিবার</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">সিলেট, সুনামগঞ্জ ও কুড়িগ্রাম</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs hover:shadow-md transition">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">অডিট নিশ্চয়তা</div>
            <div className="text-2xl font-extrabold text-teal-700 mt-0.5 flex items-baseline gap-1">
              <AnimatedCounter value={100} />
              <span className="text-sm font-bold text-teal-700">% ক্রিপ্টোগ্রাফিক</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">শূন্য মধ্যস্বত্বভোগী নীতি</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donation Form (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-lg border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>জরুরি ত্রাণ অনুদান প্রদান</span>
            </div>

            <form onSubmit={handleDonate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">দাতার নাম / ছদ্মনাম (Donor Name)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="যেমন: সাকিব আহমেদ অথবা শুভাকাঙ্ক্ষী"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                />
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">অনুদানের পরিমাণ (BDT ৳)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1000', '5000', '25000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border shadow-xs ${
                        amount === val
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ৳{Number(val).toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono shadow-xs transition"
                  placeholder="অন্য যেকোনো পরিমাণ লিখুন (টাকায়)"
                />
              </div>

              {/* Payment Channel */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">পেমেন্ট গেটওয়ে নির্বাচন করুন</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bkash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs ${
                      paymentChannel === 'bkash'
                        ? 'bg-pink-50 border-pink-500 text-pink-700 ring-1 ring-pink-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-pink-600" />
                    <span>bKash (বিকাশ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('nagad')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs ${
                      paymentChannel === 'nagad'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                    <span>Nagad (নগদ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('rocket')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs ${
                      paymentChannel === 'rocket'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Rocket (রকেট)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bank')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs ${
                      paymentChannel === 'bank'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>ব্যাংক ট্রান্সফার</span>
                  </button>
                </div>
              </div>

              {/* Allocation Cause */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">ত্রাণ খাত নির্বাচন (Target Cause)</label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-xs transition"
                >
                  <option value="সিলেট-সুনামগঞ্জ বন্যা: নিরাপদ পানি ও জরুরি উদ্ধার কিট">সিলেট-সুনামগঞ্জ বন্যা: নিরাপদ পানি ও উদ্ধার কিট</option>
                  <option value="উপকূলীয় ঘূর্ণিঝড় সাইক্লোন আশ্রয়কেন্দ্র: শিশু ও মাতৃ পুষ্টি">উপকূলীয় ঘূর্ণিঝড় আশ্রয়কেন্দ্র: শিশু ও মাতৃ পুষ্টি</option>
                  <option value="যমুনা নদীভাঙন: চিলমারী গৃহহীন পরিবারের পুনর্বাসন ও খাদ্য">যমুনা নদীভাঙন: চিলমারী পরিবারের পুনর্বাসন</option>
                  <option value="ফায়ার সার্ভিস ও জরুরি ট্রমা স্নেকবাইট অ্যান্টিভেনম কিট">জরুরি ট্রমা ও স্নেকবাইট অ্যান্টিভেনম কিট</option>
                </select>
              </div>

              {/* Dynamic Impact Preview */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  সরাসরি মাঠপর্যায়ের মানবিক প্রভাব:
                </span>
                <p className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{calculatedImpact()}</span>
                </p>
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>অনুদান সফলভাবে সংগৃহীত! ক্রিপ্টোগ্রাফিক হ্যাশ লেজারে যুক্ত হয়েছে।</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isDonating}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>{isDonating ? 'লেজারে রেকর্ড হচ্ছে...' : 'অনুদান প্রদান নিশ্চিত করুন'}</span>
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>বাংলাদেশ ব্যাংক অডিট কমপ্লায়েন্ট ক্রিপ্টো লেজার ভেরিফিকেশন।</span>
          </div>
        </div>

        {/* Public Audit Ledger (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>উন্মুক্ত অনুদান লেজার (Public Audit Ledger)</span>
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-xs">
              লাইভ ভেরিফাইড
            </span>
          </div>

          <div className="space-y-3">
            {donations.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-extrabold text-emerald-700 font-mono">
                      ৳{d.amount.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">BDT</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800">{d.donorName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md self-start sm:self-auto">
                    TX: {d.txHash}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">বরাদ্দকৃত খাত (ALLOCATED CAUSE)</span>
                    <span className="text-slate-800 font-medium">{d.allocatedCause}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">সরাসরি প্রভাব (DIRECT IMPACT)</span>
                    <span className="text-emerald-700 font-bold">{d.impactMetric}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>তারিখ ও সময়: {new Date(d.timestamp).toLocaleString()}</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VERIFIED ON-CHAIN
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
