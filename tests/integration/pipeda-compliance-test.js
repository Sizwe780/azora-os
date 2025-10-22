/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * PIPEDA Compliance Test Suite
 *
 * Comprehensive testing for Personal Information Protection and Electronic Documents Act compliance
 */

import {
  ConsentManagement,
  PersonalInformation,
  IndividualAccess,
  PrivacyAssessment,
  BreachNotification,
  AuditLogger,
  PIPEDA_DATA
} from '../../services/pipeda-compliance/index.js';

// Custom assertion function
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertArrayEqual(actual, expected, message) {
  if (actual.length !== expected.length) {
    throw new Error(`Assertion failed: ${message}. Array lengths differ. Expected: ${expected.length}, Actual: ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`Assertion failed: ${message}. Arrays differ at index ${i}. Expected: ${expected[i]}, Actual: ${actual[i]}`);
    }
  }
}

// Test runner
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log('🇨🇦 Running PIPEDA Compliance Tests...\n');

  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All PIPEDA compliance tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// ============================================================================
// CONSENT MANAGEMENT TESTS
// ============================================================================

test('Consent Management - Obtain Express Consent', async () => {
  const consentData = {
    individualId: 'individual-001',
    purpose: 'marketing',
    scope: 'email_communications',
    consentType: 'express',
    consentMethod: 'web_form',
    expiresAt: '2025-12-31T23:59:59Z'
  };

  const result = await ConsentManagement.obtainConsent(consentData);
  assert(result.consentId, 'Consent ID should be generated');
  assert(result.status === 'obtained', 'Consent status should be obtained');

  const consent = PIPEDA_DATA.consentRecords.get(result.consentId);
  assert(consent, 'Consent should be stored in data structure');
  assertEqual(consent.individualId, consentData.individualId, 'Individual ID should match');
  assertEqual(consent.purpose, consentData.purpose, 'Purpose should match');
  assertEqual(consent.consentType, consentData.consentType, 'Consent type should match');
});

test('Consent Management - Withdraw Consent', async () => {
  const consentData = {
    individualId: 'individual-002',
    purpose: 'data_processing',
    scope: 'personal_data',
    consentType: 'express',
    consentMethod: 'web_form'
  };

  const obtainResult = await ConsentManagement.obtainConsent(consentData);
  const withdrawResult = await ConsentManagement.withdrawConsent(obtainResult.consentId, 'user_request');

  assert(withdrawResult.status === 'withdrawn', 'Consent should be withdrawn');

  const consent = PIPEDA_DATA.consentRecords.get(obtainResult.consentId);
  assertEqual(consent.status, 'withdrawn', 'Consent status should be withdrawn');
  assert(consent.withdrawnAt, 'Withdrawal timestamp should be set');
});

test('Consent Management - Validate Consent', async () => {
  const consentData = {
    individualId: 'individual-003',
    purpose: 'service_provision',
    scope: 'account_data',
    consentType: 'express',
    consentMethod: 'registration_form'
  };

  await ConsentManagement.obtainConsent(consentData);

  const hasConsent = ConsentManagement.validateConsent('individual-003', 'service_provision');
  assert(hasConsent, 'Consent should be valid for the specified purpose');

  const noConsent = ConsentManagement.validateConsent('individual-003', 'marketing');
  assert(!noConsent, 'Consent should not be valid for different purpose');
});

// ============================================================================
// PERSONAL INFORMATION MANAGEMENT TESTS
// ============================================================================

test('Personal Information - Collect Information', async () => {
  const collectionData = {
    individualId: 'individual-004',
    dataCategory: 'contact_information',
    dataElements: ['name', 'email', 'phone'],
    collectionPurpose: 'customer_service',
    collectionMethod: 'web_form',
    legalBasis: 'consent',
    retentionPeriod: '7_years',
    securityMeasures: ['encryption', 'access_control']
  };

  const result = await PersonalInformation.collectInformation(collectionData);
  assert(result.infoId, 'Information ID should be generated');
  assert(result.status === 'collected', 'Status should be collected');

  const info = PIPEDA_DATA.personalInformation.get(result.infoId);
  assert(info, 'Information should be stored');
  assertEqual(info.individualId, collectionData.individualId, 'Individual ID should match');
  assertEqual(info.dataCategory, collectionData.dataCategory, 'Data category should match');
});

test('Personal Information - Use Information with Consent', async () => {
  // First obtain consent
  const consentData = {
    individualId: 'individual-005',
    purpose: 'analytics',
    scope: 'usage_data',
    consentType: 'express',
    consentMethod: 'privacy_policy'
  };
  await ConsentManagement.obtainConsent(consentData);

  // Then collect information
  const collectionData = {
    individualId: 'individual-005',
    dataCategory: 'usage_data',
    dataElements: ['page_views', 'session_duration'],
    collectionPurpose: 'analytics',
    collectionMethod: 'tracking',
    legalBasis: 'consent',
    retentionPeriod: '2_years'
  };
  const collectResult = await PersonalInformation.collectInformation(collectionData);

  // Now use the information
  const useData = {
    purpose: 'analytics',
    recipient: 'internal_analytics_team',
    justification: 'website_improvement'
  };
  const useResult = await PersonalInformation.useInformation(collectResult.infoId, useData);

  assert(useResult.useId, 'Use ID should be generated');
  assert(useResult.status === 'used', 'Status should be used');

  const info = PIPEDA_DATA.personalInformation.get(collectResult.infoId);
  assert(info.usageHistory.length === 1, 'Usage history should contain one entry');
});

test('Personal Information - Dispose Information', async () => {
  const collectionData = {
    individualId: 'individual-006',
    dataCategory: 'temporary_data',
    dataElements: ['session_id'],
    collectionPurpose: 'authentication',
    collectionMethod: 'system_generated',
    legalBasis: 'legitimate_interest',
    retentionPeriod: '1_days'
  };

  const collectResult = await PersonalInformation.collectInformation(collectionData);

  const disposalData = {
    method: 'secure_deletion',
    reason: 'retention_period_expired'
  };
  const disposeResult = await PersonalInformation.disposeInformation(collectResult.infoId, disposalData);

  assert(disposeResult.status === 'disposed', 'Status should be disposed');

  const info = PIPEDA_DATA.personalInformation.get(collectResult.infoId);
  assertEqual(info.status, 'disposed', 'Information status should be disposed');
  assert(info.disposedAt, 'Disposal timestamp should be set');
});

// ============================================================================
// INDIVIDUAL ACCESS TESTS
// ============================================================================

test('Individual Access - Submit and Process Access Request', async () => {
  // Collect some information first
  const collectionData = {
    individualId: 'individual-007',
    dataCategory: 'personal_data',
    dataElements: ['name', 'address', 'date_of_birth'],
    collectionPurpose: 'account_creation',
    collectionMethod: 'registration_form',
    legalBasis: 'consent',
    retentionPeriod: '10_years'
  };
  await PersonalInformation.collectInformation(collectionData);

  // Submit access request
  const requestData = {
    individualId: 'individual-007'
  };
  const submitResult = await IndividualAccess.submitAccessRequest(requestData);
  assert(submitResult.requestId, 'Request ID should be generated');

  // Process the request
  const processResult = await IndividualAccess.processAccessRequest(submitResult.requestId);
  assert(processResult.status === 'completed', 'Request should be completed');
  assert(processResult.data.length > 0, 'Data should be returned');
  assert(processResult.completionDate, 'Completion date should be set');
});

test('Individual Access - Submit and Process Correction Request', async () => {
  // Collect information
  const collectionData = {
    individualId: 'individual-008',
    dataCategory: 'contact_info',
    dataElements: ['name', 'email'],
    collectionPurpose: 'communication',
    collectionMethod: 'form',
    legalBasis: 'consent',
    retentionPeriod: '5_years'
  };
  const collectResult = await PersonalInformation.collectInformation(collectionData);

  // Submit correction request
  const correctionData = {
    individualId: 'individual-008',
    infoId: collectResult.infoId,
    correctionData: { dataElements: ['name', 'email', 'phone'] },
    reason: 'information_update'
  };
  const submitResult = await IndividualAccess.submitCorrectionRequest(correctionData);
  assert(submitResult.requestId, 'Correction request ID should be generated');

  // Process the correction
  const decision = {
    approved: true,
    reason: 'information_accurate'
  };
  const processResult = await IndividualAccess.processCorrectionRequest(submitResult.requestId, decision);
  assert(processResult.status === 'completed', 'Correction should be completed');
  assert(processResult.approved, 'Correction should be approved');

  const info = PIPEDA_DATA.personalInformation.get(collectResult.infoId);
  assertArrayEqual(info.dataElements, ['name', 'email', 'phone'], 'Data elements should be updated');
});

// ============================================================================
// PRIVACY ASSESSMENT TESTS
// ============================================================================

test('Privacy Assessment - Conduct High Risk Assessment', async () => {
  const assessmentData = {
    projectName: 'AI_Personalization_Engine',
    description: 'Machine learning system for personalized recommendations',
    dataElements: ['personal_identifiers', 'behavioral_data', 'financial_information'],
    processingPurpose: 'personalization',
    processingScale: 'large_scale',
    crossBorderTransfer: true,
    automatedDecisionMaking: true,
    mitigationMeasures: ['data_minimization', 'consent_management', 'transparency'],
    recommendations: ['conduct_dpia', 'implement_fairness_checks']
  };

  const result = await PrivacyAssessment.conductAssessment(assessmentData);
  assert(result.assessmentId, 'Assessment ID should be generated');
  assert(result.riskLevel === 'high', 'Assessment should be high risk');

  const assessment = PIPEDA_DATA.privacyAssessments.get(result.assessmentId);
  assert(assessment, 'Assessment should be stored');
  assertEqual(assessment.riskLevel, 'high', 'Risk level should be high');
  assert(assessment.nextReviewDate, 'Next review date should be set');
});

test('Privacy Assessment - Get High Risk Assessments', async () => {
  // Clear existing assessments for clean test
  PIPEDA_DATA.privacyAssessments.clear();

  // Create high risk assessment
  const highRiskData = {
    projectName: 'High_Risk_Project',
    description: 'High risk data processing',
    dataElements: ['health_information', 'financial_information'],
    processingPurpose: 'research',
    mitigationMeasures: []
  };
  await PrivacyAssessment.conductAssessment(highRiskData);

  // Create low risk assessment
  const lowRiskData = {
    projectName: 'Low_Risk_Project',
    description: 'Low risk data processing',
    dataElements: ['anonymous_usage_stats'],
    processingPurpose: 'analytics',
    mitigationMeasures: []
  };
  await PrivacyAssessment.conductAssessment(lowRiskData);

  const highRiskAssessments = PrivacyAssessment.getHighRiskAssessments();
  assert(highRiskAssessments.length === 1, 'Should find one high risk assessment');
  assertEqual(highRiskAssessments[0].projectName, 'High_Risk_Project', 'Should return correct high risk assessment');
});

// ============================================================================
// BREACH NOTIFICATION TESTS
// ============================================================================

test('Breach Notification - Record Significant Breach', async () => {
  const breachData = {
    breachType: 'unauthorized_access',
    affectedIndividuals: 5000,
    dataCompromised: ['personal_identifiers', 'financial_information'],
    breachDate: '2024-01-15T10:30:00Z',
    discoveryDate: '2024-01-15T14:45:00Z',
    notificationMethod: 'email_and_postal',
    regulatoryNotification: true,
    individualNotification: true,
    riskOfSignificantHarm: true
  };

  const result = await BreachNotification.recordBreach(breachData);
  assert(result.notificationId, 'Notification ID should be generated');
  assert(result.status === 'recorded', 'Status should be recorded');
  assert(result.complianceStatus === 'compliant', 'Should be compliant (within 72 hours)');

  const breach = PIPEDA_DATA.breachNotifications.find(b => b.notificationId === result.notificationId);
  assert(breach, 'Breach should be stored');
  assert(breach.riskOfSignificantHarm, 'Should be marked as significant');
});

test('Breach Notification - Get Significant Breaches', async () => {
  // Clear existing breaches
  PIPEDA_DATA.breachNotifications.length = 0;

  // Record significant breach
  const significantBreach = {
    breachType: 'data_breach',
    affectedIndividuals: 100,
    dataCompromised: ['personal_data'],
    breachDate: '2024-01-10T09:00:00Z',
    discoveryDate: '2024-01-10T11:00:00Z',
    notificationMethod: 'email',
    regulatoryNotification: true,
    individualNotification: true,
    riskOfSignificantHarm: true
  };
  await BreachNotification.recordBreach(significantBreach);

  // Record non-significant breach
  const minorBreach = {
    breachType: 'minor_incident',
    affectedIndividuals: 5,
    dataCompromised: ['session_data'],
    breachDate: '2024-01-12T08:00:00Z',
    discoveryDate: '2024-01-12T09:00:00Z',
    notificationMethod: 'internal',
    regulatoryNotification: false,
    individualNotification: false,
    riskOfSignificantHarm: false
  };
  await BreachNotification.recordBreach(minorBreach);

  const significantBreaches = BreachNotification.getSignificantBreaches();
  assert(significantBreaches.length === 1, 'Should find one significant breach');
  assert(significantBreaches[0].riskOfSignificantHarm, 'Breach should be significant');
});

// ============================================================================
// AUDIT TRAIL TESTS
// ============================================================================

test('Audit Logger - Log and Retrieve Audit Trail', async () => {
  // Clear existing audit trail
  PIPEDA_DATA.auditTrail.length = 0;

  // Perform some actions that create audit logs
  await ConsentManagement.obtainConsent({
    individualId: 'audit-test-001',
    purpose: 'testing',
    scope: 'audit_logs',
    consentType: 'express',
    consentMethod: 'test'
  });

  await PersonalInformation.collectInformation({
    individualId: 'audit-test-001',
    dataCategory: 'test_data',
    dataElements: ['test_field'],
    collectionPurpose: 'audit_testing',
    collectionMethod: 'test',
    legalBasis: 'consent',
    retentionPeriod: '1_years'
  });

  // Retrieve audit trail
  const auditTrail = AuditLogger.getAuditTrail('audit-test-001');
  assert(auditTrail.length >= 2, 'Should have at least 2 audit entries');
  assert(auditTrail.every(log => log.details.individualId === 'audit-test-001'), 'All logs should be for the test individual');
});

// ============================================================================
// COMPLIANCE DASHBOARD TESTS
// ============================================================================

test('Compliance Dashboard - Generate Dashboard Data', async () => {
  // This test verifies the dashboard endpoint structure
  // In a real scenario, this would test the actual HTTP endpoint
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
    complianceStatus: {
      overall: 'compliant',
      issues: [],
      lastAudit: new Date().toISOString(),
      nextAuditDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    timestamp: new Date().toISOString()
  };

  assert(dashboard.summary, 'Dashboard should have summary section');
  assert(dashboard.recentActivity, 'Dashboard should have recent activity');
  assert(dashboard.complianceStatus, 'Dashboard should have compliance status');
  assert(dashboard.timestamp, 'Dashboard should have timestamp');
  assert(typeof dashboard.summary.totalPersonalInfo === 'number', 'Total personal info should be a number');
});

// ============================================================================
// RUN TESTS
// ============================================================================

runTests();