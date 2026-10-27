import {
  DisasterIncident,
  SOSRequest,
  Shelter,
  SupplyItem,
  ResponderTeam,
  AidDonation,
  SOSStatus,
  TeamStatus,
} from './types';
import {
  prisma,
  isDatabaseConfigured,
  DatabaseUnavailableError,
  isDatabaseUnavailableError,
} from './prisma';

import { ALL_COMBINED_DISASTERS } from './data/historical-disasters';

// Seed initial Bangladesh data with verified historical archives and labeled demo drills
export const initialDisasters: DisasterIncident[] = ALL_COMBINED_DISASTERS;

export const initialSOSRequests: SOSRequest[] = [
  {
    id: 'sos-101',
    reporterName: 'Rafiqul Islam',
    phone: '+880 1712-345678',
    disasterId: 'dis-001',
    location: {
      address: 'Road 4, Gowainghat Upazila, Sylhet (Near Surma Riverbank)',
      lat: 25.076,
      lng: 91.975,
    },
    urgencyScore: 97,
    priority: 'CRITICAL',
    status: 'pending',
    details:
      'Surma flash floodwaters reached rooftop! 6 family members stranded including 85-year-old grandmother and infant. Current flowing fast. Need swift extraction boat immediately.',
    trappedCount: 6,
    injuriesCount: 1,
    specialNeeds: ['elderly', 'infant', 'hypothermia'],
    needsBoat: true,
    needsMedical: true,
    needsFoodWater: false,
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    aiTriageSummary:
      'Immediate swift-water shallow draft boat rescue needed. Deploy FSCD Speedboat Unit with trauma stabilization kit.',
  },
  {
    id: 'sos-102',
    reporterName: 'Ayesha Siddiqua',
    phone: '+880 1819-876543',
    disasterId: 'dis-001',
    location: {
      address: 'Ward 3, Sunamganj Sadar Upazila (Beside Old District Hospital)',
      lat: 25.066,
      lng: 91.407,
    },
    urgencyScore: 93,
    priority: 'CRITICAL',
    status: 'dispatched',
    details:
      'Hospital basement flooded, power back-up failed. 8 neonatal patients on portable oxygen and 4 pregnant mothers stranded on first floor.',
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
    aiTriageSummary:
      'High-risk pediatric/maternal evacuation. Dispatched 2x Zodiac inflatable rescue skiffs with battery generators and pediatric EMTs.',
  },
  {
    id: 'sos-103',
    reporterName: 'Mohammad Karim',
    phone: '+880 1611-223344',
    disasterId: 'dis-002',
    location: {
      address: "Ali Akbar Deil, Kutubdia Coastal Embankment, Cox's Bazar",
      lat: 21.816,
      lng: 91.854,
    },
    urgencyScore: 82,
    priority: 'HIGH',
    status: 'triaged',
    details:
      'Cyclone tidal wave breached local polder dyke. 9 villagers sheltering in mosque upper deck. Need evacuation to cyclone shelter before nightfall.',
    trappedCount: 9,
    injuriesCount: 0,
    specialNeeds: ['polder_breach', 'rising_tide'],
    needsBoat: true,
    needsMedical: false,
    needsFoodWater: true,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
    aiTriageSummary:
      'Pre-cyclone landfall evacuation. Armed Forces river craft tasked for transfer to Kutubdia Multi-Purpose Cyclone Shelter.',
  },
  {
    id: 'sos-104',
    reporterName: 'Tanvir Ahmed',
    phone: '+880 1913-998877',
    disasterId: 'dis-003',
    location: {
      address: '42 Chawk Circular Road, Chawkbazar, Lalbagh, Dhaka',
      lat: 23.719,
      lng: 90.392,
    },
    urgencyScore: 88,
    priority: 'CRITICAL',
    status: 'dispatched',
    details:
      'Heavy smoke spreading through staircase. 4 shop workers trapped on 3rd floor rooftop. Fire service ladder cannot enter narrow lane.',
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
    aiTriageSummary:
      'Urban high-density thermal smoke extraction. Aerial drone thermal scanner deployed to map alternative roof-to-roof egress.',
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
    lat: 21.821,
    lng: 91.859,
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
    lat: 24.901,
    lng: 91.892,
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
      lat: 25.066,
      lng: 91.407,
      zoneName: 'Sunamganj Sadar Hospital Waterway',
    },
    radioFreq: '156.800 MHz (VHF Ch 16 / FSCD Net)',
    equipment: [
      '3x 40HP Inflatable Skiffs',
      'Drysuits & Life Jackets',
      'Thermal Underwater Search Sonar',
      'Trauma First Aid',
    ],
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
      lat: 21.821,
      lng: 91.859,
      zoneName: 'Kutubdia Coastal CPP Station',
    },
    radioFreq: '143.900 MHz (BDRCS Disaster Net)',
    equipment: [
      'Megaphones & Signal Flags',
      'High-Angle Evacuation Ropes',
      'Stretcher Carriers',
      'Emergency Satellite Phone',
    ],
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
    equipment: [
      'MI-17 Medevac Helicopter',
      'BTR Amphibious APCs',
      'Mobile Field Surgical Unit',
      'Water Purification Bladders',
    ],
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
      lat: 23.719,
      lng: 90.392,
      zoneName: 'Chawkbazar Fireground Staging Post',
    },
    radioFreq: 'FSCD Tactical UHF Channel 4',
    equipment: [
      'Hydraulic Concrete Breakers',
      'Thermal FLIR Drones',
      'Chemical HAZMAT Suits',
      'Positive Pressure Ventilators',
    ],
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
    allocatedCause:
      'Coastal Cyclone Embankment Emergency Sandbag Reinforcement & Kutubdia Food Grants',
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
    allocatedCause:
      'Emergency Family Warm Clothes & Sanitary Kits for Displaced Flood Mothers',
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

