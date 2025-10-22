/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * GDPR Compliance Service - Test Suite
 *
 * Tests all GDPR compliance features including:
 * - Data Subject Rights
 * - Consent Management
 * - Processing Records
 * - Breach Notification
 * - DPIA
 */

import { DataSubjectRights, ConsentManager, ProcessingRecords, BreachNotification, DPIA, GDPR_DATA } from './index.js';

export async function run() {
  console.log('🛡️  Testing GDPR Compliance Service...');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };

  // Test Data Subject Rights
  await testDataSubjectRights(results);

  // Test Consent Management
  await testConsentManagement(results);

  // Test Processing Records
  await testProcessingRecords(results);

  // Test Breach Notification
  await testBreachNotification(results);

  // Test DPIA
  await testDPIA(results);

  // Summary
  console.log(`\n📊 GDPR Compliance Test Results:`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.total}`);
  console.log(`🎯 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

  return {
    passed: results.failed === 0,
    details: results
  };
}

async function testDataSubjectRights(results) {
  console.log('\n👤 Testing Data Subject Rights...');

  // Test Right of Access
  try {
    const subjectId = 'test-subject-001';
    GDPR_DATA.dataSubjects.set(subjectId, {
      id: subjectId,
      name: 'John Doe',
      email: 'john@example.com',
      created: new Date().toISOString()
    });

    const accessResult = await DataSubjectRights.rightOfAccess(subjectId);
    assert(accessResult.subjectId === subjectId, 'Right of Access should return subject data');
    assert(accessResult.data.name === 'John Doe', 'Access should include subject details');
    results.tests.push({ name: 'Right of Access', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Right of Access', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Right to Rectification
  try {
    const subjectId = 'test-subject-002';
    GDPR_DATA.dataSubjects.set(subjectId, {
      id: subjectId,
      name: 'Jane Doe',
      email: 'jane@example.com'
    });

    const corrections = { name: 'Jane Smith', email: 'jane.smith@example.com' };
    const result = await DataSubjectRights.rightToRectification(subjectId, corrections);

    const updated = GDPR_DATA.dataSubjects.get(subjectId);
    assert(updated.name === 'Jane Smith', 'Rectification should update subject data');
    assert(updated.email === 'jane.smith@example.com', 'Rectification should update all fields');
    results.tests.push({ name: 'Right to Rectification', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Right to Rectification', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Right to Erasure
  try {
    const subjectId = 'test-subject-003';
    GDPR_DATA.dataSubjects.set(subjectId, {
      id: subjectId,
      name: 'Bob Wilson',
      email: 'bob@example.com'
    });

    const result = await DataSubjectRights.rightToErasure(subjectId, 'User requested deletion');
    assert(!GDPR_DATA.dataSubjects.has(subjectId), 'Erasure should remove subject data');
    results.tests.push({ name: 'Right to Erasure', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Right to Erasure', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testConsentManagement(results) {
  console.log('\n📝 Testing Consent Management...');

  // Test Consent Recording
  try {
    const subjectId = 'consent-test-001';
    const consentData = {
      subjectId,
      purposes: ['marketing', 'analytics'],
      legalBasis: 'consent',
      consentGiven: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    const result = await ConsentManager.recordConsent(subjectId, consentData);
    assert(result.consentId, 'Consent recording should return consent ID');
    assert(GDPR_DATA.consents.has(result.consentId), 'Consent should be stored');

    const stored = GDPR_DATA.consents.get(result.consentId);
    assert(stored.purposes.includes('marketing'), 'Consent should include specified purposes');
    results.tests.push({ name: 'Consent Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Consent Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Consent Validation
  try {
    const subjectId = 'consent-test-002';
    const consentData = {
      subjectId,
      purposes: ['marketing'],
      legalBasis: 'consent',
      consentGiven: true
    };

    await ConsentManager.recordConsent(subjectId, consentData);
    const isValid = ConsentManager.isConsentValid(subjectId, 'marketing');
    assert(isValid, 'Valid consent should be recognized');

    results.tests.push({ name: 'Consent Validation', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Consent Validation', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testProcessingRecords(results) {
  console.log('\n📋 Testing Processing Records...');

  // Test Processing Record Creation
  try {
    const recordData = {
      controllerName: 'Azora OS',
      controllerAddress: '123 Innovation St, Tech City',
      controllerContact: 'dpo@azora.world',
      purpose: 'Customer relationship management',
      categoriesOfData: ['name', 'email', 'purchase_history'],
      categoriesOfSubjects: ['customers'],
      legalBasis: 'contract',
      retentionPeriod: '7 years'
    };

    const result = await ProcessingRecords.recordProcessingActivity(recordData);
    assert(result.recordId, 'Processing record should return record ID');
    assert(GDPR_DATA.processingRecords.has(result.recordId), 'Record should be stored');

    results.tests.push({ name: 'Processing Record Creation', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Processing Record Creation', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testBreachNotification(results) {
  console.log('\n🚨 Testing Breach Notification...');

  // Test Breach Recording
  try {
    const breachData = {
      description: 'Unauthorized database access',
      affectedSubjects: 1500,
      dataCategories: ['name', 'email', 'payment_info'],
      likelyConsequences: 'Identity theft, financial loss',
      measuresTaken: 'Database secured, passwords reset'
    };

    const result = await BreachNotification.recordBreach(breachData);
    assert(result.breachId, 'Breach recording should return breach ID');
    assert(result.requiresNotification, 'High-risk breach should require notification');

    const breach = GDPR_DATA.breachNotifications.find(b => b.breachId === result.breachId);
    assert(breach.riskAssessment.level === 'high', 'Breach should be assessed as high risk');

    results.tests.push({ name: 'Breach Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Breach Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testDPIA(results) {
  console.log('\n📊 Testing Data Protection Impact Assessment...');

  // Test DPIA Creation
  try {
    const projectData = {
      name: 'AI Customer Analytics Platform',
      description: 'Advanced AI system for customer behavior analysis',
      largeScale: true,
      systematicMonitoring: true,
      sensitiveData: true,
      vulnerableSubjects: false,
      publicData: false,
      innovativeTech: true,
      preventRights: false
    };

    const result = await DPIA.conductDPIA(projectData);
    assert(result.dpiaId, 'DPIA should return assessment ID');
    assert(result.required, 'High-risk project should require DPIA');
    assert(result.riskLevel === 'high', 'Project should be assessed as high risk');

    results.tests.push({ name: 'DPIA Assessment', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'DPIA Assessment', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}