import mongoose, { Schema, Document, Model } from 'mongoose';
import { SOSPriority, SOSStatus } from '../types';

export interface ISOSRequestDocument extends Document {
  id: string;
  reporterName: string;
  phone: string;
  contactPhone?: string;
  disasterId?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  urgencyScore: number;
  priority: SOSPriority;
  status: SOSStatus;
  details: string;
  description?: string;
  imageUrl?: string;
  trappedCount: number;
  injuriesCount: number;
  specialNeeds?: string[];
  needsBoat: boolean;
  needsMedical: boolean;
  needsFoodWater: boolean;
  createdAt: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  aiTriageSummary?: string;
  dispatchEtaMinutes?: number;
}

const SOSRequestSchema = new Schema<ISOSRequestDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    reporterName: { type: String, required: true },
    phone: { type: String, required: true },
    contactPhone: { type: String },
    disasterId: { type: String },
    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    urgencyScore: { type: Number, default: 50, index: true },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'triaged', 'dispatched', 'in_progress', 'rescued', 'resolved', 'cancelled'],
      default: 'pending',
      index: true,
    },
    details: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    trappedCount: { type: Number, default: 0 },
    injuriesCount: { type: Number, default: 0 },
    specialNeeds: [{ type: String }],
    needsBoat: { type: Boolean, default: false },
    needsMedical: { type: Boolean, default: false },
    needsFoodWater: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    assignedTeamId: { type: String },
    assignedTeamName: { type: String },
    aiTriageSummary: { type: String },
    dispatchEtaMinutes: { type: Number },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const SOSRequestModel: Model<ISOSRequestDocument> =
  mongoose.models.SOSRequest || mongoose.model<ISOSRequestDocument>('SOSRequest', SOSRequestSchema);