function mapPrismaDisaster(d: any): DisasterIncident {
  return {
    id: d.id,
    title: d.title,
    banglaTitle: d.banglaTitle || undefined,
    type: d.type as any,
    severity: d.severity as any,
    status: d.status as any,
    dataSource: d.dataSource as any,
    isDemo: Boolean(d.isDemo),
    citation: d.citation ? (d.citation as any) : undefined,
    location: d.location as any,
    affectedPopulation: d.affectedPopulation || 0,
    casualtiesReported: d.casualtiesReported || 0,
    respondersDeployed: d.respondersDeployed || 0,
    reportedAt: d.reportedAt instanceof Date ? d.reportedAt.toISOString() : String(d.reportedAt),
    occurredAt: d.occurredAt
      ? d.occurredAt instanceof Date
        ? d.occurredAt.toISOString()
        : String(d.occurredAt)
      : undefined,
    description: d.description,
    recommendedEvacuationRadiusKm: d.recommendedEvacuationRadiusKm || 10,
    activeHazards: Array.isArray(d.activeHazards) ? d.activeHazards : [],
  };
}

function mapPrismaSOS(s: any): SOSRequest {
  return {
    id: s.id,
    reporterName: s.reporterName,
    phone: s.phone,
    contactPhone: s.contactPhone || undefined,
    disasterId: s.disasterId || undefined,
    location: s.location as any,
    urgencyScore: s.urgencyScore || 50,
    priority: s.priority as any,
    status: s.status as any,
    details: s.details,
    description: s.description || undefined,
    imageUrl: s.imageUrl || undefined,
    videoUrl: s.videoUrl || undefined,
    voiceNoteUrl: s.voiceNoteUrl || undefined,
    trappedCount: s.trappedCount || 0,
    injuriesCount: s.injuriesCount || 0,
    specialNeeds: Array.isArray(s.specialNeeds) ? s.specialNeeds : [],
    needsBoat: Boolean(s.needsBoat),
    needsMedical: Boolean(s.needsMedical),
    needsFoodWater: Boolean(s.needsFoodWater),
    assignedTeamId: s.assignedTeamId || undefined,
    assignedTeamName: s.assignedTeamName || undefined,
    aiTriageSummary: s.aiTriageSummary || undefined,
    dispatchEtaMinutes: s.dispatchEtaMinutes || undefined,
    aiDamageAssessment: s.aiDamageAssessment ? (s.aiDamageAssessment as any) : undefined,
    aiSeverity: s.aiSeverity ? (s.aiSeverity as any) : undefined,
    assignedTo: s.assignedTo ? (s.assignedTo as any) : undefined,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
    updatedAt: s.updatedAt
      ? s.updatedAt instanceof Date
        ? s.updatedAt.toISOString()
        : String(s.updatedAt)
      : undefined,
  };
}

function mapPrismaShelter(s: any): Shelter {
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    capacity: s.capacity,
    currentOccupancy: s.currentOccupancy || 0,
    hasMedical: Boolean(s.hasMedical),
    hasFood: Boolean(s.hasFood),
    hasWater: Boolean(s.hasWater),
    hasPower: Boolean(s.hasPower),
    isPetFriendly: Boolean(s.isPetFriendly),
    hasSupplies: Boolean(s.hasSupplies),
    contactPhone: s.contactPhone || undefined,
    contactNumber: s.contactNumber || undefined,
    managedByNGO: s.managedByNGO || undefined,
    status: s.status as any,
    updatedAt: s.updatedAt
      ? s.updatedAt instanceof Date
        ? s.updatedAt.toISOString()
        : String(s.updatedAt)
      : undefined,
  };
}

function mapPrismaSupply(s: any): SupplyItem {
  return {
    id: s.id,
    name: s.name,
    category: s.category as any,
    quantity: s.quantity,
    unit: s.unit,
    warehouseLocation: s.warehouseLocation,
    status: s.status as any,
    threshold: s.threshold,
    allocated: s.allocated,
  };
}

function mapPrismaResponder(r: any): ResponderTeam {
  return {
    id: r.id,
    name: r.name,
    leadName: r.leadName,
    type: r.type as any,
    membersCount: r.membersCount,
    status: r.status as any,
    currentIncidentId: r.currentIncidentId || undefined,
    assignedSOSId: r.assignedSOSId || undefined,
    currentLocation: r.currentLocation as any,
    radioFreq: r.radioFreq,
    equipment: Array.isArray(r.equipment) ? r.equipment : [],
    lastCheckIn: r.lastCheckIn instanceof Date ? r.lastCheckIn.toISOString() : String(r.lastCheckIn),
  };
}

function mapPrismaDonation(d: any): AidDonation {
  return {
    id: d.id,
    donorName: d.donorName,
    donorEmail: d.donorEmail || undefined,
    amount: d.amount,
    currency: d.currency,
    timestamp: d.timestamp instanceof Date ? d.timestamp.toISOString() : String(d.timestamp),
    allocatedCause: d.allocatedCause,
    impactMetric: d.impactMetric,
    txHash: d.txHash,
    channel: d.channel || undefined,
    isVerified: Boolean(d.isVerified),
  };
}

