/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IInsight extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'behavioral' | 'predictive' | 'comparative' | 'trend' | 'anomaly';
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  metadata: {
    source: string;
    algorithm: string;
    confidence: number;
    dataPoints: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  };
  recommendations: Array<{
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
  status: 'new' | 'viewed' | 'acted_upon' | 'dismissed';
  viewedAt?: Date;
  actedUponAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema = new Schema<IInsight>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['behavioral', 'predictive', 'comparative', 'trend', 'anomaly'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  actionable: {
    type: Boolean,
    default: true,
  },
  metadata: {
    source: { type: String, required: true },
    algorithm: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    dataPoints: { type: Number, required: true },
    timeRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  },
  recommendations: [{
    type: { type: String, required: true },
    description: { type: String, required: true },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    effort: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
  }],
  status: {
    type: String,
    enum: ['new', 'viewed', 'acted_upon', 'dismissed'],
    default: 'new',
  },
  viewedAt: Date,
  actedUponAt: Date,
}, {
  timestamps: true,
});

// Indexes for performance
InsightSchema.index({ userId: 1, createdAt: -1 });
InsightSchema.index({ category: 1 });
InsightSchema.index({ priority: -1 });
InsightSchema.index({ status: 1 });
InsightSchema.index({ actionable: 1 });
InsightSchema.index({ 'metadata.confidence': -1 });

export const Insight = mongoose.model<IInsight>('Insight', InsightSchema);