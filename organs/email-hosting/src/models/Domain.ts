/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IDNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'PTR';
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface ISMTPConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  dkim?: {
    enabled: boolean;
    selector?: string;
    privateKey?: string;
  };
  spf?: string;
  dmarc?: string;
}

export interface IDomain extends Document {
  name: string;
  owner: string;
  status: 'pending' | 'active' | 'suspended' | 'expired';
  dnsRecords: IDNSRecord[];
  smtpConfig: ISMTPConfig;
  verificationToken?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dnsRecordSchema = new Schema({
  type: {
    type: String,
    enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  ttl: {
    type: Number,
    default: 3600,
    min: 60,
    max: 86400
  },
  priority: {
    type: Number,
    required: function() {
      return this.type === 'MX';
    }
  }
});

const smtpConfigSchema = new Schema({
  host: String,
  port: {
    type: Number,
    default: 587,
    min: 1,
    max: 65535
  },
  secure: {
    type: Boolean,
    default: false
  },
  username: String,
  password: String,
  dkim: {
    enabled: { type: Boolean, default: false },
    selector: String,
    privateKey: String
  },
  spf: String,
  dmarc: String
});

const domainSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic domain validation regex
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(v);
      },
      message: 'Invalid domain name format'
    }
  },
  owner: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'expired'],
    default: 'pending'
  },
  dnsRecords: [dnsRecordSchema],
  smtpConfig: {
    type: smtpConfigSchema,
    default: {}
  },
  verificationToken: String,
  verifiedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
domainSchema.index({ name: 1 });
domainSchema.index({ owner: 1, status: 1 });
domainSchema.index({ expiresAt: 1 });

// Pre-save middleware to update timestamps
domainSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for domain age
domainSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to check if domain is expired
domainSchema.methods.isExpired = function(): boolean {
  return this.expiresAt ? this.expiresAt < new Date() : false;
};

// Method to verify domain ownership
domainSchema.methods.verifyOwnership = function(token: string): boolean {
  return this.verificationToken === token;
};

// Static method to find domains by owner
domainSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ owner: ownerId });
};

// Static method to find active domains
domainSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

export default mongoose.model<IDomain>('Domain', domainSchema);