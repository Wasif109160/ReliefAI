import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonationDocument extends Document {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  timestamp: string;
  allocatedCause: string;
  impactMetric: string;
  txHash: string;
  channel?: string;
}

const DonationSchema = new Schema<IDonationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    donorName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    timestamp: { type: String, default: () => new Date().toISOString() },
    allocatedCause: { type: String, required: true },
    impactMetric: { type: String, required: true },
    txHash: { type: String, required: true },
    channel: { type: String },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const DonationModel: Model<IDonationDocument> =
  mongoose.models.Donation || mongoose.model<IDonationDocument>('Donation', DonationSchema);
