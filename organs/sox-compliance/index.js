/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * SOX Compliance Module
 *
 * Implements comprehensive SOX compliance including:
 * - Financial reporting controls (Section 404)
 * - Audit trails and change management
 * - Access controls for financial data
 * - Internal controls documentation
 * - Certification and attestation
 * - Whistleblower protections
 * - Document retention policies
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
const PORT = process.env.SOX_PORT || 4082;

// ============================================================================
// SOX COMPLIANCE DATA STRUCTURES
// ============================================================================

const SOX_DATA = {
  financialControls: new Map(), // Internal controls documentation
  auditTrail: [], // Comprehensive audit trail
  changeLogs: new Map(), // Change management logs
  accessControls: new Map(), // Access controls for financial data
  certifications: new Map(), // SOX certifications and attestations
  whistleblowerReports: [], // Anonymous whistleblower reports
  documentRetention: new Map(), // Document retention schedules
  materialEvents: [] // Material events requiring disclosure
};

// ============================================================================
// FINANCIAL REPORTING CONTROLS (SECTION 404)
// ============================================================================

class FinancialControls {
  /**
   * Document internal control
   */
  static async documentControl(controlData) {
    const controlId = crypto.randomUUID();

    const control = {
      controlId,
      ...controlData,
      status: 'active',
      created: new Date().toISOString(),
      lastTested: new Date().toISOString(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Annual review
      testResults: [],
      deficiencies: []
    };

    // Validate control
    this.validateControl(control);

    SOX_DATA.financialControls.set(controlId, control);

    // Log control creation
    await AuditLogger.logSOXEvent('CONTROL_CREATED', controlId, {
      controlType: controlData.controlType,
      processArea: controlData.processArea,
      riskLevel: controlData.riskLevel
    });

    return { controlId, success: true };
  }

  /**
   * Test control effectiveness
   */
  static async testControl(controlId, testData) {
    const control = SOX_DATA.financialControls.get(controlId);
    if (!control) {
      throw new Error('Control not found');
    }

    const testResult = {
      testId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...testData,
      status: testData.effective ? 'passed' : 'failed'
    };

    control.testResults.push(testResult);
    control.lastTested = new Date().toISOString();

    if (!testData.effective) {
      control.deficiencies.push({
        deficiencyId: crypto.randomUUID(),
        description: testData.deficiencyDescription,
        severity: testData.severity || 'medium',
        remediationPlan: testData.remediationPlan,
        reported: new Date().toISOString()
      });
    }

    // Log test result
    await AuditLogger.logSOXEvent('CONTROL_TESTED', controlId, {
      testResult: testResult.status,
      deficiencies: control.deficiencies.length
    });

    return { success: true, controlId, testResult: testResult.status };
  }

  /**
   * Get controls requiring testing
   */
  static getControlsRequiringTesting() {
    const now = new Date();
    const quarterly = 90 * 24 * 60 * 60 * 1000; // 90 days

    return Array.from(SOX_DATA.financialControls.values())
      .filter(control => {
        const lastTested = new Date(control.lastTested);
        return (now - lastTested) > quarterly;
      });
  }

  /**
   * Get control deficiencies
   */
  static getControlDeficiencies() {
    return Array.from(SOX_DATA.financialControls.values())
      .filter(control => control.deficiencies.length > 0)
      .map(control => ({
        controlId: control.controlId,
        processArea: control.processArea,
        deficiencies: control.deficiencies
      }));
  }

  static validateControl(control) {
    const required = [
      'controlType', 'processArea', 'objective', 'riskLevel',
      'controlActivities', 'responsibleParty'
    ];

    for (const field of required) {
      if (!control[field]) {
        throw new Error(`Missing required control field: ${field}`);
      }
    }

    const validTypes = ['preventive', 'detective', 'corrective'];
    if (!validTypes.includes(control.controlType)) {
      throw new Error('Invalid control type');
    }

    const validRisks = ['high', 'medium', 'low'];
    if (!validRisks.includes(control.riskLevel)) {
      throw new Error('Invalid risk level');
    }
  }
}

// ============================================================================
// AUDIT TRAIL & CHANGE MANAGEMENT
// ============================================================================

class AuditLogger {
  /**
   * Log SOX compliance events
   */
  static async logSOXEvent(eventType, entityId, details) {
    const auditEntry = {
      auditId: crypto.randomUUID(),
      eventType,
      entityId,
      timestamp: new Date().toISOString(),
      details,
      userId: 'system', // Would be populated from session
      ipAddress: 'system',
      userAgent: 'SOX-Compliance-Service'
    };

    SOX_DATA.auditTrail.push(auditEntry);

    // Keep only last 10000 entries
    if (SOX_DATA.auditTrail.length > 10000) {
      SOX_DATA.auditTrail = SOX_DATA.auditTrail.slice(-10000);
    }
  }

