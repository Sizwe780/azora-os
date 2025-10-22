/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * LGPD Compliance Module
 *
 * Implements comprehensive Lei Geral de Proteção de Dados (Brazilian General Data Protection Law) compliance including:
 * - Data subject rights (access, rectification, erasure, portability, objection)
 * - Data processing principles and legal bases
 * - Data Protection Officer (DPO) requirements
 * - Data processing inventory and records
 * - Cross-border data transfer rules
 * - Data breach notification (within 72 hours for high-risk breaches)
 * - Data Protection Impact Assessment (DPIA) requirements
 * - Children's data protection (under 12 years old)
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
const PORT = process.env.LGPD_PORT || 4085;

// ============================================================================
// LGPD COMPLIANCE DATA STRUCTURES
// ============================================================================

const LGPD_DATA = {
  personalData: new Map(), // Personal data records
  processingRecords: new Map(), // Data processing records
  dataSubjects: new Map(), // Data subject information
  consentRecords: new Map(), // Consent management
  dpiaAssessments: new Map(), // Data Protection Impact Assessments
  breachNotifications: [], // Breach notification records
  accessRequests: new Map(), // Data subject access requests
  rectificationRequests: new Map(), // Rectification requests
  erasureRequests: new Map(), // Right to erasure requests
  portabilityRequests: new Map(), // Data portability requests
  objectionRequests: new Map(), // Objection requests
  childrenData: new Map(), // Children's data (special protections)
  crossBorderTransfers: new Map(), // International data transfers
  auditTrail: [] // Audit trail for compliance logging
};

// ============================================================================
// DATA SUBJECT RIGHTS MANAGEMENT
// ============================================================================

