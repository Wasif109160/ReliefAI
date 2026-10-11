import {
  DisasterIncident,
  SOSRequest,
  Shelter,
  SupplyItem,
  ResponderTeam,
  AidDonation,
} from './types';

// Seed initial data
export const initialDisasters: DisasterIncident[] = [
  {
    id: 'dis-001',
    title: 'Cascadia Sector 4 Flash Floods',
    type: 'flood',
    severity: 'critical',
    status: 'active',
    location: {
      name: 'Cascadia Valley & River Basin',
      lat: 45.5152,
      lng: -122.6784,
      radiusKm: 18.5,
    },
    affectedPopulation: 42500,
    casualtiesReported: 7,
    respondersDeployed: 64,
    reportedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    description: 'Severe torrential rainfall caused riverbanks to burst. 400+ homes submerged, power grid offline across 3 wards.',
    recommendedEvacuationRadiusKm: 15,
    activeHazards: ['Submerged Power Lines', 'Rapid Water Flow > 4 knots', 'Mudslide Risk on North Ridge'],
  },
  {
    id: 'dis-002',
    title: 'Metro Faultline 6.4 M Earthquake',
    type: 'earthquake',
    severity: 'critical',
    status: 'active',
    location: {
      name: 'South Metro Industrial & Residential Corridor',
      lat: 45.4800,
      lng: -122.6200,
      radiusKm: 28.0,
    },
    affectedPopulation: 89000,
    casualtiesReported: 34,
    respondersDeployed: 120,
    reportedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    description: 'Shallow crustal seismic event. Structural damage reported across 18 high-rises and 2 overpass bridges.',
    recommendedEvacuationRadiusKm: 25,
    activeHazards: ['Ruptured Gas Mains', 'Unstable Facades', 'Aftershock Frequency (M4.0+ expected)'],
  },
  {
    id: 'dis-003',
    title: 'Pine Ridge Wildfire Conflagration',
    type: 'wildfire',
    severity: 'high',
    status: 'contained',
    location: {
      name: 'Pine Ridge National Reserve (East Flank)',
      lat: 45.5600,
      lng: -122.5100,
      radiusKm: 35.0,
    },
    affectedPopulation: 12400,
    casualtiesReported: 0,
    respondersDeployed: 48,
    reportedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    description: 'High wind gusts drove wildfire eastward. Evacuation zones established; perimeter 65% contained by aerial retardant drops.',
    recommendedEvacuationRadiusKm: 20,
    activeHazards: ['Toxic PM2.5 Smoke Plumes', 'Zero Road Visibility', 'Sporadic Fire Whirlwinds'],
  },
];

