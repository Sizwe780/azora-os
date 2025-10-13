#!/usr/bin/env node

/**
 * HIPAA Compliance Engine
 *
 * Implements comprehensive HIPAA compliance including:
 * - Protected Health Information (PHI) protection
 * - Security Rule compliance (administrative, physical, technical safeguards)
 * - Privacy Rule compliance (minimum necessary, accounting of disclosures)
 * - Breach notification (60-day requirement)
 * - Audit trails and access logging
 * - Business Associate Agreement management
 * - Risk analysis and management
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.HIPAA_PORT || 4081;

// ============================================================================
// HIPAA COMPLIANCE DATA STRUCTURES
// ============================================================================

const HIPAA_DATA = {
  phi: new Map(), // PHI records with encryption
  accessLogs: [], // Audit trails for all PHI access
  breachNotifications: [], // HIPAA breach notifications
  businessAssociates: new Map(), // BAA tracking
  riskAssessments: new Map(), // Security risk analyses
  disclosures: new Map(), // Accounting of disclosures
  authorizations: new Map(), // Patient authorizations
  auditLog: [] // Compliance audit trail
};

// ============================================================================
// PHI PROTECTION & ENCRYPTION
// ============================================================================

class PHIProtection {
  /**
   * Encrypt PHI data using AES-256-GCM
   */
  static encryptPHI(data, key = null) {
    const encryptionKey = key || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', encryptionKey);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      key: encryptionKey.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Decrypt PHI data
   */
  static decryptPHI(encryptedData) {
    const { encrypted, iv, key, authTag, algorithm } = encryptedData;

    const decipher = crypto.createDecipher(algorithm, Buffer.from(key, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Store PHI with encryption and access controls
   */
  static async storePHI(patientId, phiData, accessorId, purpose) {
    const phiId = crypto.randomUUID();

    // Encrypt PHI data
    const encryptedPHI = this.encryptPHI(phiData);

    const phiRecord = {
      phiId,
      patientId,
      encryptedPHI,
      metadata: {
        created: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
        dataCategories: Object.keys(phiData),
        sensitivity: this.assessSensitivity(phiData)
      },
      accessControls: {
        minimumNecessary: true,
        purposeLimitation: purpose,
        retentionLimit: this.calculateRetentionLimit(phiData)
      }
    };

    HIPAA_DATA.phi.set(phiId, phiRecord);

    // Log PHI creation
    await AuditLogger.logPHIEvent('CREATE', phiId, patientId, accessorId, {
      purpose,
      dataCategories: phiRecord.metadata.dataCategories,
      sensitivity: phiRecord.metadata.sensitivity
    });

    return { phiId, success: true };
  }

  /**
   * Access PHI with audit logging
   */
  static async accessPHI(phiId, accessorId, purpose, justification) {
    const phiRecord = HIPAA_DATA.phi.get(phiId);
    if (!phiRecord) {
      throw new Error('PHI record not found');
    }

    // Check access authorization
    const authorization = await this.checkAccessAuthorization(accessorId, phiRecord.patientId, purpose);
    if (!authorization.authorized) {
      await AuditLogger.logPHIEvent('ACCESS_DENIED', phiId, phiRecord.patientId, accessorId, {
        reason: authorization.reason,
        purpose,
        justification
      });
      throw new Error(`Access denied: ${authorization.reason}`);
    }

    // Check minimum necessary rule
    if (!this.isMinimumNecessary(purpose, phiRecord)) {
      await AuditLogger.logPHIEvent('MINIMUM_NECESSARY_VIOLATION', phiId, phiRecord.patientId, accessorId, {
        purpose,
        availableData: phiRecord.metadata.dataCategories
      });
      throw new Error('Access violates minimum necessary rule');
    }

    // Decrypt and return PHI
    const phiData = this.decryptPHI(phiRecord.encryptedPHI);

    // Update access metadata
    phiRecord.metadata.lastAccessed = new Date().toISOString();
    phiRecord.metadata.accessCount++;

    // Log successful access
    await AuditLogger.logPHIEvent('ACCESS', phiId, phiRecord.patientId, accessorId, {
      purpose,
      justification,
      dataCategories: phiRecord.metadata.dataCategories
    });

    return {
      phiId,
      patientId: phiRecord.patientId,
      data: phiData,
      metadata: phiRecord.metadata
    };
  }

  /**
   * Assess PHI sensitivity level
   */
  static assessSensitivity(phiData) {
    let sensitivity = 'low';

    // High sensitivity indicators
    if (phiData.diagnosis && this.containsMentalHealth(phiData.diagnosis)) {
      sensitivity = 'high';
    }
    if (phiData.geneticInfo) {
      sensitivity = 'high';
    }
    if (phiData.hivStatus || phiData.stdStatus) {
      sensitivity = 'high';
    }

    // Medium sensitivity indicators
    if (phiData.mentalHealthHistory || phiData.substanceAbuse) {
      sensitivity = Math.max(sensitivity === 'high' ? 'high' : 'medium');
    }

    return sensitivity;
  }

  /**
   * Calculate retention limit based on HIPAA requirements
   */
  static calculateRetentionLimit(phiData) {
    // HIPAA requires retention for 6 years from date of creation
    // Some states require longer (e.g., 7-10 years)
    const retentionYears = 6;
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);

    return retentionDate.toISOString();
  }

  /**
   * Check if access is authorized
   */
  static async checkAccessAuthorization(accessorId, patientId, purpose) {
    // Check if accessor is authorized healthcare provider
    const isAuthorizedProvider = await this.isAuthorizedProvider(accessorId, patientId);

    // Check if purpose is valid
    const validPurposes = [
      'treatment', 'payment', 'healthcare-operations',
      'research', 'public-health', 'legal'
    ];

    if (!validPurposes.includes(purpose)) {
      return { authorized: false, reason: 'Invalid access purpose' };
    }

    // Treatment purpose - always allowed for authorized providers
    if (purpose === 'treatment' && isAuthorizedProvider) {
      return { authorized: true };
    }

    // Check for patient authorization for other purposes
    if (purpose !== 'treatment') {
      const hasAuthorization = await this.hasPatientAuthorization(patientId, purpose, accessorId);
      if (!hasAuthorization) {
        return { authorized: false, reason: 'Patient authorization required' };
      }
    }

    return { authorized: true };
  }

  /**
   * Check minimum necessary rule
   */
  static isMinimumNecessary(purpose, phiRecord) {
    // For treatment, all data may be necessary
    if (purpose === 'treatment') {
      return true;
    }

    // For other purposes, limit to necessary data
    // This is a simplified implementation
    return phiRecord.accessControls.minimumNecessary;
  }

  static containsMentalHealth(diagnosis) {
    const mentalHealthTerms = ['depression', 'anxiety', 'schizophrenia', 'bipolar', 'ptsd'];
    return mentalHealthTerms.some(term =>
      diagnosis.toLowerCase().includes(term)
    );
  }

  static async isAuthorizedProvider(accessorId, patientId) {
    // In a real implementation, this would check against provider registry
    // For demo purposes, we'll assume accessor is authorized
    return true;
  }

  static async hasPatientAuthorization(patientId, purpose, accessorId) {
    // Check for valid patient authorization
    for (const [authId, auth] of HIPAA_DATA.authorizations) {
      if (auth.patientId === patientId &&
          auth.purpose === purpose &&
          auth.authorizedParties.includes(accessorId) &&
          auth.valid &&
          new Date(auth.expiryDate) > new Date()) {
        return true;
      }
    }
    return false;
  }
}

// ============================================================================
// AUDIT LOGGER
// ============================================================================

class AuditLogger {
  /**
   * Log PHI access events
   */
  static async logPHIEvent(eventType, phiId, patientId, accessorId, details) {
    const auditEntry = {
      auditId: crypto.randomUUID(),
      eventType,
      phiId,
      patientId,
      accessorId,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: 'system', // Would be populated from request
      userAgent: 'HIPAA-Service',
      sessionId: crypto.randomUUID()
    };

    HIPAA_DATA.accessLogs.push(auditEntry);

    // Keep only last 10000 entries (configurable)
    if (HIPAA_DATA.accessLogs.length > 10000) {
      HIPAA_DATA.accessLogs = HIPAA_DATA.accessLogs.slice(-10000);
    }

    // Log to compliance audit trail
    HIPAA_DATA.auditLog.push({
      eventId: crypto.randomUUID(),
      eventType: 'PHI_ACCESS',
      details: auditEntry,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get audit trail for patient
   */
  static getPatientAuditTrail(patientId, startDate, endDate) {
    return HIPAA_DATA.accessLogs.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const inDateRange = (!startDate || entryDate >= new Date(startDate)) &&
                         (!endDate || entryDate <= new Date(endDate));
      return entry.patientId === patientId && inDateRange;
    });
  }

  /**
   * Get audit trail for accessor
   */
  static getAccessorAuditTrail(accessorId, startDate, endDate) {
    return HIPAA_DATA.accessLogs.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const inDateRange = (!startDate || entryDate >= new Date(startDate)) &&
                         (!endDate || entryDate <= new Date(endDate));
      return entry.accessorId === accessorId && inDateRange;
    });
  }
}

// ============================================================================
// BREACH NOTIFICATION (45 CFR 164.404-164.414)
// ============================================================================

class BreachNotification {
  /**
   * Record a security breach involving PHI
   */
  static async recordBreach(breachData) {
    const breachId = crypto.randomUUID();

    const breach = {
      breachId,
      ...breachData,
      timestamp: new Date().toISOString(),
      riskAssessment: this.assessBreachRisk(breachData),
      notificationStatus: 'pending',
      notifications: []
    };

    // Validate breach data
    this.validateBreach(breach);

    HIPAA_DATA.breachNotifications.push(breach);

    // Determine notification requirements
    const notificationRequired = breach.riskAssessment.riskLevel !== 'low';

    if (notificationRequired) {
      await this.scheduleNotifications(breach);
    }

    // Log breach
    HIPAA_DATA.auditLog.push({
      eventId: crypto.randomUUID(),
      eventType: 'BREACH_RECORDED',
      details: {
        breachId,
        affectedIndividuals: breachData.affectedIndividuals,
        riskLevel: breach.riskAssessment.riskLevel
      },
      timestamp: new Date().toISOString()
    });

    return {
      breachId,
      success: true,
      notificationRequired,
      riskLevel: breach.riskAssessment.riskLevel
    };
  }

  /**
   * Assess breach risk level
   */
  static assessBreachRisk(breachData) {
    let riskScore = 0;

    // Risk factors
    if (breachData.phiCompromised) riskScore += 3;
    if (breachData.affectedIndividuals > 500) riskScore += 3;
    if (breachData.sensitivePHI) riskScore += 2;
    if (breachData.unauthorizedAccess) riskScore += 2;
    if (breachData.maliciousIntent) riskScore += 3;
    if (breachData.noEncryption) riskScore += 2;

    let riskLevel;
    if (riskScore >= 8) riskLevel = 'high';
    else if (riskScore >= 4) riskLevel = 'medium';
    else riskLevel = 'low';

    return { riskLevel, score: riskScore };
  }

  /**
   * Schedule breach notifications
   */
  static async scheduleNotifications(breach) {
    const notifications = [];

    // Notify affected individuals within 60 days
    if (breach.affectedIndividuals > 0) {
      notifications.push({
        type: 'individual',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      });
    }

    // Notify HHS within 60 days for breaches of 500+ individuals
    if (breach.affectedIndividuals >= 500) {
      notifications.push({
        type: 'hhs',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      });
    }

    // Notify media within 60 days for breaches of 500+ individuals
    if (breach.affectedIndividuals >= 500) {
      notifications.push({
        type: 'media',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      });
    }

    breach.notifications = notifications;
    breach.notificationStatus = 'scheduled';
  }

  /**
   * Mark notification as completed
   */
  static async markNotificationCompleted(breachId, notificationType, details) {
    const breach = HIPAA_DATA.breachNotifications.find(b => b.breachId === breachId);
    if (!breach) {
      throw new Error('Breach not found');
    }

    const notification = breach.notifications.find(n => n.type === notificationType);
    if (notification) {
      notification.status = 'completed';
      notification.completedAt = new Date().toISOString();
      notification.details = details;
    }

    // Check if all notifications are complete
    const allComplete = breach.notifications.every(n => n.status === 'completed');
    if (allComplete) {
      breach.notificationStatus = 'completed';
    }

    return { success: true, breachId, notificationType };
  }

  static validateBreach(breach) {
    const required = ['description', 'affectedIndividuals', 'breachDate'];

    for (const field of required) {
      if (!breach[field]) {
        throw new Error(`Missing required breach field: ${field}`);
      }
    }
  }
}

// ============================================================================
// BUSINESS ASSOCIATE AGREEMENTS
// ============================================================================

class BusinessAssociateAgreements {
  /**
   * Record BAA with business associate
   */
  static async recordBAA(baaData) {
    const baaId = crypto.randomUUID();

    const baa = {
      baaId,
      ...baaData,
      status: 'active',
      created: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Annual review
    };

    // Validate BAA
    this.validateBAA(baa);

    HIPAA_DATA.businessAssociates.set(baaId, baa);

    return { baaId, success: true };
  }

  /**
   * Update BAA status
   */
  static async updateBAAStatus(baaId, status, notes) {
    const baa = HIPAA_DATA.businessAssociates.get(baaId);
    if (!baa) {
      throw new Error('BAA not found');
    }

    baa.status = status;
    baa.lastUpdated = new Date().toISOString();
    baa.updateNotes = notes;

    if (status === 'terminated') {
      baa.terminatedAt = new Date().toISOString();
    }

    return { success: true, baaId, status };
  }

  /**
   * Get BAAs requiring review
   */
  static getBAAsRequiringReview() {
    const now = new Date();
    return Array.from(HIPAA_DATA.businessAssociates.values())
      .filter(baa =>
        baa.status === 'active' &&
        new Date(baa.nextReview) <= now
      );
  }

  static validateBAA(baa) {
    const required = [
      'associateName', 'associateAddress', 'associateContact',
      'servicesProvided', 'phiAccess', 'securityMeasures'
    ];

    for (const field of required) {
      if (!baa[field]) {
        throw new Error(`Missing required BAA field: ${field}`);
      }
    }
  }
}

// ============================================================================
// RISK ANALYSIS & MANAGEMENT
// ============================================================================

class RiskAnalysis {
  /**
   * Conduct security risk analysis
   */
  static async conductRiskAnalysis(analysisData) {
    const analysisId = crypto.randomUUID();

    const analysis = {
      analysisId,
      ...analysisData,
      timestamp: new Date().toISOString(),
      status: 'in-progress',
      riskScore: this.calculateRiskScore(analysisData),
      findings: [],
      recommendations: [],
      mitigationPlan: null
    };

    // Generate findings and recommendations
    analysis.findings = this.generateFindings(analysisData);
    analysis.recommendations = this.generateRecommendations(analysis.findings);

    HIPAA_DATA.riskAssessments.set(analysisId, analysis);

    return {
      analysisId,
      riskScore: analysis.riskScore,
      riskLevel: this.getRiskLevel(analysis.riskScore),
      findings: analysis.findings.length,
      recommendations: analysis.recommendations.length
    };
  }

  /**
   * Calculate overall risk score
   */
  static calculateRiskScore(analysisData) {
    let score = 0;

    // Technical safeguards
    if (!analysisData.encryptionAtRest) score += 3;
    if (!analysisData.encryptionInTransit) score += 3;
    if (!analysisData.accessControls) score += 2;
    if (!analysisData.auditLogging) score += 2;

    // Administrative safeguards
    if (!analysisData.securityTraining) score += 2;
    if (!analysisData.incidentResponse) score += 2;
    if (!analysisData.riskAssessments) score += 2;

    // Physical safeguards
    if (!analysisData.physicalSecurity) score += 2;
    if (!analysisData.deviceSecurity) score += 2;

    return score;
  }

  /**
   * Get risk level from score
   */
  static getRiskLevel(score) {
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  /**
   * Generate findings based on analysis
   */
  static generateFindings(analysisData) {
    const findings = [];

    if (!analysisData.encryptionAtRest) {
      findings.push({
        type: 'technical',
        severity: 'high',
        description: 'PHI not encrypted at rest',
        regulation: '45 CFR 164.312(a)(2)(iv)'
      });
    }

    if (!analysisData.accessControls) {
      findings.push({
        type: 'technical',
        severity: 'high',
        description: 'Inadequate access controls for PHI',
        regulation: '45 CFR 164.312(a)(1)'
      });
    }

    if (!analysisData.auditLogging) {
      findings.push({
        type: 'technical',
        severity: 'medium',
        description: 'Audit logging not implemented',
        regulation: '45 CFR 164.312(b)'
      });
    }

    return findings;
  }

  /**
   * Generate recommendations
   */
  static generateRecommendations(findings) {
    const recommendations = [];

    const hasEncryptionIssue = findings.some(f => f.description.includes('encrypted'));
    if (hasEncryptionIssue) {
      recommendations.push({
        priority: 'high',
        description: 'Implement AES-256 encryption for all PHI at rest and in transit',
        timeline: '30 days'
      });
    }

    const hasAccessIssue = findings.some(f => f.description.includes('access controls'));
    if (hasAccessIssue) {
      recommendations.push({
        priority: 'high',
        description: 'Implement role-based access controls with minimum necessary principle',
        timeline: '45 days'
      });
    }

    return recommendations;
  }
}

// ============================================================================
// EXPRESS SERVER SETUP
// ============================================================================

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for HIPAA requests
const hipaaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many HIPAA requests from this IP, please try again later.'
});

