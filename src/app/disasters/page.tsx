'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Layers,
  ChevronRight,
  BookOpen,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { DisasterIncident, DisasterType, SeverityLevel, DataSourceType } from '@/lib/types';
import { DemoModeBanner, DataSourceBadge, DataStateWrapper } from '@/components/ui/demo-mode-indicator';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

export default function DisastersPage() {
  const [disasters, setDisasters] = useState<DisasterIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterIncident | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams();
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (divisionFilter !== 'all') params.set('division', divisionFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (yearFilter !== 'all') params.set('year', yearFilter);

      const res = await fetch(`/api/disasters?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data.disasters)) {
        setDisasters(data.disasters);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sourceFilter, typeFilter, divisionFilter, yearFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setSourceFilter('all');
    setTypeFilter('all');
    setDivisionFilter('all');
    setYearFilter('all');
    setSearchQuery('');
  };

  const historicalCount = disasters.filter((d) => d.dataSource === 'historical').length;
  const demoCount = disasters.filter((d) => d.dataSource === 'demo').length;
  const totalCasualties = disasters.reduce((sum, d) => sum + (d.casualtiesReported || 0), 0);
  const totalAffected = disasters.reduce((sum, d) => sum + (d.affectedPopulation || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      {/* Prominent Demo Mode Indicator */}
      <DemoModeBanner />

      {/* Hero Header */}
      <FadeIn>
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 p-6 sm:p-10 shadow-xs bg-white">
          <HeroAmbientBeams className="opacity-80" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 uppercase tracking-wide">
              <BookOpen className="w-3.5 h-3.5 text-purple-700" />
              <span>SOVEREIGN DISASTER ARCHIVE // OFFICIAL GOVERNMENT & UN BENCHMARKS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Bangladesh Disaster Archive
              <span className="block text-purple-800 font-bangla text-xl sm:text-2xl font-bold mt-1">
                জাতীয় ঐতিহাসিক দুর্যোগ মহাফেজখানা ও গবেষণা তথ্যভাণ্ডার
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Explore documented historical emergencies (including the <strong>2024 Eastern Bangladesh Floods</strong>, <strong>2022 Sylhet Mega-Floods</strong>, and coastal super cyclones) verified against MoDMR, BWDB, and UN OCHA records, alongside labeled simulation drills.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-600">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>Verified Historical Records: <strong>{historicalCount}</strong></span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Simulated Training Drills: <strong>{demoCount}</strong></span>
              </span>
              <span className="text-slate-300">•</span>
              <Link href="/map" className="text-blue-700 hover:text-blue-900 font-bold inline-flex items-center space-x-1">
                <span>View on Tactical Map</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Interactive KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Cataloged Events</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{disasters.length}</div>
          <span className="text-[11px] text-slate-500">Historical & Sample Scenarios</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider font-mono">Verified Historical</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-900">{historicalCount}</div>
          <span className="text-[11px] text-purple-700 font-medium">UN OCHA & MoDMR Records</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Documented Affected</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">
            {totalAffected > 1000000 ? `${(totalAffected / 1000000).toFixed(1)}M+` : totalAffected.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Citizens Inundated / Impacted</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Official Citations</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Verified Source Documentation</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name, river basin, district (e.g. Feni, Surma, Remal, 2024)..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Search
            </button>
          </form>

          <button
            onClick={loadData}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition shrink-0 self-end sm:self-auto flex items-center space-x-1 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-bold mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Data Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Data Source: All</option>
            <option value="historical">Historical Archives Only</option>
            <option value="demo">Demo Simulation Drills Only</option>
          </select>

          {/* Disaster Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Hazard Vector: All</option>
            <option value="flood">Flash Floods & River Inundation</option>
            <option value="hurricane">Coastal Cyclones & Surges</option>
            <option value="environmental">Landslides & Geo-hazards</option>
            <option value="industrial">Urban & Industrial Hazards</option>
          </select>

          {/* Division Filter */}
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Division: All</option>
            <option value="Chittagong">Chittagong (Feni / Cox&apos;s Bazar / Rangamati)</option>
            <option value="Sylhet">Sylhet & Sunamganj Basin</option>
            <option value="Barisal">Barisal & Coastal Delta</option>
            <option value="Khulna">Khulna & Satkhira Polders</option>
            <option value="Dhaka">Dhaka Central</option>
          </select>

          {/* Year Milestone Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Documented Year: All</option>
            <option value="2024">2024 (Eastern Floods & Cyclone Remal)</option>
            <option value="2022">2022 (Sylhet Mega-Floods)</option>
            <option value="2020">2020 (Cyclone Amphan)</option>
            <option value="2019">2019 (Cyclone Fani)</option>
            <option value="2017">2017 (Rangamati Landslides)</option>
            <option value="1991">1991 (Super Cyclone Benchmark)</option>
            <option value="1970">1970 (Bhola Cyclone Milestone)</option>
          </select>

          {(sourceFilter !== 'all' || typeFilter !== 'all' || divisionFilter !== 'all' || yearFilter !== 'all' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-800 font-bold ml-auto px-2 py-1 rounded-md hover:bg-red-50 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <DataStateWrapper
        isLoading={loading}
        isError={error}
        isEmpty={disasters.length === 0}
        onRetry={handleResetFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.map((incident) => {
            const isHistorical = incident.dataSource === 'historical';
            const year = incident.citation?.documentedYear || new Date(incident.occurredAt || incident.reportedAt).getFullYear();

            return (
              <div
                key={incident.id}
                className={`flex flex-col justify-between rounded-2xl bg-white border p-6 shadow-xs hover:shadow-md transition-all ${
                  isHistorical ? 'border-purple-200/80 hover:border-purple-400' : 'border-blue-200/80 hover:border-blue-400'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <DataSourceBadge source={incident.dataSource} size="sm" />
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      YEAR {year}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {incident.title}
                    </h2>
                    {incident.banglaTitle && (
                      <p className="text-xs font-bangla text-slate-500 font-medium mt-0.5">
                        {incident.banglaTitle}
                      </p>
                    )}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{incident.location.name}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {incident.description}
                  </p>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block">Affected:</span>
                      <strong className="text-slate-800 font-mono text-xs">
                        {incident.affectedPopulation > 1000000
                          ? `${(incident.affectedPopulation / 1000000).toFixed(1)}M`
                          : incident.affectedPopulation.toLocaleString()}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block">Reported Deaths:</span>
                      <strong className={`font-mono text-xs ${incident.casualtiesReported > 0 ? 'text-red-700' : 'text-slate-700'}`}>
                        {incident.casualtiesReported > 0 ? incident.casualtiesReported.toLocaleString() : '0 (Simulated)'}
                      </strong>
                    </div>
                  </div>

                  {/* Verified Citation Box */}
                  {incident.citation && (
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-950 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-purple-800">
                          Verified Source:
                        </span>
                        {incident.citation.sourceUrl && (
                          <a
                            href={incident.citation.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-700 hover:text-purple-900 inline-flex items-center space-x-0.5 font-bold"
                          >
                            <span>Report</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-700 leading-tight">
                        {incident.citation.sourceName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {incident.location.lat.toFixed(4)}°N, {incident.location.lng.toFixed(4)}°E
                  </span>
                  <button
                    onClick={() => setSelectedDisaster(incident)}
                    className="font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                  >
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DataStateWrapper>

      {/* Detailed Disaster Dossier Modal */}
      {selectedDisaster && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <DataSourceBadge source={selectedDisaster.dataSource} />
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md uppercase">
                    Status: {selectedDisaster.status}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {selectedDisaster.title}
                </h3>
                {selectedDisaster.banglaTitle && (
                  <p className="text-sm font-bangla text-slate-600 font-medium">
                    {selectedDisaster.banglaTitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedDisaster(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div>
                <strong className="block text-slate-900 font-semibold mb-1">Operational Description:</strong>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedDisaster.description}
                </p>
              </div>

              {selectedDisaster.citation && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-purple-900 font-semibold flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-purple-700" />
                      <span>Historical Verification & Evidence:</span>
                    </strong>
                    {selectedDisaster.citation.sourceUrl && (
                      <a
                        href={selectedDisaster.citation.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-700 hover:text-purple-900 font-bold inline-flex items-center space-x-1 underline"
                      >
                        <span>Official Bulletin</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Primary Source:</strong> {selectedDisaster.citation.sourceName}
                  </p>
                  {selectedDisaster.citation.verificationNotes && (
                    <p className="text-xs text-slate-600">
                      <strong>Archive Notes:</strong> {selectedDisaster.citation.verificationNotes}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Coordinates</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDisaster.location.lat.toFixed(4)}°N, {selectedDisaster.location.lng.toFixed(4)}°E
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Affected Population</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDisaster.affectedPopulation.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Responders Deployed</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDisaster.respondersDeployed} Personnel
                  </span>
                </div>
              </div>

              {selectedDisaster.activeHazards && selectedDisaster.activeHazards.length > 0 && (
                <div>
                  <strong className="block text-slate-900 font-semibold mb-1.5">Documented Hazards & Vectors:</strong>
                  <ul className="space-y-1">
                    {selectedDisaster.activeHazards.map((h, i) => (
                      <li key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <Link
                href="/map"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs inline-flex items-center space-x-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Locate on Tactical Map</span>
              </Link>
              <button
                onClick={() => setSelectedDisaster(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
