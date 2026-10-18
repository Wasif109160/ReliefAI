import { DisasterIncident, DataSourceType, DisasterType, SeverityLevel, IncidentStatus } from '../types';
import { ALL_COMBINED_DISASTERS, VERIFIED_HISTORICAL_DISASTERS } from '../data/historical-disasters';
import { db } from '../db';

export interface DisasterFilter {
  type?: DisasterType | 'all';
  severity?: SeverityLevel | 'all';
  status?: IncidentStatus | 'all';
  dataSource?: DataSourceType | 'all';
  division?: string | 'all';
  search?: string;
  year?: number | 'all';
}

export interface DisasterStatsSummary {
  totalIncidents: number;
  activeDrills: number;
  historicalArchives: number;
  totalAffectedPeople: number;
  totalRespondersEngaged: number;
  mode: 'demo' | 'live';
  providerName: string;
  isLiveApiConnected: boolean;
  liveApiStatusMessage: string;
  lastUpdated: string;
}

export interface IDisasterDataProvider {
  readonly name: string;
  readonly mode: 'demo' | 'live';
  readonly isLiveConnected: boolean;
  getDisasters(filter?: DisasterFilter): Promise<DisasterIncident[]>;
  getDisasterById(id: string): Promise<DisasterIncident | null>;
  getHistoricalDisasters(year?: number): Promise<DisasterIncident[]>;
  getStats(): Promise<DisasterStatsSummary>;
}

/**
 * Demo Mode Provider: Serves verified historical benchmarks + labeled operational simulation drills.
 */
export class DemoDisasterProvider implements IDisasterDataProvider {
  readonly name = 'Demo & Historical Archive Provider (ReliefAI Sovereign Knowledge Graph)';
  readonly mode = 'demo' as const;
  readonly isLiveConnected = false;

  async getDisasters(filter?: DisasterFilter): Promise<DisasterIncident[]> {
    // Attempt to pull any user-created or persisted disasters from db first
    let allRecords: DisasterIncident[] = [];
    try {
      const dbRecords = await db.getDisasters();
      if (Array.isArray(dbRecords) && dbRecords.length > 0) {
        // Merge db records ensuring every record has a dataSource
        const dbNormalized = dbRecords.map((d) => ({
          ...d,
          dataSource: d.dataSource || 'demo',
          isDemo: d.isDemo ?? (d.dataSource !== 'historical'),
        }));

        // Combine with historical catalog without duplicating IDs
        const existingIds = new Set(dbNormalized.map((r) => r.id));
        const additional = ALL_COMBINED_DISASTERS.filter((d) => !existingIds.has(d.id));
        allRecords = [...dbNormalized, ...additional];
      } else {
        allRecords = [...ALL_COMBINED_DISASTERS];
      }
    } catch {
      allRecords = [...ALL_COMBINED_DISASTERS];
    }

    if (!filter) return allRecords;

    return allRecords.filter((item) => {
      // Data source filter
      if (filter.dataSource && filter.dataSource !== 'all') {
        if (item.dataSource !== filter.dataSource) return false;
      }

      // Type filter
      if (filter.type && filter.type !== 'all') {
        if (item.type !== filter.type) return false;
      }

      // Severity filter
      if (filter.severity && filter.severity !== 'all') {
        if (item.severity !== filter.severity) return false;
      }

      // Status filter
      if (filter.status && filter.status !== 'all') {
        if (item.status !== filter.status) return false;
      }

      // Division filter
      if (filter.division && filter.division !== 'all') {
        const itemDiv = item.location.division?.toLowerCase() || '';
        if (!itemDiv.includes(filter.division.toLowerCase())) return false;
      }

      // Year filter
      if (filter.year && filter.year !== 'all') {
        const docYear = item.citation?.documentedYear || new Date(item.occurredAt || item.reportedAt).getFullYear();
        if (docYear !== Number(filter.year)) return false;
      }

      // Search keyword
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q) || (item.banglaTitle && item.banglaTitle.includes(q));
        const matchesLoc = item.location.name.toLowerCase().includes(q) || (item.location.district && item.location.district.toLowerCase().includes(q));
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSource = item.citation?.sourceName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesDesc && !matchesSource) return false;
      }

