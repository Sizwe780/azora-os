/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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

// Import modular classes
import { PHIProtection } from './PHIProtection.js';
import { AuditLogger } from './AuditLogger.js';
import { BreachNotification } from './BreachNotification.js';
import { BusinessAssociateAgreements } from './BusinessAssociateAgreements.js';
import { RiskAnalysis } from './RiskAnalysis.js';

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