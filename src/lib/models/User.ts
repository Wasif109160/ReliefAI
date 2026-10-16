import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '../types';

export interface IUserDocument extends Document {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl?: string;
  organization?: string;
  badgeNumber?: string;
  assignedTeamId?: string;
  phone?: string;
  assignedZone?: string;
  skills?: string[];
  location?: {
    name?: string;
    lat: number;
    lng: number;
  };
  failedLoginAttempts?: number;
  lockoutUntil?: string;
  status?: 'active' | 'pending_approval' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    displayName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ['citizen', 'rescue_team', 'ngo', 'government', 'admin', 'volunteer', 'commander', 'responder'],
      default: 'citizen',
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String },
    organization: { type: String },
    badgeNumber: { type: String },
    assignedTeamId: { type: String, index: true },
    phone: { type: String },
    assignedZone: { type: String },
    skills: [{ type: String }],
    location: {
      name: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: String },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'suspended'],
      default: 'active',
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
