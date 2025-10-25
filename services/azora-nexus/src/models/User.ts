/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  preferences: {
    categories: string[];
    interests: string[];
    behaviorPatterns: any[];
    personalizationLevel: 'low' | 'medium' | 'high';
  };
  neuralProfile: {
    intentHistory: string[];
    recommendationHistory: string[];
    feedbackScores: number[];
    lastActivity: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  preferences: {
    categories: [{ type: String }],
    interests: [{ type: String }],
    behaviorPatterns: [{ type: Schema.Types.Mixed }],
    personalizationLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  neuralProfile: {
    intentHistory: [{ type: String }],
    recommendationHistory: [{ type: String }],
    feedbackScores: [{ type: Number, min: 0, max: 5 }],
    lastActivity: { type: Date, default: Date.now },
  },
}, {
  timestamps: true,
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'preferences.categories': 1 });
UserSchema.index({ 'preferences.interests': 1 });
UserSchema.index({ 'neuralProfile.lastActivity': -1 });

export const User = mongoose.model<IUser>('User', UserSchema);