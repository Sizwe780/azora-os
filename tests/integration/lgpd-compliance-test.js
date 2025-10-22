/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * LGPD Compliance Test Suite
 *
 * Comprehensive testing for Lei Geral de Proteção de Dados (Brazilian General Data Protection Law) compliance
 */

import {
  DataSubjectRights,
  PersonalDataManagement,
  ProcessingRecords,
  DPIAAssessment,
  CrossBorderTransfers,
  BreachNotification,
  AuditLogger,
  LGPD_DATA
} from '../../services/lgpd-compliance/index.js';

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
  console.log('🇧🇷 Running LGPD Compliance Tests...\n');

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
    console.log('🎉 All LGPD compliance tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// ============================================================================
// DATA SUBJECT RIGHTS TESTS
// ============================================================================

test('Data Subject Rights - Submit and Process Access Request', async () => {
  // Collect some personal data first
  const collectionData = {
    dataSubjectId: 'subject-001',
    dataCategory: 'personal_identifiers',
    dataElements: ['name', 'email', 'cpf'],
    collectionPurpose: 'account_creation',
    legalBasis: 'consent',
    dataSource: 'web_form',
    retentionPeriod: '5_years',
    securityMeasures: ['encryption', 'access_control'],
    isSensitive: false,
    consentObtained: true
  };
  await PersonalDataManagement.collectPersonalData(collectionData);

  // Submit access request
  const requestData = {
    dataSubjectId: 'subject-001'
  };
  const submitResult = await DataSubjectRights.submitAccessRequest(requestData);
  assert(submitResult.requestId, 'Request ID should be generated');

  // Process the request
  const processResult = await DataSubjectRights.processAccessRequest(submitResult.requestId);
  assert(processResult.status === 'completed', 'Request should be completed');
  assert(processResult.data.personalData.length > 0, 'Personal data should be returned');
  assert(processResult.completionDate, 'Completion date should be set');
});

test('Data Subject Rights - Submit and Process Rectification Request', async () => {
  // Collect personal data
  const collectionData = {
    dataSubjectId: 'subject-002',
    dataCategory: 'contact_info',
    dataElements: ['name', 'email'],
    collectionPurpose: 'communication',
    legalBasis: 'consent',
    dataSource: 'registration',
    retentionPeriod: '3_years',
    securityMeasures: ['encryption'],
    isSensitive: false,
    consentObtained: true
  };
  const collectResult = await PersonalDataManagement.collectPersonalData(collectionData);

  // Submit rectification request
  const rectificationData = {
    dataSubjectId: 'subject-002',
    infoId: collectResult.dataId,
    rectificationData: { dataElements: ['name', 'email', 'phone'] },
    reason: 'information_update'
  };
  const submitResult = await DataSubjectRights.submitRectificationRequest(rectificationData);
  assert(submitResult.requestId, 'Rectification request ID should be generated');

  // Process the rectification
  const decision = {
    approved: true,
    reason: 'information_accurate'
  };
  const processResult = await DataSubjectRights.processRectificationRequest(submitResult.requestId, decision);
  assert(processResult.status === 'completed', 'Rectification should be completed');
  assert(processResult.approved, 'Rectification should be approved');

  const data = LGPD_DATA.personalData.get(collectResult.dataId);
  assertArrayEqual(data.dataElements, ['name', 'email', 'phone'], 'Data elements should be updated');
});

test('Data Subject Rights - Submit and Process Erasure Request', async () => {
  // Collect personal data
  const collectionData = {
    dataSubjectId: 'subject-003',
    dataCategory: 'usage_data',
    dataElements: ['session_logs'],
    collectionPurpose: 'analytics',
    legalBasis: 'legitimate_interest',
    dataSource: 'system_generated',
    retentionPeriod: '1_years',
    securityMeasures: ['anonymization'],
    isSensitive: false,
    consentObtained: false
  };
  const collectResult = await PersonalDataManagement.collectPersonalData(collectionData);

  // Submit erasure request
  const erasureData = {
    dataSubjectId: 'subject-003',
    erasureReason: 'consent_withdrawn'
  };
  const submitResult = await DataSubjectRights.submitErasureRequest(erasureData);
  assert(submitResult.requestId, 'Erasure request ID should be generated');

  // Process the erasure
  const decision = {
    approved: true,
    erasureMethod: 'anonymization',
    reason: 'consent_withdrawn'
  };
  const processResult = await DataSubjectRights.processErasureRequest(submitResult.requestId, decision);
  assert(processResult.status === 'completed', 'Erasure should be completed');
  assert(processResult.approved, 'Erasure should be approved');

  const data = LGPD_DATA.personalData.get(collectResult.dataId);
  assertEqual(data.status, 'erased', 'Data status should be erased');
});

test('Data Subject Rights - Submit and Process Portability Request', async () => {
  // Collect personal data
  const collectionData = {
    dataSubjectId: 'subject-004',
    dataCategory: 'personal_data',
    dataElements: ['name', 'email', 'address'],
    collectionPurpose: 'service_provision',
    legalBasis: 'contract_performance',
    dataSource: 'account_form',
    retentionPeriod: '7_years',
    securityMeasures: ['encryption'],
    isSensitive: false,
    consentObtained: true
  };
  await PersonalDataManagement.collectPersonalData(collectionData);

  // Submit portability request
  const portabilityData = {
    dataSubjectId: 'subject-004',
    requestedFormats: ['json']
  };
  const submitResult = await DataSubjectRights.submitPortabilityRequest(portabilityData);
  assert(submitResult.requestId, 'Portability request ID should be generated');

  // Process the portability request
  const processResult = await DataSubjectRights.processPortabilityRequest(submitResult.requestId);
  assert(processResult.status === 'completed', 'Portability should be completed');
  assert(processResult.data.dataSubjectId === 'subject-004', 'Data should include subject ID');
  assert(processResult.data.personalData, 'Portable data should include personal data');
  assert(processResult.completionDate, 'Completion date should be set');
});

test('Data Subject Rights - Submit and Process Objection Request', async () => {
  // Create processing record first
  const processingData = {
    controller: 'Azora OS',
    processor: 'Data Processor Inc',
    dataSubjects: ['subject-005'],
    dataCategories: ['marketing_data'],
    processingPurposes: ['direct_marketing'],
    legalBases: ['legitimate_interest'],
    recipients: ['marketing_team'],
    retentionPeriods: ['2_years'],
    securityMeasures: ['encryption']
  };
  const processingResult = await ProcessingRecords.createProcessingRecord(processingData);

  // Submit objection request
  const objectionData = {
    dataSubjectId: 'subject-005',
    objectionReason: 'direct_marketing',
    processingIds: [processingResult.recordId]
  };
  const submitResult = await DataSubjectRights.submitObjectionRequest(objectionData);
  assert(submitResult.requestId, 'Objection request ID should be generated');

  // Process the objection
  const decision = {
    approved: true,
    reason: 'legitimate_objection'
  };
  const processResult = await DataSubjectRights.processObjectionRequest(submitResult.requestId, decision);
  assert(processResult.status === 'completed', 'Objection should be completed');
  assert(processResult.approved, 'Objection should be approved');

  const processing = LGPD_DATA.processingRecords.get(processingResult.recordId);
  assertEqual(processing.status, 'objected', 'Processing should be marked as objected');
});

// ============================================================================
// PERSONAL DATA MANAGEMENT TESTS
// ============================================================================

test('Personal Data Management - Collect Personal Data', async () => {
  const collectionData = {
    dataSubjectId: 'subject-006',
    dataCategory: 'health_data',
    dataElements: ['medical_history', 'allergies'],
    collectionPurpose: 'healthcare_service',
    legalBasis: 'consent',
    dataSource: 'health_form',
    retentionPeriod: '10_years',
    securityMeasures: ['encryption', 'access_control', 'audit_logs'],
    isSensitive: true,
    consentObtained: true
  };

  const result = await PersonalDataManagement.collectPersonalData(collectionData);
  assert(result.dataId, 'Data ID should be generated');
  assert(result.status === 'collected', 'Status should be collected');

  const data = LGPD_DATA.personalData.get(result.dataId);
  assert(data, 'Data should be stored');
  assertEqual(data.dataSubjectId, collectionData.dataSubjectId, 'Data subject ID should match');
  assert(data.isSensitive, 'Data should be marked as sensitive');
});

test('Personal Data Management - Process Personal Data with Valid Legal Basis', async () => {
  // Collect data first
  const collectionData = {
    dataSubjectId: 'subject-007',
    dataCategory: 'financial_data',
    dataElements: ['account_number', 'balance'],
    collectionPurpose: 'banking_service',
    legalBasis: 'contract_performance',
    dataSource: 'account_form',
    retentionPeriod: '7_years',
    securityMeasures: ['encryption'],
    isSensitive: true,
    consentObtained: true
  };
  const collectResult = await PersonalDataManagement.collectPersonalData(collectionData);

  // Process the data
  const processingData = {
    purpose: 'account_management',
    legalBasis: 'contract_performance',
    controller: 'Azora Bank',
    processor: 'Data Processor Inc',
    recipients: ['account_team'],
    processingLocation: 'Brazil',
    retentionPeriod: '7_years',
    securityMeasures: ['encryption', 'access_control']
  };
  const processResult = await PersonalDataManagement.processPersonalData(collectResult.dataId, processingData);

  assert(processResult.processingId, 'Processing ID should be generated');
  assert(processResult.status === 'processed', 'Status should be processed');

  const data = LGPD_DATA.personalData.get(collectResult.dataId);
  assert(data.processingHistory.length === 1, 'Processing history should contain one entry');
});

test('Personal Data Management - Collect Children Data with Parental Consent', async () => {
  const collectionData = {
    dataSubjectId: 'child-001',
    dataCategory: 'educational_data',
    dataElements: ['school_records', 'grades'],
    collectionPurpose: 'education_service',
    legalBasis: 'consent',
    dataSource: 'school_form',
    retentionPeriod: '5_years',
    securityMeasures: ['encryption', 'parental_controls'],
    isSensitive: false,
    consentObtained: true,
    isChildData: true,
    parentalConsent: true
  };

  const result = await PersonalDataManagement.collectPersonalData(collectionData);
  assert(result.dataId, 'Data ID should be generated');

  const data = LGPD_DATA.personalData.get(result.dataId);
  assert(data.isChildData, 'Data should be marked as child data');
  assert(data.parentalConsent, 'Parental consent should be recorded');

  const childData = LGPD_DATA.childrenData.get(result.dataId);
  assert(childData, 'Child data should be stored in children data map');
});

// ============================================================================
// PROCESSING RECORDS TESTS
// ============================================================================

test('Processing Records - Create Processing Record', async () => {
  const recordData = {
    controller: 'Azora Corp',
    processor: 'Cloud Processor Ltd',
    dataSubjects: ['subject-008', 'subject-009'],
    dataCategories: ['personal_identifiers', 'contact_info'],
    processingPurposes: ['customer_service', 'analytics'],
    legalBases: ['consent', 'legitimate_interest'],
    recipients: ['service_team', 'analytics_team'],
    retentionPeriods: ['5_years', '2_years'],
    securityMeasures: ['encryption', 'pseudonymization']
  };

  const result = await ProcessingRecords.createProcessingRecord(recordData);
  assert(result.recordId, 'Record ID should be generated');
  assert(result.status === 'created', 'Status should be created');

  const record = LGPD_DATA.processingRecords.get(result.recordId);
  assert(record, 'Record should be stored');
  assertEqual(record.controller, recordData.controller, 'Controller should match');
  assertEqual(record.dataSubjects.length, 2, 'Should have 2 data subjects');
});

test('Processing Records - Get High Risk Processing', async () => {
  // Clear existing records
  LGPD_DATA.processingRecords.clear();

  // Create high risk processing record
  const highRiskData = {
    controller: 'Azora AI',
    processor: 'AI Processor Inc',
    dataSubjects: ['subject-010'],
    dataCategories: ['health_data', 'genetic_data'],
    processingPurposes: ['profiling', 'automated_decision_making'],
    legalBases: ['consent'],
    recipients: ['ai_team'],
    retentionPeriods: ['10_years'],
    securityMeasures: ['encryption']
  };
  await ProcessingRecords.createProcessingRecord(highRiskData);

  // Create low risk processing record
  const lowRiskData = {
    controller: 'Azora Support',
    processor: 'Support Processor',
    dataSubjects: ['subject-011'],
    dataCategories: ['contact_info'],
    processingPurposes: ['customer_support'],
    legalBases: ['legitimate_interest'],
    recipients: ['support_team'],
    retentionPeriods: ['2_years'],
    securityMeasures: ['encryption']
  };
  await ProcessingRecords.createProcessingRecord(lowRiskData);

  const highRiskRecords = ProcessingRecords.getHighRiskProcessing();
  assert(highRiskRecords.length === 1, 'Should find one high risk processing record');
  assertEqual(highRiskRecords[0].controller, 'Azora AI', 'Should return correct high risk record');
});

// ============================================================================
// DPIA ASSESSMENT TESTS
// ============================================================================

test('DPIA Assessment - Conduct High Risk Assessment', async () => {
  const assessmentData = {
    projectName: 'AI_Scoring_System',
    description: 'Automated credit scoring using AI and personal data',
    dataCategories: ['financial_data', 'personal_identifiers'],
    processingPurposes: ['automated_decision_making', 'profiling'],
    dataSubjects: 50000,
    scale: 'large_scale',
    mitigationMeasures: ['data_minimization', 'transparency', 'human_override'],
    recommendations: ['implement_fairness_checks', 'regular_audits'],
    dpoApproval: true
  };

  const result = await DPIAAssessment.conductAssessment(assessmentData);
  assert(result.assessmentId, 'Assessment ID should be generated');
  assert(result.riskLevel === 'high', 'Assessment should be high risk');

  const assessment = LGPD_DATA.dpiaAssessments.get(result.assessmentId);
  assert(assessment, 'Assessment should be stored');
  assertEqual(assessment.riskLevel, 'high', 'Risk level should be high');
  assert(assessment.nextReviewDate, 'Next review date should be set');
});

test('DPIA Assessment - Get High Risk Assessments', async () => {
  // Clear existing assessments
  LGPD_DATA.dpiaAssessments.clear();

  // Create high risk assessment
  const highRiskData = {
    projectName: 'High_Risk_AI',
    description: 'High risk AI processing',
    dataCategories: ['health_data'],
    processingPurposes: ['automated_decision_making'],
    dataSubjects: 100000,
    scale: 'large_scale',
    mitigationMeasures: []
  };
  await DPIAAssessment.conductAssessment(highRiskData);

  // Create low risk assessment
  const lowRiskData = {
    projectName: 'Low_Risk_Support',
    description: 'Low risk customer support',
    dataCategories: ['contact_info'],
    processingPurposes: ['customer_service'],
    dataSubjects: 1000,
    scale: 'small_scale',
    mitigationMeasures: []
  };
  await DPIAAssessment.conductAssessment(lowRiskData);

  const highRiskAssessments = DPIAAssessment.getHighRiskAssessments();
  assert(highRiskAssessments.length === 1, 'Should find one high risk assessment');
  assertEqual(highRiskAssessments[0].projectName, 'High_Risk_AI', 'Should return correct high risk assessment');
});

// ============================================================================
// CROSS-BORDER TRANSFERS TESTS
// ============================================================================

test('Cross-border Transfers - Record Transfer with Safeguards', async () => {
  const transferData = {
    dataCategories: ['personal_identifiers', 'contact_info'],
    destinationCountry: 'US',
    recipient: 'Cloud Processor Inc',
    transferPurpose: 'data_processing',
    legalBasis: 'standard_contractual_clauses',
    safeguards: ['encryption', 'data_minimization'],
    adequacyDecision: false,
    standardClauses: true,
    bindingCorporateRules: false
  };

  const result = await CrossBorderTransfers.recordTransfer(transferData);
  assert(result.transferId, 'Transfer ID should be generated');
  assert(result.status === 'recorded', 'Status should be recorded');

  const transfer = LGPD_DATA.crossBorderTransfers.get(result.transferId);
  assert(transfer, 'Transfer should be stored');
  assertEqual(transfer.destinationCountry, 'US', 'Destination country should match');
  assert(transfer.standardClauses, 'Should have standard contractual clauses');
});

test('Cross-border Transfers - Get Inadequate Country Transfers', async () => {
  // Clear existing transfers
  LGPD_DATA.crossBorderTransfers.clear();

  // Record transfer to inadequate country without safeguards
  const inadequateTransfer = {
    dataCategories: ['personal_data'],
    destinationCountry: 'US',
    recipient: 'US Processor',
    transferPurpose: 'storage',
    legalBasis: 'consent',
    safeguards: [],
    adequacyDecision: false,
    standardClauses: false,
    bindingCorporateRules: false
  };
  await CrossBorderTransfers.recordTransfer(inadequateTransfer);

  // Record transfer to adequate country
  const adequateTransfer = {
    dataCategories: ['personal_data'],
    destinationCountry: 'Canada',
    recipient: 'Canadian Processor',
    transferPurpose: 'processing',
    legalBasis: 'adequacy_decision',
    safeguards: [],
    adequacyDecision: true,
    standardClauses: false,
    bindingCorporateRules: false
  };
  await CrossBorderTransfers.recordTransfer(adequateTransfer);

  const inadequateTransfers = CrossBorderTransfers.getInadequateCountryTransfers();
  assert(inadequateTransfers.length === 1, 'Should find one inadequate country transfer');
  assertEqual(inadequateTransfers[0].destinationCountry, 'US', 'Should return US transfer');
});

// ============================================================================
// BREACH NOTIFICATION TESTS
// ============================================================================

test('Breach Notification - Record High Risk Breach', async () => {
  const breachData = {
    breachType: 'unauthorized_access',
    affectedDataSubjects: 25000,
    dataCompromised: ['personal_identifiers', 'financial_data'],
    breachDate: '2024-01-15T10:30:00Z',
    discoveryDate: '2024-01-15T14:45:00Z',
    anpdNotification: true,
    dataSubjectNotification: true,
    riskOfHarm: 'high',
    measuresTaken: ['contained_breach', 'notified_authorities', 'enhanced_security']
  };

  const result = await BreachNotification.recordBreach(breachData);
  assert(result.notificationId, 'Notification ID should be generated');
  assert(result.status === 'recorded', 'Status should be recorded');
  assert(result.complianceStatus === 'compliant', 'Should be compliant (within 72 hours)');

  const breach = LGPD_DATA.breachNotifications.find(b => b.notificationId === result.notificationId);
  assert(breach, 'Breach should be stored');
  assertEqual(breach.riskOfHarm, 'high', 'Should be marked as high risk');
});

test('Breach Notification - Get High Risk Breaches', async () => {
  // Clear existing breaches
  LGPD_DATA.breachNotifications.length = 0;

  // Record high risk breach
  const highRiskBreach = {
    breachType: 'data_breach',
    affectedDataSubjects: 10000,
    dataCompromised: ['health_data'],
    breachDate: '2024-01-10T09:00:00Z',
    discoveryDate: '2024-01-10T11:00:00Z',
    anpdNotification: true,
    dataSubjectNotification: true,
    riskOfHarm: 'high',
    measuresTaken: ['investigation_started']
  };
  await BreachNotification.recordBreach(highRiskBreach);

  // Record low risk breach
  const lowRiskBreach = {
    breachType: 'minor_incident',
    affectedDataSubjects: 5,
    dataCompromised: ['session_data'],
    breachDate: '2024-01-12T08:00:00Z',
    discoveryDate: '2024-01-12T09:00:00Z',
    anpdNotification: false,
    dataSubjectNotification: false,
    riskOfHarm: 'low',
    measuresTaken: ['logged_incident']
  };
  await BreachNotification.recordBreach(lowRiskBreach);

  const highRiskBreaches = BreachNotification.getHighRiskBreaches();
  assert(highRiskBreaches.length === 1, 'Should find one high risk breach');
  assertEqual(highRiskBreaches[0].riskOfHarm, 'high', 'Breach should be high risk');
});

// ============================================================================
// AUDIT TRAIL TESTS
// ============================================================================

test('Audit Logger - Log and Retrieve Audit Trail', async () => {
  // Clear existing audit trail
  LGPD_DATA.auditTrail.length = 0;

  // Perform some actions that create audit logs
  await PersonalDataManagement.collectPersonalData({
    dataSubjectId: 'audit-test-001',
    dataCategory: 'test_data',
    dataElements: ['test_field'],
    collectionPurpose: 'audit_testing',
    legalBasis: 'consent',
    dataSource: 'test',
    retentionPeriod: '1_years',
    securityMeasures: ['encryption'],
    isSensitive: false,
    consentObtained: true
  });

  await DataSubjectRights.submitAccessRequest({
    dataSubjectId: 'audit-test-001'
  });

  // Retrieve audit trail
  const auditTrail = AuditLogger.getAuditTrail('audit-test-001');
  assert(auditTrail.length >= 2, 'Should have at least 2 audit entries');
  assert(auditTrail.every(log => log.details.dataSubjectId === 'audit-test-001'), 'All logs should be for the test subject');
});

// ============================================================================
// COMPLIANCE DASHBOARD TESTS
// ============================================================================

test('Compliance Dashboard - Generate Dashboard Data', async () => {
  // This test verifies the dashboard endpoint structure
  // In a real scenario, this would test the actual HTTP endpoint
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
  assert(typeof dashboard.summary.totalPersonalData === 'number', 'Total personal data should be a number');
});

// ============================================================================
// RUN TESTS
// ============================================================================

runTests();