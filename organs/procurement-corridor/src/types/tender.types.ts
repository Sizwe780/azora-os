/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type TenderStatus = 
  | 'draft'
  | 'published'
  | 'open'
  | 'closed'
  | 'evaluating'
  | 'awarded'
  | 'cancelled';

export type TenderType =
  | 'goods'
  | 'services'
  | 'construction'
  | 'consultancy';

export type BidStatus =
  | 'submitted'
  | 'under_review'
  | 'compliant'
  | 'non_compliant'
  | 'shortlisted'
  | 'awarded'
  | 'rejected';

export interface Tender {
  id: string;
  organizationId: string;
  
  // Basic info
  referenceNumber: string;
  title: string;
  description: string;
  type: TenderType;
  status: TenderStatus;
  
  // Dates
  publishedAt?: Date;
  closingDate: Date;
  briefingDate?: Date;
  expectedAwardDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Financial
  estimatedValue: number;
  currency: string;
  budgetAvailable: number;
  
  // Requirements
  minimumRequirements: string[];
  evaluationCriteria: EvaluationCriterion[];
  documentRequirements: string[];
  
  // Compliance
  bbbeeRequired: boolean;
  bbbeeMinimumLevel?: number;
  taxClearanceRequired: boolean;
  centralSupplierDatabaseRequired: boolean;
  
  // Blockchain
  blockchainHash?: string;
  blockchainTxId?: string;
  immutabilityProof?: string;
  
  // Metadata
  createdBy: string;
  department?: string;
  category?: string;
  tags: string[];
}

export interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number; // 0-100
  type: 'price' | 'quality' | 'bbbee' | 'experience' | 'custom';
}

export interface Bid {
  id: string;
  tenderId: string;
  organizationId: string;
  supplierId: string;
  
  // Submission
  submittedAt: Date;
  status: BidStatus;
  bidAmount: number;
  currency: string;
  
  // Documents
  documents: BidDocument[];
  
  // Compliance
  taxClearanceCertificate?: string;
  bbbeeLevel?: number;
  bbbeeCertificate?: string;
  csdRegistrationNumber?: string;
  
  // Evaluation
  evaluationScore?: number;
  evaluationNotes?: string;
  evaluatedBy?: string;
  evaluatedAt?: Date;
  
  // Award
  awardedAt?: Date;
  awardValue?: number;
  awardNotes?: string;
  
  // Blockchain
  blockchainHash?: string;
  blockchainTxId?: string;
  
  // Metadata
  metadata: Record<string, unknown>;
}

export interface BidDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface ComplianceCheck {
  id: string;
  tenderId?: string;
  bidId?: string;
  
  // Results
  status: 'pending' | 'passed' | 'failed' | 'warning';
  score: number; // 0-100
  checks: ComplianceRule[];
  
  // Timestamps
  checkedAt: Date;
  checkedBy: string;
  
  // Details
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'constitutional' | 'legal' | 'policy' | 'best_practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  passed: boolean;
  details?: string;
}

export interface CorruptionAnalysis {
  id: string;
  tenderId: string;
  
  // Risk assessment
  riskScore: number; // 0-100 (0 = no risk, 100 = critical risk)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Detection categories
  pricingAnomaly: boolean;
  pricingAnomalyScore: number;
  bidRigging: boolean;
  bidRiggingScore: number;
  collusion: boolean;
  collusionScore: number;
  conflictOfInterest: boolean;
  conflictScore: number;
  
  // Patterns
  patterns: CorruptionPattern[];
  
  // Recommendations
  alerts: string[];
  recommendations: string[];
  requiredActions: string[];
  
  // Metadata
  analyzedAt: Date;
  analyzedBy: string;
  model: string;
  modelVersion: string;
}

export interface CorruptionPattern {
  type: 'pricing' | 'timing' | 'network' | 'behavior' | 'document';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  confidence: number; // 0-100
}

export interface BlockchainAnchor {
  id: string;
  entityType: 'tender' | 'bid' | 'award' | 'document';
  entityId: string;
  
  // Blockchain details
  hash: string;
  transactionId: string;
  blockNumber?: number;
  blockTimestamp?: Date;
  network: 'ethereum' | 'polygon' | 'testnet';
  
  // Data
  data: Record<string, unknown>;
  dataHash: string;
  
  // Metadata
  anchoredAt: Date;
  anchoredBy: string;
  verified: boolean;
  verifiedAt?: Date;
}
