import mongoose, { Schema, Document, Model } from 'mongoose';
import { DisasterType, SeverityLevel, IncidentStatus } from '../types';

export interface IDisasterDocument extends Document {
  id: string;
  title: string;
  banglaTitle?: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: IncidentStatus;
  dataSource?: string;
  isDemo?: boolean;
  citation?: {
    sourceName: string;
    sourceUrl?: string;
    recordType: string;
    documentedYear?: number;
    verificationNotes?: string;
  };
  location: {
    name: string;
    lat: number;
    lng: number;
    radiusKm: number;
    division?: string;
    district?: string;
  };
  affectedPopulation: number;
  casualtiesReported: number;
  respondersDeployed: number;
  reportedAt: string;
  occurredAt?: string;
  description: string;
  recommendedEvacuationRadiusKm?: number;
  activeHazards?: string[];
}

const DisasterSchema = new Schema<IDisasterDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    banglaTitle: { type: String },
    type: {
      type: String,
      enum: ['flood', 'earthquake', 'wildfire', 'hurricane', 'industrial', 'medical', 'environmental'],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'moderate', 'low'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'contained', 'resolved'],
      default: 'active',
      index: true,
    },
    dataSource: {
      type: String,
      enum: ['historical', 'live', 'forecast', 'demo'],
      default: 'demo',
      index: true,
    },
    isDemo: { type: Boolean, default: false },
    citation: {
      sourceName: { type: String },
      sourceUrl: { type: String },
      recordType: { type: String },
      documentedYear: { type: Number },
      verificationNotes: { type: String },
    },
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      radiusKm: { type: Number, default: 10 },
      division: { type: String },
      district: { type: String },
    },
    affectedPopulation: { type: Number, default: 0 },
    casualtiesReported: { type: Number, default: 0 },
    respondersDeployed: { type: Number, default: 0 },
    reportedAt: { type: String, default: () => new Date().toISOString() },
    occurredAt: { type: String },
    description: { type: String, required: true },
    recommendedEvacuationRadiusKm: { type: Number },
    activeHazards: [{ type: String }],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const DisasterModel: Model<IDisasterDocument> =
  mongoose.models.Disaster || mongoose.model<IDisasterDocument>('Disaster', DisasterSchema);
