import mongoose, { Schema, Document, Model } from 'mongoose';
import { ResponderTeamType, TeamStatus } from '../types';

export interface IResponderDocument extends Document {
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

const ResponderSchema = new Schema<IResponderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    leadName: { type: String, required: true },
    type: {
      type: String,
      enum: ['medical_unit', 'swift_water', 'search_rescue', 'logistics', 'drone_recon'],
      required: true,
      index: true,
    },
    membersCount: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ['available', 'dispatched', 'en_route', 'on_scene', 'off_duty'],
      default: 'available',
      index: true,
    },
    currentIncidentId: { type: String },
    assignedSOSId: { type: String },
    currentLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      zoneName: { type: String, required: true },
    },
    radioFreq: { type: String, required: true },
    equipment: [{ type: String }],
    lastCheckIn: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const ResponderModel: Model<IResponderDocument> =
  mongoose.models.Responder || mongoose.model<IResponderDocument>('Responder', ResponderSchema);
