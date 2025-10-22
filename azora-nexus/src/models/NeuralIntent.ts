/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface INeuralIntent extends Document {
  userId: mongoose.Types.ObjectId;
  intent: string;
  confidence: number;
  context: {
    input: string;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    sentiment: {
      score: number;
      magnitude: number;
    };
    temporalContext: {
      timeOfDay: string;
      dayOfWeek: string;
      season: string;
    };
  };
  processed: boolean;
  processingResult?: {
    recommendations: string[];
    actions: string[];
    insights: string[];
  };
  feedback?: {
    rating: number;
    comments?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NeuralIntentSchema = new Schema<INeuralIntent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  intent: {
    type: String,
    required: true,
    trim: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  context: {
    input: { type: String, required: true },
    entities: [{
      type: { type: String, required: true },
      value: { type: String, required: true },
      confidence: { type: Number, min: 0, max: 1, required: true },
    }],
    sentiment: {
      score: { type: Number, min: -1, max: 1, required: true },
      magnitude: { type: Number, min: 0, required: true },
    },
    temporalContext: {
      timeOfDay: { type: String, required: true },
      dayOfWeek: { type: String, required: true },
      season: { type: String, required: true },
    },
  },
  processed: {
    type: Boolean,
    default: false,
  },
  processingResult: {
    recommendations: [{ type: String }],
    actions: [{ type: String }],
    insights: [{ type: String }],
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    timestamp: { type: Date, default: Date.now },
  },
}, {
  timestamps: true,
});

// Indexes for performance
NeuralIntentSchema.index({ userId: 1, createdAt: -1 });
NeuralIntentSchema.index({ intent: 1 });
NeuralIntentSchema.index({ confidence: -1 });
NeuralIntentSchema.index({ processed: 1 });
NeuralIntentSchema.index({ 'context.entities.type': 1 });

export const NeuralIntent = mongoose.model<INeuralIntent>('NeuralIntent', NeuralIntentSchema);