export const initialSOSRequests: SOSRequest[] = [
  {
    id: 'sos-101',
    reporterName: 'Marcus Vance',
    phone: '+1 (555) 234-8901',
    disasterId: 'dis-001',
    location: {
      address: '742 Riverwood Dr, Fluvial District',
      lat: 45.5180,
      lng: -122.6720,
    },
    urgencyScore: 96,
    priority: 'CRITICAL',
    status: 'pending',
    details: 'Floodwaters reached 2nd floor balcony! Family of 4 trapped including 82-year-old grandmother requiring oxygen tank. Water rising 1 inch every 10 min.',
    trappedCount: 4,
    injuriesCount: 1,
    specialNeeds: ['elderly', 'oxygen_dependent'],
    needsBoat: true,
    needsMedical: true,
    needsFoodWater: false,
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    aiTriageSummary: 'Immediate swift-water extraction advised. High hypothermia and respiratory failure risk. Deploy Zodiac Boat Unit + EMT.',
  },
  {
    id: 'sos-102',
    reporterName: 'Dr. Elena Rostova',
    phone: '+1 (555) 872-4412',
    disasterId: 'dis-002',
    location: {
      address: 'Suite 302, Pioneer Medical Annex',
      lat: 45.4850,
      lng: -122.6280,
    },
    urgencyScore: 92,
    priority: 'CRITICAL',
    status: 'dispatched',
    details: 'Stairwell collapsed post-quake. 6 patients and 2 staff trapped. 1 individual with compound femur fracture and active bleeding.',
    trappedCount: 8,
    injuriesCount: 3,
    specialNeeds: ['trauma', 'unstable_structure'],
    needsBoat: false,
    needsMedical: true,
    needsFoodWater: true,
    createdAt: new Date(Date.now() - 48 * 60000).toISOString(),
    assignedTeamId: 'team-01',
    assignedTeamName: 'Metro USAR Task Force 1',
    dispatchEtaMinutes: 8,
    aiTriageSummary: 'Heavy urban search & rescue required. Potential crush injury protocol. Trauma pack & stabilization hydraulic spreaders en route.',
  },
  {
    id: 'sos-103',
    reporterName: 'Clara Jenkins',
    phone: '+1 (555) 319-9022',
    disasterId: 'dis-001',
    location: {
      address: '1108 Elmira St, Lowlands',
      lat: 45.5090,
      lng: -122.6850,
    },
    urgencyScore: 78,
    priority: 'HIGH',
    status: 'triaged',
    details: 'Roof partially intact, water 4 feet deep in ground floor. Need evacuation for 3 adults and infant. Infant formula depleted.',
    trappedCount: 4,
    injuriesCount: 0,
    specialNeeds: ['infant'],
    needsBoat: true,
    needsMedical: false,
    needsFoodWater: true,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
    aiTriageSummary: 'Infant nutritional emergency. Rapid shallow-draft boat rescue suggested before nightfall.',
  },
  {
    id: 'sos-104',
    reporterName: 'Kenji Sato',
    phone: '+1 (555) 604-1823',
    disasterId: 'dis-002',
    location: {
      address: 'Unit 12B, Timberline Commons',
      lat: 45.4720,
      lng: -122.6150,
    },
    urgencyScore: 54,
    priority: 'MEDIUM',
    status: 'rescued',
    details: 'Power cut off, elevator jammed on 1st floor. Safely pried open by neighbors. Need clean drinking water and blanket rations.',
    trappedCount: 0,
    injuriesCount: 0,
    specialNeeds: [],
    needsBoat: false,
    needsMedical: false,
    needsFoodWater: true,
    createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
    aiTriageSummary: 'Victims safely evacuated from elevator. Water and basic survival kits distributed.',
  },
];

export const initialShelters: Shelter[] = [
  {
    id: 'she-001',
    name: 'Cascadia Civic Arena Safe Zone',
    address: '100 Stadium Way, Cascadia',
    lat: 45.5300,
    lng: -122.6650,
    capacity: 1200,
    currentOccupancy: 864,
    hasMedical: true,
    hasFood: true,
    hasWater: true,
    hasPower: true,
    isPetFriendly: true,
    contactPhone: '+1 (555) 900-1122',
    status: 'open',
  },
  {
    id: 'she-002',
    name: 'Lincoln Memorial High Gymnasium',
    address: '450 Lincoln Ave, South Metro',
    lat: 45.4950,
    lng: -122.6100,
    capacity: 450,
    currentOccupancy: 420,
    hasMedical: true,
    hasFood: true,
    hasWater: true,
    hasPower: true,
    isPetFriendly: false,
    contactPhone: '+1 (555) 900-3344',
    status: 'nearing_capacity',
  },
  {
    id: 'she-003',
    name: 'Redwood Valley Community Safe Haven',
    address: '880 Foothill Blvd, East Basin',
    lat: 45.5450,
    lng: -122.5350,
    capacity: 350,
    currentOccupancy: 140,
    hasMedical: false,
    hasFood: true,
    hasWater: true,
    hasPower: true,
    isPetFriendly: true,
    contactPhone: '+1 (555) 900-5566',
    status: 'open',
  },
  {
    id: 'she-004',
    name: 'Westside Transit Hall Auxiliary Safe Zone',
    address: '22 Metro Way, Cascadia West',
    lat: 45.5100,
    lng: -122.7100,
    capacity: 600,
    currentOccupancy: 600,
    hasMedical: true,
    hasFood: false,
    hasWater: true,
    hasPower: false,
    isPetFriendly: false,
    contactPhone: '+1 (555) 900-7788',
    status: 'full',
  },
];