let hasInitializedPrisma = false;
async function initDb() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !isDatabaseConfigured()) {
    throw new DatabaseUnavailableError('FATAL: DATABASE_URL is required and cannot be empty in production.');
  }

  if (hasInitializedPrisma) return;

  if (isDatabaseConfigured()) {
    try {
      // Disasters seeding
      const disasterCount = await prisma.disasterIncident.count();
      if (disasterCount === 0) {
        for (const item of initialDisasters) {
          await prisma.disasterIncident.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              title: item.title,
              banglaTitle: item.banglaTitle,
              type: item.type as any,
              severity: item.severity as any,
              status: item.status as any,
              dataSource: item.dataSource as any,
              isDemo: item.isDemo || false,
              citation: item.citation ? (item.citation as any) : undefined,
              location: item.location as any,
              affectedPopulation: item.affectedPopulation,
              casualtiesReported: item.casualtiesReported,
              respondersDeployed: item.respondersDeployed,
              reportedAt: new Date(item.reportedAt),
              occurredAt: item.occurredAt ? new Date(item.occurredAt) : undefined,
              description: item.description,
              recommendedEvacuationRadiusKm: item.recommendedEvacuationRadiusKm,
              activeHazards: item.activeHazards || [],
            },
          });
        }
      }

      // SOS requests seeding
      const sosCount = await prisma.sOSRequest.count();
      if (sosCount === 0) {
        for (const item of initialSOSRequests) {
          await prisma.sOSRequest.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              reporterName: item.reporterName,
              phone: item.phone,
              contactPhone: item.contactPhone,
              disasterId: item.disasterId,
              location: item.location as any,
              urgencyScore: item.urgencyScore,
              priority: item.priority as any,
              status: item.status as any,
              details: item.details,
              description: item.description,
              imageUrl: item.imageUrl,
              trappedCount: item.trappedCount,
              injuriesCount: item.injuriesCount,
              specialNeeds: item.specialNeeds || [],
              needsBoat: item.needsBoat,
              needsMedical: item.needsMedical,
              needsFoodWater: item.needsFoodWater,
              assignedTeamId: item.assignedTeamId,
              assignedTeamName: item.assignedTeamName,
              aiTriageSummary: item.aiTriageSummary,
              dispatchEtaMinutes: item.dispatchEtaMinutes,
              createdAt: new Date(item.createdAt),
            },
          });
        }
      }

      // Shelters seeding
      const shelterCount = await prisma.shelter.count();
      if (shelterCount === 0) {
        for (const item of initialShelters) {
          await prisma.shelter.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              name: item.name,
              address: item.address,
              lat: item.lat,
              lng: item.lng,
              capacity: item.capacity,
              currentOccupancy: item.currentOccupancy,
              hasMedical: item.hasMedical,
              hasFood: item.hasFood ?? true,
              hasWater: item.hasWater ?? true,
              hasPower: item.hasPower ?? false,
              isPetFriendly: item.isPetFriendly ?? false,
              hasSupplies: item.hasSupplies ?? true,
              contactPhone: item.contactPhone,
              contactNumber: item.contactNumber,
              managedByNGO: item.managedByNGO,
              status: item.status as any,
            },
          });
        }
      }

      // Supplies seeding
      const supplyCount = await prisma.supplyItem.count();
      if (supplyCount === 0) {
        for (const item of initialSupplies) {
          await prisma.supplyItem.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              name: item.name,
              category: item.category as any,
              quantity: item.quantity,
              unit: item.unit,
              warehouseLocation: item.warehouseLocation,
              status: item.status as any,
              threshold: item.threshold,
              allocated: item.allocated,
            },
          });
        }
      }

      // Responders seeding
      const responderCount = await prisma.responderTeam.count();
      if (responderCount === 0) {
        for (const item of initialResponders) {
          await prisma.responderTeam.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              name: item.name,
              leadName: item.leadName,
              type: item.type as any,
              membersCount: item.membersCount,
              status: item.status as any,
              currentIncidentId: item.currentIncidentId,
              assignedSOSId: item.assignedSOSId,
              currentLocation: item.currentLocation as any,
              radioFreq: item.radioFreq,
              equipment: item.equipment || [],
              lastCheckIn: new Date(item.lastCheckIn),
            },
          });
        }
      }

      // Donations seeding
      const donationCount = await prisma.aidDonation.count();
      if (donationCount === 0) {
        for (const item of initialDonations) {
          await prisma.aidDonation.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              donorName: item.donorName,
              donorEmail: item.donorEmail,
              amount: item.amount,
              currency: item.currency,
              timestamp: new Date(item.timestamp),
              allocatedCause: item.allocatedCause,
              impactMetric: item.impactMetric,
              txHash: item.txHash,
              channel: item.channel,
              isVerified: true,
            },
          });
        }
      }

      hasInitializedPrisma = true;
    } catch (e) {
      hasInitializedPrisma = false;
      if (isProduction) {
        console.error('[ReliefAI DB] Failed to establish database connection:', e instanceof Error ? e.message : e);
        throw isDatabaseUnavailableError(e)
          ? e
          : new DatabaseUnavailableError('Failed to establish database connection in production.');
      }
      console.warn('[ReliefAI DB] PostgreSQL connection skipped, running in-memory fallback:', e);
    }
  }
}

