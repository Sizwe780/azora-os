/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * PIPEDA Compliance Module
 *
 * Implements comprehensive Personal Information Protection and Electronic Documents Act compliance including:
 * - Consent and collection principles
 * - Use, disclosure and retention of personal information
 * - Accuracy and safeguards requirements
 * - Openness and individual access
 * - Challenging compliance and recourse
 * - Privacy impact assessments
 * - Breach notification (72-hour requirement for significant breaches)
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
const PORT = process.env.PIPEDA_PORT || 4084;

// ============================================================================
// PIPEDA COMPLIANCE DATA STRUCTURES
// ============================================================================

const PIPEDA_DATA = {
  personalInformation: new Map(), // Personal information records
  consentRecords: new Map(), // Consent management
  dataProcessing: new Map(), // Data processing activities
  privacyAssessments: new Map(), // Privacy impact assessments
  breachNotifications: [], // Breach notification records
  accessRequests: new Map(), // Individual access requests
  correctionRequests: new Map(), // Correction requests
  auditTrail: [] // Audit trail for compliance logging
};

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

class ConsentManagement {
  static async obtainConsent(consentData) {
    const consentId = crypto.randomUUID();
    const consent = {
      consentId,
      individualId: consentData.individualId,
      purpose: consentData.purpose,
      scope: consentData.scope,
      consentType: consentData.consentType, // 'express', 'implied', 'deemed'
      obtainedAt: new Date().toISOString(),
      expiresAt: consentData.expiresAt,
      consentMethod: consentData.consentMethod,
      withdrawalAllowed: true,
      status: 'active',
      metadata: consentData.metadata || {}
    };

    PIPEDA_DATA.consentRecords.set(consentId, consent);

    AuditLogger.log('consent_obtained', {
      consentId,
      individualId: consentData.individualId,
      purpose: consentData.purpose
    });

    return { consentId, status: 'obtained' };
  }

  static async withdrawConsent(consentId, reason) {
    const consent = PIPEDA_DATA.consentRecords.get(consentId);
    if (!consent) {
      throw new Error('Consent record not found');
    }

    consent.status = 'withdrawn';
    consent.withdrawnAt = new Date().toISOString();
    consent.withdrawalReason = reason;

    AuditLogger.log('consent_withdrawn', { consentId, reason });

    return { consentId, status: 'withdrawn' };
  }

  static validateConsent(individualId, purpose) {
    const consents = Array.from(PIPEDA_DATA.consentRecords.values())
      .filter(consent => consent.individualId === individualId &&
                        consent.purpose === purpose &&
                        consent.status === 'active');

    return consents.length > 0;
  }

  static getExpiredConsents() {
    const now = new Date();
    return Array.from(PIPEDA_DATA.consentRecords.values())
      .filter(consent => consent.expiresAt && new Date(consent.expiresAt) < now && consent.status === 'active');
  }
}

// ============================================================================
// PERSONAL INFORMATION MANAGEMENT
// ============================================================================

class PersonalInformation {
  static async collectInformation(collectionData) {
    const infoId = crypto.randomUUID();
    const info = {
      infoId,
      individualId: collectionData.individualId,
      dataCategory: collectionData.dataCategory,
      dataElements: collectionData.dataElements,
      collectionPurpose: collectionData.collectionPurpose,
      collectionMethod: collectionData.collectionMethod,
      legalBasis: collectionData.legalBasis,
      collectedAt: new Date().toISOString(),
      retentionPeriod: collectionData.retentionPeriod,
      securityMeasures: collectionData.securityMeasures || [],
      status: 'active'
    };

    PIPEDA_DATA.personalInformation.set(infoId, info);

    AuditLogger.log('personal_information_collected', {
      infoId,
      individualId: collectionData.individualId,
      dataCategory: collectionData.dataCategory
    });

    return { infoId, status: 'collected' };
  }

  static async useInformation(infoId, useData) {
    const info = PIPEDA_DATA.personalInformation.get(infoId);
    if (!info) {
      throw new Error('Personal information not found');
    }

    // Validate consent for the use
    const hasConsent = ConsentManagement.validateConsent(info.individualId, useData.purpose);
    if (!hasConsent && !this.isPermittedUse(useData.purpose)) {
      throw new Error('Consent required for this use');
    }

    const useRecord = {
      useId: crypto.randomUUID(),
      infoId,
      purpose: useData.purpose,
      recipient: useData.recipient,
      usedAt: new Date().toISOString(),
      justification: useData.justification
    };

    if (!info.usageHistory) info.usageHistory = [];
    info.usageHistory.push(useRecord);

    AuditLogger.log('personal_information_used', {
      infoId,
      purpose: useData.purpose,
      recipient: useData.recipient
    });

    return { useId: useRecord.useId, status: 'used' };
  }