class DataSubjectRights {
  static async submitAccessRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      requestType: 'access',
      submittedAt: new Date().toISOString(),
      status: 'received',
      verificationStatus: 'pending',
      completionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days for LGPD
      requestedData: requestData.requestedData || ['all']
    };

    LGPD_DATA.accessRequests.set(requestId, request);

    AuditLogger.log('access_request_submitted', {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      requestedData: requestData.requestedData
    });

    return { requestId, status: 'received' };
  }

  static async processAccessRequest(requestId) {
    const request = LGPD_DATA.accessRequests.get(requestId);
    if (!request) {
      throw new Error('Access request not found');
    }

    const personalData = PersonalDataManagement.getDataBySubject(request.dataSubjectId);
    const processingInfo = ProcessingRecords.getProcessingBySubject(request.dataSubjectId);

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.responseData = {
      personalData,
      processingInfo,
      dataSources: processingInfo.map(p => p.dataSource),
      recipients: processingInfo.flatMap(p => p.recipients || []),
      retentionPeriods: processingInfo.map(p => p.retentionPeriod)
    };

    AuditLogger.log('access_request_completed', {
      requestId,
      recordsFound: personalData.length,
      processingActivities: processingInfo.length
    });

    return {
      requestId,
      status: 'completed',
      data: request.responseData,
      completionDate: request.completedAt
    };
  }

  static async submitRectificationRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      rectificationData: requestData.rectificationData,
      reason: requestData.reason,
      submittedAt: new Date().toISOString(),
      status: 'received',
      completionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    LGPD_DATA.rectificationRequests.set(requestId, request);

    AuditLogger.log('rectification_request_submitted', {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      fieldsToRectify: Object.keys(requestData.rectificationData)
    });

    return { requestId, status: 'received' };
  }

  static async processRectificationRequest(requestId, decision) {
    const request = LGPD_DATA.rectificationRequests.get(requestId);
    if (!request) {
      throw new Error('Rectification request not found');
    }

    if (decision.approved) {
      // Update personal data records
      const dataRecords = PersonalDataManagement.getDataBySubject(request.dataSubjectId);
      dataRecords.forEach(record => {
        Object.assign(record, request.rectificationData);
        record.rectifiedAt = new Date().toISOString();
        record.rectificationReason = request.reason;
      });
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.decision = decision;

    AuditLogger.log('rectification_request_processed', {
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

  static async submitErasureRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      erasureReason: requestData.erasureReason,
      submittedAt: new Date().toISOString(),
      status: 'received',
      completionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    LGPD_DATA.erasureRequests.set(requestId, request);

    AuditLogger.log('erasure_request_submitted', {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      reason: requestData.erasureReason
    });

    return { requestId, status: 'received' };
  }

  static async processErasureRequest(requestId, decision) {
    const request = LGPD_DATA.erasureRequests.get(requestId);
    if (!request) {
      throw new Error('Erasure request not found');
    }

    if (decision.approved) {
      // Mark personal data as erased (anonymized or deleted)
      const dataRecords = PersonalDataManagement.getDataBySubject(request.dataSubjectId);
      dataRecords.forEach(record => {
        record.status = 'erased';
        record.erasedAt = new Date().toISOString();
        record.erasureReason = request.erasureReason;
        record.erasureMethod = decision.erasureMethod || 'anonymization';
      });
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.decision = decision;

    AuditLogger.log('erasure_request_processed', {
      requestId,
      approved: decision.approved,
      recordsErased: decision.approved ? dataRecords.length : 0
    });

    return {
      requestId,
      status: 'completed',
      approved: decision.approved,
      completionDate: request.completedAt
    };
  }

  static async submitPortabilityRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      requestedFormats: requestData.requestedFormats || ['json'],
      submittedAt: new Date().toISOString(),
      status: 'received',
      completionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    LGPD_DATA.portabilityRequests.set(requestId, request);

    AuditLogger.log('portability_request_submitted', {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      formats: requestData.requestedFormats
    });

    return { requestId, status: 'received' };
  }

  static async processPortabilityRequest(requestId) {
    const request = LGPD_DATA.portabilityRequests.get(requestId);
    if (!request) {
      throw new Error('Portability request not found');
    }

    const personalData = PersonalDataManagement.getDataBySubject(request.dataSubjectId);
    const processingInfo = ProcessingRecords.getProcessingBySubject(request.dataSubjectId);

    const portableData = {
      dataSubjectId: request.dataSubjectId,
      exportDate: new Date().toISOString(),
      personalData,
      processingHistory: processingInfo,
      dataControllers: processingInfo.map(p => p.controller),
      legalBases: [...new Set(processingInfo.map(p => p.legalBasis))],
      retentionPeriods: processingInfo.map(p => p.retentionPeriod)
    };

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.portableData = portableData;

    AuditLogger.log('portability_request_completed', {
      requestId,
      dataExported: personalData.length,
      formats: request.requestedFormats
    });

    return {
      requestId,
      status: 'completed',
      data: portableData,
      completionDate: request.completedAt
    };
  }

  static async submitObjectionRequest(requestData) {
    const requestId = crypto.randomUUID();
    const request = {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      objectionReason: requestData.objectionReason,
      processingIds: requestData.processingIds, // Specific processing activities to object to
      submittedAt: new Date().toISOString(),
      status: 'received',
      completionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    LGPD_DATA.objectionRequests.set(requestId, request);

    AuditLogger.log('objection_request_submitted', {
      requestId,
      dataSubjectId: requestData.dataSubjectId,
      reason: requestData.objectionReason
    });

    return { requestId, status: 'received' };
  }

  static async processObjectionRequest(requestId, decision) {
    const request = LGPD_DATA.objectionRequests.get(requestId);
    if (!request) {
      throw new Error('Objection request not found');
    }

    if (decision.approved) {
      // Stop the objected processing activities
      request.processingIds.forEach(processingId => {
        const processing = LGPD_DATA.processingRecords.get(processingId);
        if (processing) {
          processing.status = 'objected';
          processing.objectedAt = new Date().toISOString();
          processing.objectionReason = request.objectionReason;
        }
      });
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.decision = decision;

    AuditLogger.log('objection_request_processed', {
      requestId,
      approved: decision.approved,
      processingActivitiesStopped: decision.approved ? request.processingIds.length : 0
    });

    return {
      requestId,
      status: 'completed',
      approved: decision.approved,
      completionDate: request.completedAt
    };
  }

  static getPendingRequests() {
    return {
      access: Array.from(LGPD_DATA.accessRequests.values()).filter(r => r.status === 'received'),
      rectification: Array.from(LGPD_DATA.rectificationRequests.values()).filter(r => r.status === 'received'),
      erasure: Array.from(LGPD_DATA.erasureRequests.values()).filter(r => r.status === 'received'),
      portability: Array.from(LGPD_DATA.portabilityRequests.values()).filter(r => r.status === 'received'),
      objection: Array.from(LGPD_DATA.objectionRequests.values()).filter(r => r.status === 'received')
    };
  }

  static getOverdueRequests() {
    const now = new Date();
    return {
      access: Array.from(LGPD_DATA.accessRequests.values())
        .filter(r => r.status !== 'completed' && new Date(r.completionDeadline) < now),
      rectification: Array.from(LGPD_DATA.rectificationRequests.values())
        .filter(r => r.status !== 'completed' && new Date(r.completionDeadline) < now),
      erasure: Array.from(LGPD_DATA.erasureRequests.values())
        .filter(r => r.status !== 'completed' && new Date(r.completionDeadline) < now),
      portability: Array.from(LGPD_DATA.portabilityRequests.values())
        .filter(r => r.status !== 'completed' && new Date(r.completionDeadline) < now),
      objection: Array.from(LGPD_DATA.objectionRequests.values())
        .filter(r => r.status !== 'completed' && new Date(r.completionDeadline) < now)
    };
  }
}

// ============================================================================
// PERSONAL DATA MANAGEMENT
// ============================================================================

class PersonalDataManagement {
  static async collectPersonalData(collectionData) {
    const dataId = crypto.randomUUID();
    const data = {
      dataId,
      dataSubjectId: collectionData.dataSubjectId,
      dataCategory: collectionData.dataCategory,
      dataElements: collectionData.dataElements,
      collectionPurpose: collectionData.collectionPurpose,
      legalBasis: collectionData.legalBasis,
      dataSource: collectionData.dataSource,
      collectedAt: new Date().toISOString(),
      retentionPeriod: collectionData.retentionPeriod,
      securityMeasures: collectionData.securityMeasures || [],
      status: 'active',
      isSensitive: collectionData.isSensitive || false,
      consentObtained: collectionData.consentObtained || false
    };

    // Special handling for children's data (under 12)
    if (collectionData.isChildData) {
      data.isChildData = true;
      data.parentalConsent = collectionData.parentalConsent;
      LGPD_DATA.childrenData.set(dataId, data);
    }

    LGPD_DATA.personalData.set(dataId, data);

    AuditLogger.log('personal_data_collected', {
      dataId,
      dataSubjectId: collectionData.dataSubjectId,
      dataCategory: collectionData.dataCategory,
      isSensitive: data.isSensitive
    });

    return { dataId, status: 'collected' };
  }

  static async processPersonalData(dataId, processingData) {
    const data = LGPD_DATA.personalData.get(dataId);
    if (!data) {
      throw new Error('Personal data not found');
    }

    // Validate legal basis for processing
    if (!this.isValidLegalBasis(processingData.legalBasis, data)) {
      throw new Error('Invalid legal basis for processing this data');
    }

    const processingRecord = {
      processingId: crypto.randomUUID(),
      dataId,
      purpose: processingData.purpose,
      legalBasis: processingData.legalBasis,
      controller: processingData.controller,
      processor: processingData.processor,
      recipients: processingData.recipients || [],
      processingLocation: processingData.processingLocation,
      startedAt: new Date().toISOString(),
      retentionPeriod: processingData.retentionPeriod,
      securityMeasures: processingData.securityMeasures || [],
      status: 'active'
    };

    LGPD_DATA.processingRecords.set(processingRecord.processingId, processingRecord);

    if (!data.processingHistory) data.processingHistory = [];
    data.processingHistory.push(processingRecord);

    AuditLogger.log('personal_data_processed', {
      dataId,
      processingId: processingRecord.processingId,
      purpose: processingData.purpose,
      legalBasis: processingData.legalBasis
    });

    return { processingId: processingRecord.processingId, status: 'processed' };
  }

  static isValidLegalBasis(legalBasis, data) {
    const validBases = [
      'consent',
      'contract_performance',
      'legal_obligation',
      'legitimate_interest',
      'public_interest',
      'vital_interest',
      'official_authority'
    ];

    if (!validBases.includes(legalBasis)) {
      return false;
    }

    // Special validation for sensitive data
    if (data.isSensitive && legalBasis === 'consent') {
      return data.consentObtained;
    }

    // Special validation for children's data
    if (data.isChildData && legalBasis === 'consent') {
      return data.parentalConsent;
    }

    return true;
  }

  static getDataBySubject(dataSubjectId) {
    return Array.from(LGPD_DATA.personalData.values())
      .filter(data => data.dataSubjectId === dataSubjectId && data.status === 'active');
  }

  static getSensitiveData() {
    return Array.from(LGPD_DATA.personalData.values())
      .filter(data => data.isSensitive && data.status === 'active');
  }

  static getChildrenData() {
    return Array.from(LGPD_DATA.childrenData.values())
      .filter(data => data.status === 'active');
  }

  static getExpiredData() {
    const now = new Date();
    return Array.from(LGPD_DATA.personalData.values())
      .filter(data => {
        const collectedAt = new Date(data.collectedAt);
        const retentionMs = this.parseRetentionPeriod(data.retentionPeriod);
        return collectedAt.getTime() + retentionMs < now.getTime() && data.status === 'active';
      });
  }

  static parseRetentionPeriod(period) {
    const match = period.match(/(\d+)_(\w+)/);
    if (!match) return 365 * 24 * 60 * 60 * 1000; // Default 1 year

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'days': return value * 24 * 60 * 60 * 1000;
      case 'months': return value * 30 * 24 * 60 * 60 * 1000;
      case 'years': return value * 365 * 24 * 60 * 60 * 1000;
      default: return 365 * 24 * 60 * 60 * 1000;
    }
  }
}

// ============================================================================
// PROCESSING RECORDS MANAGEMENT
// ============================================================================

class ProcessingRecords {
  static async createProcessingRecord(recordData) {
    const recordId = crypto.randomUUID();
    const record = {
      recordId,
      controller: recordData.controller,
      processor: recordData.processor,
      dataSubjects: recordData.dataSubjects,
      dataCategories: recordData.dataCategories,
      processingPurposes: recordData.processingPurposes,
      legalBases: recordData.legalBases,
      recipients: recordData.recipients,
      retentionPeriods: recordData.retentionPeriods,
      securityMeasures: recordData.securityMeasures,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    LGPD_DATA.processingRecords.set(recordId, record);

    AuditLogger.log('processing_record_created', {
      recordId,
      controller: recordData.controller,
      dataSubjects: recordData.dataSubjects.length
    });

    return { recordId, status: 'created' };
  }

  static getProcessingBySubject(dataSubjectId) {
    return Array.from(LGPD_DATA.processingRecords.values())
      .filter(record => record.dataSubjects.includes(dataSubjectId) && record.status === 'active');
  }

  static getProcessingByController(controller) {
    return Array.from(LGPD_DATA.processingRecords.values())
      .filter(record => record.controller === controller && record.status === 'active');
  }

  static getHighRiskProcessing() {
    return Array.from(LGPD_DATA.processingRecords.values())
      .filter(record => this.isHighRiskProcessing(record));
  }

  static isHighRiskProcessing(record) {
    // High risk criteria for LGPD
    const highRiskPurposes = ['profiling', 'automated_decision_making', 'large_scale_processing'];
    const sensitiveCategories = ['health_data', 'genetic_data', 'biometric_data', 'racial_origin', 'political_opinions'];

    return highRiskPurposes.some(purpose => record.processingPurposes.includes(purpose)) ||
           sensitiveCategories.some(category => record.dataCategories.includes(category)) ||
           record.dataSubjects.length > 10000; // Large scale
  }
}

// ============================================================================
// DATA PROTECTION IMPACT ASSESSMENT (DPIA)
// ============================================================================

class DPIAAssessment {
  static async conductAssessment(assessmentData) {
    const assessmentId = crypto.randomUUID();
    const assessment = {
      assessmentId,
      projectName: assessmentData.projectName,
      description: assessmentData.description,
      dataCategories: assessmentData.dataCategories,
      processingPurposes: assessmentData.processingPurposes,
      riskLevel: this.assessRisk(assessmentData),
      dataSubjects: assessmentData.dataSubjects,
      scale: assessmentData.scale,
      mitigationMeasures: assessmentData.mitigationMeasures || [],
      assessmentDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      dpoApproval: assessmentData.dpoApproval,
      recommendations: assessmentData.recommendations || []
    };

    LGPD_DATA.dpiaAssessments.set(assessmentId, assessment);

    AuditLogger.log('dpia_assessment_completed', {
      assessmentId,
      projectName: assessmentData.projectName,
      riskLevel: assessment.riskLevel
    });

    return { assessmentId, riskLevel: assessment.riskLevel };
  }

  static assessRisk(assessmentData) {
    let riskScore = 0;

    // Data sensitivity
    if (assessmentData.dataCategories.includes('health_data')) riskScore += 4;
    if (assessmentData.dataCategories.includes('genetic_data')) riskScore += 4;
    if (assessmentData.dataCategories.includes('biometric_data')) riskScore += 3;
    if (assessmentData.dataCategories.includes('personal_identifiers')) riskScore += 2;

    // Processing purposes
    if (assessmentData.processingPurposes.includes('profiling')) riskScore += 3;
    if (assessmentData.processingPurposes.includes('automated_decision_making')) riskScore += 3;

    // Scale
    if (assessmentData.scale === 'large_scale') riskScore += 2;

    // Data subjects
    if (assessmentData.dataSubjects > 10000) riskScore += 2;

    if (riskScore >= 8) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  static getHighRiskAssessments() {
    return Array.from(LGPD_DATA.dpiaAssessments.values())
      .filter(assessment => assessment.riskLevel === 'high');
  }

  static getAssessmentsRequiringReview() {
    const now = new Date();
    return Array.from(LGPD_DATA.dpiaAssessments.values())
      .filter(assessment => new Date(assessment.nextReviewDate) < now);
  }
}

// ============================================================================
// CROSS-BORDER DATA TRANSFERS
// ============================================================================

class CrossBorderTransfers {
  static async recordTransfer(transferData) {
    const transferId = crypto.randomUUID();
    const transfer = {
      transferId,
      dataCategories: transferData.dataCategories,
      destinationCountry: transferData.destinationCountry,
      recipient: transferData.recipient,
      transferPurpose: transferData.transferPurpose,
      legalBasis: transferData.legalBasis,
      safeguards: transferData.safeguards,
      adequacyDecision: transferData.adequacyDecision,
      standardClauses: transferData.standardClauses,
      bindingCorporateRules: transferData.bindingCorporateRules,
      transferDate: new Date().toISOString(),
      status: 'active'
    };

    LGPD_DATA.crossBorderTransfers.set(transferId, transfer);

    AuditLogger.log('cross_border_transfer_recorded', {
      transferId,
      destinationCountry: transferData.destinationCountry,
      recipient: transferData.recipient
    });

    return { transferId, status: 'recorded' };
  }

  static getTransfersByCountry(country) {
    return Array.from(LGPD_DATA.crossBorderTransfers.values())
      .filter(transfer => transfer.destinationCountry === country && transfer.status === 'active');
  }

  static getInadequateCountryTransfers() {
    // LGPD considers these countries inadequate without additional safeguards
    const inadequateCountries = ['US', 'China', 'Russia']; // Example list

    return Array.from(LGPD_DATA.crossBorderTransfers.values())
      .filter(transfer => inadequateCountries.includes(transfer.destinationCountry) &&
                         !transfer.adequacyDecision &&
                         !transfer.standardClauses &&
                         !transfer.bindingCorporateRules);
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
      affectedDataSubjects: breachData.affectedDataSubjects,
      dataCompromised: breachData.dataCompromised,
      breachDate: breachData.breachDate,
      discoveryDate: breachData.discoveryDate,
      notificationDate: new Date().toISOString(),
      anpdNotification: breachData.anpdNotification, // National Data Protection Authority
      dataSubjectNotification: breachData.dataSubjectNotification,
      riskOfHarm: breachData.riskOfHarm,
      measuresTaken: breachData.measuresTaken,
      status: 'reported'
    };

    // LGPD requires notification within 72 hours for high-risk breaches
    const discoveryTime = new Date(breachData.discoveryDate).getTime();
    const notificationTime = new Date().getTime();
    const hoursElapsed = (notificationTime - discoveryTime) / (1000 * 60 * 60);

    breach.complianceStatus = hoursElapsed <= 72 ? 'compliant' : 'non-compliant';

    LGPD_DATA.breachNotifications.push(breach);

    AuditLogger.log('breach_recorded', {
      notificationId,
      affectedDataSubjects: breachData.affectedDataSubjects,
      breachType: breachData.breachType,
      complianceStatus: breach.complianceStatus
    });

    return { notificationId, status: 'recorded', complianceStatus: breach.complianceStatus };
  }

  static getHighRiskBreaches() {
    return LGPD_DATA.breachNotifications
      .filter(breach => breach.riskOfHarm === 'high');
  }

  static getBreachesRequiringNotification() {
    return LGPD_DATA.breachNotifications
      .filter(breach => !breach.anpdNotification || !breach.dataSubjectNotification);
  }

  static getNonCompliantNotifications() {
    return LGPD_DATA.breachNotifications
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

    LGPD_DATA.auditTrail.push(logEntry);
  }

  static getAuditTrail(entityId, startDate, endDate) {
    let filteredLogs = LGPD_DATA.auditTrail;

    if (entityId) {
      filteredLogs = filteredLogs.filter(log =>
        log.details.dataSubjectId === entityId ||
        log.details.requestId === entityId ||
        log.details.dataId === entityId
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

// Rate limiting for LGPD requests
const lgpdLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many LGPD requests from this IP, please try again later.'
});

app.use('/lgpd', lgpdLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LGPD Compliance Module',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Data Subject Rights
app.post('/lgpd/access-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await DataSubjectRights.submitAccessRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/access-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await DataSubjectRights.processAccessRequest(requestId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/rectification-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await DataSubjectRights.submitRectificationRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/rectification-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const decision = req.body;
    const result = await DataSubjectRights.processRectificationRequest(requestId, decision);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/erasure-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await DataSubjectRights.submitErasureRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/erasure-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const decision = req.body;
    const result = await DataSubjectRights.processErasureRequest(requestId, decision);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/portability-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await DataSubjectRights.submitPortabilityRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/portability-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await DataSubjectRights.processPortabilityRequest(requestId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/objection-request', async (req, res) => {
  try {
    const requestData = req.body;
    const result = await DataSubjectRights.submitObjectionRequest(requestData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/objection-request/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const decision = req.body;
    const result = await DataSubjectRights.processObjectionRequest(requestId, decision);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Personal Data Management
app.post('/lgpd/personal-data', async (req, res) => {
  try {
    const collectionData = req.body;
    const result = await PersonalDataManagement.collectPersonalData(collectionData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/lgpd/personal-data/:dataId/process', async (req, res) => {
  try {
    const { dataId } = req.params;
    const processingData = req.body;
    const result = await PersonalDataManagement.processPersonalData(dataId, processingData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Processing Records
app.post('/lgpd/processing-record', async (req, res) => {
  try {
    const recordData = req.body;
    const result = await ProcessingRecords.createProcessingRecord(recordData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/lgpd/processing-record/high-risk', (req, res) => {
  try {
    const records = ProcessingRecords.getHighRiskProcessing();
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DPIA Assessments
app.post('/lgpd/dpia-assessment', async (req, res) => {
  try {
    const assessmentData = req.body;
    const result = await DPIAAssessment.conductAssessment(assessmentData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/lgpd/dpia-assessment/high-risk', (req, res) => {
  try {
    const assessments = DPIAAssessment.getHighRiskAssessments();
    res.json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cross-border Transfers
app.post('/lgpd/cross-border-transfer', async (req, res) => {
  try {
    const transferData = req.body;
    const result = await CrossBorderTransfers.recordTransfer(transferData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/lgpd/cross-border-transfer/inadequate', (req, res) => {
  try {
    const transfers = CrossBorderTransfers.getInadequateCountryTransfers();
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Breach Notification
app.post('/lgpd/breach-notification', async (req, res) => {
  try {
    const breachData = req.body;
    const result = await BreachNotification.recordBreach(breachData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/lgpd/breach-notification/high-risk', (req, res) => {
  try {
    const breaches = BreachNotification.getHighRiskBreaches();
    res.json({ success: true, data: breaches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audit Trail
app.get('/lgpd/audit/:entityId', (req, res) => {
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
app.get('/lgpd/dashboard', (req, res) => {
  try {
    const dashboard = {
      summary: {
        totalPersonalData: LGPD_DATA.personalData.size,
        activeProcessingRecords: LGPD_DATA.processingRecords.size,
        pendingRequests: Object.values(DataSubjectRights.getPendingRequests())
          .reduce((total, requests) => total + requests.length, 0),
        overdueRequests: Object.values(DataSubjectRights.getOverdueRequests())
          .reduce((total, requests) => total + requests.length, 0),
        sensitiveDataRecords: PersonalDataManagement.getSensitiveData().length,
        childrenDataRecords: PersonalDataManagement.getChildrenData().length,
        dpiaAssessments: LGPD_DATA.dpiaAssessments.size,
        highRiskAssessments: DPIAAssessment.getHighRiskAssessments().length,
        crossBorderTransfers: LGPD_DATA.crossBorderTransfers.size,
        inadequateCountryTransfers: CrossBorderTransfers.getInadequateCountryTransfers().length,
        highRiskBreaches: BreachNotification.getHighRiskBreaches().length,
        expiredData: PersonalDataManagement.getExpiredData().length
      },
      recentActivity: LGPD_DATA.auditTrail.slice(-10),
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
  const overdueRequests = DataSubjectRights.getOverdueRequests();
  const totalOverdue = Object.values(overdueRequests).reduce((total, requests) => total + requests.length, 0);
  if (totalOverdue > 0) {
    status.issues.push(`${totalOverdue} data subject requests are overdue`);
  }

  // Check for expired personal data
  const expiredData = PersonalDataManagement.getExpiredData();
  if (expiredData.length > 0) {
    status.issues.push(`${expiredData.length} personal data records have expired`);
  }

  // Check for inadequate cross-border transfers
  const inadequateTransfers = CrossBorderTransfers.getInadequateCountryTransfers();
  if (inadequateTransfers.length > 0) {
    status.issues.push(`${inadequateTransfers.length} cross-border transfers lack adequate safeguards`);
  }

  // Check for high-risk processing without DPIA
  const highRiskProcessing = ProcessingRecords.getHighRiskProcessing();
  const highRiskAssessments = DPIAAssessment.getHighRiskAssessments();
  if (highRiskProcessing.length > highRiskAssessments.length) {
    status.issues.push(`${highRiskProcessing.length - highRiskAssessments.length} high-risk processing activities lack DPIA`);
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
    console.log(`🇧🇷 LGPD Compliance Module running on port ${PORT}`);
    console.log(`📊 Service provides comprehensive LGPD compliance including:`);
    console.log(`   • Data Subject Rights (Access, Rectification, Erasure, Portability, Objection)`);
    console.log(`   • Personal Data Processing Principles & Legal Bases`);
    console.log(`   • Data Protection Impact Assessment (DPIA)`);
    console.log(`   • Cross-border Data Transfer Controls`);
    console.log(`   • Children's Data Protection (under 12 years)`);
    console.log(`   • Breach Notification (72-hour requirement for high-risk breaches)`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Dashboard: http://localhost:${PORT}/lgpd/dashboard`);
  });
}

// Export for testing
export {
  DataSubjectRights,
  PersonalDataManagement,
  ProcessingRecords,
  DPIAAssessment,
  CrossBorderTransfers,
  BreachNotification,
  AuditLogger,
  LGPD_DATA
};