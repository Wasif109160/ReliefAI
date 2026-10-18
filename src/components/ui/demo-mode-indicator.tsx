'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Database,
  ShieldAlert,
} from 'lucide-react';
import { DataSourceType } from '@/lib/types';

export interface DemoModeBannerProps {
  className?: string;
  compact?: boolean;
  mode?: 'live' | 'demo' | string;
}

export function DemoModeBanner({ className = '', compact = false, mode = 'demo' }: DemoModeBannerProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isLive = mode === 'live';

  if (compact) {
    if (isLive) {
      return (
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-900 text-xs font-semibold shadow-xs ${className}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="font-mono font-bold tracking-wider uppercase text-[11px]">LIVE STREAM</span>
          <span className="text-emerald-700 font-normal">| Live Telemetry Online</span>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-semibold shadow-xs ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <span className="font-mono font-bold tracking-wider uppercase text-[11px]">DEMO MODE</span>
        <span className="text-amber-700 font-normal">| Verified Archives & Drills</span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Demo mode and data provenance notification"
      className={`rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-blue-50 border border-amber-300/80 p-4 text-slate-800 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
            <FlaskConical className="w-4 h-4 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                DEMO MODE ACTIVE
              </span>
              <span className="text-xs text-slate-500 font-medium hidden md:inline">
                Data Architecture Stage 1: Verified Historical Archives & Labeled Drills
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              Active incidents and distress feeds are simulated for multi-agency training drills. Historical records reflect verified government & UN OCHA benchmarks.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <Link
            href="/disasters"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/80 border border-blue-200 shadow-xs transition"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Historical Archive</span>
          </Link>
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            aria-expanded={detailsOpen}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/80 border border-slate-200 shadow-xs transition"
          >
            <span>Provenance</span>
            {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {detailsOpen && (
        <div className="mt-4 pt-3 border-t border-amber-200/80 text-xs text-slate-600 space-y-2 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
              <strong className="block text-slate-800 font-semibold mb-0.5">Historical Records:</strong>
              <span>Verified data from UN OCHA, MoDMR, and BWDB (2024 Eastern Floods, 2022 Sylhet Mega-Floods, Cyclones Remal & Amphan).</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
              <strong className="block text-slate-800 font-semibold mb-0.5">Simulated Drills:</strong>
              <span>Clearly labeled with <span className="font-mono text-blue-600 font-bold">[DEMO SIMULATION]</span> for testing search-and-rescue dispatch and logistics.</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
              <strong className="block text-slate-800 font-semibold mb-0.5">Live API Readiness:</strong>
              <span>Service architecture structured for seamless integration with official BWDB / BMD live telemetry in Phase 3.</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-amber-900 font-medium pt-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>For real-world emergencies, stranded citizens must dial National Emergency Services at <strong>999</strong>, Fire Service at <strong>102</strong>, or Disaster Warning at <strong>1090</strong>.</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export interface DataSourceBadgeProps {
  source?: DataSourceType | string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function DataSourceBadge({
  source = 'demo',
  size = 'md',
  className = '',
  showIcon = true,
  label,
}: DataSourceBadgeProps) {
  const normalized = (source || 'demo').toLowerCase();

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (normalized) {
    case 'historical':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 rounded-lg font-bold font-mono tracking-wider uppercase bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs ${sizeClasses} ${className}`}
          title="Verified Government / UN OCHA Historical Disaster Record"
        >
          {showIcon && <Clock className="w-3 h-3 text-purple-600 shrink-0" aria-hidden="true" />}
          <span>{label || 'HISTORICAL ARCHIVE'}</span>
        </span>
      );
    case 'live':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 rounded-lg font-bold font-mono tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs ${sizeClasses} ${className}`}
          title="Official Real-Time Agency Telemetry Stream"
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
          )}
          <span>{label || 'LIVE TELEMETRY'}</span>
        </span>
      );
    case 'forecast':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 rounded-lg font-bold font-mono tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${sizeClasses} ${className}`}
          title="Meteorological / Hydrological Forecast Model"
        >
          {showIcon && <Radio className="w-3 h-3 text-amber-600 shrink-0 animate-pulse" aria-hidden="true" />}
          <span>{label || 'OFFICIAL FORECAST'}</span>
        </span>
      );
    case 'demo':
    default:
      return (
        <span
          className={`inline-flex items-center space-x-1.5 rounded-lg font-bold font-mono tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs ${sizeClasses} ${className}`}
          title="Simulated Operational Drill Record (For Training & Testing)"
        >
          {showIcon && <FlaskConical className="w-3 h-3 text-blue-600 shrink-0" aria-hidden="true" />}
          <span>{label || 'DEMO SIMULATION'}</span>
        </span>
      );
  }
}

export interface DataStateWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  isUnavailable?: boolean;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  errorMessage?: string;
  unavailableTitle?: string;
  unavailableMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function DataStateWrapper({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  isUnavailable = false,
  loadingMessage = 'Loading crisis telemetry data...',
  emptyTitle = 'No Records Found',
  emptyMessage = 'No incidents match your selected filters. Adjust your criteria or clear the search query.',
  emptyDescription,
  errorMessage = 'Failed to load telemetry data. Please verify network connectivity and retry.',
  unavailableTitle = 'Live Data Stream Unavailable in Demo Mode',
  unavailableMessage = 'Official live telemetry from BWDB and BMD will be connected during Phase 3. You can explore verified historical archives and simulated table-top drills.',
  onRetry,
  children,
}: DataStateWrapperProps) {
  const hasError = isError || Boolean(error);
  const activeErrorMessage = (typeof error === 'string' && error) ? error : errorMessage;
  const activeEmptyMessage = emptyDescription || emptyMessage;

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-4 rounded-2xl bg-white/70 border border-slate-200 p-8 shadow-xs">
        <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-700 animate-pulse">{loadingMessage}</p>
        <span className="text-xs text-slate-400 font-mono">SOVEREIGN BANGLADESH DISASTER GRID</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center space-y-3 rounded-2xl bg-red-50/70 border border-red-200 p-8 text-center shadow-xs">
        <AlertCircle className="w-10 h-10 text-red-600" />
        <h4 className="text-base font-extrabold text-slate-900">Telemetry Stream Error</h4>
        <p className="text-xs text-slate-600 max-w-md">{activeErrorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center space-y-3 rounded-2xl bg-amber-50/70 border border-amber-200 p-8 text-center shadow-xs">
        <Radio className="w-10 h-10 text-amber-600 animate-pulse" />
        <h3 className="text-base font-bold text-amber-950">{unavailableTitle}</h3>
        <p className="text-xs text-amber-800 max-w-md">{unavailableMessage}</p>
        <Link
          href="/disasters"
          className="mt-2 px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs inline-flex items-center space-x-1.5"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Browse Historical Disaster Archive</span>
        </Link>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white/70 border border-dashed border-slate-300 p-8 text-center shadow-xs">
        <div className="p-3 rounded-2xl bg-slate-100 text-slate-500">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">{emptyTitle}</h3>
        <p className="text-xs text-slate-500 max-w-md">{activeEmptyMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