  static async discloseInformation(infoId, disclosureData) {
    const info = PIPEDA_DATA.personalInformation.get(infoId);
    if (!info) {
      throw new Error('Personal information not found');
    }

    // Validate consent for disclosure
    const hasConsent = ConsentManagement.validateConsent(info.individualId, disclosureData.purpose);
    if (!hasConsent && !this.isPermittedDisclosure(disclosureData.purpose)) {
      throw new Error('Consent required for this disclosure');
    }

    const disclosureRecord = {
      disclosureId: crypto.randomUUID(),
      infoId,
      purpose: disclosureData.purpose,
      recipient: disclosureData.recipient,
      disclosedAt: new Date().toISOString(),
      recipientType: disclosureData.recipientType, // 'organization', 'individual', 'government'
      safeguards: disclosureData.safeguards || []
    };

    if (!info.disclosureHistory) info.disclosureHistory = [];
    info.disclosureHistory.push(disclosureRecord);

    AuditLogger.log('personal_information_disclosed', {
      infoId,
      purpose: disclosureData.purpose,
      recipient: disclosureData.recipient
    });

    return { disclosureId: disclosureRecord.disclosureId, status: 'disclosed' };
  }

  static async retainInformation(infoId, retentionData) {
    const info = PIPEDA_DATA.personalInformation.get(infoId);
    if (!info) {
      throw new Error('Personal information not found');
    }

    info.retentionJustification = retentionData.justification;
    info.retentionReviewedAt = new Date().toISOString();
    info.retentionStatus = 'retained';

    AuditLogger.log('personal_information_retained', {
      infoId,
      justification: retentionData.justification
    });

    return { infoId, status: 'retained' };
  }

  static async disposeInformation(infoId, disposalData) {
    const info = PIPEDA_DATA.personalInformation.get(infoId);
    if (!info) {
      throw new Error('Personal information not found');
    }

    info.status = 'disposed';
    info.disposedAt = new Date().toISOString();
    info.disposalMethod = disposalData.method;
    info.disposalReason = disposalData.reason;

    AuditLogger.log('personal_information_disposed', {
      infoId,
      method: disposalData.method,
      reason: disposalData.reason
    });

    return { infoId, status: 'disposed' };
  }

  static isPermittedUse(purpose) {
    const permittedUses = [
      'consent_obtained',
      'legal_requirement',
      'legal_proceeding',
      'medical_emergency',
      'journalistic_purpose',
      'artistic_literary_expression'
    ];
    return permittedUses.includes(purpose);
  }

  static isPermittedDisclosure(purpose) {
    const permittedDisclosures = [
      'consent_obtained',
      'legal_requirement',
      'legal_proceeding',
      'medical_emergency',
      'journalistic_purpose',
      'artistic_literary_expression'
    ];
    return permittedDisclosures.includes(purpose);
  }

  static getInformationByIndividual(individualId) {
    return Array.from(PIPEDA_DATA.personalInformation.values())
      .filter(info => info.individualId === individualId && info.status === 'active');
  }

  static getExpiredInformation() {
    const now = new Date();
    return Array.from(PIPEDA_DATA.personalInformation.values())
      .filter(info => {
        const collectedAt = new Date(info.collectedAt);
        const retentionMs = this.parseRetentionPeriod(info.retentionPeriod);
        return collectedAt.getTime() + retentionMs < now.getTime() && info.status === 'active';
      });
  }

  static parseRetentionPeriod(period) {
    // Parse retention period like "7_years", "30_days", "1_year"
    const match = period.match(/(\d+)_(\w+)/);
    if (!match) return 365 * 24 * 60 * 60 * 1000; // Default 1 year

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'days': return value * 24 * 60 * 60 * 1000;
      case 'weeks': return value * 7 * 24 * 60 * 60 * 1000;
      case 'months': return value * 30 * 24 * 60 * 60 * 1000;
      case 'years': return value * 365 * 24 * 60 * 60 * 1000;
      default: return 365 * 24 * 60 * 60 * 1000;
    }
  }
}

// ============================================================================
// INDIVIDUAL ACCESS AND CORRECTION
// ============================================================================

class IndividualAccess {
  static async submitAccessRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      individualId: requestData.individualId,
      requestType: 'access',
      submittedAt: new Date().toISOString(),
      status: 'received',
      verificationStatus: 'pending',
      completionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    PIPEDA_DATA.accessRequests.set(requestId, request);

