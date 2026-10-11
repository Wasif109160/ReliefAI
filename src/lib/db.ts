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
    title: 'Surma-Kushiyara Basin Severe Inundation (সিলেট-সুনামগঞ্জ বন্যা)',
    type: 'flood',
    severity: 'critical',
    status: 'active',
    location: {
      name: 'Sylhet & Sunamganj Riverine Lowlands',
      lat: 24.8949,
      lng: 91.8687,
      radiusKm: 42.0,
    },
    affectedPopulation: 640000,
    casualtiesReported: 14,
    respondersDeployed: 240,
    reportedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    description: 'Surma & Kushiyara rivers surging 1.42m above danger level. 8 upazilas submerged including Gowainghat and Companiganj; 1,200 schools converted to shelters.',
    recommendedEvacuationRadiusKm: 25,
    activeHazards: ['Submerged Power Grid & Electrocution Risk', 'Flash Current > 5.2 knots', 'Waterborne Cholera / Diarrhea Outbreak Threat'],
  },
  {
    id: 'dis-002',
    title: 'Bay of Bengal Super Cyclone Threat (মহাবিপদ সংকেত ১০)',
    type: 'hurricane',
    severity: 'critical',
    status: 'active',
    location: {
      name: "Chittagong-Cox's Bazar Coastal Arc & Kutubdia",
      lat: 21.4272,
      lng: 91.9702,
      radiusKm: 85.0,
    },
    affectedPopulation: 1450000,
    casualtiesReported: 3,
    respondersDeployed: 480,
    reportedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    description: 'Category 4 equivalent tropical cyclone approaching southeast coast. Storm surge predicted 12-16 feet above normal astronomical tide.',
    recommendedEvacuationRadiusKm: 45,
    activeHazards: ['16ft Tidal Surge Inundation', 'Coastal Embankment Breaches', 'Wind Gusts Exceeding 140 km/h'],
  },
  {
    id: 'dis-003',
    title: 'Old Dhaka Chemical Warehouse Hazard (চকবাজার জরুরি অগ্নিকাণ্ড)',
    type: 'industrial',
    severity: 'critical',
    status: 'active',
    location: {
      name: 'Chawkbazar & Lalbagh Dense Corridor, Dhaka',
      lat: 23.7150,
      lng: 90.3950,
      radiusKm: 3.5,
    },
    affectedPopulation: 58000,
    casualtiesReported: 6,
    respondersDeployed: 110,
    reportedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    description: 'Industrial chemical solvent explosion triggered multi-story fire in ultra-dense historic residential quarter. Narrow lanes impeding fire engine access.',
    recommendedEvacuationRadiusKm: 2,
    activeHazards: ['Toxic Solvent Fumes (Benzene / Acetone)', 'Structural Collapse of Century-Old Brickwork', 'Gas Line Secondary Explosions'],
  },
  {
    id: 'dis-004',
    title: 'Jamuna River Erosion & Embankment Breach (চিলমারী নদীভাঙন)',
    type: 'flood',
    severity: 'high',
    status: 'active',
    location: {
      name: 'Chilmari & Roumari Upazila, Kurigram',
      lat: 25.8073,
      lng: 89.6369,
      radiusKm: 22.0,
    },
    affectedPopulation: 85000,
    casualtiesReported: 1,
    respondersDeployed: 65,
    reportedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    description: 'Jamuna river severe bank failure washing away 320 homesteads within 48 hours. Flood protection dam breached over 150-meter section.',
    recommendedEvacuationRadiusKm: 12,
    activeHazards: ['Rapid Bank Cavitation', 'Loss of Agricultural Land & Livestock', 'Zero Road Connectivity to Char Islands'],
  },
];

