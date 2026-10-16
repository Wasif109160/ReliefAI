import {
  DisasterIncident,
  SOSRequest,
  Shelter,
  SupplyItem,
  ResponderTeam,
  AidDonation,
} from './types';
import { connectToDatabase, isMongoConfigured } from './mongodb';
import {
  DisasterModel,
  SOSRequestModel,
  ShelterModel,
  SupplyModel,
  ResponderModel,
  DonationModel,
} from './models';

// Seed initial Bangladesh data
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

let hasInitializedMongo = false;
async function initDb() {
  if (hasInitializedMongo) return;
  if (isMongoConfigured()) {
    try {
      const conn = await connectToDatabase();
      if (conn) {
        hasInitializedMongo = true;
        const { seedMongoIfEmpty } = await import('./mongodb/seed');
        await seedMongoIfEmpty();
      }
    } catch (e) {
      console.warn('[ReliefAI DB] MongoDB connection skipped, running in-memory fallback:', e);
    }
  }
}

export const db = {
  // Disasters
  async getDisasters(): Promise<DisasterIncident[]> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const items = await DisasterModel.find().lean();
        if (items && items.length > 0) {
          return items.map((d: any) => ({
            ...d,
            id: d.id,
            _id: undefined,
          })) as DisasterIncident[];
        }
      } catch (err) {
        console.warn('Mongo read disasters failed, using in-memory store:', err);
      }
    }
    return [...dbInstance.disasters];
  },

  async getDisaster(id: string): Promise<DisasterIncident | undefined> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const item = await DisasterModel.findOne({ id }).lean();
        if (item) return { ...item, id: (item as any).id, _id: undefined } as DisasterIncident;
      } catch {}
    }
    return dbInstance.disasters.find((d) => d.id === id);
  },

  async createDisaster(item: Omit<DisasterIncident, 'id' | 'reportedAt'>): Promise<DisasterIncident> {
    const newDisaster: DisasterIncident = {
      ...item,
      id: `dis-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };
    dbInstance.disasters.unshift(newDisaster);
    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await DisasterModel.create(newDisaster);
      } catch (err) {
        console.warn('Mongo create disaster failed:', err);
      }
    }
    return newDisaster;
  },

  // SOS Requests
  async getSOSRequests(): Promise<SOSRequest[]> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const items = await SOSRequestModel.find().sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) {
          return items.map((s: any) => ({
            ...s,
            id: s.id,
            _id: undefined,
          })) as SOSRequest[];
        }
      } catch (err) {
        console.warn('Mongo read SOS failed, using in-memory store:', err);
      }
    }
    return [...dbInstance.sosRequests];
  },

  async getSOS(id: string): Promise<SOSRequest | undefined> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const item = await SOSRequestModel.findOne({ id }).lean();
        if (item) return { ...item, id: (item as any).id, _id: undefined } as SOSRequest;
      } catch {}
    }
    return dbInstance.sosRequests.find((s) => s.id === id);
  },

  async createSOS(item: Omit<SOSRequest, 'id' | 'createdAt' | 'status'>): Promise<SOSRequest> {
    const newSOS: SOSRequest = {
      ...item,
      id: `sos-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dbInstance.sosRequests.unshift(newSOS);
    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await SOSRequestModel.create(newSOS);
      } catch (err) {
        console.warn('Mongo create SOS failed:', err);
      }
    }
    return newSOS;
  },

  async updateSOSStatus(
    id: string,
    status: SOSRequest['status'],
    teamId?: string,
    teamName?: string
  ): Promise<SOSRequest | undefined> {
    const req = dbInstance.sosRequests.find((s) => s.id === id);
    if (req) {
      req.status = status;
      if (teamId) req.assignedTeamId = teamId;
      if (teamName) req.assignedTeamName = teamName;
      if (status === 'dispatched' && !req.dispatchEtaMinutes) {
        req.dispatchEtaMinutes = Math.floor(Math.random() * 12) + 5;
      }
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updates: any = { status };
        if (teamId) updates.assignedTeamId = teamId;
        if (teamName) updates.assignedTeamName = teamName;
        if (status === 'dispatched' && req?.dispatchEtaMinutes) {
          updates.dispatchEtaMinutes = req.dispatchEtaMinutes;
        }
        const updated = await SOSRequestModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as SOSRequest;
        }
      } catch (err) {
        console.warn('Mongo update SOS failed:', err);
      }
    }
    return req;
  },

  // Shelters
  async getShelters(): Promise<Shelter[]> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const items = await ShelterModel.find().lean();
        if (items && items.length > 0) {
          return items.map((s: any) => ({
            ...s,
            id: s.id,
            _id: undefined,
          })) as Shelter[];
        }
      } catch (err) {
        console.warn('Mongo read shelters failed:', err);
      }
    }
    return [...dbInstance.shelters];
  },

  async getShelter(id: string): Promise<Shelter | undefined> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const item = await ShelterModel.findOne({ id }).lean();
        if (item) return { ...item, id: (item as any).id, _id: undefined } as Shelter;
      } catch {}
    }
    return dbInstance.shelters.find((s) => s.id === id);
  },

  async updateShelterOccupancy(id: string, newOccupancy: number): Promise<Shelter | undefined> {
    const s = dbInstance.shelters.find((shelter) => shelter.id === id);
    if (!s) return undefined;
    s.currentOccupancy = Math.max(0, Math.min(newOccupancy, s.capacity));
    if (s.currentOccupancy >= s.capacity) {
      s.status = 'full';
    } else if (s.currentOccupancy >= s.capacity * 0.9) {
      s.status = 'nearing_capacity';
    } else {
      s.status = 'open';
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await ShelterModel.findOneAndUpdate(
          { id },
          { currentOccupancy: s.currentOccupancy, status: s.status },
          { new: true }
        ).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as Shelter;
        }
      } catch (err) {
        console.warn('Mongo update shelter failed:', err);
      }
    }
    return s;
  },

  // Supplies
  async getSupplies(): Promise<SupplyItem[]> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const items = await SupplyModel.find().lean();
        if (items && items.length > 0) {
          return items.map((s: any) => ({
            ...s,
            id: s.id,
            _id: undefined,
          })) as SupplyItem[];
        }
      } catch (err) {
        console.warn('Mongo read supplies failed:', err);
      }
    }
    return [...dbInstance.supplies];
  },

  async dispatchSupply(id: string, qty: number): Promise<SupplyItem | undefined> {
    const item = dbInstance.supplies.find((sup) => sup.id === id);
    if (!item) return undefined;
    item.allocated += qty;
    item.quantity = Math.max(0, item.quantity - qty);
    if (item.quantity <= 0) {
      item.status = 'critical';
    } else if (item.quantity < item.threshold) {
      item.status = 'low';
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await SupplyModel.findOneAndUpdate(
          { id },
          { quantity: item.quantity, allocated: item.allocated, status: item.status },
          { new: true }
        ).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as SupplyItem;
        }
      } catch (err) {
        console.warn('Mongo dispatch supply failed:', err);
      }
    }
    return item;
  },

  async restockSupply(id: string, qty: number): Promise<SupplyItem | undefined> {
    const item = dbInstance.supplies.find((sup) => sup.id === id);
    if (!item) return undefined;
    item.quantity += qty;
    if (item.quantity >= item.threshold) {
      item.status = 'adequate';
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await SupplyModel.findOneAndUpdate(
          { id },
          { quantity: item.quantity, status: item.status },
          { new: true }
        ).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as SupplyItem;
        }
      } catch (err) {
        console.warn('Mongo restock supply failed:', err);
      }
    }
    return item;
  },

  // Responders
  async getResponders(): Promise<ResponderTeam[]> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const items = await ResponderModel.find().lean();
        if (items && items.length > 0) {
          return items.map((r: any) => ({
            ...r,
            id: r.id,
            _id: undefined,
          })) as ResponderTeam[];
        }
      } catch (err) {
        console.warn('Mongo read responders failed:', err);
      }
    }
    return [...dbInstance.responders];
  },

  async getResponder(id: string): Promise<ResponderTeam | undefined> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const item = await ResponderModel.findOne({ id }).lean();
        if (item) return { ...item, id: (item as any).id, _id: undefined } as ResponderTeam;
      } catch {}
    }
    return dbInstance.responders.find((r) => r.id === id);
  },

  async dispatchResponder(teamId: string, incidentId: string, sosId?: string): Promise<ResponderTeam | undefined> {
    const team = dbInstance.responders.find((r) => r.id === teamId);
    if (!team) return undefined;
    team.status = 'dispatched';
    team.currentIncidentId = incidentId;
    team.assignedSOSId = sosId;
    team.lastCheckIn = new Date().toISOString();

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await ResponderModel.findOneAndUpdate(
          { id: teamId },
          {
            status: 'dispatched',
            currentIncidentId: incidentId,
            assignedSOSId: sosId,
            lastCheckIn: team.lastCheckIn,
          },
          { new: true }
        ).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as ResponderTeam;
        }
      } catch (err) {
        console.warn('Mongo dispatch responder failed:', err);
      }
    }
    return team;
  },

  async updateResponderStatus(teamId: string, status: ResponderTeam['status']): Promise<ResponderTeam | undefined> {
    const team = dbInstance.responders.find((r) => r.id === teamId);
    if (!team) return undefined;
    team.status = status;
    team.lastCheckIn = new Date().toISOString();

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await ResponderModel.findOneAndUpdate(
          { id: teamId },
          { status, lastCheckIn: team.lastCheckIn },
          { new: true }
        ).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as ResponderTeam;
        }
      } catch (err) {
        console.warn('Mongo update responder failed:', err);
      }
    }
    return team;
  },

  // Donations
  async getDonations(): Promise<AidDonation[]> {
    await initDb();
    if (isMongoConfigured()) {
      try {
        const items = await DonationModel.find().sort({ timestamp: -1 }).lean();
        if (items && items.length > 0) {
          return items.map((d: any) => ({
            ...d,
            id: d.id,
            _id: undefined,
          })) as AidDonation[];
        }
      } catch (err) {
        console.warn('Mongo read donations failed:', err);
      }
    }
    return [...dbInstance.donations];
  },

  async createDonation(item: Omit<AidDonation, 'id' | 'timestamp' | 'txHash'>): Promise<AidDonation> {
    const newDonation: AidDonation = {
      ...item,
      id: `don-${Date.now()}`,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
    };
    dbInstance.donations.unshift(newDonation);
    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await DonationModel.create(newDonation);
      } catch (err) {
        console.warn('Mongo create donation failed:', err);
      }
    }
    return newDonation;
  },

  async getStats() {
    const disasters = await this.getDisasters();
    const responders = await this.getResponders();
    const sosRequests = await this.getSOSRequests();
    const shelters = await this.getShelters();
    const supplies = await this.getSupplies();
    const donations = await this.getDonations();

    const totalAffected = disasters.reduce((acc, d) => acc + d.affectedPopulation, 0);
    const totalResponders = responders.reduce((acc, r) => acc + r.membersCount, 0);
    const criticalSOSCount = sosRequests.filter(
      (s) => s.priority === 'CRITICAL' && (s.status === 'pending' || s.status === 'triaged')
    ).length;
    const totalSheltered = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
    const totalAidRaised = donations.reduce((acc, d) => acc + d.amount, 0);

    return {
      activeDisastersCount: disasters.filter((d) => d.status === 'active').length,
      totalAffected,
      totalResponders,
      criticalSOSCount,
      totalSheltered,
      totalAidRaised,
      suppliesCount: supplies.length,
      sosPendingCount: sosRequests.filter((s) => s.status === 'pending').length,
    };
  },
};
