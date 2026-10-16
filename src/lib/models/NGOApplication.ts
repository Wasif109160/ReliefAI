import mongoose, { Schema, Document, Model } from 'mongoose';
import { NGOApplication } from '../types';

export interface INGOApplicationDoc extends NGOApplication, Document {}

const NGOApplicationSchema = new Schema<INGOApplicationDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    organizationName: { type: String, required: true },
    registrationNumber: { type: String, required: true, index: true },
    focalPersonName: { type: String, required: true },
    focalPersonEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    focalPersonPhone: { type: String, required: true },
    website: { type: String },
    hqAddress: { type: String, required: true },
    operationalDistricts: [{ type: String }],
    reliefCapabilities: [{ type: String }],
    documentName: { type: String },
    documentData: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const NGOApplicationModel: Model<INGOApplicationDoc> =
  mongoose.models.NGOApplication || mongoose.model<INGOApplicationDoc>('NGOApplication', NGOApplicationSchema);
