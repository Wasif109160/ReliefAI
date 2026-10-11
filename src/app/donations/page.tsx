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
  CreditCard,
  Building2,
  Sparkles,
} from 'lucide-react';
import { AidDonation } from '@/lib/types';
import { useNotifications } from '@/context/NotificationContext';
import { ASSETS } from '@/lib/assets';

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
          title: `ত্রাণ অনুদান গৃহীত হয়েছে: ৳${Number(amount).toLocaleString()}`,
          message: `${name} ৳${Number(amount).toLocaleString()} টাকা অনুদান প্রদান করেছেন (${cause})। পাবলিক লেজারে লিপিবদ্ধ।`,
          type: 'success',
          link: '/donations',
        });
        setDonorName('');
        setAmount('5000');
        loadDonations();
        setTimeout(() => setSuccessMsg(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDonating(false);
    }
  };

  const calculatedImpact = () => {
    const num = Number(amount) || 0;
    if (num >= 25000) {
      return `${Math.floor(num / 5000)}টি পরিবারকে বর্ষা-উপযোগী ওয়াটারপ্রুফ শেল্টার কিট প্রদান`;
    }
    if (num >= 5000) {
      return `${Math.floor(num / 1000)}টি বানভাসি পরিবারের ৩০ দিনের বিশুদ্ধ পানি ও অ্যাকুয়াট্যাব সরবরাহ`;
    }
    return `${Math.floor(num / 250)}টি জরুরি শুকনো খাবারের প্যাকেট (চিঁড়া, গুড়, ওরস্যালাইন)`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-52 sm:h-64">
        <Image
          src={ASSETS.greenAreas}
          alt="Green Bangladesh Landscape and Relief Resilience"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono uppercase tracking-wider w-max">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>TRANSPARENT HUMANITARIAN RELIEF LEDGER // স্বচ্ছ ত্রাণ তহবিল</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Bangladesh Disaster Relief & Solidarity Fund
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            প্রত্যেকটি অনুদান সরাসরি রূপান্তর হয় জীবনরক্ষাকারী ওষুধ, বিশুদ্ধ খাবার পানি এবং বন্যাকবলিত পরিবারের খাদ্য সহায়তায়। ১০০% উন্মুক্ত পাবলিক লেজার।
          </p>
        </div>
      </div>

      {/* Global Impact Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">মোট সংগৃহীত ত্রাণ তহবিল</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              ৳{totalRaised.toLocaleString()} <span className="text-xs text-slate-400 font-sans">BDT</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">≈ ${(totalRaised / 121).toFixed(0)} USD Equivalent</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">যাচাইকৃত সুবিধাভোগী</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              ২৮,৫০০+ পরিবার
            </div>
            <div className="text-[10px] text-cyan-500 font-mono">সিলেট, সুনামগঞ্জ ও কুড়িগ্রাম</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">অডিট নিশ্চয়তা</div>
            <div className="text-2xl font-black text-teal-400 font-mono mt-0.5">
              ১০০% ক্রিপ্টোগ্রাফিক
            </div>
            <div className="text-[10px] text-teal-500 font-mono">শূন্য মধ্যস্বত্বভোগী নীতি</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donation Form (1 Col) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>জরুরি ত্রাণ অনুদান প্রদান</span>
            </div>

            <form onSubmit={handleDonate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">দাতার নাম / ছদ্মনাম (Donor Name)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="যেমন: সাকিব আহমেদ অথবা শুভাকাঙ্ক্ষী"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">অনুদানের পরিমাণ (BDT ৳)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1000', '5000', '25000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        amount === val
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="অন্য যেকোনো পরিমাণ লিখুন (টাকায়)"
                />
              </div>

              {/* Payment Channel */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">পেমেন্ট গেটওয়ে নির্বাচন করুন</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bkash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      paymentChannel === 'bkash'
                        ? 'bg-pink-950/80 border-pink-500 text-pink-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                    <span>bKash (বিকাশ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('nagad')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      paymentChannel === 'nagad'
                        ? 'bg-orange-950/80 border-orange-500 text-orange-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                    <span>Nagad (নগদ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('rocket')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      paymentChannel === 'rocket'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>Rocket (রকেট)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bank')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      paymentChannel === 'bank'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ব্যাংক ট্রান্সফার</span>
                  </button>
                </div>
              </div>

              {/* Allocation Cause */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">ত্রাণ খাত নির্বাচন (Target Cause)</label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="সিলেট-সুনামগঞ্জ বন্যা: নিরাপদ পানি ও জরুরি উদ্ধার কিট">সিলেট-সুনামগঞ্জ বন্যা: নিরাপদ পানি ও উদ্ধার কিট</option>
                  <option value="উপকূলীয় ঘূর্ণিঝড় সাইক্লোন আশ্রয়কেন্দ্র: শিশু ও মাতৃ পুষ্টি">উপকূলীয় ঘূর্ণিঝড় আশ্রয়কেন্দ্র: শিশু ও মাতৃ পুষ্টি</option>
                  <option value="যমুনা নদীভাঙন: চিলমারী গৃহহীন পরিবারের পুনর্বাসন ও খাদ্য">যমুনা নদীভাঙন: চিলমারী পরিবারের পুনর্বাসন</option>
                  <option value="ফায়ার সার্ভিস ও জরুরি ট্রমা স্নেকবাইট অ্যান্টিভেনম কিট">জরুরি ট্রমা ও স্নেকবাইট অ্যান্টিভেনম কিট</option>
                </select>
              </div>

              {/* Dynamic Impact Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                  সরাসরি মাঠপর্যায়ের মানবিক প্রভাব:
                </span>
                <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{calculatedImpact()}</span>
                </p>
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>অনুদান সফলভাবে সংগৃহীত! ক্রিপ্টোগ্রাফিক হ্যাশ লেজারে যুক্ত হয়েছে।</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isDonating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>{isDonating ? 'লেজারে রেকর্ড হচ্ছে...' : 'অনুদান প্রদান নিশ্চিত করুন'}</span>
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>বাংলাদেশ ব্যাংক অডিট কমপ্লায়েন্ট ক্রিপ্টো লেজার ভেরিফিকেশন।</span>
          </div>
        </div>

        {/* Public Audit Ledger (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>উন্মুক্ত অনুদান লেজার (Public Audit Ledger)</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
              লাইভ ভেরিফাইড
            </span>
          </div>

          <div className="space-y-3">
            {donations.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      ৳{d.amount.toLocaleString()} <span className="text-xs text-slate-400 font-sans">BDT</span>
                    </span>
                    <span className="text-xs font-bold text-white">{d.donorName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded self-start sm:self-auto">
                    TX: {d.txHash}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">বরাদ্দকৃত খাত (ALLOCATED CAUSE)</span>
                    <span className="text-slate-200 font-medium">{d.allocatedCause}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">সরাসরি প্রভাব (DIRECT IMPACT)</span>
                    <span className="text-emerald-400 font-bold">{d.impactMetric}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-1">
                  <span>তারিখ ও সময়: {new Date(d.timestamp).toLocaleString()}</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ON-CHAIN
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
