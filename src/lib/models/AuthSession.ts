import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  UserSession,
  RefreshTokenRecord,
  PasswordResetToken,
  EmailVerificationToken,
} from '../types';

export interface IUserSessionDoc extends UserSession, Document {}
export interface IRefreshTokenDoc extends RefreshTokenRecord, Document {}
export interface IPasswordResetDoc extends PasswordResetToken, Document {}
export interface IEmailVerificationDoc extends EmailVerificationToken, Document {}

const UserSessionSchema = new Schema<IUserSessionDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    expiresAt: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false, versionKey: false }
);

const RefreshTokenSchema = new Schema<IRefreshTokenDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    familyId: { type: String, required: true, index: true },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false, versionKey: false }
);

const PasswordResetSchema = new Schema<IPasswordResetDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    otp: { type: String, index: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: String, required: true },
    usedAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false, versionKey: false }
);

const EmailVerificationSchema = new Schema<IEmailVerificationDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    token: { type: String },
    otp: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset', 'login_verify', 'email_change', 'activation'],
      default: 'email_verification',
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: String, required: true },
    usedAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false, versionKey: false }
);

export const UserSessionModel: Model<IUserSessionDoc> =
  mongoose.models.UserSession || mongoose.model<IUserSessionDoc>('UserSession', UserSessionSchema);

export const RefreshTokenModel: Model<IRefreshTokenDoc> =
  mongoose.models.RefreshToken || mongoose.model<IRefreshTokenDoc>('RefreshToken', RefreshTokenSchema);

export const PasswordResetTokenModel: Model<IPasswordResetDoc> =
  mongoose.models.PasswordResetToken || mongoose.model<IPasswordResetDoc>('PasswordResetToken', PasswordResetSchema);

export const EmailVerificationTokenModel: Model<IEmailVerificationDoc> =
  mongoose.models.EmailVerificationToken || mongoose.model<IEmailVerificationDoc>('EmailVerificationToken', EmailVerificationSchema);
