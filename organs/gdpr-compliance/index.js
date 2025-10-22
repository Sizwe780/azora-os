/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * GDPR Compliance Service
 *
 * Implements comprehensive GDPR compliance including:
 * - Data Subject Rights (access, rectification, erasure, portability)
 * - Consent Management
 * - Data Processing Records
 * - Breach Notification
 * - Data Protection Impact Assessment
 * - Automated Compliance Monitoring
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.GDPR_PORT || 4080;

// ============================================================================
// GDPR COMPLIANCE DATA STRUCTURES
// ============================================================================

const GDPR_DATA = {
  consents: new Map(), // consentId -> consent data
  dataSubjects: new Map(), // subjectId -> subject data
  processingRecords: new Map(), // recordId -> processing activity
  breachNotifications: [], // breach history
  dpia: new Map(), // DPIA assessments
  auditLog: [] // compliance audit trail
};

// ============================================================================
// DATA SUBJECT RIGHTS IMPLEMENTATION
// ============================================================================

class DataSubjectRights {
  /**
   * Right of Access - Article 15
   * Data subjects can obtain confirmation and copy of their data
   */
  static async rightOfAccess(subjectId) {
    const subject = GDPR_DATA.dataSubjects.get(subjectId);
    if (!subject) {
      throw new Error('Data subject not found');
    }

    // Log access request
    this.logAuditEvent('ACCESS_REQUEST', subjectId, {
      right: 'access',
      timestamp: new Date().toISOString()
    });

    return {
      subjectId,
      data: subject,
      processingRecords: this.getProcessingRecordsForSubject(subjectId),
      consents: this.getConsentsForSubject(subjectId),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Right to Rectification - Article 16
   * Data subjects can have their data rectified or completed
   */
  static async rightToRectification(subjectId, corrections) {
    const subject = GDPR_DATA.dataSubjects.get(subjectId);
    if (!subject) {
      throw new Error('Data subject not found');
    }

    // Apply corrections
    Object.assign(subject, corrections);
    subject.lastModified = new Date().toISOString();

    // Log rectification
    this.logAuditEvent('RECTIFICATION', subjectId, {
      right: 'rectification',
      corrections: Object.keys(corrections),
      timestamp: new Date().toISOString()
    });

    return { success: true, subjectId, corrections };
  }

  /**
   * Right to Erasure (Right to be Forgotten) - Article 17
   * Data subjects can have their data erased
   */
  static async rightToErasure(subjectId, reason) {
    const subject = GDPR_DATA.dataSubjects.get(subjectId);
    if (!subject) {
      throw new Error('Data subject not found');
    }

    // Check if erasure is allowed (no legal obligations preventing it)
    if (this.hasLegalObligation(subjectId)) {
      throw new Error('Erasure not permitted due to legal obligations');
    }

    // Perform erasure
    GDPR_DATA.dataSubjects.delete(subjectId);

    // Erase related data
    this.eraseRelatedData(subjectId);

    // Log erasure
    this.logAuditEvent('ERASURE', subjectId, {
      right: 'erasure',
      reason,
      timestamp: new Date().toISOString()
    });

    return { success: true, subjectId, erased: true };
  }

  /**
   * Right to Data Portability - Article 20
   * Data subjects can receive their data in a structured format
   */
  static async rightToPortability(subjectId) {
    const subject = GDPR_DATA.dataSubjects.get(subjectId);
    if (!subject) {
      throw new Error('Data subject not found');
    }

    const portableData = {
      subject: subject,
      consents: this.getConsentsForSubject(subjectId),
      processingHistory: this.getProcessingRecordsForSubject(subjectId),
      exportTimestamp: new Date().toISOString(),
      format: 'JSON',
      gdprVersion: 'GDPR-2018'
    };

    // Log portability request
    this.logAuditEvent('PORTABILITY', subjectId, {
      right: 'portability',
      timestamp: new Date().toISOString()
    });

    return portableData;
  }

  /**
   * Right to Restriction of Processing - Article 18
   */
  static async rightToRestriction(subjectId, restrictionType) {
    const subject = GDPR_DATA.dataSubjects.get(subjectId);
    if (!subject) {
      throw new Error('Data subject not found');
    }

    subject.processingRestricted = true;
    subject.restrictionType = restrictionType;
    subject.restrictionTimestamp = new Date().toISOString();

    this.logAuditEvent('RESTRICTION', subjectId, {
      right: 'restriction',
      type: restrictionType,
      timestamp: new Date().toISOString()
    });

    return { success: true, subjectId, restricted: true };
  }

  /**
   * Right to Object - Article 21
   */
  static async rightToObject(subjectId, objectionReason) {
    const subject = GDPR_DATA.dataSubjects.get(subjectId);
    if (!subject) {
      throw new Error('Data subject not found');
    }

    subject.objectionFiled = true;
    subject.objectionReason = objectionReason;
    subject.objectionTimestamp = new Date().toISOString();

    this.logAuditEvent('OBJECTION', subjectId, {
      right: 'objection',
      reason: objectionReason,
      timestamp: new Date().toISOString()
    });

    return { success: true, subjectId, objectionFiled: true };
  }

  // Helper methods
  static getProcessingRecordsForSubject(subjectId) {
    return Array.from(GDPR_DATA.processingRecords.values())
      .filter(record => record.subjectId === subjectId);
  }

  static getConsentsForSubject(subjectId) {
    return Array.from(GDPR_DATA.consents.values())
      .filter(consent => consent.subjectId === subjectId);
  }

  static hasLegalObligation(subjectId) {
    // Check for legal obligations that prevent erasure
    const records = this.getProcessingRecordsForSubject(subjectId);
    return records.some(record =>
      record.legalBasis === 'legal-obligation' ||
      record.legalBasis === 'public-task' ||
      record.purpose === 'legal-compliance'
    );
  }

  static eraseRelatedData(subjectId) {
    // Erase consents
    for (const [consentId, consent] of GDPR_DATA.consents) {
      if (consent.subjectId === subjectId) {
        GDPR_DATA.consents.delete(consentId);
      }
    }

    // Erase processing records
    for (const [recordId, record] of GDPR_DATA.processingRecords) {
      if (record.subjectId === subjectId) {
        GDPR_DATA.processingRecords.delete(recordId);
      }
    }
  }

  static logAuditEvent(eventType, subjectId, details) {
    const auditEntry = {
      eventId: crypto.randomUUID(),
      eventType,
      subjectId,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: 'system', // Would be populated from request in real implementation
      userAgent: 'GDPR-Service'
    };

    GDPR_DATA.auditLog.push(auditEntry);

    // Keep only last 10000 entries
    if (GDPR_DATA.auditLog.length > 10000) {
      GDPR_DATA.auditLog = GDPR_DATA.auditLog.slice(-10000);
    }
  }
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

class ConsentManager {
  /**
   * Record consent for data processing
   */
  static async recordConsent(subjectId, consentData) {
    const consentId = crypto.randomUUID();

    const consent = {
      consentId,
      subjectId,
      ...consentData,
      timestamp: new Date().toISOString(),
      valid: true,
      version: '1.0'
    };

    // Validate consent requirements
    this.validateConsent(consent);

    GDPR_DATA.consents.set(consentId, consent);

    DataSubjectRights.logAuditEvent('CONSENT_RECORDED', subjectId, {
      consentId,
      purposes: consentData.purposes,
      timestamp: consent.timestamp
    });

    return { consentId, success: true };
  }

  /**
   * Withdraw consent
   */
  static async withdrawConsent(consentId, subjectId) {
    const consent = GDPR_DATA.consents.get(consentId);
    if (!consent || consent.subjectId !== subjectId) {
      throw new Error('Consent not found or access denied');
    }

    consent.valid = false;
    consent.withdrawnAt = new Date().toISOString();

    DataSubjectRights.logAuditEvent('CONSENT_WITHDRAWN', subjectId, {
      consentId,
      timestamp: consent.withdrawnAt
    });

    return { success: true, consentId, withdrawn: true };
  }

  /**
   * Check if consent is valid for specific purpose
   */
  static isConsentValid(subjectId, purpose) {
    const consents = Array.from(GDPR_DATA.consents.values())
      .filter(consent =>
        consent.subjectId === subjectId &&
        consent.valid &&
        consent.purposes.includes(purpose)
      );

    return consents.length > 0;
  }

  /**
   * Validate consent meets GDPR requirements
   */
  static validateConsent(consent) {
    const required = ['subjectId', 'purposes', 'legalBasis', 'consentGiven'];

    for (const field of required) {
      if (!consent[field]) {
        throw new Error(`Missing required consent field: ${field}`);
      }
    }

    if (!consent.consentGiven) {
      throw new Error('Explicit consent must be given');
    }

    if (!Array.isArray(consent.purposes) || consent.purposes.length === 0) {
      throw new Error('At least one processing purpose must be specified');
    }

    // Check for valid legal basis
    const validBases = [
      'consent', 'contract', 'legal-obligation', 'vital-interests',
      'public-task', 'legitimate-interests'
    ];

    if (!validBases.includes(consent.legalBasis)) {
      throw new Error('Invalid legal basis for processing');
    }
  }
}

// ============================================================================
// DATA PROCESSING RECORDS (Article 30)
// ============================================================================

class ProcessingRecords {
  /**
   * Record a data processing activity
   */
  static async recordProcessingActivity(activityData) {
    const recordId = crypto.randomUUID();

    const record = {
      recordId,
      ...activityData,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    // Validate record
    this.validateProcessingRecord(record);

    GDPR_DATA.processingRecords.set(recordId, record);

    return { recordId, success: true };
  }

  /**
   * Update processing record
   */
  static async updateProcessingRecord(recordId, updates) {
    const record = GDPR_DATA.processingRecords.get(recordId);
    if (!record) {
      throw new Error('Processing record not found');
    }

    Object.assign(record, updates);
    record.lastModified = new Date().toISOString();

    return { success: true, recordId };
  }

  /**
   * Get processing records for controller/processor
   */
  static getRecordsForController(controllerId) {
    return Array.from(GDPR_DATA.processingRecords.values())
      .filter(record => record.controllerId === controllerId);
  }

  /**
   * Validate processing record meets Article 30 requirements
   */
  static validateProcessingRecord(record) {
    const required = [
      'controllerName', 'controllerAddress', 'controllerContact',
      'purpose', 'categoriesOfData', 'categoriesOfSubjects',
      'legalBasis', 'retentionPeriod'
    ];

    for (const field of required) {
      if (!record[field]) {
        throw new Error(`Missing required processing record field: ${field}`);
      }
    }

    // Validate retention period format
    if (!this.isValidRetentionPeriod(record.retentionPeriod)) {
      throw new Error('Invalid retention period format');
    }
  }

  static isValidRetentionPeriod(period) {
    // Examples: "2 years", "6 months", "indefinite with review"
    const pattern = /^(\d+\s+(years?|months?|days?|weeks?))|indefinite/i;
    return pattern.test(period);
  }
}

// ============================================================================
// BREACH NOTIFICATION (Article 33-34)
// ============================================================================

class BreachNotification {
  /**
   * Record a personal data breach
   */
  static async recordBreach(breachData) {
    const breachId = crypto.randomUUID();

    const breach = {
      breachId,
      ...breachData,
      timestamp: new Date().toISOString(),
      notified: false,
      riskAssessment: this.assessBreachRisk(breachData)
    };

    // Validate breach data
    this.validateBreach(breach);

    GDPR_DATA.breachNotifications.push(breach);

    // Check if notification is required (72 hours)
    if (breach.riskAssessment.highRisk) {
      await this.scheduleNotification(breach);
    }

    DataSubjectRights.logAuditEvent('BREACH_RECORDED', 'system', {
      breachId,
      affectedSubjects: breachData.affectedSubjects,
      riskLevel: breach.riskAssessment.level,
      timestamp: breach.timestamp
    });

    return { breachId, success: true, requiresNotification: breach.riskAssessment.highRisk };
  }

  /**
   * Assess risk level of breach
   */
  static assessBreachRisk(breachData) {
    let riskScore = 0;

    // Factors increasing risk
    if (breachData.sensitiveData) riskScore += 3;
    if (breachData.affectedSubjects > 1000) riskScore += 2;
    if (breachData.affectedSubjects > 10000) riskScore += 3;
    if (breachData.unencrypted) riskScore += 2;
    if (breachData.publiclyAccessible) riskScore += 3;

    // Determine risk level
    let level, highRisk;
    if (riskScore >= 8) {
      level = 'high';
      highRisk = true;
    } else if (riskScore >= 4) {
      level = 'medium';
      highRisk = false;
    } else {
      level = 'low';
      highRisk = false;
    }

    return { level, highRisk, score: riskScore };
  }

  /**
   * Schedule breach notification
   */
  static async scheduleNotification(breach) {
    // In a real implementation, this would integrate with notification systems
    console.log(`🚨 HIGH-RISK BREACH DETECTED: ${breach.breachId}`);
    console.log(`📊 Risk Level: ${breach.riskAssessment.level}`);
    console.log(`👥 Affected Subjects: ${breach.affectedSubjects}`);
    console.log(`⏰ Notification required within 72 hours`);

    // Mark as requiring notification
    breach.notificationRequired = true;
    breach.notificationDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  }

  /**
   * Mark breach as notified
   */
  static async markNotified(breachId, notificationDetails) {
    const breach = GDPR_DATA.breachNotifications.find(b => b.breachId === breachId);
    if (!breach) {
      throw new Error('Breach not found');
    }

    breach.notified = true;
    breach.notificationDetails = {
      ...notificationDetails,
      notifiedAt: new Date().toISOString()
    };

    return { success: true, breachId };
  }

  static validateBreach(breach) {
    const required = ['description', 'affectedSubjects', 'dataCategories'];

    for (const field of required) {
      if (!breach[field]) {
        throw new Error(`Missing required breach field: ${field}`);
      }
    }
  }
}

// ============================================================================
// DATA PROTECTION IMPACT ASSESSMENT (Article 35)
// ============================================================================

class DPIA {
  /**
   * Conduct Data Protection Impact Assessment
   */
  static async conductDPIA(projectData) {
    const dpiaId = crypto.randomUUID();

    const dpia = {
      dpiaId,
      ...projectData,
      timestamp: new Date().toISOString(),
      status: 'in-progress',
      riskAssessment: this.assessProcessingRisk(projectData),
      mitigationMeasures: [],
      conclusion: null
    };

    // Determine if DPIA is required
    dpia.required = this.isDPIARequired(projectData);

    if (dpia.required) {
      dpia.recommendations = this.generateRecommendations(dpia.riskAssessment);
    }

    GDPR_DATA.dpia.set(dpiaId, dpia);

    return { dpiaId, required: dpia.required, riskLevel: dpia.riskAssessment.level };
  }

  /**
   * Assess risk level of processing activity
   */
  static assessProcessingRisk(projectData) {
    let riskScore = 0;

    // High risk factors
    if (projectData.largeScale) riskScore += 3;
    if (projectData.systematicMonitoring) riskScore += 3;
    if (projectData.sensitiveData) riskScore += 3;
    if (projectData.vulnerableSubjects) riskScore += 2;
    if (projectData.publicData) riskScore += 2;
    if (projectData.innovativeTech) riskScore += 2;
    if (projectData.preventRights) riskScore += 3;

    let level;
    if (riskScore >= 10) level = 'high';
    else if (riskScore >= 5) level = 'medium';
    else level = 'low';

    return { level, score: riskScore, factors: this.getRiskFactors(riskScore) };
  }

  /**
   * Check if DPIA is required (Article 35)
   */
  static isDPIARequired(projectData) {
    // DPIA required for high-risk processing
    const risk = this.assessProcessingRisk(projectData);
    return risk.level === 'high';
  }

  /**
   * Generate DPIA recommendations
   */
  static generateRecommendations(riskAssessment) {
    const recommendations = [];

    if (riskAssessment.level === 'high') {
      recommendations.push('Implement strong encryption for data at rest and in transit');
      recommendations.push('Conduct regular security audits and penetration testing');
      recommendations.push('Implement data minimization principles');
      recommendations.push('Establish clear data retention policies');
      recommendations.push('Provide comprehensive privacy notices');
      recommendations.push('Implement automated data deletion mechanisms');
    }

    return recommendations;
  }

  static getRiskFactors(score) {
    const factors = [];
    if (score >= 3) factors.push('large-scale-processing');
    if (score >= 6) factors.push('sensitive-data');
    if (score >= 9) factors.push('high-risk-combination');
    return factors;
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

// Rate limiting for GDPR requests
const gdprLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many GDPR requests from this IP, please try again later.'
});

app.use('/gdpr', gdprLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GDPR Compliance Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Data Subject Rights
app.post('/gdpr/access/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const result = await DataSubjectRights.rightOfAccess(subjectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/gdpr/rectify/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { corrections } = req.body;
    const result = await DataSubjectRights.rightToRectification(subjectId, corrections);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/gdpr/erase/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { reason } = req.body;
    const result = await DataSubjectRights.rightToErasure(subjectId, reason);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/gdpr/portability/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const result = await DataSubjectRights.rightToPortability(subjectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/gdpr/restrict/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { restrictionType } = req.body;
    const result = await DataSubjectRights.rightToRestriction(subjectId, restrictionType);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/gdpr/object/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { objectionReason } = req.body;
    const result = await DataSubjectRights.rightToObject(subjectId, objectionReason);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Consent Management
app.post('/gdpr/consent', async (req, res) => {
  try {
    const consentData = req.body;
    const result = await ConsentManager.recordConsent(consentData.subjectId, consentData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/gdpr/consent/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { subjectId } = req.body;
    const result = await ConsentManager.withdrawConsent(consentId, subjectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/gdpr/consent/valid/:subjectId/:purpose', (req, res) => {
  try {
    const { subjectId, purpose } = req.params;
    const isValid = ConsentManager.isConsentValid(subjectId, purpose);
    res.json({ success: true, valid: isValid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Processing Records
app.post('/gdpr/processing-record', async (req, res) => {
  try {
    const activityData = req.body;
    const result = await ProcessingRecords.recordProcessingActivity(activityData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/gdpr/processing-records/:controllerId', (req, res) => {
  try {
    const { controllerId } = req.params;
    const records = ProcessingRecords.getRecordsForController(controllerId);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Breach Notification
app.post('/gdpr/breach', async (req, res) => {
  try {
    const breachData = req.body;
    const result = await BreachNotification.recordBreach(breachData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/gdpr/breach/:breachId/notified', async (req, res) => {
  try {
    const { breachId } = req.params;
    const notificationDetails = req.body;
    const result = await BreachNotification.markNotified(breachId, notificationDetails);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/gdpr/breaches', (req, res) => {
  try {
    const breaches = GDPR_DATA.breachNotifications;
    res.json({ success: true, data: breaches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DPIA
app.post('/gdpr/dpia', async (req, res) => {
  try {
    const projectData = req.body;
    const result = await DPIA.conductDPIA(projectData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Audit Log
app.get('/gdpr/audit', (req, res) => {
  try {
    const { subjectId, eventType, limit = 100 } = req.query;

    let auditLog = GDPR_DATA.auditLog;

    if (subjectId) {
      auditLog = auditLog.filter(entry => entry.subjectId === subjectId);
    }

    if (eventType) {
      auditLog = auditLog.filter(entry => entry.eventType === eventType);
    }

    // Return most recent entries
    auditLog = auditLog.slice(-parseInt(limit));

    res.json({ success: true, data: auditLog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compliance Dashboard
app.get('/gdpr/dashboard', (req, res) => {
  try {
    const dashboard = {
      summary: {
        totalSubjects: GDPR_DATA.dataSubjects.size,
        totalConsents: GDPR_DATA.consents.size,
        totalProcessingRecords: GDPR_DATA.processingRecords.size,
        totalBreaches: GDPR_DATA.breachNotifications.length,
        activeDPIAs: Array.from(GDPR_DATA.dpia.values()).filter(d => d.status === 'in-progress').length
      },
      recentActivity: GDPR_DATA.auditLog.slice(-10),
      complianceStatus: getComplianceStatus(),
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
    nextAuditDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  };

  // Check for unnotified high-risk breaches
  const unnotifiedBreaches = GDPR_DATA.breachNotifications.filter(
    breach => breach.riskAssessment?.highRisk && !breach.notified
  );

  if (unnotifiedBreaches.length > 0) {
    status.overall = 'non-compliant';
    status.issues.push(`${unnotifiedBreaches.length} high-risk breaches not notified within 72 hours`);
  }

  // Check for expired consents that are still valid
  const expiredConsents = Array.from(GDPR_DATA.consents.values()).filter(
    consent => consent.expiryDate && new Date(consent.expiryDate) < new Date() && consent.valid
  );

  if (expiredConsents.length > 0) {
    status.issues.push(`${expiredConsents.length} consents have expired but are still marked as valid`);
  }

  return status;
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 GDPR Compliance Service running on port ${PORT}`);
  console.log(`📊 Service provides comprehensive GDPR compliance including:`);
  console.log(`   • Data Subject Rights (Articles 15-21)`);
  console.log(`   • Consent Management`);
  console.log(`   • Data Processing Records (Article 30)`);
  console.log(`   • Breach Notification (Articles 33-34)`);
  console.log(`   • Data Protection Impact Assessment (Article 35)`);
  console.log(`   • Automated Compliance Monitoring`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Dashboard: http://localhost:${PORT}/gdpr/dashboard`);
});

// Export for testing
export {
  DataSubjectRights,
  ConsentManager,
  ProcessingRecords,
  BreachNotification,
  DPIA,
  GDPR_DATA
};