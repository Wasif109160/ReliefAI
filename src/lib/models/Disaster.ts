import mongoose, { Schema, Document, Model } from 'mongoose';
import { DisasterType, SeverityLevel, IncidentStatus } from '../types';

export interface IDisasterDocument extends Document {
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
  recommendedEvacuationRadiusKm?: number;
  activeHazards?: string[];
}

const DisasterSchema = new Schema<IDisasterDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
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
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      radiusKm: { type: Number, default: 10 },
    },
    affectedPopulation: { type: Number, default: 0 },
    casualtiesReported: { type: Number, default: 0 },
    respondersDeployed: { type: Number, default: 0 },
    reportedAt: { type: String, default: () => new Date().toISOString() },
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
