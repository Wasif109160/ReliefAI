'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Zap,
  Users,
  Clock,
  Radio,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';
import { SOSRequest, ResponderTeam, DisasterIncident } from '@/lib/types';

export default function CommandPage() {
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [responders, setResponders] = useState<ResponderTeam[]>([]);
  const [disasters, setDisasters] = useState<DisasterIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [iapPlan, setIapPlan] = useState<string | null>(null);
  const [isGeneratingIAP, setIsGeneratingIAP] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [selectedSOSId, setSelectedSOSId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-01');

  const loadData = async () => {
    try {
      setLoading(true);
      const [resSOS, resResp, resDis] = await Promise.all([
        fetch('/api/sos').then((r) => r.json()),
        fetch('/api/responders').then((r) => r.json()),
        fetch('/api/disasters').then((r) => r.json()),
      ]);
      if (Array.isArray(resSOS)) setSosList(resSOS);
      if (Array.isArray(resResp)) setResponders(resResp);
      if (resDis.disasters) setDisasters(resDis.disasters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateIAP = async () => {
    setIsGeneratingIAP(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Generate comprehensive Incident Action Plan for current operational period in Bangladesh flood and cyclone crisis',
          mode: 'command',
        }),
      });
      const data = await res.json();
      setIapPlan(data.reply);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingIAP(false);
    }
  };

  const handleDispatch = async (sosId: string) => {
    const team = responders.find((r) => r.id === selectedTeamId);
    try {
      await fetch(`/api/sos/${sosId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team?.id || 'team-01',
          teamName: team?.name || 'FSCD Sylhet Swift-Water Dive Team 1 (ফায়ার সার্ভিস)',
        }),
      });
      setSelectedSOSId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastText('');
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>NATIONAL DISASTER INCIDENT COMMAND // দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয়</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Command Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unified incident management, automated dispatch authority, and autonomous Incident Action Plans.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
          <button
            onClick={handleGenerateIAP}
            disabled={isGeneratingIAP}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950"
          >
            <Bot className="w-4 h-4" />
            <span>{isGeneratingIAP ? 'Formulating IAP...' : 'Generate AI Action Plan'}</span>
          </button>
        </div>
      </div>

      {/* AI Incident Action Plan (IAP) Display Modal / Panel */}
      {iapPlan && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-amber-500/40 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <FileText className="w-5 h-5" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                FORMAL INCIDENT ACTION PLAN (IAP) // OPERATIONAL PERIOD 02
              </span>
            </div>
            <button
              onClick={() => setIapPlan(null)}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Dismiss ✕
            </button>
          </div>
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            {iapPlan}
          </div>
        </div>
      )}

      {/* Operational Grid: Triage Queue & Responder Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Triage & Dispatch Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Priority Triage & Extraction Queue</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {sosList.filter((s) => s.status !== 'rescued').length} Active Requests
            </span>
          </div>

          <div className="space-y-3">
            {sosList.map((sos) => {
              const isPending = sos.status === 'pending';
              const isDispatched = sos.status === 'dispatched';
              const isCritical = sos.priority === 'CRITICAL';

              return (
                <div
                  key={sos.id}
                  className={`p-5 rounded-2xl glass-panel border transition space-y-3 ${
                    isCritical ? 'border-red-500/40 shadow-md shadow-red-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {sos.urgencyScore}/100 [{sos.priority}]
                      </span>
                      <h3 className="font-bold text-white text-base">{sos.reporterName}</h3>
                      <span className="text-xs text-slate-400 font-mono">({sos.phone})</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                        isDispatched
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : isPending
                          ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {sos.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    {sos.details}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
                    <div>Trapped: <strong className="text-white">{sos.trappedCount}</strong></div>
                    <div>Injuries: <strong className="text-amber-400">{sos.injuriesCount}</strong></div>
                    <div>Location: <span className="text-slate-300 truncate">{sos.location.address}</span></div>
                    <div>Needs Boat: <strong className={sos.needsBoat ? 'text-sky-400' : 'text-slate-500'}>{sos.needsBoat ? 'YES' : 'NO'}</strong></div>
                  </div>

                  {sos.aiTriageSummary && (
                    <div className="text-[11px] text-cyan-300 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-800/30 font-sans">
                      <strong className="font-mono text-cyan-400">AI Triage Recommendation: </strong>
                      {sos.aiTriageSummary}
                    </div>
                  )}

                  {/* Dispatch Controls */}
                  {isPending && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full sm:w-auto flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        {responders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.type.replace('_', ' ')}) - [{r.status.toUpperCase()}]
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDispatch(sos.id)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-950 shrink-0"
                      >
                        Authorize Immediate Dispatch
                      </button>
                    </div>
                  )}

                  {isDispatched && (
                    <div className="pt-1 flex items-center justify-between text-xs text-cyan-400 font-mono">
                      <span>Assigned Unit: {sos.assignedTeamName}</span>
                      <span>ETA: {sos.dispatchEtaMinutes || 7} mins</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Responder Status & Emergency Broadcast */}
        <div className="space-y-6">
          {/* Active Battalions / Responders */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Field Responder Roster</span>
            </h2>

            <div className="space-y-3">
              {responders.map((team) => (
                <div key={team.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{team.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        team.status === 'dispatched'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : team.status === 'available'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Lead: {team.leadName}</span>
                    <span className="font-mono text-cyan-400">{team.radioFreq}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    Zone: {team.currentLocation.zoneName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Alert Broadcast Terminal */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Radio className="w-4 h-4 text-red-400" />
              <span>Public Emergency Broadcast</span>
            </h2>
            <p className="text-xs text-slate-400">
              Transmit urgent push notifications and cell-broadcast messages across all civilian receivers.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <textarea
                required
                rows={3}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="EVACUATION ORDER: Sector 4 riverbanks flooding. Move north immediately..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              />

              {broadcastSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Broadcast transmitted to 42,500 active civilian devices!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Cell Broadcast</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
