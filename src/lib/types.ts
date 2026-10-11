export type UserRole = 'citizen' | 'rescue_team' | 'ngo' | 'government' | 'admin' | 'volunteer' | 'commander' | 'responder';

export interface User {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isEmailVerified: boolean;
  badgeNumber?: string;
  organization?: string;
  phone?: string;
  phoneNumber?: string;
  skills?: string[];
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  assignedZone?: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type UserProfile = User;

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export type DisasterType = 'flood' | 'earthquake' | 'wildfire' | 'hurricane' | 'industrial' | 'medical' | 'environmental';
export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';
export type IncidentStatus = 'active' | 'contained' | 'resolved';

export interface DisasterIncident {
  id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: {
    name: string;
    lat: number;
    lng: number;
    radiusKm: number;
  };
  affectedPopulation: number;
  casualtiesReported: number;
  respondersDeployed: number;
  reportedAt: string;
  description: string;
  recommendedEvacuationRadiusKm: number;
  activeHazards: string[];
}

export type SOSPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SOSStatus = 'pending' | 'triaged' | 'dispatched' | 'assigned' | 'in_progress' | 'rescued' | 'resolved' | 'cancelled';

export interface AIDamageAssessment {
  damageType: string;
  damageSeverity: SeverityLevel;
  structuralRiskScore: number;
  detectedHazards: string[];
  estimatedSurvivorsTrapped: number;
  recommendations: string[];
  confidenceScore: number;
}

export interface AISeverityClassification {
  score: number;
  level: SeverityLevel;
  urgencyReason: string;
  requiredRescueUnits: string[];
  estimatedSOP: string;
}

export interface SOSRequest {
  id: string;
  reporterId?: string;
  reporterName: string;
  phone: string;
  contactPhone?: string;
  disasterId?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    zoneId?: string;
  };
  urgencyScore: number;
  priority: SOSPriority;
  status: SOSStatus;
  details: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  voiceNoteUrl?: string;
  language?: 'en' | 'bn';
  trappedCount: number;
  injuriesCount: number;
  injuredCount?: number;
  specialNeeds?: string[];
  needsBoat: boolean;
  needsMedical: boolean;
  needsFoodWater: boolean;
  createdAt: string;
  updatedAt?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  aiTriageSummary?: string;
  aiDamageAssessment?: AIDamageAssessment;
  aiSeverity?: AISeverityClassification;
  dispatchEtaMinutes?: number;
  assignedTo?: {
    teamId: string;
    teamName: string;
    responderType: 'volunteer' | 'ngo' | 'emergency_services' | 'rescue_team';
    etaMinutes?: number;
  };
}

export type SOSReport = SOSRequest;

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  hasMedical: boolean;
  hasFood: boolean;
  hasWater: boolean;
  hasPower: boolean;
  isPetFriendly: boolean;
  contactPhone: string;
  contactNumber?: string;
  managedByNGO?: string;
  status: 'open' | 'nearing_capacity' | 'full' | 'closed';
}

export type ShelterItem = Shelter;

export type ResourceCategory = 'medical' | 'rations' | 'water' | 'shelter_gear' | 'vehicles' | 'power' | 'tents' | 'generators' | 'infant_kits';

export interface SupplyItem {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;
  warehouseLocation: string;
  status: 'adequate' | 'low' | 'critical';
  threshold: number;
  allocated: number;
}

export type ResponderTeamType = 'medical_unit' | 'swift_water' | 'search_rescue' | 'logistics' | 'drone_recon';
export type TeamStatus = 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'off_duty';

export interface ResponderTeam {
  id: string;
  name: string;
  leadName: string;
  type: ResponderTeamType;
  membersCount: number;
  status: TeamStatus;
  currentIncidentId?: string;
  assignedSOSId?: string;
  currentLocation: {
    lat: number;
    lng: number;
    zoneName: string;
  };
  radioFreq: string;
  equipment: string[];
  lastCheckIn: string;
}

export interface AidDonation {
  id: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  timestamp: string;
  allocatedCause: string;
  impactMetric: string;
  impactMetrics?: string;
  txHash: string;
  transactionHash?: string;
  isVerified?: boolean;
}

export type DonationRecord = AidDonation;

export interface ReliefDistribution {
  id: string;
  ngoId: string;
  ngoName: string;
  itemCategory: 'medical' | 'rations' | 'water' | 'tents' | 'generators' | 'infant_kits';
  itemName: string;
  quantityDistributed: number;
  unit: string;
  targetShelterId?: string;
  targetZone: string;
  dispatchedAt: string;
  status: 'dispatched' | 'in_transit' | 'delivered';
  verifiedBy?: string;
}

export interface InAppNotification {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'all';
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  link?: string;
  timestamp: string;
  read: boolean;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: SeverityLevel;
  requiredSkill: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface AITriageAnalysis {
  urgencyScore: number;
  priority: SOSPriority;
  suggestedTeamType: ResponderTeamType;
  requiredEquipment: string[];
  triageSummary: string;
  evacuationFeasibility: 'immediate_airlift' | 'boat_rescue' | 'ground_ambulance' | 'shelter_in_place';
  estimatedSOPAction: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: 'command' | 'citizen';
  quickActions?: string[];
}
