/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
  size: number;
}

export interface IEmail extends Document {
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: IAttachment[];
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  priority: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  domain: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
});

const emailSchema = new Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  from: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  to: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }],
  cc: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  bcc: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  subject: {
    type: String,
    required: true,
    maxlength: 998 // RFC 5322 limit
  },
  text: {
    type: String,
    maxlength: 1000000 // 1MB limit
  },
  html: {
    type: String,
    maxlength: 1000000 // 1MB limit
  },
  attachments: [attachmentSchema],
  status: {
    type: String,
    enum: ['queued', 'sending', 'sent', 'delivered', 'bounced', 'failed'],
    default: 'queued',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  scheduledAt: Date,
  sentAt: Date,
  deliveredAt: Date,
  bouncedAt: Date,
  failedAt: Date,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 0,
    max: 5
  },
  domain: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
emailSchema.index({ userId: 1, status: 1 });
emailSchema.index({ domain: 1, status: 1 });
emailSchema.index({ status: 1, createdAt: -1 });
emailSchema.index({ scheduledAt: 1 }, { sparse: true });
emailSchema.index({ sentAt: 1 }, { sparse: true });

// Pre-save middleware
emailSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for total recipients
emailSchema.virtual('totalRecipients').get(function() {
  return (this.to?.length || 0) + (this.cc?.length || 0) + (this.bcc?.length || 0);
});

// Method to mark as sent
emailSchema.methods.markAsSent = function(): void {
  this.status = 'sent';
  this.sentAt = new Date();
};

// Method to mark as delivered
emailSchema.methods.markAsDelivered = function(): void {
  this.status = 'delivered';
  this.deliveredAt = new Date();
};

// Method to mark as bounced
emailSchema.methods.markAsBounced = function(errorMessage?: string): void {
  this.status = 'bounced';
  this.bouncedAt = new Date();
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
};

// Method to mark as failed
emailSchema.methods.markAsFailed = function(errorMessage?: string): void {
  this.status = 'failed';
  this.failedAt = new Date();
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  this.retryCount += 1;
};

// Method to check if can retry
emailSchema.methods.canRetry = function(): boolean {
  return this.retryCount < this.maxRetries && this.status === 'failed';
};

// Static method to find emails by user
emailSchema.statics.findByUser = function(userId: string, limit = 50, skip = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find queued emails
emailSchema.statics.findQueued = function(limit = 100) {
  return this.find({
    status: 'queued',
    $or: [
      { scheduledAt: { $exists: false } },
      { scheduledAt: { $lte: new Date() } }
    ]
  })
  .sort({ priority: -1, createdAt: 1 })
  .limit(limit);
};

// Static method to find failed emails for retry
emailSchema.statics.findFailedForRetry = function() {
  return this.find({
    status: 'failed',
    retryCount: { $lt: mongoose.Schema.Types.Mixed }, // Compare with maxRetries field
    updatedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // Wait 5 minutes before retry
  });
};

export default mongoose.model<IEmail>('Email', emailSchema);