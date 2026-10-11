import mongoose, { Schema, Document, Model } from 'mongoose';
import { ResourceCategory } from '../types';

export interface ISupplyDocument extends Document {
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

const SupplySchema = new Schema<ISupplyDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['medical', 'rations', 'water', 'shelter_gear', 'vehicles', 'power', 'tents', 'generators', 'infant_kits'],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    warehouseLocation: { type: String, required: true },
    status: {
      type: String,
      enum: ['adequate', 'low', 'critical'],
      default: 'adequate',
      index: true,
    },
    threshold: { type: Number, default: 50 },
    allocated: { type: Number, default: 0 },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const SupplyModel: Model<ISupplyDocument> =
  mongoose.models.Supply || mongoose.model<ISupplyDocument>('Supply', SupplySchema);