      return true;
    });
  }

  async getDisasterById(id: string): Promise<DisasterIncident | null> {
    const list = await this.getDisasters();
    return list.find((d) => d.id === id) || null;
  }

  async getHistoricalDisasters(year?: number): Promise<DisasterIncident[]> {
    return this.getDisasters({ dataSource: 'historical', year });
  }

  async getStats(): Promise<DisasterStatsSummary> {
    const all = await this.getDisasters();
    const activeDrills = all.filter((d) => d.status === 'active' && d.dataSource === 'demo').length;
    const historical = all.filter((d) => d.dataSource === 'historical').length;
    const totalAffected = all.reduce((sum, d) => sum + (d.affectedPopulation || 0), 0);
    const totalResp = all.reduce((sum, d) => sum + (d.respondersDeployed || 0), 0);

    return {
      totalIncidents: all.length,
      activeDrills,
      historicalArchives: historical,
      totalAffectedPeople: totalAffected,
      totalRespondersEngaged: totalResp,
      mode: 'demo',
      providerName: this.name,
      isLiveApiConnected: false,
      liveApiStatusMessage: 'Demo Mode Active: Serving verified Bangladesh historical archives and labeled simulation drills. Official live telemetry (BWDB / BMD) integration planned for live stage.',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Live Mode Provider Architecture:
 * Pre-engineered contract for official Bangladesh Government & Humanitarian APIs
 * (BWDB, BMD, FFWC, UN OCHA, GDACS).
 */
export class LiveDisasterProvider implements IDisasterDataProvider {
  readonly name = 'Official Government & Humanitarian Telemetry Provider (BWDB / BMD / GDACS)';
  readonly mode = 'live' as const;
  readonly isLiveConnected = false; // Set to true once official API credentials/tokens are provisioned

  async getDisasters(filter?: DisasterFilter): Promise<DisasterIncident[]> {
    // Official live integration endpoint check
    const bwdbApiConfigured = Boolean(process.env.BWDB_API_ENDPOINT && process.env.BWDB_API_KEY);
    const bmdApiConfigured = Boolean(process.env.BMD_API_ENDPOINT && process.env.BMD_API_KEY);

    if (!bwdbApiConfigured && !bmdApiConfigured) {
      console.warn('[DisasterService: LiveProvider] Official telemetry APIs not yet provisioned. Falling back to DemoDisasterProvider.');
      const fallback = new DemoDisasterProvider();
      return fallback.getDisasters(filter);
    }

    // When configured in Phase 3, this will execute real HTTP ingestion from BWDB / BMD:
    // const res = await fetch(`${process.env.BWDB_API_ENDPOINT}/live-hazards`, { headers: { 'Authorization': `Bearer ${process.env.BWDB_API_KEY}` } });
    return [];
  }

  async getDisasterById(id: string): Promise<DisasterIncident | null> {
    const all = await this.getDisasters();
    return all.find((d) => d.id === id) || null;
  }

  async getHistoricalDisasters(year?: number): Promise<DisasterIncident[]> {
    // Historical archives fallback
    return VERIFIED_HISTORICAL_DISASTERS.filter((d) => (year ? d.citation?.documentedYear === year : true));
  }

  async getStats(): Promise<DisasterStatsSummary> {
    return {
      totalIncidents: 0,
      activeDrills: 0,
      historicalArchives: VERIFIED_HISTORICAL_DISASTERS.length,
      totalAffectedPeople: 0,
      totalRespondersEngaged: 0,
      mode: 'live',
      providerName: this.name,
      isLiveApiConnected: false,
      liveApiStatusMessage: 'Live Telemetry Gateway: Awaiting official BWDB / BMD gateway endpoint configuration.',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Unified Disaster Service:
 * Resolves active provider based on runtime environment configuration.
 */
class UnifiedDisasterService {
  private activeProvider: IDisasterDataProvider;

  constructor() {
    // Default to DemoDisasterProvider; can switch to LiveDisasterProvider when NEXT_PUBLIC_DATA_MODE === 'live'
    const isLive = process.env.NEXT_PUBLIC_DATA_MODE === 'live';
    this.activeProvider = isLive ? new LiveDisasterProvider() : new DemoDisasterProvider();
  }

  public getProvider(): IDisasterDataProvider {
    return this.activeProvider;
  }

  public isDemoMode(): boolean {
    return this.activeProvider.mode === 'demo' || !this.activeProvider.isLiveConnected;
  }

  public async getDisasters(filter?: DisasterFilter): Promise<DisasterIncident[]> {
    return this.activeProvider.getDisasters(filter);
  }

  public async getDisasterById(id: string): Promise<DisasterIncident | null> {
    return this.activeProvider.getDisasterById(id);
  }

  public async getHistoricalDisasters(year?: number): Promise<DisasterIncident[]> {
    return this.activeProvider.getHistoricalDisasters(year);
  }

  public async getStats(): Promise<DisasterStatsSummary> {
    return this.activeProvider.getStats();
  }
}

export const disasterService = new UnifiedDisasterService();