export const initialSupplies: SupplyItem[] = [
  {
    id: 'sup-001',
    name: 'Tactical Trauma Hemostatic Kits',
    category: 'medical',
    quantity: 420,
    unit: 'kits',
    warehouseLocation: 'Depot Alpha (North Harbor)',
    status: 'adequate',
    threshold: 150,
    allocated: 280,
  },
  {
    id: 'sup-002',
    name: 'Purification Water Bladders (10L)',
    category: 'water',
    quantity: 1850,
    unit: 'units',
    warehouseLocation: 'Depot Alpha (North Harbor)',
    status: 'adequate',
    threshold: 500,
    allocated: 1200,
  },
  {
    id: 'sup-003',
    name: 'Ready-to-Eat Emergency Meal Packs (MREs)',
    category: 'rations',
    quantity: 6400,
    unit: 'meals',
    warehouseLocation: 'Depot Beta (East Runway)',
    status: 'adequate',
    threshold: 2000,
    allocated: 3900,
  },
  {
    id: 'sup-004',
    name: 'Inflatable Swift-Water Zodiac Skiffs',
    category: 'vehicles',
    quantity: 8,
    unit: 'vessels',
    warehouseLocation: 'River Rescue Staging Dock',
    status: 'low',
    threshold: 12,
    allocated: 6,
  },
  {
    id: 'sup-005',
    name: 'Mobile Solar Battery Inverters (3kW)',
    category: 'power',
    quantity: 14,
    unit: 'generators',
    warehouseLocation: 'Depot Gamma (Metro South)',
    status: 'critical',
    threshold: 25,
    allocated: 12,
  },
  {
    id: 'sup-006',
    name: 'Heavy-Duty Disaster Relief Tents (8-Person)',
    category: 'shelter_gear',
    quantity: 210,
    unit: 'tents',
    warehouseLocation: 'Depot Beta (East Runway)',
    status: 'adequate',
    threshold: 80,
    allocated: 140,
  },
];

export const initialResponders: ResponderTeam[] = [
  {
    id: 'team-01',
    name: 'Metro USAR Task Force 1',
    leadName: 'Capt. Sarah Thorne',
    type: 'search_rescue',
    membersCount: 12,
    status: 'dispatched',
    currentIncidentId: 'dis-002',
    assignedSOSId: 'sos-102',
    currentLocation: {
      lat: 45.4850,
      lng: -122.6280,
      zoneName: 'Sector 4 Collapse Zone',
    },
    radioFreq: '154.280 MHz (Tactical 2)',
    equipment: ['Hydraulic Cutters', 'Thermal Cameras', 'Search Canines', 'Shoring Jacks'],
    lastCheckIn: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'team-02',
    name: 'Cascadia Swift Water Rescue Unit B',
    leadName: 'Lt. Dave O’Connor',
    type: 'swift_water',
    membersCount: 8,
    status: 'available',
    currentIncidentId: 'dis-001',
    currentLocation: {
      lat: 45.5200,
      lng: -122.6700,
      zoneName: 'Fluvial Staging Ramp',
    },
    radioFreq: '156.800 MHz (Marine Ch 16)',
    equipment: ['2x 40HP Zodiacs', 'Drysuits', 'High-Angle Throw Lines', 'Defibrillator'],
    lastCheckIn: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'team-03',
    name: 'Aero-Medical Medevac Flight Alpha',
    leadName: 'Dr. Raymond Kim',
    type: 'medical_unit',
    membersCount: 4,
    status: 'available',
    currentIncidentId: 'dis-002',
    currentLocation: {
      lat: 45.5900,
      lng: -122.5975,
      zoneName: 'PDX Helipad Standby',
    },
    radioFreq: '123.025 MHz (Air-to-Ground)',
    equipment: ['Life Support Ventilator', 'Trauma Blood Bank', 'Night Vision FLIR'],
    lastCheckIn: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'team-04',
    name: 'SkyWatcher Autonomous Recon Drone Squad',
    leadName: 'Specialist Mia Zhang',
    type: 'drone_recon',
    membersCount: 3,
    status: 'on_scene',
    currentIncidentId: 'dis-001',
    currentLocation: {
      lat: 45.5150,
      lng: -122.6750,
      zoneName: 'Riverbank Airspace Grid 7',
    },
    radioFreq: '915 MHz Mesh Telemetry',
    equipment: ['3x Matrice 350 RTK', 'LiDAR Thermal Pods', 'Loudspeaker Broadcast Module'],
    lastCheckIn: new Date(Date.now() - 1 * 60000).toISOString(),
  },
];