  /**
   * Get audit trail for entity
   */
  static getAuditTrail(entityId, startDate, endDate) {
    return SOX_DATA.auditTrail.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const inDateRange = (!startDate || entryDate >= new Date(startDate)) &&
                         (!endDate || entryDate <= new Date(endDate));
      return entry.entityId === entityId && inDateRange;
    });
  }

  /**
   * Get audit trail by event type
   */
  static getAuditTrailByType(eventType, startDate, endDate) {
    return SOX_DATA.auditTrail.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const inDateRange = (!startDate || entryDate >= new Date(startDate)) &&
                         (!endDate || entryDate <= new Date(endDate));
      return entry.eventType === eventType && inDateRange;
    });
  }
}

// ============================================================================
// CHANGE MANAGEMENT
// ============================================================================

class ChangeManagement {
  /**
   * Record change to financial system
   */
  static async recordChange(changeData) {
    const changeId = crypto.randomUUID();

    const change = {
      changeId,
      ...changeData,
      status: 'pending',
      submitted: new Date().toISOString(),
      approvals: [],
      testingResults: null,
      implementationDate: null
    };

    // Validate change
    this.validateChange(change);

    SOX_DATA.changeLogs.set(changeId, change);

    // Log change submission
    await AuditLogger.logSOXEvent('CHANGE_SUBMITTED', changeId, {
      changeType: changeData.changeType,
      impactLevel: changeData.impactLevel,
      submitter: changeData.submitter
    });

    return { changeId, success: true };
  }

