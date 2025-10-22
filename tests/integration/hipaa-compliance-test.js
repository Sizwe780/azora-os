/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * HIPAA Compliance Engine - Test Suite
 *
 * Tests all HIPAA compliance features including:
 * - PHI Protection & Encryption
 * - Audit Trails
 * - Breach Notification
 * - Business Associate Agreements
 * - Risk Analysis
 */

import { PHIProtection, AuditLogger, BreachNotification, BusinessAssociateAgreements, RiskAnalysis, HIPAA_DATA } from './index.js';

export async function run() {
  console.log('🚑 Testing HIPAA Compliance Engine...');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };

  // Test PHI Protection
  await testPHIProtection(results);

  // Test Audit Logging
  await testAuditLogging(results);

  // Test Breach Notification
  await testBreachNotification(results);

  // Test Business Associate Agreements
  await testBusinessAssociateAgreements(results);

  // Test Risk Analysis
  await testRiskAnalysis(results);

  // Summary
  console.log(`\n📊 HIPAA Compliance Test Results:`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.total}`);
  console.log(`🎯 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

  return {
    passed: results.failed === 0,
    details: results
  };
}

async function testPHIProtection(results) {
  console.log('\n🔒 Testing PHI Protection...');

  // Test PHI Storage
  try {
    const patientId = 'patient-001';
    const phiData = {
      name: 'John Doe',
      dob: '1980-01-01',
      diagnosis: 'Hypertension',
      medications: ['Lisinopril 10mg'],
      treatmentHistory: ['Regular checkups']
    };

    const result = await PHIProtection.storePHI(patientId, phiData, 'provider-001', 'treatment');
    assert(result.phiId, 'PHI storage should return PHI ID');
    assert(HIPAA_DATA.phi.has(result.phiId), 'PHI should be stored');

    const stored = HIPAA_DATA.phi.get(result.phiId);
    assert(stored.patientId === patientId, 'PHI should be associated with correct patient');
    assert(stored.encryptedPHI, 'PHI should be encrypted');
    results.tests.push({ name: 'PHI Storage', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'PHI Storage', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test PHI Access
  try {
    const phiId = Array.from(HIPAA_DATA.phi.keys())[0];
    const result = await PHIProtection.accessPHI(phiId, 'provider-001', 'treatment', 'Patient care');

    assert(result.phiId === phiId, 'PHI access should return correct PHI ID');
    assert(result.data.name === 'John Doe', 'PHI access should return decrypted data');
    assert(result.metadata.accessCount >= 1, 'Access count should be updated');
    results.tests.push({ name: 'PHI Access', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'PHI Access', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Sensitivity Assessment
  try {
    const sensitiveData = {
      name: 'Jane Smith',
      diagnosis: 'Depression and anxiety',
      geneticInfo: 'BRCA1 mutation',
      hivStatus: 'Positive'
    };

    const sensitivity = PHIProtection.assessSensitivity(sensitiveData);
    assert(sensitivity === 'high', 'Sensitive PHI should be assessed as high sensitivity');
    results.tests.push({ name: 'PHI Sensitivity Assessment', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'PHI Sensitivity Assessment', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testAuditLogging(results) {
  console.log('\n📋 Testing Audit Logging...');

  // Test Audit Trail Generation
  try {
    const patientId = 'patient-002';
    const accessorId = 'provider-002';

    // Generate some audit events
    await AuditLogger.logPHIEvent('CREATE', 'phi-001', patientId, accessorId, {
      purpose: 'treatment',
      dataCategories: ['diagnosis', 'medications']
    });

    await AuditLogger.logPHIEvent('ACCESS', 'phi-001', patientId, accessorId, {
      purpose: 'treatment',
      justification: 'Patient care'
    });

    assert(HIPAA_DATA.accessLogs.length >= 2, 'Audit events should be logged');

    // Test patient audit trail
    const patientTrail = AuditLogger.getPatientAuditTrail(patientId);
    assert(patientTrail.length >= 2, 'Patient audit trail should include all events');

    // Test accessor audit trail
    const accessorTrail = AuditLogger.getAccessorAuditTrail(accessorId);
    assert(accessorTrail.length >= 2, 'Accessor audit trail should include all events');

    results.tests.push({ name: 'Audit Trail Generation', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Audit Trail Generation', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testBreachNotification(results) {
  console.log('\n🚨 Testing Breach Notification...');

  // Test Breach Recording
  try {
    const breachData = {
      description: 'Unauthorized access to patient records',
      affectedIndividuals: 1500,
      breachDate: new Date().toISOString(),
      phiCompromised: true,
      sensitivePHI: true,
      unauthorizedAccess: true,
      maliciousIntent: false,
      noEncryption: false
    };

    const result = await BreachNotification.recordBreach(breachData);
    assert(result.breachId, 'Breach recording should return breach ID');
    assert(result.notificationRequired, 'Large breach should require notification');
    assert(result.riskLevel === 'high', 'Breach should be assessed as high risk');

    const breach = HIPAA_DATA.breachNotifications.find(b => b.breachId === result.breachId);
    assert(breach.notifications.length > 0, 'Breach should have notification requirements');

    results.tests.push({ name: 'Breach Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Breach Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Notification Completion
  try {
    const breachId = HIPAA_DATA.breachNotifications[0].breachId;
    const result = await BreachNotification.markNotificationCompleted(
      breachId,
      'individual',
      { method: 'email', dateSent: new Date().toISOString() }
    );

    assert(result.success, 'Notification completion should succeed');

    const breach = HIPAA_DATA.breachNotifications.find(b => b.breachId === breachId);
    const notification = breach.notifications.find(n => n.type === 'individual');
    assert(notification.status === 'completed', 'Notification should be marked as completed');

    results.tests.push({ name: 'Breach Notification Completion', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Breach Notification Completion', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testBusinessAssociateAgreements(results) {
  console.log('\n🤝 Testing Business Associate Agreements...');

  // Test BAA Recording
  try {
    const baaData = {
      associateName: 'Cloud Storage Provider Inc.',
      associateAddress: '123 Cloud St, Data City, DC 12345',
      associateContact: 'legal@cloudstorage.com',
      servicesProvided: ['Data storage and backup'],
      phiAccess: ['Encrypted PHI storage'],
      securityMeasures: ['AES-256 encryption', 'Access controls', 'Audit logging']
    };

    const result = await BusinessAssociateAgreements.recordBAA(baaData);
    assert(result.baaId, 'BAA recording should return BAA ID');
    assert(HIPAA_DATA.businessAssociates.has(result.baaId), 'BAA should be stored');

    const baa = HIPAA_DATA.businessAssociates.get(result.baaId);
    assert(baa.status === 'active', 'BAA should be active by default');
    assert(baa.nextReview, 'BAA should have next review date');

    results.tests.push({ name: 'BAA Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'BAA Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test BAA Status Update
  try {
    const baaId = Array.from(HIPAA_DATA.businessAssociates.keys())[0];
    const result = await BusinessAssociateAgreements.updateBAAStatus(
      baaId,
      'under-review',
      'Annual security review in progress'
    );

    assert(result.success, 'BAA status update should succeed');

    const baa = HIPAA_DATA.businessAssociates.get(baaId);
    assert(baa.status === 'under-review', 'BAA status should be updated');
    assert(baa.updateNotes === 'Annual security review in progress', 'BAA should have update notes');

    results.tests.push({ name: 'BAA Status Update', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'BAA Status Update', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testRiskAnalysis(results) {
  console.log('\n📊 Testing Risk Analysis...');

  // Test Risk Analysis
  try {
    const analysisData = {
      encryptionAtRest: false,
      encryptionInTransit: true,
      accessControls: true,
      auditLogging: false,
      securityTraining: true,
      incidentResponse: true,
      riskAssessments: false,
      physicalSecurity: true,
      deviceSecurity: true
    };

    const result = await RiskAnalysis.conductRiskAnalysis(analysisData);
    assert(result.analysisId, 'Risk analysis should return analysis ID');
    assert(result.riskLevel === 'medium', 'Analysis should identify medium risk');
    assert(result.findings > 0, 'Analysis should identify findings');
    assert(result.recommendations > 0, 'Analysis should provide recommendations');

    const analysis = HIPAA_DATA.riskAssessments.get(result.analysisId);
    assert(analysis.findings.length > 0, 'Analysis should have detailed findings');
    assert(analysis.recommendations.length > 0, 'Analysis should have recommendations');

    results.tests.push({ name: 'Risk Analysis', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Risk Analysis', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}