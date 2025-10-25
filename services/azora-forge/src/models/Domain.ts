/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IDomainListing extends Document {
  domain: string;
  owner: string;
  status: 'available' | 'listed' | 'sold' | 'transferred' | 'expired';
  price?: number;
  currency: string;
  category?: string;
  description?: string;
  tags?: string[];
  featured: boolean;
  views: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  transferCode?: string;
  buyer?: string;
  soldAt?: Date;
  soldPrice?: number;
}

export interface IDomainBid extends Document {
  domainId: string;
  bidder: string;
  amount: number;
  currency: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface IDomainCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDomainWatchlist extends Document {
  userId: string;
  domain: string;
  alertPrice?: number;
  createdAt: Date;
}

const domainListingSchema = new Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  owner: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'listed', 'sold', 'transferred', 'expired'],
    default: 'available',
    index: true
  },
  price: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  category: {
    type: String,
    index: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  inquiries: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: Date,
  transferCode: {
    type: String,
    select: false // Don't include in regular queries
  },
  buyer: String,
  soldAt: Date,
  soldPrice: Number
}, {
  timestamps: true
});

// Indexes
domainListingSchema.index({ status: 1, featured: -1, createdAt: -1 });
domainListingSchema.index({ category: 1, status: 1 });
domainListingSchema.index({ price: 1, status: 1 });
domainListingSchema.index({ tags: 1 });
domainListingSchema.index({ expiresAt: 1 }, { sparse: true });

// Virtual for domain age
domainListingSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for domain TLD
domainListingSchema.virtual('tld').get(function() {
  const parts = this.domain.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
});

// Method to check if domain is expired
domainListingSchema.methods.isExpired = function(): boolean {
  return this.expiresAt ? this.expiresAt < new Date() : false;
};

// Method to mark as sold
domainListingSchema.methods.markAsSold = function(buyer: string, soldPrice: number): void {
  this.status = 'sold';
  this.buyer = buyer;
  this.soldAt = new Date();
  this.soldPrice = soldPrice;
};

// Static method to find available domains
domainListingSchema.statics.findAvailable = function(limit = 50, skip = 0) {
  return this.find({ status: 'available' })
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find featured domains
domainListingSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ status: 'available', featured: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search domains
domainListingSchema.statics.search = function(query: string, limit = 50) {
  const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return this.find({
    status: 'available',
    $or: [
      { domain: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ]
  })
  .sort({ featured: -1, createdAt: -1 })
  .limit(limit);
};

const domainBidSchema = new Schema({
  domainId: {
    type: String,
    required: true,
    index: true
  },
  bidder: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['active', 'accepted', 'rejected', 'expired'],
    default: 'active',
    index: true
  },
  message: {
    type: String,
    maxlength: 500
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: true
  }
}, {
  timestamps: true
});

// Indexes
domainBidSchema.index({ domainId: 1, status: 1, createdAt: -1 });
domainBidSchema.index({ bidder: 1, status: 1 });
domainBidSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const domainCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: String,
  icon: String,
  color: String,
  parentId: {
    type: String,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

const domainWatchlistSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  alertPrice: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index for uniqueness
domainWatchlistSchema.index({ userId: 1, domain: 1 }, { unique: true });

export const DomainListing = mongoose.model<IDomainListing>('DomainListing', domainListingSchema);
export const DomainBid = mongoose.model<IDomainBid>('DomainBid', domainBidSchema);
export const DomainCategory = mongoose.model<IDomainCategory>('DomainCategory', domainCategorySchema);
export const DomainWatchlist = mongoose.model<IDomainWatchlist>('DomainWatchlist', domainWatchlistSchema);

export default DomainListing;