import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShelterDocument extends Document {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  hasMedical: boolean;
  hasFood?: boolean;
  hasWater?: boolean;
  hasPower?: boolean;
  isPetFriendly: boolean;
  hasSupplies?: boolean;
  contactPhone?: string;
  contactNumber?: string;
  managedByNGO?: string;
  updatedAt?: string;
  status: 'open' | 'nearing_capacity' | 'full' | 'closed';
}

const ShelterSchema = new Schema<IShelterDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    hasMedical: { type: Boolean, default: false },
    hasFood: { type: Boolean, default: true },
    hasWater: { type: Boolean, default: true },
    hasPower: { type: Boolean, default: false },
    isPetFriendly: { type: Boolean, default: false },
    hasSupplies: { type: Boolean, default: true },
    contactPhone: { type: String },
    contactNumber: { type: String },
    managedByNGO: { type: String },
    updatedAt: { type: String },
    status: {
      type: String,
      enum: ['open', 'nearing_capacity', 'full', 'closed'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const ShelterModel: Model<IShelterDocument> =
  mongoose.models.Shelter || mongoose.model<IShelterDocument>('Shelter', ShelterSchema);
