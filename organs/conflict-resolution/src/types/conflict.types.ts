/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Conflict Resolution Engine Types
 * Nobel Peace Prize Infrastructure - Phase 5
 */

// Conflict Taxonomy (Ontology Layer)
export type ConflictType = 
  | 'trade'           // Trade disputes, tariffs, customs
  | 'border'          // Territorial, demarcation, sovereignty
  | 'regulatory'      // Policy, compliance, standards
  | 'humanitarian'    // Aid, refugees, evacuations
  | 'cyber'           // Attribution, retaliation, espionage
  | 'climate'         // Resources, migration, disasters
  | 'diplomatic'      // Treaties, protocols, representation
  | 'economic'        // Currency, sanctions, investment
  | 'security'        // Defense, peacekeeping, terrorism
  | 'social';         // Civil unrest, human rights, justice

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical' | 'existential';

export type ConflictStatus = 
  | 'intake'          // Initial submission
  | 'analysis'        // AI analysis & classification
  | 'mediation'       // Active mediation
  | 'simulation'      // Outcome modeling
  | 'negotiation'     // Parties negotiating
  | 'arbitration'     // Binding arbitration
  | 'resolution'      // Agreement reached
  | 'implementation'  // Agreement being executed
  | 'verified'        // Compliance verified
  | 'escalated'       // Failed resolution
  | 'archived';       // Completed or abandoned

// Actor Graph (Ontology Layer)
export interface Actor {
  id: string;
  name: string;
  type: 'nation' | 'organization' | 'company' | 'individual' | 'coalition';
  jurisdiction: string[];
  powerIndex: number;        // 0-100 (economic, military, diplomatic)
  reputationScore: number;   // 0-100 (historical behavior)
  interests: string[];
  positions: string[];
  redLines: string[];        // Non-negotiable constraints
  metadata: Record<string, unknown>;
}

export interface ActorRelationship {
  actorA: string;
  actorB: string;
  type: 'alliance' | 'trade_partner' | 'adversary' | 'neutral' | 'dependent';
  strength: number;          // 0-100
  history: string[];
}

// Conflict Structure
export interface Conflict {
  id: string;
  referenceNumber: string;
  
  // Classification
  type: ConflictType;
  subtype?: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  
  // Parties
  parties: Actor[];
  relationships: ActorRelationship[];
  
  // Core details
  title: string;
  description: string;
  background: string;
  stakes: {
    economic: number;        // USD value
    humanitarian: number;    // Lives at risk
    political: number;       // Stability score 0-100
    environmental: number;   // Impact score 0-100
  };
  
  // Timeline
  startDate: Date;
  escalationDeadline?: Date;
  resolutionDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Resolution
  protocol?: 'arbitration' | 'negotiation' | 'restorative' | 'hybrid';
  mediators: string[];
  observers: string[];
  
  // Evidence
  documents: ConflictDocument[];
  claims: Claim[];
  
  // AI Analysis
  intentAnalysis?: IntentAnalysis;
  simulationResults?: SimulationResult[];
  ethicalAssessment?: EthicalAssessment;
  narrativeReconciliation?: NarrativeReconciliation;
  
  // Resolution
  agreement?: Agreement;
  
  // Blockchain
  blockchainHash?: string;
  blockchainTxId?: string;
  
  // Metadata
  tags: string[];
  jurisdiction: string[];
  legalFrameworks: string[];  // UN, AU, WTO, ICC, etc.
  createdBy: string;
}

// Intent Analysis (AI Layer)
export interface IntentAnalysis {
  id: string;
  conflictId: string;
  
  parties: {
    actorId: string;
    statedPosition: string[];
    underlyingInterests: string[];
    hiddenAgenda?: string[];
    negotiationStyle: 'cooperative' | 'competitive' | 'avoiding' | 'accommodating';
    confidence: number;
  }[];
  
  commonGround: string[];
  irreconcilableDifferences: string[];
  compromiseOpportunities: string[];
  
  analyzedAt: Date;
  analyzedBy: string;
  model: string;
}

// Multi-Agent Simulation (AI Layer)
export interface SimulationResult {
  id: string;
  conflictId: string;
  scenario: string;
  
  // Outcomes
  outcomes: {
    scenario: string;
    probability: number;
    impacts: {
      economic: number;
      humanitarian: number;
      political: number;
      environmental: number;
    };
    escalationRisk: number;  // 0-100
    sustainabilityScore: number;  // 0-100
    actorSatisfaction: {
      actorId: string;
      satisfactionScore: number;  // 0-100
    }[];
  }[];
  