export const initialSOSRequests: SOSRequest[] = [
  {
    id: 'sos-101',
    reporterName: 'Rafiqul Islam',
    phone: '+880 1712-345678',
    disasterId: 'dis-001',
    location: {
      address: 'Road 4, Gowainghat Upazila, Sylhet (Near Surma Riverbank)',
      lat: 25.0760,
      lng: 91.9750,
    },
    urgencyScore: 97,
    priority: 'CRITICAL',
    status: 'pending',
    details: 'Surma flash floodwaters reached rooftop! 6 family members stranded including 85-year-old grandmother and infant. Current flowing fast. Need swift extraction boat immediately.',
    trappedCount: 6,
    injuriesCount: 1,
    specialNeeds: ['elderly', 'infant', 'hypothermia'],
    needsBoat: true,
    needsMedical: true,
    needsFoodWater: false,
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    aiTriageSummary: 'Immediate swift-water shallow draft boat rescue needed. Deploy FSCD Speedboat Unit with trauma stabilization kit.',
  },
  {
    id: 'sos-102',
    reporterName: 'Ayesha Siddiqua',
    phone: '+880 1819-876543',
    disasterId: 'dis-001',
    location: {
      address: 'Ward 3, Sunamganj Sadar Upazila (Beside Old District Hospital)',
      lat: 25.0660,
      lng: 91.4070,
    },
    urgencyScore: 93,
    priority: 'CRITICAL',
    status: 'dispatched',
    details: 'Hospital basement flooded, power back-up failed. 8 neonatal patients on portable oxygen and 4 pregnant mothers stranded on first floor.',
    trappedCount: 12,
    injuriesCount: 2,
    specialNeeds: ['neonatal', 'maternal_care', 'oxygen_dependent'],
    needsBoat: true,
    needsMedical: true,
    needsFoodWater: true,
    createdAt: new Date(Date.now() - 48 * 60000).toISOString(),
    assignedTeamId: 'team-01',
    assignedTeamName: 'FSCD Sylhet Swift-Water Dive Team 1',
    dispatchEtaMinutes: 7,
    aiTriageSummary: 'High-risk pediatric/maternal evacuation. Dispatched 2x Zodiac inflatable rescue skiffs with battery generators and pediatric EMTs.',
  },
  {
    id: 'sos-103',
    reporterName: 'Mohammad Karim',
    phone: '+880 1611-223344',
    disasterId: 'dis-002',
    location: {
      address: "Ali Akbar Deil, Kutubdia Coastal Embankment, Cox's Bazar",
      lat: 21.8160,
      lng: 91.8540,
    },
    urgencyScore: 82,
    priority: 'HIGH',
    status: 'triaged',
    details: 'Cyclone tidal wave breached local polder dyke. 9 villagers sheltering in mosque upper deck. Need evacuation to cyclone shelter before nightfall.',
    trappedCount: 9,
    injuriesCount: 0,
    specialNeeds: ['polder_breach', 'rising_tide'],
    needsBoat: true,
    needsMedical: false,
    needsFoodWater: true,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
    aiTriageSummary: 'Pre-cyclone landfall evacuation. Armed Forces river craft tasked for transfer to Kutubdia Multi-Purpose Cyclone Shelter.',
  },
  {
    id: 'sos-104',
    reporterName: 'Tanvir Ahmed',
    phone: '+880 1913-998877',
    disasterId: 'dis-003',
    location: {
      address: '42 Chawk Circular Road, Chawkbazar, Lalbagh, Dhaka',
      lat: 23.7190,
      lng: 90.3920,
    },
    urgencyScore: 88,
    priority: 'CRITICAL',
    status: 'dispatched',
    details: 'Heavy smoke spreading through staircase. 4 shop workers trapped on 3rd floor rooftop. Fire service ladder cannot enter narrow lane.',
    trappedCount: 4,
    injuriesCount: 2,
    specialNeeds: ['smoke_inhalation', 'burns'],
    needsBoat: false,
    needsMedical: true,
    needsFoodWater: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    assignedTeamId: 'team-04',
    assignedTeamName: 'FSCD Headquarters Special Rescue Unit Dhaka',
    dispatchEtaMinutes: 5,
    aiTriageSummary: 'Urban high-density thermal smoke extraction. Aerial drone thermal scanner deployed to map alternative roof-to-roof egress.',
  },
];

