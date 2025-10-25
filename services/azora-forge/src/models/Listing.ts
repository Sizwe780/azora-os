/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  _id: mongoose.Types.ObjectId;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number; // in AZR
  images?: string[];
  tags?: string[];
  status: 'active' | 'sold' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  deliveryMethod: 'digital' | 'service';
  requirements?: string; // What buyer needs to provide
  estimatedDelivery?: string;
}

const ListingSchema = new Schema<IListing>({
  sellerId: { type: String, required: true, index: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0.01 },
  images: [{ type: String }],
  tags: [{ type: String }],
  status: { type: String, enum: ['active', 'sold', 'inactive'], default: 'active' },
  expiresAt: { type: Date },
  deliveryMethod: { type: String, enum: ['digital', 'service'], required: true },
  requirements: { type: String, maxlength: 500 },
  estimatedDelivery: { type: String, maxlength: 100 },
}, {
  timestamps: true,
});

// Indexes
ListingSchema.index({ category: 1, status: 1 });
ListingSchema.index({ title: 'text', description: 'text' });
ListingSchema.index({ tags: 1 });
ListingSchema.index({ createdAt: -1 });

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);

// Category model
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon?: string;
  parentCategory?: mongoose.Types.ObjectId;
  subcategories: mongoose.Types.ObjectId[];
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  subcategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  isActive: { type: Boolean, default: true },
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

// Transaction model for tracking marketplace activity
export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  buyerId: string;
  sellerId: string;
  amount: number; // in AZR
  status: 'pending' | 'completed' | 'disputed' | 'cancelled';
  transactionHash?: string; // blockchain transaction hash
  completedAt?: Date;
  notes?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'disputed', 'cancelled'], default: 'pending' },
  transactionHash: { type: String },
  completedAt: { type: Date },
  notes: { type: String },
}, {
  timestamps: true,
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);