/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'product' | 'content' | 'service' | 'personalized';
  items: Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    score: number;
    metadata: any;
  }>;
  score: number;
  context: {
    userPreferences: any;
    behavioralData: any;
    temporalFactors: any;
  };
  metadata: {
    algorithm: string;
    processingTime: number;
    confidence: number;
    source: string;
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['product', 'content', 'service', 'personalized'],
    required: true,
  },
  items: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    score: { type: Number, min: 0, max: 1, required: true },
    metadata: { type: Schema.Types.Mixed },
  }],
  score: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  context: {
    userPreferences: { type: Schema.Types.Mixed },
    behavioralData: { type: Schema.Types.Mixed },
    temporalFactors: { type: Schema.Types.Mixed },
  },
  metadata: {
    algorithm: { type: String, required: true },
    processingTime: { type: Number, required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    source: { type: String, required: true },
  },
  expiresAt: Date,
}, {
  timestamps: true,
});

// Indexes for performance
RecommendationSchema.index({ userId: 1, createdAt: -1 });
RecommendationSchema.index({ type: 1 });
RecommendationSchema.index({ score: -1 });
RecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RecommendationSchema.index({ 'items.category': 1 });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);