export const initialShelters: Shelter[] = [
  {
    id: 'she-001',
    name: 'Sunamganj Govt Jubilee High School Flood Shelter',
    address: 'Jubilee Road, Sunamganj Sadar',
    lat: 25.0715,
    lng: 91.4034,
    capacity: 1500,
    currentOccupancy: 1180,
    hasMedical: true,
    hasFood: true,
    hasWater: true,
    hasPower: true,
    isPetFriendly: true,
    contactPhone: '+880 1711-224466',
    status: 'open',
  },
  {
    id: 'she-002',
    name: "Kutubdia Multi-Purpose Cyclone Shelter, Cox's Bazar",
    address: 'Boroghop Union, Kutubdia Island',
    lat: 21.8210,
    lng: 91.8590,
    capacity: 1200,
    currentOccupancy: 1120,
    hasMedical: true,
    hasFood: true,
    hasWater: true,
    hasPower: true,
    isPetFriendly: false,
    contactPhone: '+880 1812-335577',
    status: 'nearing_capacity',
  },
  {
    id: 'she-003',
    name: 'MC College Student Union Emergency Shelter, Sylhet',
    address: 'Tamabil Road, Tilagarh, Sylhet',
    lat: 24.9010,
    lng: 91.8920,
    capacity: 2200,
    currentOccupancy: 1450,
    hasMedical: true,
    hasFood: true,
    hasWater: true,
    hasPower: true,
    isPetFriendly: true,
    contactPhone: '+880 1715-667788',
    status: 'open',
  },
  {
    id: 'she-004',
    name: 'Patuakhali Coastal Cyclone Shelter & Red Crescent Post',
    address: 'Galachipa Coastal Union, Patuakhali',
    lat: 22.3596,
    lng: 90.3299,
    capacity: 850,
    currentOccupancy: 850,
    hasMedical: true,
    hasFood: true,
    hasWater: true,
    hasPower: false,
    isPetFriendly: false,
    contactPhone: '+880 1914-556677',
    status: 'full',
  },
];

export const initialSupplies: SupplyItem[] = [
  {
    id: 'sup-001',
    name: 'Emergency Water Purification Tablets (Aquatabs / Halazone)',
    category: 'water',
    quantity: 48000,
    unit: 'tablets',
    warehouseLocation: 'Dhaka Central Tejgaon Strategic Depot',
    status: 'adequate',
    threshold: 15000,
    allocated: 26000,
  },
  {
    id: 'sup-002',
    name: 'Inflatable Swift-Water Rescue Zodiac Skiffs (40HP Yamaha)',
    category: 'vehicles',
    quantity: 14,
    unit: 'vessels',
    warehouseLocation: 'FSCD Sylhet River Staging Ghat',
    status: 'low',
    threshold: 20,
    allocated: 11,
  },
  {
    id: 'sup-003',
    name: 'BDRCS Family Emergency Dry Food Packs (Chira, Gur, ORS, Biscuits)',
    category: 'rations',
    quantity: 12500,
    unit: 'packs',
    warehouseLocation: 'Sunamganj Upazila Central Relief Depot',
    status: 'adequate',
    threshold: 4000,
    allocated: 7800,
  },
  {
    id: 'sup-004',
    name: 'Polyvalent Snake Antivenom & Emergency Trauma Hemostatic Kits',
    category: 'medical',
    quantity: 650,
    unit: 'kits',
    warehouseLocation: 'Sylhet MAG Osmani Medical College Auxiliary Depot',
    status: 'low',
    threshold: 800,
    allocated: 490,
  },
  {
    id: 'sup-005',
    name: 'Heavy-Duty 4-Inch High-Discharge Flood De-Watering Pumps',
    category: 'power',
    quantity: 18,
    unit: 'pumps',
    warehouseLocation: 'BWDB Chittagong Agrabad Technical Workshop',
    status: 'critical',
    threshold: 30,
    allocated: 15,
  },
  {
    id: 'sup-006',
    name: 'Cyclone Resistant Family Tarpaulins & Reinforced Tents',
    category: 'shelter_gear',
    quantity: 1400,
    unit: 'tents',
    warehouseLocation: "Cox's Bazar Disaster Relief Logistics Hub",
    status: 'adequate',
    threshold: 500,
    allocated: 850,
  },
];