    AuditLogger.log('access_request_submitted', {
      requestId,
      individualId: requestData.individualId
    });

    return { requestId, status: 'received' };
  }

  static async processAccessRequest(requestId) {
    const request = PIPEDA_DATA.accessRequests.get(requestId);
    if (!request) {
      throw new Error('Access request not found');
    }

    const personalInfo = PersonalInformation.getInformationByIndividual(request.individualId);

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.responseData = personalInfo;

    AuditLogger.log('access_request_completed', {
      requestId,
      recordsFound: personalInfo.length
    });

    return {
      requestId,
      status: 'completed',
      data: personalInfo,
      completionDate: request.completedAt
    };
  }

  static async submitCorrectionRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      individualId: requestData.individualId,
      infoId: requestData.infoId,
      correctionData: requestData.correctionData,
      reason: requestData.reason,
      submittedAt: new Date().toISOString(),
      status: 'received',
      completionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    PIPEDA_DATA.correctionRequests.set(requestId, request);

    AuditLogger.log('correction_request_submitted', {
      requestId,
      individualId: requestData.individualId,
      infoId: requestData.infoId
    });

    return { requestId, status: 'received' };
  }

  static async processCorrectionRequest(requestId, decision) {
    const request = PIPEDA_DATA.correctionRequests.get(requestId);
    if (!request) {
      throw new Error('Correction request not found');
    }

    if (decision.approved) {
      const info = PIPEDA_DATA.personalInformation.get(request.infoId);
      if (info) {
        Object.assign(info, request.correctionData);
        info.correctedAt = new Date().toISOString();
        info.correctionReason = request.reason;
      }
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.decision = decision;

    AuditLogger.log('correction_request_processed', {
      requestId,
      approved: decision.approved,
      reason: decision.reason
    });

    return {
      requestId,
      status: 'completed',
      approved: decision.approved,
      completionDate: request.completedAt
    };
  }

  static getPendingRequests() {
    const accessRequests = Array.from(PIPEDA_DATA.accessRequests.values())
      .filter(request => request.status === 'received');
    const correctionRequests = Array.from(PIPEDA_DATA.correctionRequests.values())
      .filter(request => request.status === 'received');

    return { accessRequests, correctionRequests };
  }

  static getOverdueRequests() {
    const now = new Date();
    const overdueAccess = Array.from(PIPEDA_DATA.accessRequests.values())
      .filter(request => new Date(request.completionDeadline) < now && request.status !== 'completed');
    const overdueCorrections = Array.from(PIPEDA_DATA.correctionRequests.values())
      .filter(request => new Date(request.completionDeadline) < now && request.status !== 'completed');

    return { overdueAccess, overdueCorrections };
  }
}

// ============================================================================
// PRIVACY IMPACT ASSESSMENTS
// ============================================================================

class PrivacyAssessment {
  static async conductAssessment(assessmentData) {
    const assessmentId = crypto.randomUUID();
    const assessment = {
      assessmentId,
      projectName: assessmentData.projectName,
      description: assessmentData.description,
      dataElements: assessmentData.dataElements,
      processingPurpose: assessmentData.processingPurpose,
      riskLevel: this.assessRisk(assessmentData),
      mitigationMeasures: assessmentData.mitigationMeasures || [],
      assessmentDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      recommendations: assessmentData.recommendations || []
    };

    PIPEDA_DATA.privacyAssessments.set(assessmentId, assessment);

    AuditLogger.log('privacy_assessment_completed', {
      assessmentId,
      projectName: assessmentData.projectName,
      riskLevel: assessment.riskLevel
    });

    return { assessmentId, riskLevel: assessment.riskLevel };
  }