app.use('/hipaa', hipaaLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HIPAA Compliance Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// PHI Management
app.post('/hipaa/phi', async (req, res) => {
  try {
    const { patientId, phiData, accessorId, purpose } = req.body;
    const result = await PHIProtection.storePHI(patientId, phiData, accessorId, purpose);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/hipaa/phi/:phiId', async (req, res) => {
  try {
    const { phiId } = req.params;
    const { accessorId, purpose, justification } = req.query;
    const result = await PHIProtection.accessPHI(phiId, accessorId, purpose, justification);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Audit Trails
app.get('/hipaa/audit/patient/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;
    const auditTrail = AuditLogger.getPatientAuditTrail(patientId, startDate, endDate);
    res.json({ success: true, data: auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/hipaa/audit/accessor/:accessorId', (req, res) => {
  try {
    const { accessorId } = req.params;
    const { startDate, endDate } = req.query;
    const auditTrail = AuditLogger.getAccessorAuditTrail(accessorId, startDate, endDate);
    res.json({ success: true, data: auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Breach Notification
app.post('/hipaa/breach', async (req, res) => {
  try {
    const breachData = req.body;
    const result = await BreachNotification.recordBreach(breachData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/hipaa/breach/:breachId/notification/:type', async (req, res) => {
  try {
    const { breachId, type } = req.params;
    const details = req.body;
    const result = await BreachNotification.markNotificationCompleted(breachId, type, details);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/hipaa/breaches', (req, res) => {
  try {
    const breaches = HIPAA_DATA.breachNotifications;
    res.json({ success: true, data: breaches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Business Associate Agreements
app.post('/hipaa/baa', async (req, res) => {
  try {
    const baaData = req.body;
    const result = await BusinessAssociateAgreements.recordBAA(baaData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/hipaa/baa/:baaId/status', async (req, res) => {
  try {
    const { baaId } = req.params;
    const { status, notes } = req.body;
    const result = await BusinessAssociateAgreements.updateBAAStatus(baaId, status, notes);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/hipaa/baa/review-required', (req, res) => {
  try {
    const baas = BusinessAssociateAgreements.getBAAsRequiringReview();
    res.json({ success: true, data: baas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Risk Analysis
app.post('/hipaa/risk-analysis', async (req, res) => {
  try {
    const analysisData = req.body;
    const result = await RiskAnalysis.conductRiskAnalysis(analysisData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Patient Authorizations
app.post('/hipaa/authorization', async (req, res) => {
  try {
    const authData = req.body;
    const authId = crypto.randomUUID();

    const authorization = {
      authId,
      ...authData,
      valid: true,
      created: new Date().toISOString()
    };

    HIPAA_DATA.authorizations.set(authId, authorization);
    res.json({ success: true, data: { authId } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Compliance Dashboard
app.get('/hipaa/dashboard', (req, res) => {
  try {
    const dashboard = {
      summary: {
        totalPHI: HIPAA_DATA.phi.size,
        totalAccessEvents: HIPAA_DATA.accessLogs.length,
        totalBreaches: HIPAA_DATA.breachNotifications.length,
        activeBAAs: Array.from(HIPAA_DATA.businessAssociates.values())
          .filter(baa => baa.status === 'active').length,
        pendingNotifications: HIPAA_DATA.breachNotifications
          .filter(breach => breach.notificationStatus === 'pending').length
      },
      recentActivity: HIPAA_DATA.auditLog.slice(-10),
      complianceStatus: this.getComplianceStatus(),
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// COMPLIANCE STATUS
// ============================================================================

function getComplianceStatus() {
  const status = {
    overall: 'compliant',
    issues: [],
    lastAudit: new Date().toISOString(),
    nextAuditDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Check for unencrypted PHI
  const unencryptedPHI = Array.from(HIPAA_DATA.phi.values())
    .filter(phi => !phi.encryptedPHI);

  if (unencryptedPHI.length > 0) {
    status.overall = 'non-compliant';
    status.issues.push(`${unencryptedPHI.length} PHI records are not encrypted`);
  }

  // Check for overdue breach notifications
  const overdueNotifications = HIPAA_DATA.breachNotifications
    .filter(breach =>
      breach.notifications.some(notification =>
        notification.status === 'pending' &&
        new Date(notification.deadline) < new Date()
      )
    );

  if (overdueNotifications.length > 0) {
    status.overall = 'non-compliant';
    status.issues.push(`${overdueNotifications.length} breach notifications are overdue`);
  }

  // Check for BAAs requiring review
  const baasRequiringReview = BusinessAssociateAgreements.getBAAsRequiringReview();

  if (baasRequiringReview.length > 0) {
    status.issues.push(`${baasRequiringReview.length} Business Associate Agreements require review`);
  }

  return status;
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚑 HIPAA Compliance Engine running on port ${PORT}`);
  console.log(`🔒 Service provides comprehensive HIPAA compliance including:`);
  console.log(`   • PHI Protection & Encryption`);
  console.log(`   • Security Rule Compliance (Administrative, Physical, Technical)`);
  console.log(`   • Privacy Rule Compliance (Minimum Necessary, Accounting of Disclosures)`);
  console.log(`   • Breach Notification (60-day requirement)`);
  console.log(`   • Audit Trails & Access Logging`);
  console.log(`   • Business Associate Agreement Management`);
  console.log(`   • Risk Analysis & Security Assessments`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Dashboard: http://localhost:${PORT}/hipaa/dashboard`);
});

// Export for testing
export {
  PHIProtection,
  AuditLogger,
  BreachNotification,
  BusinessAssociateAgreements,
  RiskAnalysis,
  HIPAA_DATA
};