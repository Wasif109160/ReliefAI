/**
 * Centralized Bangladesh Asset Registry for ReliefAI
 * Automatically maps and optimizes assets from /public/assets/
 */

export const ASSETS = {
  // National Geospatial & River Identity
  mapArtwork: '/assets/bangladesh-map-artwork-free-vector.jpg',
  padmaRiver: '/assets/padma_river.jpg',
  dhakaCity: '/assets/dhaka.jpg',
  greenAreas: '/assets/green%20areas.jpg',
  ruralRoad: '/assets/rural_road.jpg',

  // Disaster Scenarios
  flood: '/assets/flood.jpg',
  cycloneShelter: '/assets/cyclone%20shelter.jpg',

  // Emergency Services & Rescue Fleet
  rescueOperation: '/assets/Rescue_operation.jpg',
  fireService: '/assets/fire%20service.jpg',
  ambulance: '/assets/Ambulance.jpg',
  police: '/assets/police.jpg',
  hospital: '/assets/hospital.jpg',

  // Environmental Protection & Pollution
  wasteDumping: '/assets/waste_dumping.webp',
  waterPollution: '/assets/water_pollution.webp',
} as const;

export interface AssetMeta {
  src: string;
  title: string;
  banglaTitle: string;
  category: 'disaster' | 'rescue' | 'environment' | 'infrastructure' | 'logistics';
  description: string;
}

export const ASSET_METADATA: Record<keyof typeof ASSETS, AssetMeta> = {
  mapArtwork: {
    src: ASSETS.mapArtwork,
    title: 'Sovereign Bangladesh Tactical Geo-Grid',
    banglaTitle: 'বাংলাদেশ জাতীয় দুর্যোগ মানচিত্র',
    category: 'infrastructure',
    description: 'High-fidelity geospatial grid covering 64 districts and 495 upazilas.',
  },
  padmaRiver: {
    src: ASSETS.padmaRiver,
    title: 'Padma River Hydrological Basin',
    banglaTitle: 'পদ্মা নদী অববাহিকা জলস্তর',
    category: 'environment',
    description: 'Major arterial waterway telemetry sensor monitoring zone.',
  },
  dhakaCity: {
    src: ASSETS.dhakaCity,
    title: 'Dhaka Metropolitan Megacity Complex',
    banglaTitle: 'ঢাকা মেগাসিটি রেজিলিয়েন্স',
    category: 'infrastructure',
    description: 'Dense urban center drainage, seismic resilience, and civil defense hub.',
  },
  greenAreas: {
    src: ASSETS.greenAreas,
    title: 'Lush Forest Canopies & Delta Biosphere',
    banglaTitle: 'সবুজ বনায়ন ও সুন্দরবন ইকোসিস্টেম',
    category: 'environment',
    description: 'Coastal mangrove belt and protected ecological buffer zones.',
  },
  ruralRoad: {
    src: ASSETS.ruralRoad,
    title: 'Rural Connectivity & Remote Relief Corridor',
    banglaTitle: 'গ্রামীণ যোগাযোগ ও ত্রাণ সরবরাহ রুট',
    category: 'logistics',
    description: 'Last-mile unpaved transport routes requiring specialized all-terrain rescue vehicles.',
  },
  flood: {
    src: ASSETS.flood,
    title: 'Surma-Jamuna Riverine Inundation',
    banglaTitle: 'সিলেট-সুনামগঞ্জ বন্যা প্লাবন',
    category: 'disaster',
    description: 'Submerged settlements under flash flood surge requiring immediate zodiac boat evacuation.',
  },
  cycloneShelter: {
    src: ASSETS.cycloneShelter,
    title: 'Coastal Reinforced Cyclone Shelter',
    banglaTitle: 'উপকূলীয় বহুমুখী ঘূর্ণিঝড় আশ্রয়কেন্দ্র',
    category: 'infrastructure',
    description: 'Engineered high-ground shelter designed to withstand Category 5 cyclone surges.',
  },
  rescueOperation: {
    src: ASSETS.rescueOperation,
    title: 'Tactical SAR Flood Extraction Operation',
    banglaTitle: 'বিপন্ন নাগরিক উদ্ধার অভিযান',
    category: 'rescue',
    description: 'Paramedic and diver squads conducting rooftop extractions with tactical lifeboats.',
  },
  fireService: {
    src: ASSETS.fireService,
    title: 'Bangladesh Fire Service & Civil Defence',
    banglaTitle: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স',
    category: 'rescue',
    description: 'Specialized heavy rescue vehicles, thermal cameras, and hydraulic cutting gear.',
  },
  ambulance: {
    src: ASSETS.ambulance,
    title: 'Trauma Medevac Emergency Unit',
    banglaTitle: 'জরুরি অ্যাম্বুলেন্স ও ট্রমা সেবা',
    category: 'rescue',
    description: 'ICU-equipped rapid medical transit unit with satellite telemetry.',
  },
  police: {
    src: ASSETS.police,
    title: 'Law Enforcement Crisis Containment Unit',
    banglaTitle: 'বাংলাদেশ পুলিশ নিরাপত্তা বলয়',
    category: 'rescue',
    description: 'Perimeter security, crowd stabilization, and emergency convoy escort.',
  },
  hospital: {
    src: ASSETS.hospital,
    title: 'District Trauma & Emergency Facility',
    banglaTitle: 'জেলা জরুরি হাসপাতাল ও ট্রমা সেন্টার',
    category: 'infrastructure',
    description: 'Primary disaster casualty intake center with critical oxygen supplies.',
  },
  wasteDumping: {
    src: ASSETS.wasteDumping,
    title: 'Urban Solid Waste & Canal Chokepoint',
    banglaTitle: 'কঠিন বর্জ্য ও ড্রেনেজ ব্লকেজ',
    category: 'environment',
    description: 'Blocked urban canals causing waterlogging and flash flooding in low-lying sectors.',
  },
  waterPollution: {
    src: ASSETS.waterPollution,
    title: 'Industrial Effluent & River Contamination',
    banglaTitle: 'বুড়িগঙ্গা-কর্ণফুলী নদী দূষণ পর্যবেক্ষণ',
    category: 'environment',
    description: 'Chemical and microplastic runoff monitored via IoT water quality probes.',
  },
};