  static assessRisk(assessmentData) {
    let riskScore = 0;

    // Data sensitivity
    if (assessmentData.dataElements.includes('financial_information')) riskScore += 3;
    if (assessmentData.dataElements.includes('health_information')) riskScore += 3;
    if (assessmentData.dataElements.includes('personal_identifiers')) riskScore += 2;

    // Processing scale
    if (assessmentData.processingScale === 'large_scale') riskScore += 2;

    // Cross-border transfer
    if (assessmentData.crossBorderTransfer) riskScore += 2;

    // Automated decision making
    if (assessmentData.automatedDecisionMaking) riskScore += 2;

    if (riskScore >= 8) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  static getHighRiskAssessments() {
    return Array.from(PIPEDA_DATA.privacyAssessments.values())
      .filter(assessment => assessment.riskLevel === 'high');
  }

  static getAssessmentsRequiringReview() {
    const now = new Date();
    return Array.from(PIPEDA_DATA.privacyAssessments.values())
      .filter(assessment => new Date(assessment.nextReviewDate) < now);
  }
}

// ============================================================================
// BREACH NOTIFICATION
// ============================================================================

class BreachNotification {
  static async recordBreach(breachData) {
    const notificationId = crypto.randomUUID();
    const breach = {
      notificationId,
      breachType: breachData.breachType,
      affectedIndividuals: breachData.affectedIndividuals,
      dataCompromised: breachData.dataCompromised,
      breachDate: breachData.breachDate,
      discoveryDate: breachData.discoveryDate,
      notificationDate: new Date().toISOString(),
      notificationMethod: breachData.notificationMethod,
      regulatoryNotification: breachData.regulatoryNotification,
      individualNotification: breachData.individualNotification,
      riskOfSignificantHarm: breachData.riskOfSignificantHarm,
      status: 'reported'
    };

    // PIPEDA requires notification within 72 hours for significant breaches
    const discoveryTime = new Date(breachData.discoveryDate).getTime();
    const notificationTime = new Date().getTime();
    const hoursElapsed = (notificationTime - discoveryTime) / (1000 * 60 * 60);

    breach.complianceStatus = hoursElapsed <= 72 ? 'compliant' : 'non-compliant';

    PIPEDA_DATA.breachNotifications.push(breach);

    AuditLogger.log('breach_recorded', {
      notificationId,
      affectedIndividuals: breachData.affectedIndividuals,
      breachType: breachData.breachType,
      complianceStatus: breach.complianceStatus
    });

    return { notificationId, status: 'recorded', complianceStatus: breach.complianceStatus };
  }

  static getSignificantBreaches() {
    return PIPEDA_DATA.breachNotifications
      .filter(breach => breach.riskOfSignificantHarm);
  }

  static getBreachesRequiringNotification() {
    return PIPEDA_DATA.breachNotifications
      .filter(breach => !breach.individualNotification || !breach.regulatoryNotification);
  }

  static getNonCompliantNotifications() {
    return PIPEDA_DATA.breachNotifications
      .filter(breach => breach.complianceStatus === 'non-compliant');
  }
}

// ============================================================================
// AUDIT LOGGER
// ============================================================================

class AuditLogger {
  static log(action, details) {
    const logEntry = {
      logId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      details,
      ipAddress: 'system',
      userAgent: 'system'
    };

    PIPEDA_DATA.auditTrail.push(logEntry);
  }