export const initialDonations: AidDonation[] = [
  {
    id: 'don-01',
    donorName: 'OpenHumanity Foundation',
    amount: 150000,
    currency: 'USD',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    allocatedCause: 'Emergency Water Filtration & Water Bladders (12,000 Persons)',
    impactMetric: '1,200 Water Filtration Kits Deployed',
    txHash: '0x8f2a...c89e',
  },
  {
    id: 'don-02',
    donorName: 'Global Telecom Relief',
    amount: 45000,
    currency: 'USD',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    allocatedCause: 'Starlink Satellite Emergency Ground Terminals',
    impactMetric: '8 Emergency Mobile Mesh Hubs Online',
    txHash: '0x3d7b...e12a',
  },
  {
    id: 'don-03',
    donorName: 'Pacific Tech Cooperative',
    amount: 25000,
    currency: 'USD',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    allocatedCause: 'Field Trauma & Pediatric First Aid Packs',
    impactMetric: '500 Specialized Medical Kits Delivered',
    txHash: '0x6e90...4fbb',
  },
  {
    id: 'don-04',
    donorName: 'Anonymous Citizen Aid',
    amount: 5000,
    currency: 'USD',
    timestamp: new Date(Date.now() - 16 * 3600000).toISOString(),
    allocatedCause: 'Baby Formula & Infant Survival Supplies',
    impactMetric: '150 Families Provided Nutrition Packs',
    txHash: '0x1a45...77cd',
  },
];

interface ReliefDatabase {
  disasters: DisasterIncident[];
  sosRequests: SOSRequest[];
  shelters: Shelter[];
  supplies: SupplyItem[];
  responders: ResponderTeam[];
  donations: AidDonation[];
}

const dbInstance: ReliefDatabase = {
  disasters: [...initialDisasters],
  sosRequests: [...initialSOSRequests],
  shelters: [...initialShelters],
  supplies: [...initialSupplies],
  responders: [...initialResponders],
  donations: [...initialDonations],
};

