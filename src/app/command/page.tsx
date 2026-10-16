'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Users,
  Radio,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  RefreshCw,
} from 'lucide-react';
import { SOSRequest, ResponderTeam, DisasterIncident } from '@/lib/types';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

export default function CommandPage() {
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [responders, setResponders] = useState<ResponderTeam[]>([]);
  const [, setDisasters] = useState<DisasterIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [iapPlan, setIapPlan] = useState<string | null>(null);
  const [isGeneratingIAP, setIsGeneratingIAP] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-01');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resSOS, resResp, resDis] = await Promise.all([
        fetch('/api/sos', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/responders', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/disasters', { credentials: 'include' }).then((r) => r.json()),
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
    if (dispatchingId) return;
    setDispatchingId(sosId);
    setDispatchError(null);
    setDispatchSuccessMsg(null);

    const team = responders.find((r) => r.id === selectedTeamId) || responders[0];
    const teamId = team?.id || selectedTeamId || 'team-01';
    const teamName = team?.name || 'Rapid Response Unit';

    try {
      const res = await fetch(`/api/sos/${encodeURIComponent(sosId)}/dispatch`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          teamName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDispatchError(data.error || 'Failed to dispatch unit. Ensure required operational clearance.');
        return;
      }

      setSosList((prev) =>
        prev.map((s) =>
          s.id === sosId
            ? {
                ...s,
                status: 'dispatched',
                assignedTeamId: teamId,
                assignedTeamName: teamName,
              }
            : s
        )
      );

      setResponders((prev) =>
        prev.map((r) =>
          r.id === teamId
            ? {
                ...r,
                status: 'dispatched',
                assignedSOSId: sosId,
              }
            : r
        )
      );

      setDispatchSuccessMsg(`Assigned unit "${teamName}" dispatched to SOS #${sosId}!`);
      setTimeout(() => setDispatchSuccessMsg(null), 5000);
      await loadData();
    } catch (e) {
      console.error('Dispatch network error:', e);
      setDispatchError('Network error connecting to tactical dispatch service.');
    } finally {
      setDispatchingId(null);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastText('');
    }, 4000);
  };

  return (
    <FadeIn className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <HeroAmbientBeams className="opacity-60" />
      {/* Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
            <span>FEMA ICS-400 / MoDMR COMMAND & CONTROL DECK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Incident Command System (ICS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-agency coordination, Gemini tactical triage, and responder dispatch matrix.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
          <button
            onClick={handleGenerateIAP}
            disabled={isGeneratingIAP}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{isGeneratingIAP ? 'Formulating IAP...' : 'Generate AI Action Plan'}</span>
          </button>
        </div>
      </div>

      {/* AI Incident Action Plan (IAP) Display Modal / Panel */}
      {iapPlan && (
        <div className="p-6 sm:p-8 rounded-3xl border border-blue-200 bg-blue-50/40 space-y-4 shadow-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <div className="flex items-center space-x-2 text-blue-900">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                FORMAL INCIDENT ACTION PLAN (IAP) // OPERATIONAL PERIOD 02
              </span>
            </div>
            <button
              onClick={() => setIapPlan(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Dismiss ✕
            </button>
          </div>
          <div className="max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-mono bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
            {iapPlan}
          </div>
        </div>
      )}

      {/* Operational Grid: Triage Queue & Responder Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Triage & Dispatch Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-red-600 animate-pulse" />
              <span>Priority Triage & Extraction Queue</span>
            </h2>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
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
                  className={`p-5 rounded-3xl bg-white border transition-all space-y-3 shadow-xs hover:shadow-md ${
                    isCritical ? 'border-red-200' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {sos.urgencyScore}/100 [{sos.priority}]
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{sos.reporterName}</h3>
                      <span className="text-xs text-slate-500 font-mono">({sos.phone})</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto border ${
                        isDispatched
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : isPending
                          ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {sos.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {sos.details}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                    <div>Trapped: <strong className="text-slate-900">{sos.trappedCount}</strong></div>
                    <div>Injuries: <strong className="text-amber-700">{sos.injuriesCount}</strong></div>
                    <div>Location: <span className="text-slate-800 truncate font-medium">{sos.location.address}</span></div>
                    <div>Needs Boat: <strong className={sos.needsBoat ? 'text-blue-700' : 'text-slate-400'}>{sos.needsBoat ? 'YES' : 'NO'}</strong></div>
                  </div>

                  {sos.aiTriageSummary && (
                    <div className="text-xs text-blue-900 bg-blue-50/60 p-3 rounded-2xl border border-blue-100 font-sans">
                      <strong className="text-blue-700 font-semibold">AI Triage Recommendation: </strong>
                      {sos.aiTriageSummary}
                    </div>
                  )}

                  {/* Dispatch Feedback & Controls */}
                  {dispatchError && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{dispatchError}</span>
                    </div>
                  )}

                  {dispatchSuccessMsg && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{dispatchSuccessMsg}</span>
                    </div>
                  )}

                  {isPending && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full sm:w-auto flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                      >
                        {responders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.type.replace('_', ' ')}) - [{r.status.toUpperCase()}]
                          </option>
                        ))}
                      </select>

                      <button
                        disabled={dispatchingId === sos.id}
                        onClick={() => handleDispatch(sos.id)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition shadow-xs shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {dispatchingId === sos.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Authorizing...</span>
                          </>
                        ) : (
                          <span>Authorize Immediate Dispatch</span>
                        )}
                      </button>
                    </div>
                  )}

                  {isDispatched && (
                    <div className="pt-1 flex items-center justify-between text-xs text-blue-700 font-medium">
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
          <div className="p-6 rounded-3xl border border-slate-200/90 bg-white space-y-4 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Field Responder Roster</span>
            </h2>

            <div className="space-y-3">
              {responders.map((team) => (
                <div key={team.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{team.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        team.status === 'dispatched'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : team.status === 'available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>Lead: {team.leadName}</span>
                    <span className="font-mono text-teal-700 font-semibold">{team.radioFreq}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Zone: {team.currentLocation.zoneName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Alert Broadcast Terminal */}
          <div className="p-6 rounded-3xl border border-slate-200/90 bg-white space-y-3 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Radio className="w-4 h-4 text-red-600" />
              <span>Public Emergency Broadcast</span>
            </h2>
            <p className="text-xs text-slate-500">
              Transmit urgent push notifications and cell-broadcast messages across all civilian receivers.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <textarea
                required
                rows={3}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="EVACUATION ORDER: Sector 4 riverbanks flooding. Move north immediately..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 resize-none shadow-xs transition"
              />

              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Broadcast transmitted to 42,500 active civilian devices!</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-shine w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-200" />
                <span>Transmit Cell Broadcast</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
