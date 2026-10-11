'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
  Globe2,
  DollarSign,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { AidDonation } from '@/lib/types';

export default function DonatePage() {
  const [donations, setDonations] = useState<AidDonation[]>([]);
  const [totalRaised, setTotalRaised] = useState<number>(225000);
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('150');
  const [cause, setCause] = useState('Emergency Water Filtration & Water Bladders');
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
          donorName: donorName || 'Anonymous Supporter',
          amount: Number(amount),
          allocatedCause: cause,
        }),
      });

      if (res.ok) {
        setSuccessMsg(true);
        setDonorName('');
        setAmount('150');
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
    if (num >= 500) {
      return `${Math.floor(num / 100)} Specialized Trauma Hemostatic Kits`;
    }
    if (num >= 150) {
      return `${Math.floor(num / 25)} High-Capacity Clean Water Purification Kits`;
    }
    return `${Math.floor(num / 10)} Ready-to-Eat Emergency Nutritional Rations`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>TRANSPARENT AID LEDGER // VERIFIED AUDIT PROOF</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Humane Relief Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every dollar directly converts into life-saving supplies with publicly auditable cryptographic distribution records.
          </p>
        </div>

        {/* Global Impact Counter */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total Mobilized Aid</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ${totalRaised.toLocaleString()} <span className="text-xs text-slate-400 font-sans">USD</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donation Form (1 Col) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg border-b border-slate-800 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Fund Emergency Supplies</span>
            </div>

            <form onSubmit={handleDonate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Donor Name (or Public Pseudonym)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anonymous Supporter"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Contribution Amount ($USD)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['50', '150', '500'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        amount === val
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="5"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="Or enter custom amount"
                />
              </div>

              {/* Allocation Cause */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Relief Operation</label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Emergency Water Filtration & Water Bladders">Emergency Water Filtration & Bladders</option>
                  <option value="Tactical Trauma Hemostatic Kits & Oxygen">Trauma Hemostatic Kits & Medical</option>
                  <option value="Nutritional Rations & Infant Survival Meals">Emergency MRE Rations & Infant Nutrition</option>
                  <option value="Solar Generators & Satellite Starlink Comms">Power Inverters & Comms Terminals</option>
                </select>
              </div>

              {/* Dynamic Impact Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                  ESTIMATED HUMANITARIAN IMPACT:
                </span>
                <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{calculatedImpact()}</span>
                </p>
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Contribution committed! Proof written to public ledger.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isDonating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>{isDonating ? 'Recording on Ledger...' : 'Commit Aid Contribution'}</span>
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Non-custodial 100% direct relief guarantee.</span>
          </div>
        </div>

        {/* Public Audit Ledger (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Public Verification Ledger</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Cryptographically Audited</span>
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
                      ${d.amount.toLocaleString()} <span className="text-xs text-slate-400 font-sans">USD</span>
                    </span>
                    <span className="text-xs font-bold text-white">{d.donorName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded self-start sm:self-auto">
                    TX: {d.txHash}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">ALLOCATED PURPOSE</span>
                    <span className="text-slate-200 font-medium">{d.allocatedCause}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">DIRECT TANGIBLE IMPACT</span>
                    <span className="text-emerald-400 font-bold">{d.impactMetric}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-1">
                  <span>Timestamp: {new Date(d.timestamp).toLocaleString()}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
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