  /**
   * Approve change
   */
  static async approveChange(changeId, approverId, approvalData) {
    const change = SOX_DATA.changeLogs.get(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    const approval = {
      approverId,
      timestamp: new Date().toISOString(),
      ...approvalData,
      status: 'approved'
    };

    change.approvals.push(approval);

    // Check if all required approvals received
    const requiredApprovals = this.getRequiredApprovals(change.impactLevel);
    if (change.approvals.length >= requiredApprovals) {
      change.status = 'approved';
    }

    // Log approval
    await AuditLogger.logSOXEvent('CHANGE_APPROVED', changeId, {
      approver: approverId,
      approvalLevel: approvalData.approvalLevel
    });

    return { success: true, changeId, status: change.status };
  }

  /**
   * Implement change
   */
  static async implementChange(changeId, implementationData) {
    const change = SOX_DATA.changeLogs.get(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    if (change.status !== 'approved') {
      throw new Error('Change must be approved before implementation');
    }

    change.status = 'implemented';
    change.implementationDate = new Date().toISOString();
    change.implementationResults = implementationData;

    // Log implementation
    await AuditLogger.logSOXEvent('CHANGE_IMPLEMENTED', changeId, {
      implementationDate: change.implementationDate,
      success: implementationData.success
    });

    return { success: true, changeId };
  }

  /**
   * Get pending changes
   */
  static getPendingChanges() {
    return Array.from(SOX_DATA.changeLogs.values())
      .filter(change => change.status === 'pending');
  }

  /**
   * Get approved changes awaiting implementation
   */
  static getApprovedChanges() {
    return Array.from(SOX_DATA.changeLogs.values())
      .filter(change => change.status === 'approved');
  }

  static validateChange(change) {
    const required = [
      'changeType', 'description', 'impactLevel', 'submitter',
      'affectedSystems', 'businessJustification'
    ];

    for (const field of required) {
      if (!change[field]) {
        throw new Error(`Missing required change field: ${field}`);
      }
    }

    const validTypes = ['enhancement', 'bug-fix', 'security-patch', 'infrastructure'];
    if (!validTypes.includes(change.changeType)) {
      throw new Error('Invalid change type');
    }

    const validImpacts = ['high', 'medium', 'low'];
    if (!validImpacts.includes(change.impactLevel)) {
      throw new Error('Invalid impact level');
    }
  }

  static getRequiredApprovals(impactLevel) {
    const approvalMatrix = {
      high: 3,    // Requires 3 approvals
      medium: 2,  // Requires 2 approvals
      low: 1      // Requires 1 approval
    };

    return approvalMatrix[impactLevel] || 1;
  }
}

// ============================================================================
// ACCESS CONTROLS FOR FINANCIAL DATA
// ============================================================================

class AccessControls {
  /**
   * Grant access to financial data
   */
  static async grantAccess(accessData) {
    const accessId = crypto.randomUUID();

    const access = {
      accessId,
      ...accessData,
      granted: new Date().toISOString(),
      status: 'active',
      lastAccessed: null,
      accessLog: []
    };

    // Validate access request
    this.validateAccess(access);

    SOX_DATA.accessControls.set(accessId, access);

    // Log access grant
    await AuditLogger.logSOXEvent('ACCESS_GRANTED', accessId, {
      userId: accessData.userId,
      dataType: accessData.dataType,
      accessLevel: accessData.accessLevel
    });

    return { accessId, success: true };
  }

  /**
   * Revoke access
   */
  static async revokeAccess(accessId, reason) {
    const access = SOX_DATA.accessControls.get(accessId);
    if (!access) {
      throw new Error('Access not found');
    }

    access.status = 'revoked';
    access.revokedAt = new Date().toISOString();
    access.revokeReason = reason;

    // Log access revocation
    await AuditLogger.logSOXEvent('ACCESS_REVOKED', accessId, {
      reason,
      userId: access.userId
    });

    return { success: true, accessId };
  }

  /**
   * Log access attempt
   */
  static async logAccessAttempt(accessId, attemptData) {
    const access = SOX_DATA.accessControls.get(accessId);
    if (!access) {
      throw new Error('Access not found');
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      ...attemptData
    };

    access.accessLog.push(logEntry);
    access.lastAccessed = new Date().toISOString();

    // Log access attempt
    await AuditLogger.logSOXEvent('ACCESS_ATTEMPT', accessId, {
      success: attemptData.success,
      userId: access.userId,
      action: attemptData.action
    });

    return { success: true };
  }

  /**
   * Check if user has access
   */
  static hasAccess(userId, dataType, action) {
    const userAccess = Array.from(SOX_DATA.accessControls.values())
      .filter(access =>
        access.userId === userId &&
        access.dataType === dataType &&
        access.status === 'active'
      );

    return userAccess.some(access =>
      access.permissions.includes(action)
    );
  }

  /**
   * Get access violations
   */
  static getAccessViolations(startDate, endDate) {
    const violations = [];

    for (const access of SOX_DATA.accessControls.values()) {
      const relevantLogs = access.accessLog.filter(log => {
        const logDate = new Date(log.timestamp);
        const inDateRange = (!startDate || logDate >= new Date(startDate)) &&
                           (!endDate || logDate <= new Date(endDate));
        return inDateRange && !log.success;
      });

      if (relevantLogs.length > 0) {
        violations.push({
          accessId: access.accessId,
          userId: access.userId,
          dataType: access.dataType,
          violations: relevantLogs
        });
      }
    }

    return violations;
  }

  static validateAccess(access) {
    const required = ['userId', 'dataType', 'accessLevel', 'permissions', 'justification'];

    for (const field of required) {
      if (!access[field]) {
        throw new Error(`Missing required access field: ${field}`);
      }
    }

    const validLevels = ['read', 'write', 'admin'];
    if (!validLevels.includes(access.accessLevel)) {
      throw new Error('Invalid access level');
    }

    if (!Array.isArray(access.permissions)) {
      throw new Error('Permissions must be an array');
    }
  }
}

// ============================================================================
// SOX CERTIFICATIONS & ATTESTATIONS
// ============================================================================

class Certifications {
  /**
   * Record SOX certification
   */
  static async recordCertification(certificationData) {
    const certId = crypto.randomUUID();

    const certification = {
      certId,
      ...certificationData,
      status: 'active',
      issued: new Date().toISOString(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      attestations: []
    };

    // Validate certification
    this.validateCertification(certification);

    SOX_DATA.certifications.set(certId, certification);

    // Log certification
    await AuditLogger.logSOXEvent('CERTIFICATION_ISSUED', certId, {
      certifier: certificationData.certifier,
      scope: certificationData.scope,
      period: certificationData.period
    });

    return { certId, success: true };
  }

  /**
   * Record attestation
   */
  static async recordAttestation(certId, attestationData) {
    const certification = SOX_DATA.certifications.get(certId);
    if (!certification) {
      throw new Error('Certification not found');
    }

    const attestation = {
      attestationId: crypto.randomUUID(),
      ...attestationData,
      timestamp: new Date().toISOString()
    };

    certification.attestations.push(attestation);

    // Log attestation
    await AuditLogger.logSOXEvent('ATTESTATION_RECORDED', certId, {
      attester: attestationData.attester,
      role: attestationData.role,
      statement: attestationData.statement
    });

    return { success: true, attestationId: attestation.attestationId };
  }

  /**
   * Get certifications expiring soon
   */
  static getExpiringCertifications(days = 90) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return Array.from(SOX_DATA.certifications.values())
      .filter(cert => new Date(cert.expires) <= futureDate);
  }

  static validateCertification(cert) {
    const required = ['certifier', 'scope', 'period', 'controlEffectiveness'];

    for (const field of required) {
      if (!cert[field]) {
        throw new Error(`Missing required certification field: ${field}`);
      }
    }
  }
}

// ============================================================================
// WHISTLEBLOWER REPORTING
// ============================================================================

class WhistleblowerProtection {
  /**
   * Submit anonymous whistleblower report
   */
  static async submitReport(reportData) {
    const reportId = crypto.randomUUID();

    const report = {
      reportId,
      ...reportData,
      submitted: new Date().toISOString(),
      status: 'received',
      anonymous: reportData.anonymous !== false, // Default to anonymous
      investigationStatus: null,
      findings: null,
      actions: []
    };

    // Remove identifying information if anonymous
    if (report.anonymous) {
      delete report.reporterName;
      delete report.reporterContact;
    }

    SOX_DATA.whistleblowerReports.push(report);

    // Log report submission (without sensitive details)
    await AuditLogger.logSOXEvent('WHISTLEBLOWER_REPORT', reportId, {
      category: reportData.category,
      severity: reportData.severity,
      anonymous: report.anonymous
    });

    return { reportId, success: true, anonymous: report.anonymous };
  }

  /**
   * Update investigation status
   */
  static async updateInvestigation(reportId, updateData) {
    const report = SOX_DATA.whistleblowerReports.find(r => r.reportId === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    report.investigationStatus = updateData.status;
    report.lastUpdated = new Date().toISOString();

    if (updateData.findings) {
      report.findings = updateData.findings;
    }

    if (updateData.actions) {
      report.actions.push(...updateData.actions.map(action => ({
        ...action,
        timestamp: new Date().toISOString()
      })));
    }

    // Log investigation update
    await AuditLogger.logSOXEvent('INVESTIGATION_UPDATE', reportId, {
      status: updateData.status,
      hasFindings: !!updateData.findings
    });

    return { success: true, reportId };
  }

  /**
   * Get reports by status
   */
  static getReportsByStatus(status) {
    return SOX_DATA.whistleblowerReports.filter(report => report.status === status);
  }

  /**
   * Get reports requiring investigation
   */
  static getReportsRequiringInvestigation() {
    return SOX_DATA.whistleblowerReports.filter(report =>
      report.status === 'received' || report.investigationStatus === 'pending'
    );
  }
}

// ============================================================================
// MATERIAL EVENTS & DISCLOSURES
// ============================================================================

class MaterialEvents {
  /**
   * Record material event
   */
  static async recordEvent(eventData) {
    const eventId = crypto.randomUUID();

    const event = {
      eventId,
      ...eventData,
      recorded: new Date().toISOString(),
      disclosureStatus: 'pending',
      disclosures: [],
      impact: this.assessImpact(eventData)
    };

    // Validate event
    this.validateEvent(event);

    SOX_DATA.materialEvents.push(event);

    // Log material event
    await AuditLogger.logSOXEvent('MATERIAL_EVENT', eventId, {
      eventType: eventData.eventType,
      impactLevel: event.impact.level,
      requiresDisclosure: event.impact.requiresDisclosure
    });

    return { eventId, success: true, requiresDisclosure: event.impact.requiresDisclosure };
  }

  /**
   * Record disclosure
   */
  static async recordDisclosure(eventId, disclosureData) {
    const event = SOX_DATA.materialEvents.find(e => e.eventId === eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const disclosure = {
      disclosureId: crypto.randomUUID(),
      ...disclosureData,
      timestamp: new Date().toISOString()
    };

    event.disclosures.push(disclosure);
    event.disclosureStatus = 'disclosed';

    // Log disclosure
    await AuditLogger.logSOXEvent('EVENT_DISCLOSED', eventId, {
      method: disclosureData.method,
      audience: disclosureData.audience
    });

    return { success: true, disclosureId: disclosure.disclosureId };
  }

  /**
   * Assess impact of event
   */
  static assessImpact(eventData) {
    let impactScore = 0;

    // Financial impact factors
    if (eventData.financialImpact > 1000000) impactScore += 3; // $1M+
    if (eventData.financialImpact > 10000000) impactScore += 2; // $10M+

    // Operational impact
    if (eventData.operationalDisruption === 'severe') impactScore += 3;
    if (eventData.operationalDisruption === 'moderate') impactScore += 2;

    // Regulatory impact
    if (eventData.regulatoryImpact) impactScore += 2;

    // Reputation impact
    if (eventData.reputationImpact === 'severe') impactScore += 2;

    let level, requiresDisclosure;
    if (impactScore >= 8) {
      level = 'high';
      requiresDisclosure = true;
    } else if (impactScore >= 4) {
      level = 'medium';
      requiresDisclosure = true;
    } else {
      level = 'low';
      requiresDisclosure = false;
    }

    return { level, score: impactScore, requiresDisclosure };
  }

  static validateEvent(event) {
    const required = ['eventType', 'description', 'dateOccurred'];

    for (const field of required) {
      if (!event[field]) {
        throw new Error(`Missing required event field: ${field}`);
      }
    }
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

// Rate limiting for SOX requests
const soxLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many SOX requests from this IP, please try again later.'
});

app.use('/sox', soxLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SOX Compliance Module',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Financial Controls
app.post('/sox/controls', async (req, res) => {
  try {
    const controlData = req.body;
    const result = await FinancialControls.documentControl(controlData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sox/controls/:controlId/test', async (req, res) => {
  try {
    const { controlId } = req.params;
    const testData = req.body;
    const result = await FinancialControls.testControl(controlId, testData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sox/controls/testing-required', (req, res) => {
  try {
    const controls = FinancialControls.getControlsRequiringTesting();
    res.json({ success: true, data: controls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/sox/controls/deficiencies', (req, res) => {
  try {
    const deficiencies = FinancialControls.getControlDeficiencies();
    res.json({ success: true, data: deficiencies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change Management
app.post('/sox/changes', async (req, res) => {
  try {
    const changeData = req.body;
    const result = await ChangeManagement.recordChange(changeData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sox/changes/:changeId/approve', async (req, res) => {
  try {
    const { changeId } = req.params;
    const { approverId, ...approvalData } = req.body;
    const result = await ChangeManagement.approveChange(changeId, approverId, approvalData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sox/changes/:changeId/implement', async (req, res) => {
  try {
    const { changeId } = req.params;
    const implementationData = req.body;
    const result = await ChangeManagement.implementChange(changeId, implementationData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sox/changes/pending', (req, res) => {
  try {
    const changes = ChangeManagement.getPendingChanges();
    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Access Controls
app.post('/sox/access', async (req, res) => {
  try {
    const accessData = req.body;
    const result = await AccessControls.grantAccess(accessData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/sox/access/:accessId', async (req, res) => {
  try {
    const { accessId } = req.params;
    const { reason } = req.body;
    const result = await AccessControls.revokeAccess(accessId, reason);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sox/access/violations', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const violations = AccessControls.getAccessViolations(startDate, endDate);
    res.json({ success: true, data: violations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Certifications
app.post('/sox/certifications', async (req, res) => {
  try {
    const certData = req.body;
    const result = await Certifications.recordCertification(certData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sox/certifications/:certId/attest', async (req, res) => {
  try {
    const { certId } = req.params;
    const attestationData = req.body;
    const result = await Certifications.recordAttestation(certId, attestationData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sox/certifications/expiring', (req, res) => {
  try {
    const certifications = Certifications.getExpiringCertifications();
    res.json({ success: true, data: certifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Whistleblower Reports
app.post('/sox/whistleblower', async (req, res) => {
  try {
    const reportData = req.body;
    const result = await WhistleblowerProtection.submitReport(reportData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/sox/whistleblower/:reportId/investigation', async (req, res) => {
  try {
    const { reportId } = req.params;
    const updateData = req.body;
    const result = await WhistleblowerProtection.updateInvestigation(reportId, updateData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sox/whistleblower/investigation-required', (req, res) => {
  try {
    const reports = WhistleblowerProtection.getReportsRequiringInvestigation();
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Material Events
app.post('/sox/material-events', async (req, res) => {
  try {
    const eventData = req.body;
    const result = await MaterialEvents.recordEvent(eventData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sox/material-events/:eventId/disclose', async (req, res) => {
  try {
    const { eventId } = req.params;
    const disclosureData = req.body;
    const result = await MaterialEvents.recordDisclosure(eventId, disclosureData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Audit Trail
app.get('/sox/audit/:entityId', (req, res) => {
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
app.get('/sox/dashboard', (req, res) => {
  try {
    const dashboard = {
      summary: {
        totalControls: SOX_DATA.financialControls.size,
        controlsRequiringTesting: FinancialControls.getControlsRequiringTesting().length,
        controlDeficiencies: FinancialControls.getControlDeficiencies().length,
        pendingChanges: ChangeManagement.getPendingChanges().length,
        activeAccessControls: Array.from(SOX_DATA.accessControls.values())
          .filter(access => access.status === 'active').length,
        totalCertifications: SOX_DATA.certifications.size,
        whistleblowerReports: SOX_DATA.whistleblowerReports.length,
        materialEvents: SOX_DATA.materialEvents.length
      },
      recentActivity: SOX_DATA.auditTrail.slice(-10),
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

  // Check for control deficiencies
  const deficiencies = FinancialControls.getControlDeficiencies();
  if (deficiencies.length > 0) {
    status.issues.push(`${deficiencies.length} control deficiencies identified`);
  }

  // Check for controls requiring testing
  const controlsNeedingTesting = FinancialControls.getControlsRequiringTesting();
  if (controlsNeedingTesting.length > 0) {
    status.issues.push(`${controlsNeedingTesting.length} controls require testing`);
  }

  // Check for pending changes
  const pendingChanges = ChangeManagement.getPendingChanges();
  if (pendingChanges.length > 0) {
    status.issues.push(`${pendingChanges.length} changes pending approval`);
  }

  // Check for expiring certifications
  const expiringCerts = Certifications.getExpiringCertifications(90);
  if (expiringCerts.length > 0) {
    status.issues.push(`${expiringCerts.length} certifications expiring within 90 days`);
  }

  // Check for whistleblower reports requiring investigation
  const reportsNeedingInvestigation = WhistleblowerProtection.getReportsRequiringInvestigation();
  if (reportsNeedingInvestigation.length > 0) {
    status.issues.push(`${reportsNeedingInvestigation.length} whistleblower reports require investigation`);
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
    console.log(`📈 SOX Compliance Module running on port ${PORT}`);
    console.log(`📊 Service provides comprehensive SOX compliance including:`);
    console.log(`   • Financial Reporting Controls (Section 404)`);
    console.log(`   • Audit Trails & Change Management`);
    console.log(`   • Access Controls for Financial Data`);
    console.log(`   • SOX Certifications & Attestations`);
    console.log(`   • Whistleblower Protection Program`);
    console.log(`   • Material Events & Disclosure Management`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Dashboard: http://localhost:${PORT}/sox/dashboard`);
  });
}

// Export for testing
export {
  FinancialControls,
  AuditLogger,
  ChangeManagement,
  AccessControls,
  Certifications,
  WhistleblowerProtection,
  MaterialEvents,
  SOX_DATA
};