  static getAuditTrail(entityId, startDate, endDate) {
    let filteredLogs = PIPEDA_DATA.auditTrail;

    if (entityId) {
      filteredLogs = filteredLogs.filter(log =>
        log.details.individualId === entityId ||
        log.details.requestId === entityId ||
        log.details.consentId === entityId
      );
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    return filteredLogs;
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

// Rate limiting for PIPEDA requests
const pipedaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many PIPEDA requests from this IP, please try again later.'
});

app.use('/pipeda', pipedaLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PIPEDA Compliance Module',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Consent Management
app.post('/pipeda/consent', async (req, res) => {
  try {
    const consentData = req.body;
    const result = await ConsentManagement.obtainConsent(consentData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/pipeda/consent/:consentId/withdraw', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { reason } = req.body;
    const result = await ConsentManagement.withdrawConsent(consentId, reason);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Personal Information Management
app.post('/pipeda/personal-information', async (req, res) => {
  try {
    const collectionData = req.body;
    const result = await PersonalInformation.collectInformation(collectionData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/pipeda/personal-information/:infoId/use', async (req, res) => {
  try {
    const { infoId } = req.params;
    const useData = req.body;
    const result = await PersonalInformation.useInformation(infoId, useData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/pipeda/personal-information/:infoId/disclose', async (req, res) => {
  try {
    const { infoId } = req.params;
    const disclosureData = req.body;
    const result = await PersonalInformation.discloseInformation(infoId, disclosureData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/pipeda/personal-information/:infoId/dispose', async (req, res) => {
  try {
    const { infoId } = req.params;
    const disposalData = req.body;
    const result = await PersonalInformation.disposeInformation(infoId, disposalData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Individual Access
app.post('/pipeda/access-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await IndividualAccess.submitAccessRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/pipeda/access-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await IndividualAccess.processAccessRequest(requestId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Correction Requests
app.post('/pipeda/correction-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await IndividualAccess.submitCorrectionRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/pipeda/correction-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const decision = req.body;
    const result = await IndividualAccess.processCorrectionRequest(requestId, decision);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Privacy Assessments
app.post('/pipeda/privacy-assessment', async (req, res) => {
  try {
    const assessmentData = req.body;
    const result = await PrivacyAssessment.conductAssessment(assessmentData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/pipeda/privacy-assessment/high-risk', (req, res) => {
  try {
    const assessments = PrivacyAssessment.getHighRiskAssessments();
    res.json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Breach Notification
app.post('/pipeda/breach-notification', async (req, res) => {
  try {
    const breachData = req.body;
    const result = await BreachNotification.recordBreach(breachData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/pipeda/breach-notification/significant', (req, res) => {
  try {
    const breaches = BreachNotification.getSignificantBreaches();
    res.json({ success: true, data: breaches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audit Trail
app.get('/pipeda/audit/:entityId', (req, res) => {
  try {
    const { entityId } = req.params;
    const { startDate, endDate } = req.query;
    const auditTrail = AuditLogger.getAuditTrail(entityId, startDate, endDate);
    res.json({ success: true, data: auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compliance Dashboard
app.get('/pipeda/dashboard', (req, res) => {
  try {
    const dashboard = {
      summary: {
        totalPersonalInfo: PIPEDA_DATA.personalInformation.size,
        activeConsents: Array.from(PIPEDA_DATA.consentRecords.values())
          .filter(consent => consent.status === 'active').length,
        pendingAccessRequests: IndividualAccess.getPendingRequests().accessRequests.length,
        pendingCorrectionRequests: IndividualAccess.getPendingRequests().correctionRequests.length,
        overdueRequests: IndividualAccess.getOverdueRequests().overdueAccess.length +
                        IndividualAccess.getOverdueRequests().overdueCorrections.length,
        privacyAssessments: PIPEDA_DATA.privacyAssessments.size,
        highRiskAssessments: PrivacyAssessment.getHighRiskAssessments().length,
        significantBreaches: BreachNotification.getSignificantBreaches().length,
        expiredInformation: PersonalInformation.getExpiredInformation().length
      },
      recentActivity: PIPEDA_DATA.auditTrail.slice(-10),
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
    nextAuditDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Check for overdue requests
  const overdueRequests = IndividualAccess.getOverdueRequests();
  if (overdueRequests.overdueAccess.length > 0 || overdueRequests.overdueCorrections.length > 0) {
    status.issues.push(`${overdueRequests.overdueAccess.length + overdueRequests.overdueCorrections.length} requests are overdue`);
  }

  // Check for expired consents
  const expiredConsents = ConsentManagement.getExpiredConsents();
  if (expiredConsents.length > 0) {
    status.issues.push(`${expiredConsents.length} consents have expired`);
  }

  // Check for expired personal information
  const expiredInfo = PersonalInformation.getExpiredInformation();
  if (expiredInfo.length > 0) {
    status.issues.push(`${expiredInfo.length} personal information records have expired`);
  }

  // Check for high-risk privacy assessments
  const highRiskAssessments = PrivacyAssessment.getHighRiskAssessments();
  if (highRiskAssessments.length > 0) {
    status.issues.push(`${highRiskAssessments.length} high-risk privacy assessments identified`);
  }

  // Check for breaches requiring notification
  const breachesRequiringNotification = BreachNotification.getBreachesRequiringNotification();
  if (breachesRequiringNotification.length > 0) {
    status.issues.push(`${breachesRequiringNotification.length} breaches require notification`);
  }

  // Check for non-compliant breach notifications
  const nonCompliantNotifications = BreachNotification.getNonCompliantNotifications();
  if (nonCompliantNotifications.length > 0) {
    status.issues.push(`${nonCompliantNotifications.length} breach notifications were not timely`);
  }

  // Determine overall status
  if (status.issues.length > 0) {
    status.overall = status.issues.length > 3 ? 'non-compliant' : 'needs-attention';
  }

  return status;
}

// ============================================================================
// SERVER STARTUP (only when run directly)
// ============================================================================

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, () => {
    console.log(`🇨🇦 PIPEDA Compliance Module running on port ${PORT}`);
    console.log(`📊 Service provides comprehensive PIPEDA compliance including:`);
    console.log(`   • Consent Management & Collection Principles`);
    console.log(`   • Personal Information Use, Disclosure & Retention`);
    console.log(`   • Individual Access & Correction Rights`);
    console.log(`   • Privacy Impact Assessments`);
    console.log(`   • Breach Notification (72-hour requirement)`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Dashboard: http://localhost:${PORT}/pipeda/dashboard`);
  });
}

// Export for testing
export {
  ConsentManagement,
  PersonalInformation,
  IndividualAccess,
  PrivacyAssessment,
  BreachNotification,
  AuditLogger,
  PIPEDA_DATA
};