export const db = {
  getDisasters(): DisasterIncident[] {
    return [...dbInstance.disasters];
  },
  getDisaster(id: string): DisasterIncident | undefined {
    return dbInstance.disasters.find((d) => d.id === id);
  },
  createDisaster(item: Omit<DisasterIncident, 'id' | 'reportedAt'>): DisasterIncident {
    const newDisaster: DisasterIncident = {
      ...item,
      id: `dis-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };
    dbInstance.disasters.unshift(newDisaster);
    return newDisaster;
  },

  getSOSRequests(): SOSRequest[] {
    return [...dbInstance.sosRequests];
  },
  getSOS(id: string): SOSRequest | undefined {
    return dbInstance.sosRequests.find((s) => s.id === id);
  },
  createSOS(item: Omit<SOSRequest, 'id' | 'createdAt' | 'status'>): SOSRequest {
    const newSOS: SOSRequest = {
      ...item,
      id: `sos-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dbInstance.sosRequests.unshift(newSOS);
    return newSOS;
  },
  updateSOSStatus(
    id: string,
    status: SOSRequest['status'],
    teamId?: string,
    teamName?: string
  ): SOSRequest | undefined {
    const req = dbInstance.sosRequests.find((s) => s.id === id);
    if (!req) return undefined;
    req.status = status;
    if (teamId) req.assignedTeamId = teamId;
    if (teamName) req.assignedTeamName = teamName;
    if (status === 'dispatched' && !req.dispatchEtaMinutes) {
      req.dispatchEtaMinutes = Math.floor(Math.random() * 12) + 5;
    }
    return req;
  },

  getShelters(): Shelter[] {
    return [...dbInstance.shelters];
  },
  getShelter(id: string): Shelter | undefined {
    return dbInstance.shelters.find((s) => s.id === id);
  },
  updateShelterOccupancy(id: string, newOccupancy: number): Shelter | undefined {
    const s = dbInstance.shelters.find((shelter) => shelter.id === id);
    if (!s) return undefined;
    s.currentOccupancy = Math.min(newOccupancy, s.capacity);
    if (s.currentOccupancy >= s.capacity) {
      s.status = 'full';
    } else if (s.currentOccupancy >= s.capacity * 0.9) {
      s.status = 'nearing_capacity';
    } else {
      s.status = 'open';
    }
    return s;
  },

  getSupplies(): SupplyItem[] {
    return [...dbInstance.supplies];
  },
  dispatchSupply(id: string, qty: number): SupplyItem | undefined {
    const item = dbInstance.supplies.find((sup) => sup.id === id);
    if (!item) return undefined;
    item.allocated += qty;
    item.quantity = Math.max(0, item.quantity - qty);
    if (item.quantity <= 0) {
      item.status = 'critical';
    } else if (item.quantity < item.threshold) {
      item.status = 'low';
    }
    return item;
  },
  restockSupply(id: string, qty: number): SupplyItem | undefined {
    const item = dbInstance.supplies.find((sup) => sup.id === id);
    if (!item) return undefined;
    item.quantity += qty;
    if (item.quantity >= item.threshold) {
      item.status = 'adequate';
    }
    return item;
  },

  getResponders(): ResponderTeam[] {
    return [...dbInstance.responders];
  },
  getResponder(id: string): ResponderTeam | undefined {
    return dbInstance.responders.find((r) => r.id === id);
  },
  dispatchResponder(teamId: string, incidentId: string, sosId?: string): ResponderTeam | undefined {
    const team = dbInstance.responders.find((r) => r.id === teamId);
    if (!team) return undefined;
    team.status = 'dispatched';
    team.currentIncidentId = incidentId;
    team.assignedSOSId = sosId;
    team.lastCheckIn = new Date().toISOString();
    return team;
  },
  updateResponderStatus(teamId: string, status: ResponderTeam['status']): ResponderTeam | undefined {
    const team = dbInstance.responders.find((r) => r.id === teamId);
    if (!team) return undefined;
    team.status = status;
    team.lastCheckIn = new Date().toISOString();
    return team;
  },

  getDonations(): AidDonation[] {
    return [...dbInstance.donations];
  },
  createDonation(item: Omit<AidDonation, 'id' | 'timestamp' | 'txHash'>): AidDonation {
    const newDonation: AidDonation = {
      ...item,
      id: `don-${Date.now()}`,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
    };
    dbInstance.donations.unshift(newDonation);
    return newDonation;
  },

  getStats() {
    const totalAffected = dbInstance.disasters.reduce((acc, d) => acc + d.affectedPopulation, 0);
    const totalResponders = dbInstance.responders.reduce((acc, r) => acc + r.membersCount, 0);
    const criticalSOSCount = dbInstance.sosRequests.filter(
      (s) => s.priority === 'CRITICAL' && (s.status === 'pending' || s.status === 'triaged')
    ).length;
    const totalSheltered = dbInstance.shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
    const totalAidRaised = dbInstance.donations.reduce((acc, d) => acc + d.amount, 0);

    return {
      activeDisastersCount: dbInstance.disasters.filter((d) => d.status === 'active').length,
      totalAffected,
      totalResponders,
      criticalSOSCount,
      totalSheltered,
      totalAidRaised,
      suppliesCount: dbInstance.supplies.length,
      sosPendingCount: dbInstance.sosRequests.filter((s) => s.status === 'pending').length,
    };
  },
};