export const db = {
  // Disasters
  async getDisasters(): Promise<DisasterIncident[]> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const items = await prisma.disasterIncident.findMany({
          orderBy: { reportedAt: 'desc' },
        });
        if (items && items.length > 0) {
          return items.map((d) => mapPrismaDisaster(d));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching disasters.');
        }
        console.warn('Prisma read disasters failed, using in-memory store:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return [...dbInstance.disasters];
  },

  async getDisaster(id: string): Promise<DisasterIncident | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const item = await prisma.disasterIncident.findUnique({
          where: { id },
        });
        if (item) return mapPrismaDisaster(item);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching disaster.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return dbInstance.disasters.find((d) => d.id === id);
  },

  async createDisaster(item: Omit<DisasterIncident, 'id' | 'reportedAt'>): Promise<DisasterIncident> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const newDisaster: DisasterIncident = {
      ...item,
      id: `dis-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.disasterIncident.create({
          data: {
            id: newDisaster.id,
            title: newDisaster.title,
            banglaTitle: newDisaster.banglaTitle,
            type: newDisaster.type as any,
            severity: newDisaster.severity as any,
            status: newDisaster.status as any,
            dataSource: newDisaster.dataSource as any,
            isDemo: newDisaster.isDemo || false,
            citation: newDisaster.citation ? (newDisaster.citation as any) : undefined,
            location: newDisaster.location as any,
            affectedPopulation: newDisaster.affectedPopulation,
            casualtiesReported: newDisaster.casualtiesReported,
            respondersDeployed: newDisaster.respondersDeployed,
            reportedAt: new Date(newDisaster.reportedAt),
            occurredAt: newDisaster.occurredAt ? new Date(newDisaster.occurredAt) : undefined,
            description: newDisaster.description,
            recommendedEvacuationRadiusKm: newDisaster.recommendedEvacuationRadiusKm,
            activeHazards: newDisaster.activeHazards || [],
          },
        });
        return mapPrismaDisaster(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating disaster.');
      }
    }

    dbInstance.disasters.unshift(newDisaster);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.disasterIncident.create({
          data: {
            id: newDisaster.id,
            title: newDisaster.title,
            banglaTitle: newDisaster.banglaTitle,
            type: newDisaster.type as any,
            severity: newDisaster.severity as any,
            status: newDisaster.status as any,
            dataSource: newDisaster.dataSource as any,
            isDemo: newDisaster.isDemo || false,
            citation: newDisaster.citation ? (newDisaster.citation as any) : undefined,
            location: newDisaster.location as any,
            affectedPopulation: newDisaster.affectedPopulation,
            casualtiesReported: newDisaster.casualtiesReported,
            respondersDeployed: newDisaster.respondersDeployed,
            reportedAt: new Date(newDisaster.reportedAt),
            occurredAt: newDisaster.occurredAt ? new Date(newDisaster.occurredAt) : undefined,
            description: newDisaster.description,
            recommendedEvacuationRadiusKm: newDisaster.recommendedEvacuationRadiusKm,
            activeHazards: newDisaster.activeHazards || [],
          },
        });
        return mapPrismaDisaster(created);
      } catch (err) {
        console.warn('Prisma create disaster failed, kept in memory:', err);
      }
    }
    return newDisaster;
  },

  async updateDisaster(id: string, updates: Partial<DisasterIncident>): Promise<DisasterIncident | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const dataToUpdate: any = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title;
    if (updates.banglaTitle !== undefined) dataToUpdate.banglaTitle = updates.banglaTitle;
    if (updates.type !== undefined) dataToUpdate.type = updates.type as any;
    if (updates.severity !== undefined) dataToUpdate.severity = updates.severity as any;
    if (updates.status !== undefined) dataToUpdate.status = updates.status as any;
    if (updates.location !== undefined) dataToUpdate.location = updates.location as any;
    if (updates.affectedPopulation !== undefined) dataToUpdate.affectedPopulation = updates.affectedPopulation;
    if (updates.casualtiesReported !== undefined) dataToUpdate.casualtiesReported = updates.casualtiesReported;
    if (updates.respondersDeployed !== undefined) dataToUpdate.respondersDeployed = updates.respondersDeployed;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.recommendedEvacuationRadiusKm !== undefined)
      dataToUpdate.recommendedEvacuationRadiusKm = updates.recommendedEvacuationRadiusKm;
    if (updates.activeHazards !== undefined) dataToUpdate.activeHazards = updates.activeHazards;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.disasterIncident.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaDisaster(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating disaster.');
      }
    }

    const index = dbInstance.disasters.findIndex((d) => d.id === id);
    if (index !== -1) {
      dbInstance.disasters[index] = { ...dbInstance.disasters[index], ...updates };
    }

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.disasterIncident.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaDisaster(updated);
      } catch (err) {
        console.warn('Prisma update disaster failed:', err);
      }
    }
    return dbInstance.disasters[index];
  },

  // SOS Requests
  async getSOSRequests(): Promise<SOSRequest[]> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const items = await prisma.sOSRequest.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (items && items.length > 0) {
          return items.map((s) => mapPrismaSOS(s));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching SOS requests.');
        }
        console.warn('Prisma read SOS failed, using in-memory store:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return [...dbInstance.sosRequests];
  },

  async getSOSRequest(id: string): Promise<SOSRequest | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const item = await prisma.sOSRequest.findUnique({
          where: { id },
        });
        if (item) return mapPrismaSOS(item);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching SOS request.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return dbInstance.sosRequests.find((s) => s.id === id);
  },

  async createSOSRequest(item: Omit<SOSRequest, 'id' | 'createdAt'>): Promise<SOSRequest> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const newSOS: SOSRequest = {
      ...item,
      id: `sos-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.sOSRequest.create({
          data: {
            id: newSOS.id,
            reporterName: newSOS.reporterName,
            phone: newSOS.phone,
            contactPhone: newSOS.contactPhone,
            disasterId: newSOS.disasterId,
            location: newSOS.location as any,
            urgencyScore: newSOS.urgencyScore,
            priority: newSOS.priority as any,
            status: newSOS.status as any,
            details: newSOS.details,
            description: newSOS.description,
            imageUrl: newSOS.imageUrl,
            videoUrl: newSOS.videoUrl,
            voiceNoteUrl: newSOS.voiceNoteUrl,
            trappedCount: newSOS.trappedCount,
            injuriesCount: newSOS.injuriesCount,
            specialNeeds: newSOS.specialNeeds || [],
            needsBoat: newSOS.needsBoat,
            needsMedical: newSOS.needsMedical,
            needsFoodWater: newSOS.needsFoodWater,
            assignedTeamId: newSOS.assignedTeamId,
            assignedTeamName: newSOS.assignedTeamName,
            aiTriageSummary: newSOS.aiTriageSummary,
            dispatchEtaMinutes: newSOS.dispatchEtaMinutes,
            aiDamageAssessment: newSOS.aiDamageAssessment ? (newSOS.aiDamageAssessment as any) : undefined,
            aiSeverity: newSOS.aiSeverity ? (newSOS.aiSeverity as any) : undefined,
            assignedTo: newSOS.assignedTo ? (newSOS.assignedTo as any) : undefined,
            createdAt: new Date(newSOS.createdAt),
          },
        });
        return mapPrismaSOS(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating SOS request.');
      }
    }

    dbInstance.sosRequests.unshift(newSOS);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.sOSRequest.create({
          data: {
            id: newSOS.id,
            reporterName: newSOS.reporterName,
            phone: newSOS.phone,
            contactPhone: newSOS.contactPhone,
            disasterId: newSOS.disasterId,
            location: newSOS.location as any,
            urgencyScore: newSOS.urgencyScore,
            priority: newSOS.priority as any,
            status: newSOS.status as any,
            details: newSOS.details,
            description: newSOS.description,
            imageUrl: newSOS.imageUrl,
            videoUrl: newSOS.videoUrl,
            voiceNoteUrl: newSOS.voiceNoteUrl,
            trappedCount: newSOS.trappedCount,
            injuriesCount: newSOS.injuriesCount,
            specialNeeds: newSOS.specialNeeds || [],
            needsBoat: newSOS.needsBoat,
            needsMedical: newSOS.needsMedical,
            needsFoodWater: newSOS.needsFoodWater,
            assignedTeamId: newSOS.assignedTeamId,
            assignedTeamName: newSOS.assignedTeamName,
            aiTriageSummary: newSOS.aiTriageSummary,
            dispatchEtaMinutes: newSOS.dispatchEtaMinutes,
            createdAt: new Date(newSOS.createdAt),
          },
        });
        return mapPrismaSOS(created);
      } catch (err) {
        console.warn('Prisma create SOS failed, kept in memory:', err);
      }
    }
    return newSOS;
  },

  async getSOS(id: string): Promise<SOSRequest | undefined> {
    return this.getSOSRequest(id);
  },

  async createSOS(
    item: Omit<SOSRequest, 'id' | 'createdAt'> | (Omit<SOSRequest, 'id' | 'createdAt' | 'status'> & { status?: SOSStatus })
  ): Promise<SOSRequest> {
    const fullItem = {
      ...item,
      status: (item as any).status || 'pending',
    } as Omit<SOSRequest, 'id' | 'createdAt'>;
    return this.createSOSRequest(fullItem);
  },

  async updateSOSStatus(
    id: string,
    status: SOSStatus,
    detailsOrTeamId?: { assignedTeamId?: string; assignedTeamName?: string; dispatchEtaMinutes?: number } | string,
    teamName?: string
  ): Promise<SOSRequest | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const details = typeof detailsOrTeamId === 'string'
      ? { assignedTeamId: detailsOrTeamId, assignedTeamName: teamName }
      : detailsOrTeamId;

    const dataToUpdate: any = {
      status: status as any,
    };
    if (details?.assignedTeamId !== undefined) dataToUpdate.assignedTeamId = details.assignedTeamId;
    if (details?.assignedTeamName !== undefined) dataToUpdate.assignedTeamName = details.assignedTeamName;
    if (details?.dispatchEtaMinutes !== undefined) dataToUpdate.dispatchEtaMinutes = details.dispatchEtaMinutes;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.sOSRequest.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaSOS(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating SOS status.');
      }
    }

    const item = dbInstance.sosRequests.find((s) => s.id === id);
    if (!item) return undefined;
    item.status = status;
    if (details?.assignedTeamId) item.assignedTeamId = details.assignedTeamId;
    if (details?.assignedTeamName) item.assignedTeamName = details.assignedTeamName;
    if (details?.dispatchEtaMinutes) item.dispatchEtaMinutes = details.dispatchEtaMinutes;

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.sOSRequest.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaSOS(updated);
      } catch (err) {
        console.warn('Prisma update SOS status failed:', err);
      }
    }
    return item;
  },

  async updateSOSRequest(id: string, updates: Partial<SOSRequest>): Promise<SOSRequest | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const dataToUpdate: any = {};
    if (updates.priority !== undefined) dataToUpdate.priority = updates.priority as any;
    if (updates.status !== undefined) dataToUpdate.status = updates.status as any;
    if (updates.urgencyScore !== undefined) dataToUpdate.urgencyScore = updates.urgencyScore;
    if (updates.details !== undefined) dataToUpdate.details = updates.details;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.assignedTeamId !== undefined) dataToUpdate.assignedTeamId = updates.assignedTeamId;
    if (updates.assignedTeamName !== undefined) dataToUpdate.assignedTeamName = updates.assignedTeamName;
    if (updates.dispatchEtaMinutes !== undefined) dataToUpdate.dispatchEtaMinutes = updates.dispatchEtaMinutes;
    if (updates.aiTriageSummary !== undefined) dataToUpdate.aiTriageSummary = updates.aiTriageSummary;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.sOSRequest.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaSOS(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating SOS request.');
      }
    }

    const index = dbInstance.sosRequests.findIndex((s) => s.id === id);
    if (index !== -1) {
      dbInstance.sosRequests[index] = { ...dbInstance.sosRequests[index], ...updates };
    }

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.sOSRequest.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaSOS(updated);
      } catch (err) {
        console.warn('Prisma update SOS failed:', err);
      }
    }
    return dbInstance.sosRequests[index];
  },

  async assignSOSTeam(
    sosId: string,
    teamId: string,
    teamName?: string,
    etaMinutes: number = 15
  ): Promise<SOSRequest | undefined> {
    const updated = await this.updateSOSStatus(sosId, 'dispatched', {
      assignedTeamId: teamId,
      assignedTeamName: teamName || 'Rescue Unit',
      dispatchEtaMinutes: etaMinutes,
    });
    await this.assignResponderToSOS(teamId, sosId);
    return updated;
  },

  // Shelters
  async getShelters(): Promise<Shelter[]> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const items = await prisma.shelter.findMany({
          orderBy: { name: 'asc' },
        });
        if (items && items.length > 0) {
          return items.map((s) => mapPrismaShelter(s));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching shelters.');
        }
        console.warn('Prisma read shelters failed, using in-memory store:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return [...dbInstance.shelters];
  },

  async getShelter(id: string): Promise<Shelter | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const item = await prisma.shelter.findUnique({
          where: { id },
        });
        if (item) return mapPrismaShelter(item);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching shelter.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return dbInstance.shelters.find((s) => s.id === id);
  },

  async createShelter(item: Omit<Shelter, 'id'>): Promise<Shelter> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const newShelter: Shelter = {
      ...item,
      id: `she-${Date.now()}`,
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.shelter.create({
          data: {
            id: newShelter.id,
            name: newShelter.name,
            address: newShelter.address,
            lat: newShelter.lat,
            lng: newShelter.lng,
            capacity: newShelter.capacity,
            currentOccupancy: newShelter.currentOccupancy || 0,
            hasMedical: newShelter.hasMedical,
            hasFood: newShelter.hasFood ?? true,
            hasWater: newShelter.hasWater ?? true,
            hasPower: newShelter.hasPower ?? false,
            isPetFriendly: newShelter.isPetFriendly ?? false,
            hasSupplies: newShelter.hasSupplies ?? true,
            contactPhone: newShelter.contactPhone,
            contactNumber: newShelter.contactNumber,
            managedByNGO: newShelter.managedByNGO,
            status: newShelter.status as any,
          },
        });
        return mapPrismaShelter(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating shelter.');
      }
    }

    dbInstance.shelters.push(newShelter);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.shelter.create({
          data: {
            id: newShelter.id,
            name: newShelter.name,
            address: newShelter.address,
            lat: newShelter.lat,
            lng: newShelter.lng,
            capacity: newShelter.capacity,
            currentOccupancy: newShelter.currentOccupancy || 0,
            hasMedical: newShelter.hasMedical,
            hasFood: newShelter.hasFood ?? true,
            hasWater: newShelter.hasWater ?? true,
            hasPower: newShelter.hasPower ?? false,
            isPetFriendly: newShelter.isPetFriendly ?? false,
            hasSupplies: newShelter.hasSupplies ?? true,
            contactPhone: newShelter.contactPhone,
            contactNumber: newShelter.contactNumber,
            managedByNGO: newShelter.managedByNGO,
            status: newShelter.status as any,
          },
        });
        return mapPrismaShelter(created);
      } catch (err) {
        console.warn('Prisma create shelter failed, kept in memory:', err);
      }
    }
    return newShelter;
  },

  async updateShelterOccupancy(id: string, currentOccupancy: number): Promise<Shelter | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const shelter = await prisma.shelter.findUnique({ where: { id } });
        if (!shelter) return undefined;

        let status = shelter.status;
        if (currentOccupancy >= shelter.capacity) status = 'full';
        else if (currentOccupancy >= shelter.capacity * 0.9) status = 'nearing_capacity';
        else status = 'open';

        const updated = await prisma.shelter.update({
          where: { id },
          data: { currentOccupancy, status: status as any },
        });
        return mapPrismaShelter(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating shelter occupancy.');
      }
    }

    const item = dbInstance.shelters.find((s) => s.id === id);
    if (!item) return undefined;
    item.currentOccupancy = currentOccupancy;
    if (currentOccupancy >= item.capacity) item.status = 'full';
    else if (currentOccupancy >= item.capacity * 0.9) item.status = 'nearing_capacity';
    else item.status = 'open';

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.shelter.update({
          where: { id },
          data: { currentOccupancy, status: item.status as any },
        });
        return mapPrismaShelter(updated);
      } catch (err) {
        console.warn('Prisma update shelter occupancy failed:', err);
      }
    }
    return item;
  },

  async updateShelter(id: string, updates: Partial<Shelter>): Promise<Shelter | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.address !== undefined) dataToUpdate.address = updates.address;
    if (updates.capacity !== undefined) dataToUpdate.capacity = updates.capacity;
    if (updates.currentOccupancy !== undefined) dataToUpdate.currentOccupancy = updates.currentOccupancy;
    if (updates.hasMedical !== undefined) dataToUpdate.hasMedical = updates.hasMedical;
    if (updates.hasFood !== undefined) dataToUpdate.hasFood = updates.hasFood;
    if (updates.hasWater !== undefined) dataToUpdate.hasWater = updates.hasWater;
    if (updates.hasPower !== undefined) dataToUpdate.hasPower = updates.hasPower;
    if (updates.isPetFriendly !== undefined) dataToUpdate.isPetFriendly = updates.isPetFriendly;
    if (updates.status !== undefined) dataToUpdate.status = updates.status as any;
    if (updates.contactPhone !== undefined) dataToUpdate.contactPhone = updates.contactPhone;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.shelter.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaShelter(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating shelter.');
      }
    }

    const index = dbInstance.shelters.findIndex((s) => s.id === id);
    if (index !== -1) {
      dbInstance.shelters[index] = { ...dbInstance.shelters[index], ...updates };
    }

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.shelter.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaShelter(updated);
      } catch (err) {
        console.warn('Prisma update shelter failed:', err);
      }
    }
    return dbInstance.shelters[index];
  },

  // Supplies
  async getSupplies(): Promise<SupplyItem[]> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const items = await prisma.supplyItem.findMany({
          orderBy: { name: 'asc' },
        });
        if (items && items.length > 0) {
          return items.map((s) => mapPrismaSupply(s));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching supplies.');
        }
        console.warn('Prisma read supplies failed, using in-memory store:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return [...dbInstance.supplies];
  },

  async getSupply(id: string): Promise<SupplyItem | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const item = await prisma.supplyItem.findUnique({
          where: { id },
        });
        if (item) return mapPrismaSupply(item);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching supply item.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return dbInstance.supplies.find((s) => s.id === id);
  },

  async dispatchSupply(id: string, quantity: number): Promise<SupplyItem | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const item = await prisma.supplyItem.findUnique({ where: { id } });
        if (!item) return undefined;

        const newQuantity = Math.max(0, item.quantity - quantity);
        const newAllocated = item.allocated + quantity;
        let status = item.status;
        if (newQuantity <= item.threshold * 0.3) status = 'critical';
        else if (newQuantity <= item.threshold) status = 'low';
        else status = 'adequate';

        const updated = await prisma.supplyItem.update({
          where: { id },
          data: {
            quantity: newQuantity,
            allocated: newAllocated,
            status: status as any,
          },
        });
        return mapPrismaSupply(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while dispatching supply.');
      }
    }

    const item = dbInstance.supplies.find((s) => s.id === id);
    if (!item) return undefined;
    item.quantity = Math.max(0, item.quantity - quantity);
    item.allocated += quantity;
    if (item.quantity <= item.threshold * 0.3) item.status = 'critical';
    else if (item.quantity <= item.threshold) item.status = 'low';
    else item.status = 'adequate';

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.supplyItem.update({
          where: { id },
          data: {
            quantity: item.quantity,
            allocated: item.allocated,
            status: item.status as any,
          },
        });
        return mapPrismaSupply(updated);
      } catch (err) {
        console.warn('Prisma dispatch supply failed:', err);
      }
    }
    return item;
  },

  async restockSupply(id: string, quantity: number): Promise<SupplyItem | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const item = await prisma.supplyItem.findUnique({ where: { id } });
        if (!item) return undefined;

        const newQuantity = item.quantity + quantity;
        let status = item.status;
        if (newQuantity <= item.threshold * 0.3) status = 'critical';
        else if (newQuantity <= item.threshold) status = 'low';
        else status = 'adequate';

        const updated = await prisma.supplyItem.update({
          where: { id },
          data: {
            quantity: newQuantity,
            status: status as any,
          },
        });
        return mapPrismaSupply(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while restocking supply.');
      }
    }

    const item = dbInstance.supplies.find((s) => s.id === id);
    if (!item) return undefined;
    item.quantity += quantity;
    if (item.quantity <= item.threshold * 0.3) item.status = 'critical';
    else if (item.quantity <= item.threshold) item.status = 'low';
    else item.status = 'adequate';

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.supplyItem.update({
          where: { id },
          data: {
            quantity: item.quantity,
            status: item.status as any,
          },
        });
        return mapPrismaSupply(updated);
      } catch (err) {
        console.warn('Prisma restock supply failed:', err);
      }
    }
    return item;
  },

  async updateSupply(id: string, updates: Partial<SupplyItem>): Promise<SupplyItem | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.category !== undefined) dataToUpdate.category = updates.category as any;
    if (updates.quantity !== undefined) dataToUpdate.quantity = updates.quantity;
    if (updates.unit !== undefined) dataToUpdate.unit = updates.unit;
    if (updates.warehouseLocation !== undefined) dataToUpdate.warehouseLocation = updates.warehouseLocation;
    if (updates.status !== undefined) dataToUpdate.status = updates.status as any;
    if (updates.threshold !== undefined) dataToUpdate.threshold = updates.threshold;
    if (updates.allocated !== undefined) dataToUpdate.allocated = updates.allocated;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.supplyItem.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaSupply(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating supply item.');
      }
    }

    const index = dbInstance.supplies.findIndex((s) => s.id === id);
    if (index !== -1) {
      dbInstance.supplies[index] = { ...dbInstance.supplies[index], ...updates };
    }

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.supplyItem.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaSupply(updated);
      } catch (err) {
        console.warn('Prisma update supply failed:', err);
      }
    }
    return dbInstance.supplies[index];
  },

  // Responders
  async getResponders(): Promise<ResponderTeam[]> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const items = await prisma.responderTeam.findMany({
          orderBy: { name: 'asc' },
        });
        if (items && items.length > 0) {
          return items.map((r) => mapPrismaResponder(r));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching responders.');
        }
        console.warn('Prisma read responders failed, using in-memory store:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return [...dbInstance.responders];
  },

  async getResponder(id: string): Promise<ResponderTeam | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const item = await prisma.responderTeam.findUnique({
          where: { id },
        });
        if (item) return mapPrismaResponder(item);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching responder team.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return dbInstance.responders.find((r) => r.id === id);
  },

  async updateResponderStatus(id: string, status: TeamStatus): Promise<ResponderTeam | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const lastCheckIn = new Date().toISOString();

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.responderTeam.update({
          where: { id },
          data: { status: status as any, lastCheckIn: new Date(lastCheckIn) },
        });
        return mapPrismaResponder(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating responder status.');
      }
    }

    const item = dbInstance.responders.find((r) => r.id === id);
    if (!item) return undefined;
    item.status = status;
    item.lastCheckIn = lastCheckIn;

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.responderTeam.update({
          where: { id },
          data: { status: status as any, lastCheckIn: new Date(lastCheckIn) },
        });
        return mapPrismaResponder(updated);
      } catch (err) {
        console.warn('Prisma update responder status failed:', err);
      }
    }
    return item;
  },

  async updateResponderLocation(
    id: string,
    lat: number,
    lng: number,
    zoneName: string
  ): Promise<ResponderTeam | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const lastCheckIn = new Date().toISOString();
    const currentLocation = { lat, lng, zoneName };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.responderTeam.update({
          where: { id },
          data: {
            currentLocation: currentLocation as any,
            lastCheckIn: new Date(lastCheckIn),
          },
        });
        return mapPrismaResponder(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating responder location.');
      }
    }

    const item = dbInstance.responders.find((r) => r.id === id);
    if (!item) return undefined;
    item.currentLocation = currentLocation;
    item.lastCheckIn = lastCheckIn;

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.responderTeam.update({
          where: { id },
          data: {
            currentLocation: currentLocation as any,
            lastCheckIn: new Date(lastCheckIn),
          },
        });
        return mapPrismaResponder(updated);
      } catch (err) {
        console.warn('Prisma update responder location failed:', err);
      }
    }
    return item;
  },

  async assignResponderToSOS(
    responderId: string,
    sosId: string,
    incidentId?: string
  ): Promise<ResponderTeam | undefined> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const lastCheckIn = new Date().toISOString();

    const dataToUpdate: any = {
      status: 'dispatched',
      assignedSOSId: sosId,
      lastCheckIn: new Date(lastCheckIn),
    };
    if (incidentId) dataToUpdate.currentIncidentId = incidentId;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.responderTeam.update({
          where: { id: responderId },
          data: dataToUpdate,
        });
        return mapPrismaResponder(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while assigning responder to SOS.');
      }
    }

    const item = dbInstance.responders.find((r) => r.id === responderId);
    if (!item) return undefined;
    item.status = 'dispatched';
    item.assignedSOSId = sosId;
    if (incidentId) item.currentIncidentId = incidentId;
    item.lastCheckIn = lastCheckIn;

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.responderTeam.update({
          where: { id: responderId },
          data: dataToUpdate,
        });
        return mapPrismaResponder(updated);
      } catch (err) {
        console.warn('Prisma assign responder failed:', err);
      }
    }
    return item;
  },

  async dispatchResponder(
    teamId: string,
    incidentId: string,
    sosId: string
  ): Promise<ResponderTeam | undefined> {
    return this.assignResponderToSOS(teamId, sosId, incidentId);
  },

  async createResponder(item: Omit<ResponderTeam, 'id' | 'lastCheckIn'>): Promise<ResponderTeam> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const newResponder: ResponderTeam = {
      ...item,
      id: `team-${Date.now()}`,
      lastCheckIn: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.responderTeam.create({
          data: {
            id: newResponder.id,
            name: newResponder.name,
            leadName: newResponder.leadName,
            type: newResponder.type as any,
            membersCount: newResponder.membersCount,
            status: newResponder.status as any,
            currentIncidentId: newResponder.currentIncidentId,
            assignedSOSId: newResponder.assignedSOSId,
            currentLocation: newResponder.currentLocation as any,
            radioFreq: newResponder.radioFreq,
            equipment: newResponder.equipment || [],
            lastCheckIn: new Date(newResponder.lastCheckIn),
          },
        });
        return mapPrismaResponder(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating responder team.');
      }
    }

    dbInstance.responders.push(newResponder);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.responderTeam.create({
          data: {
            id: newResponder.id,
            name: newResponder.name,
            leadName: newResponder.leadName,
            type: newResponder.type as any,
            membersCount: newResponder.membersCount,
            status: newResponder.status as any,
            currentIncidentId: newResponder.currentIncidentId,
            assignedSOSId: newResponder.assignedSOSId,
            currentLocation: newResponder.currentLocation as any,
            radioFreq: newResponder.radioFreq,
            equipment: newResponder.equipment || [],
            lastCheckIn: new Date(newResponder.lastCheckIn),
          },
        });
        return mapPrismaResponder(created);
      } catch (err) {
        console.warn('Prisma create responder failed, kept in memory:', err);
      }
    }
    return newResponder;
  },

  // Donations
  async getDonations(): Promise<AidDonation[]> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const items = await prisma.aidDonation.findMany({
          orderBy: { timestamp: 'desc' },
        });
        if (items && items.length > 0) {
          return items.map((d) => mapPrismaDonation(d));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching donations.');
        }
        console.warn('Prisma read donations failed, using in-memory store:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return [...dbInstance.donations];
  },

  async createDonation(item: Omit<AidDonation, 'id' | 'timestamp' | 'txHash'>): Promise<AidDonation> {
    await initDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const newDonation: AidDonation = {
      ...item,
      id: `don-${Date.now()}`,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.aidDonation.create({
          data: {
            id: newDonation.id,
            donorName: newDonation.donorName,
            donorEmail: newDonation.donorEmail,
            amount: newDonation.amount,
            currency: newDonation.currency,
            timestamp: new Date(newDonation.timestamp),
            allocatedCause: newDonation.allocatedCause,
            impactMetric: newDonation.impactMetric,
            txHash: newDonation.txHash,
            channel: newDonation.channel,
            isVerified: true,
          },
        });
        return mapPrismaDonation(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating donation.');
      }
    }

    dbInstance.donations.unshift(newDonation);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.aidDonation.create({
          data: {
            id: newDonation.id,
            donorName: newDonation.donorName,
            donorEmail: newDonation.donorEmail,
            amount: newDonation.amount,
            currency: newDonation.currency,
            timestamp: new Date(newDonation.timestamp),
            allocatedCause: newDonation.allocatedCause,
            impactMetric: newDonation.impactMetric,
            txHash: newDonation.txHash,
            channel: newDonation.channel,
            isVerified: true,
          },
        });
        return mapPrismaDonation(created);
      } catch (err) {
        console.warn('Prisma create donation failed:', err);
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