  recommendation: string;
  recommendationConfidence: number;
  
  simulatedAt: Date;
  model: string;
}

// Ethical Assessment (AI Layer)
export interface EthicalAssessment {
  id: string;
  conflictId: string;
  
  fairnessScore: number;       // 0-100
  proportionalityScore: number;  // 0-100
  precedentAlignment: number;   // 0-100 (consistency with past cases)
  
  concerns: string[];
  recommendations: string[];
  
  complianceCheck: {
    framework: string;          // UN Charter, AU Protocol, etc.
    compliant: boolean;
    violations: string[];
  }[];
  
  assessedAt: Date;
  model: string;
}

// Narrative Reconciliation (AI Layer)
export interface NarrativeReconciliation {
  id: string;
  conflictId: string;
  
  divergentNarratives: {
    actorId: string;
    narrative: string;
    keyPoints: string[];
  }[];
  
  sharedTruth: string;
  sharedUnderstanding: string[];
  irreconcilableViews: string[];
  
  bridgingLanguage: string[];   // Phrases to enable dialogue
  
  reconciledAt: Date;
  model: string;
}

// Protocols (Protocol Layer)
export interface Protocol {
  id: string;
  name: string;
  type: 'arbitration' | 'negotiation' | 'restorative' | 'hybrid';
  description: string;
  
  steps: ProtocolStep[];
  
  legalFramework: string[];
  complianceRequirements: string[];
  
  successCriteria: string[];
  failureConditions: string[];
}

export interface ProtocolStep {
  id: string;
  order: number;
  name: string;
  description: string;
  actor: 'mediator' | 'parties' | 'observers' | 'system';
  timeframe: string;
  required: boolean;
  automatable: boolean;
}

// Evidence & Claims
export interface ConflictDocument {
  id: string;
  name: string;
  type: 'treaty' | 'agreement' | 'evidence' | 'precedent' | 'legal_text' | 'report';
  url: string;
  hash: string;
  uploadedAt: Date;
  uploadedBy: string;
  verified: boolean;
  private: boolean;          // Zero-knowledge proof required
}

export interface Claim {
  id: string;
  actorId: string;
  statement: string;
  evidence: string[];
  verificationStatus: 'unverified' | 'verified' | 'disputed' | 'disproven';
  verifiers: string[];
}

// Agreement
export interface Agreement {
  id: string;
  conflictId: string;
  
  title: string;
  text: string;
  
  parties: string[];
  mediators: string[];
  
  terms: AgreementTerm[];
  
  signatures: {
    actorId: string;
    signedAt: Date;
    signature: string;
  }[];
  
  // Compliance
  milestones: Milestone[];
  verificationMechanism: string;
  disputeResolutionClause: string;
  
  // Blockchain
  blockchainHash: string;
  blockchainTxId: string;
  immutable: boolean;
  
  // Dates
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
}

export interface AgreementTerm {
  id: string;
  order: number;
  text: string;
  responsibleParty: string[];
  deadline?: Date;
  verifiable: boolean;
  metrics?: string[];
}

export interface Milestone {
  id: string;
  agreementId: string;
  description: string;
  deadline: Date;
  responsibleParty: string;
  status: 'pending' | 'in_progress' | 'completed' | 'missed' | 'disputed';
  verificationEvidence?: string[];
  verifiedAt?: Date;
}

// Reputation
export interface ReputationScore {
  actorId: string;
  
  overallScore: number;        // 0-100
  
  // Component scores
  complianceScore: number;     // Historical agreement adherence
  transparencyScore: number;   // Information sharing
  goodFaithScore: number;      // Negotiation behavior
  trackRecordScore: number;    // Past resolution success
  
  // History
  conflictsResolved: number;
  agreementsHonored: number;
  agreementsViolated: number;
  
  lastUpdated: Date;
}

// Verifier Mesh
export interface Verifier {
  id: string;
  name: string;
  type: 'civil_society' | 'regulator' | 'observer' | 'expert' | 'ai';
  jurisdiction: string[];
  credibilityScore: number;    // 0-100
  verificationsCompleted: number;
  verificationsAccurate: number;
}

export interface Verification {
  id: string;
  conflictId?: string;
  agreementId?: string;
  milestoneId?: string;
  
  verifierId: string;
  verificationDate: Date;
  
  status: 'verified' | 'unverified' | 'disputed';
  evidence: string[];
  notes: string;
  
  blockchainHash?: string;
}
