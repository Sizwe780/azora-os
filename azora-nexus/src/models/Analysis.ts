/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'behavioral' | 'predictive' | 'comparative' | 'trend';
  data: {
    input: any;
    parameters: any;
    filters: any;
  };
  results: {
    insights: string[];
    patterns: Array<{
      type: string;
      description: string;
      significance: number;
      data: any;
    }>;
    predictions: Array<{
      outcome: string;
      probability: number;
      timeframe: string;
      factors: string[];
    }>;
    metrics: {
      accuracy: number;
      confidence: number;
      coverage: number;
    };
  };
  metadata: {
    algorithm: string;
    processingTime: number;
    dataPoints: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  };
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['behavioral', 'predictive', 'comparative', 'trend'],
    required: true,
  },
  data: {
    input: { type: Schema.Types.Mixed, required: true },
    parameters: { type: Schema.Types.Mixed },
    filters: { type: Schema.Types.Mixed },
  },
  results: {
    insights: [{ type: String }],
    patterns: [{
      type: { type: String, required: true },
      description: { type: String, required: true },
      significance: { type: Number, min: 0, max: 1, required: true },
      data: { type: Schema.Types.Mixed },
    }],
    predictions: [{
      outcome: { type: String, required: true },
      probability: { type: Number, min: 0, max: 1, required: true },
      timeframe: { type: String, required: true },
      factors: [{ type: String }],
    }],
    metrics: {
      accuracy: { type: Number, min: 0, max: 1, required: true },
      confidence: { type: Number, min: 0, max: 1, required: true },
      coverage: { type: Number, min: 0, max: 1, required: true },
    },
  },
  metadata: {
    algorithm: { type: String, required: true },
    processingTime: { type: Number, required: true },
    dataPoints: { type: Number, required: true },
    timeRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  error: String,
}, {
  timestamps: true,
});

// Indexes for performance
AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ type: 1 });
AnalysisSchema.index({ status: 1 });
AnalysisSchema.index({ 'results.metrics.confidence': -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);