export const initialResponders: ResponderTeam[] = [
  {
    id: 'team-01',
    name: 'FSCD Sylhet Station Swift-Water Rescue Dive Team 1 (ফায়ার সার্ভিস)',
    leadName: 'Station Officer Tareq Mahmud',
    type: 'swift_water',
    membersCount: 14,
    status: 'dispatched',
    currentIncidentId: 'dis-001',
    assignedSOSId: 'sos-102',
    currentLocation: {
      lat: 25.0660,
      lng: 91.4070,
      zoneName: 'Sunamganj Sadar Hospital Waterway',
    },
    radioFreq: '156.800 MHz (VHF Ch 16 / FSCD Net)',
    equipment: ['3x 40HP Inflatable Skiffs', 'Drysuits & Life Jackets', 'Thermal Underwater Search Sonar', 'Trauma First Aid'],
    lastCheckIn: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'team-02',
    name: 'Bangladesh Red Crescent (BDRCS) Cyclone Preparedness Programme (CPP)',
    leadName: 'Commander Nurul Huda',
    type: 'search_rescue',
    membersCount: 28,
    status: 'available',
    currentIncidentId: 'dis-002',
    currentLocation: {
      lat: 21.8210,
      lng: 91.8590,
      zoneName: 'Kutubdia Coastal CPP Station',
    },
    radioFreq: '143.900 MHz (BDRCS Disaster Net)',
    equipment: ['Megaphones & Signal Flags', 'High-Angle Evacuation Ropes', 'Stretcher Carriers', 'Emergency Satellite Phone'],
    lastCheckIn: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'team-03',
    name: 'Armed Forces Division (AFD) 17th Infantry Riverine Rescue Column',
    leadName: 'Major Farhan Chowdhury',
    type: 'medical_unit',
    membersCount: 32,
    status: 'available',
    currentIncidentId: 'dis-001',
    currentLocation: {
      lat: 24.8949,
      lng: 91.8687,
      zoneName: 'Sylhet Cantonment Helipad / River Staging',
    },
    radioFreq: 'Army Tactical UHF Net',
    equipment: ['MI-17 Medevac Helicopter', 'BTR Amphibious APCs', 'Mobile Field Surgical Unit', 'Water Purification Bladders'],
    lastCheckIn: new Date(Date.now() - 7 * 60000).toISOString(),
  },
  {
    id: 'team-04',
    name: 'FSCD Headquarters Special Chemical & Urban Search Rescue (Dhaka Command)',
    leadName: 'Assistant Director Rafiq Ullah',
    type: 'search_rescue',
    membersCount: 18,
    status: 'on_scene',
    currentIncidentId: 'dis-003',
    currentLocation: {
      lat: 23.7190,
      lng: 90.3920,
      zoneName: 'Chawkbazar Fireground Staging Post',
    },
    radioFreq: 'FSCD Tactical UHF Channel 4',
    equipment: ['Hydraulic Concrete Breakers', 'Thermal FLIR Drones', 'Chemical HAZMAT Suits', 'Positive Pressure Ventilators'],
    lastCheckIn: new Date(Date.now() - 1 * 60000).toISOString(),
  },
];

export const initialDonations: AidDonation[] = [
  {
    id: 'don-01',
    donorName: 'BRAC Humanitarian Disaster Fund',
    amount: 2500000,
    currency: 'BDT',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    allocatedCause: 'Sylhet & Sunamganj Emergency Water Filtration & High-Risk Family Evacuation',
    impactMetric: '14,000 Persons Provided Safe Drinking Water for 30 Days',
    txHash: '0x8f2a...c89e',
  },
  {
    id: 'don-02',
    donorName: "Chief Adviser's Relief & Welfare Fund (প্রধান উপদেষ্টার ত্রাণ তহবিল)",
    amount: 5000000,
    currency: 'BDT',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    allocatedCause: 'Coastal Cyclone Embankment Emergency Sandbag Reinforcement & Kutubdia Food Grants',
    impactMetric: '8.5km Embankment Stabilized & 5,000 Dry Food Rations',
    txHash: '0x3d7b...e12a',
  },
  {
    id: 'don-03',
    donorName: 'bKash Humanitarian Crowd Campaign',
    amount: 1250000,
    currency: 'BDT',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    allocatedCause: 'Snake Antivenom & Pediatric Rehydration Salts for Flood Victims',
    impactMetric: '850 Emergency Hospital Trauma Packs Dispatched',
    txHash: '0x6e90...4fbb',
  },
  {
    id: 'don-04',
    donorName: 'Anjuman Mufidul Islam Disaster Wing',
    amount: 750000,
    currency: 'BDT',
    timestamp: new Date(Date.now() - 16 * 3600000).toISOString(),
    allocatedCause: 'Emergency Family Warm Clothes & Sanitary Kits for Displaced Flood Mothers',
    impactMetric: '1,200 Families Supported in Gowainghat & Companiganj',
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
