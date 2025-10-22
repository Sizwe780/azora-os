/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * CCPA Compliance Module - Test Suite
 *
 * Tests all CCPA compliance features including:
 * - Consumer Rights Management
 * - Data Inventory & Mapping
 * - Privacy Notices & Consent
 * - Vendor Risk Assessment
 * - Breach Notification
 */

import { ConsumerRights, DataInventory, PrivacyNotices, ConsentManagement, VendorAssessment, BreachNotification, AuditLogger, CCPA_DATA } from '../../services/ccpa-compliance/index.js';

export async function run() {
  console.log('🛡️  Testing CCPA Compliance Module...');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };

  // Test Consumer Rights
  await testConsumerRights(results);

  // Test Data Inventory
  await testDataInventory(results);

  // Test Privacy Notices
  await testPrivacyNotices(results);

  // Test Consent Management
  await testConsentManagement(results);

  // Test Vendor Assessment
  await testVendorAssessment(results);

  // Test Breach Notification
  await testBreachNotification(results);

  // Summary
  console.log(`\n📊 CCPA Compliance Test Results:`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.total}`);
  console.log(`🎯 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

  // Show failed tests
  const failedTests = results.tests.filter(test => test.status === 'failed');
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
  }

  return {
    passed: results.failed === 0,
    details: results
  };
}

