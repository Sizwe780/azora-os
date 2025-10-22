/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose, { Document, Schema } from 'mongoose';

// Website Generation Request Interface
export interface IWebsiteGeneration extends Document {
  userId: string;
  name: string;
  description: string;
  businessType: string;
  targetAudience: string;
  colorScheme: string[];
  features: string[];
  templateId?: string;
  customizations: {
    logo?: string;
    images?: string[];
    content?: Record<string, any>;
    styling?: Record<string, any>;
  };
  aiPrompt: string;
  generatedContent: {
    html: string;
    css: string;
    js: string;
    assets: string[];
  };
  status: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Website Template Interface
export interface IWebsiteTemplate extends Document {
  name: string;
  description: string;
  category: string;
  businessType: string[];
  thumbnail: string;
  previewUrl: string;
  baseStructure: {
    html: string;
    css: string;
    js: string;
  };
  customizableSections: string[];
  features: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Website Deployment Interface
export interface IWebsiteDeployment extends Document {
  websiteId: string;
  userId: string;
  domain?: string;
  subdomain: string;
  deploymentUrl: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
  buildLogs: string[];
  lastDeployedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Website Generation Schema
const WebsiteGenerationSchema = new Schema<IWebsiteGeneration>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  businessType: {
    type: String,
    required: true,
    enum: ['ecommerce', 'blog', 'portfolio', 'business', 'restaurant', 'agency', 'other'],
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  colorScheme: [{
    type: String,
    validate: {
      validator: (v: string) => /^#[0-9A-F]{6}$/i.test(v),
      message: 'Color must be a valid hex color',
    },
  }],
  features: [{
    type: String,
    enum: ['contact-form', 'gallery', 'blog', 'ecommerce', 'social-links', 'newsletter', 'analytics'],
  }],
  templateId: {
    type: String,
    ref: 'WebsiteTemplate',
  },
  customizations: {
    logo: String,
    images: [String],
    content: Schema.Types.Mixed,
    styling: Schema.Types.Mixed,
  },
  aiPrompt: {
    type: String,
    required: true,
  },
  generatedContent: {
    html: {
      type: String,
      required: true,
    },
    css: {
      type: String,
      required: true,
    },
    js: {
      type: String,
      default: '',
    },
    assets: [String],
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending',
  },
  errorMessage: String,
  completedAt: Date,
}, {
  timestamps: true,
});

// Website Template Schema
const WebsiteTemplateSchema = new Schema<IWebsiteTemplate>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['minimal', 'modern', 'creative', 'corporate', 'ecommerce'],
  },
  businessType: [{
    type: String,
    enum: ['ecommerce', 'blog', 'portfolio', 'business', 'restaurant', 'agency', 'other'],
  }],
  thumbnail: {
    type: String,
    required: true,
  },
  previewUrl: {
    type: String,
    required: true,
  },
  baseStructure: {
    html: {
      type: String,
      required: true,
    },
    css: {
      type: String,
      required: true,
    },
    js: {
      type: String,
      default: '',
    },
  },
  customizableSections: [String],
  features: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Website Deployment Schema
const WebsiteDeploymentSchema = new Schema<IWebsiteDeployment>({
  websiteId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  domain: String,
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  deploymentUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'deploying', 'deployed', 'failed'],
    default: 'pending',
  },
  buildLogs: [String],
  lastDeployedAt: Date,
  errorMessage: String,
}, {
  timestamps: true,
});

// Indexes
WebsiteGenerationSchema.index({ userId: 1, createdAt: -1 });
WebsiteGenerationSchema.index({ status: 1 });
WebsiteTemplateSchema.index({ category: 1, isActive: 1 });
WebsiteTemplateSchema.index({ businessType: 1 });
WebsiteDeploymentSchema.index({ userId: 1, status: 1 });
WebsiteDeploymentSchema.index({ subdomain: 1 });

// Models
const WebsiteGeneration = mongoose.model<IWebsiteGeneration>('WebsiteGeneration', WebsiteGenerationSchema);
const WebsiteTemplate = mongoose.model<IWebsiteTemplate>('WebsiteTemplate', WebsiteTemplateSchema);
const WebsiteDeployment = mongoose.model<IWebsiteDeployment>('WebsiteDeployment', WebsiteDeploymentSchema);

export { WebsiteGeneration, WebsiteTemplate, WebsiteDeployment };