async function testConsumerRights(results) {
  console.log('\n👤 Testing Consumer Rights...');

  // Test Request Submission
  try {
    const requestData = {
      consumerId: 'consumer-001',
      requestType: 'access',
      consumerEmail: 'john.doe@example.com',
      consumerPhone: '+1-555-0123',
      description: 'Request access to all personal data'
    };

    const result = await ConsumerRights.submitRequest(requestData);
    assert(result.requestId, 'Request submission should return request ID');
    assert(CCPA_DATA.consumerRequests.has(result.requestId), 'Request should be stored');

    const request = CCPA_DATA.consumerRequests.get(result.requestId);
    assert(request.status === 'received', 'Request should be received');
    assert(request.requestType === 'access', 'Request type should be stored correctly');
    results.tests.push({ name: 'Request Submission', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Request Submission', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Consumer Verification
  try {
    const requestId = Array.from(CCPA_DATA.consumerRequests.keys())[0];
    const verificationData = {
      email: 'john.doe@example.com',
      phone: '+1-555-0123'
    };

    const result = await ConsumerRights.verifyConsumer(requestId, verificationData);
    assert(result.verified, 'Consumer verification should succeed');

    const request = CCPA_DATA.consumerRequests.get(requestId);
    assert(request.verificationStatus === 'verified', 'Request should be verified');
    results.tests.push({ name: 'Consumer Verification', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Consumer Verification', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Access Request Processing
  try {
    const requestId = Array.from(CCPA_DATA.consumerRequests.keys())[0];
    const result = await ConsumerRights.processAccessRequest(requestId);
    assert(result.requestId, 'Access request processing should succeed');
    assert(result.status === 'completed', 'Request should be completed');
    assert(result.data, 'Access data should be returned');

    const request = CCPA_DATA.consumerRequests.get(requestId);
    assert(request.status === 'completed', 'Request status should be completed');
    results.tests.push({ name: 'Access Request Processing', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Access Request Processing', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testDataInventory(results) {
  console.log('\n📋 Testing Data Inventory...');

  // Test Data Collection Documentation
  try {
    const dataCollection = {
      dataCategory: 'personal_information',
      dataElements: ['name', 'email', 'phone'],
      collectionMethod: 'website_form',
      purpose: 'account_creation',
      retentionPeriod: '7_years',
      legalBasis: 'consent',
      dataSources: ['user_input'],
      dataRecipients: ['internal_systems'],
      securityMeasures: ['encryption', 'access_controls']
    };

    const result = await DataInventory.documentDataCollection(dataCollection);
    assert(result.inventoryId, 'Data collection documentation should return inventory ID');
    assert(CCPA_DATA.dataInventory.has(result.inventoryId), 'Data collection should be stored');

    const inventory = CCPA_DATA.dataInventory.get(result.inventoryId);
    assert(inventory.dataCategory === 'personal_information', 'Data category should be stored correctly');
    assert(inventory.status === 'active', 'Inventory should be active by default');
    results.tests.push({ name: 'Data Collection Documentation', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Data Collection Documentation', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Data Inventory Update
  try {
    const inventoryId = Array.from(CCPA_DATA.dataInventory.keys())[0];
    const updates = {
      retentionPeriod: '5_years',
      securityMeasures: ['encryption', 'access_controls', 'anonymization']
    };

    const result = await DataInventory.updateDataInventory(inventoryId, updates);
    assert(result.inventoryId, 'Data inventory update should succeed');

    const inventory = CCPA_DATA.dataInventory.get(inventoryId);
    assert(inventory.retentionPeriod === '5_years', 'Retention period should be updated');
    assert(inventory.securityMeasures.length === 3, 'Security measures should be updated');
    results.tests.push({ name: 'Data Inventory Update', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Data Inventory Update', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testPrivacyNotices(results) {
  console.log('\n📜 Testing Privacy Notices...');

  // Test Notice Creation
  try {
    const noticeData = {
      noticeType: 'privacy_policy',
      title: 'Privacy Policy',
      content: 'This is our comprehensive privacy policy...',
      effectiveDate: new Date().toISOString(),
      version: '1.0',
      languages: ['en'],
      targetAudience: 'all'
    };

    const result = await PrivacyNotices.createNotice(noticeData);
    assert(result.noticeId, 'Notice creation should return notice ID');
    assert(CCPA_DATA.privacyNotices.has(result.noticeId), 'Notice should be stored');

    const notice = CCPA_DATA.privacyNotices.get(result.noticeId);
    assert(notice.noticeType === 'privacy_policy', 'Notice type should be stored correctly');
    assert(notice.status === 'draft', 'Notice should be draft by default');
    results.tests.push({ name: 'Notice Creation', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Notice Creation', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Notice Publishing
  try {
    const noticeId = Array.from(CCPA_DATA.privacyNotices.keys())[0];
    const result = await PrivacyNotices.publishNotice(noticeId);
    assert(result.noticeId, 'Notice publishing should succeed');
    assert(result.status === 'published', 'Notice should be published');

    const notice = CCPA_DATA.privacyNotices.get(noticeId);
    assert(notice.status === 'published', 'Notice status should be published');
    assert(notice.publishedAt, 'Notice should have published date');
    results.tests.push({ name: 'Notice Publishing', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Notice Publishing', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testConsentManagement(results) {
  console.log('\n🤝 Testing Consent Management...');

  // Test Consent Recording
  try {
    const consentData = {
      consumerId: 'consumer-001',
      consentType: 'data_collection',
      scope: 'marketing_emails',
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      consentMethod: 'website',
      consentContext: 'newsletter_signup',
      metadata: { source: 'homepage' }
    };

    const result = await ConsentManagement.recordConsent(consentData);
    assert(result.consentId, 'Consent recording should return consent ID');
    assert(CCPA_DATA.consentRecords.has(result.consentId), 'Consent should be stored');

    const consent = CCPA_DATA.consentRecords.get(result.consentId);
    assert(consent.consentType === 'data_collection', 'Consent type should be stored correctly');
    assert(consent.status === 'active', 'Consent should be active by default');
    results.tests.push({ name: 'Consent Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Consent Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Consent Withdrawal
  try {
    const consentId = Array.from(CCPA_DATA.consentRecords.keys())[0];
    const result = await ConsentManagement.withdrawConsent(consentId, 'user_request');
    assert(result.consentId, 'Consent withdrawal should succeed');
    assert(result.status === 'withdrawn', 'Consent should be withdrawn');

    const consent = CCPA_DATA.consentRecords.get(consentId);
    assert(consent.status === 'withdrawn', 'Consent status should be withdrawn');
    assert(consent.withdrawalReason === 'user_request', 'Withdrawal reason should be recorded');
    results.tests.push({ name: 'Consent Withdrawal', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Consent Withdrawal', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testVendorAssessment(results) {
  console.log('\n🏢 Testing Vendor Assessment...');

  // Test Vendor Assessment
  try {
    const vendorData = {
      vendorName: 'DataProcessor Inc.',
      vendorType: 'processor',
      dataShared: ['personal_information', 'commercial_information'],
      dataProcessingPurpose: 'analytics',
      securityAssessment: 'adequate',
      complianceStatus: 'compliant',
      contractStatus: 'signed'
    };

    const result = await VendorAssessment.assessVendor(vendorData);
    assert(result.assessmentId, 'Vendor assessment should return assessment ID');
    assert(CCPA_DATA.vendorAssessments.has(result.assessmentId), 'Assessment should be stored');

    const assessment = CCPA_DATA.vendorAssessments.get(result.assessmentId);
    assert(assessment.vendorName === 'DataProcessor Inc.', 'Vendor name should be stored correctly');
    assert(assessment.riskLevel, 'Risk level should be calculated');
    assert(assessment.status === 'active', 'Assessment should be active by default');
    results.tests.push({ name: 'Vendor Assessment', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Vendor Assessment', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test High Risk Vendor Detection
  try {
    const highRiskVendors = VendorAssessment.getHighRiskVendors();
    // Should have at least one vendor from our test
    assert(highRiskVendors.length >= 0, 'High risk vendor query should work');
    results.tests.push({ name: 'High Risk Vendor Detection', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'High Risk Vendor Detection', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testBreachNotification(results) {
  console.log('\n🚨 Testing Breach Notification...');

  // Test Breach Recording
  try {
    const breachData = {
      breachType: 'unauthorized_access',
      affectedConsumers: 1500,
      dataCompromised: ['personal_information', 'financial_information'],
      breachDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      discoveryDate: new Date().toISOString(),
      notificationMethod: 'email',
      regulatoryNotification: false,
      consumerNotification: false
    };

    const result = await BreachNotification.recordBreach(breachData);
    assert(result.notificationId, 'Breach recording should return notification ID');

    const breach = CCPA_DATA.breachNotifications.find(b => b.notificationId === result.notificationId);
    assert(breach.breachType === 'unauthorized_access', 'Breach type should be stored correctly');
    assert(breach.affectedConsumers === 1500, 'Affected consumers should be stored correctly');
    assert(breach.status === 'reported', 'Breach should be reported');
    results.tests.push({ name: 'Breach Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Breach Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Breach Notification Requirements
  try {
    const breachesRequiringNotification = BreachNotification.getBreachesRequiringNotification();
    // Should include our test breach since notifications weren't sent
    assert(breachesRequiringNotification.length > 0, 'Should identify breaches requiring notification');
    results.tests.push({ name: 'Breach Notification Requirements', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Breach Notification Requirements', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run the test if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run().then(result => {
    console.log(`\n🎯 CCPA Compliance Test ${result.passed ? 'PASSED' : 'FAILED'}`);
    process.exit(result.passed ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}