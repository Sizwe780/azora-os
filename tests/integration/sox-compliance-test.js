/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * SOX Compliance Module - Test Suite
 *
 * Tests all SOX compliance features including:
 * - Financial Reporting Controls
 * - Change Management
 * - Access Controls
 * - Certifications & Attestations
 * - Whistleblower Protection
 * - Material Events
 */

import { FinancialControls, AuditLogger, ChangeManagement, AccessControls, Certifications, WhistleblowerProtection, MaterialEvents, SOX_DATA } from '../../services/sox-compliance/index.js';

export async function run() {
  console.log('📈 Testing SOX Compliance Module...');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };

  // Test Financial Controls
  await testFinancialControls(results);

  // Test Change Management
  await testChangeManagement(results);

  // Test Access Controls
  await testAccessControls(results);

  // Test Certifications
  await testCertifications(results);

  // Test Whistleblower Protection
  await testWhistleblowerProtection(results);

  // Test Material Events
  await testMaterialEvents(results);

  // Summary
  console.log(`\n📊 SOX Compliance Test Results:`);
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

async function testFinancialControls(results) {
  console.log('\n📊 Testing Financial Controls...');

  // Test Control Documentation
  try {
    const controlData = {
      controlType: 'preventive',
      processArea: 'Revenue Recognition',
      objective: 'Ensure accurate revenue reporting',
      riskLevel: 'high',
      controlActivities: ['Monthly reconciliation', 'Approval workflows'],
      responsibleParty: 'CFO'
    };

    const result = await FinancialControls.documentControl(controlData);
    assert(result.controlId, 'Control documentation should return control ID');
    assert(SOX_DATA.financialControls.has(result.controlId), 'Control should be stored');

    const control = SOX_DATA.financialControls.get(result.controlId);
    assert(control.controlType === 'preventive', 'Control type should be stored correctly');
    assert(control.status === 'active', 'Control should be active by default');
    results.tests.push({ name: 'Control Documentation', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Control Documentation', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Control Testing
  try {
    const controlId = Array.from(SOX_DATA.financialControls.keys())[0];
    const testData = {
      effective: true,
      testDescription: 'Monthly reconciliation review',
      testResults: 'All reconciliations completed accurately',
      deficiencies: []
    };

    const result = await FinancialControls.testControl(controlId, testData);
    assert(result.success, 'Control testing should succeed');
    assert(result.testResult === 'passed', 'Control should pass test');

    const control = SOX_DATA.financialControls.get(controlId);
    assert(control.testResults.length > 0, 'Test results should be recorded');
    results.tests.push({ name: 'Control Testing', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Control Testing', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testChangeManagement(results) {
  console.log('\n🔄 Testing Change Management...');

  // Test Change Submission
  try {
    const changeData = {
      changeType: 'enhancement',
      description: 'Implement automated reconciliation process',
      impactLevel: 'medium',
      submitter: 'IT Manager',
      affectedSystems: ['Financial Reporting System'],
      businessJustification: 'Improve accuracy and efficiency'
    };

    const result = await ChangeManagement.recordChange(changeData);
    assert(result.changeId, 'Change submission should return change ID');
    assert(SOX_DATA.changeLogs.has(result.changeId), 'Change should be stored');

    const change = SOX_DATA.changeLogs.get(result.changeId);
    assert(change.status === 'pending', 'Change should be pending initially');
    assert(change.approvals.length === 0, 'Change should have no approvals initially');
    results.tests.push({ name: 'Change Submission', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Change Submission', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Change Approval
  try {
    const changeId = Array.from(SOX_DATA.changeLogs.keys())[0];
    const approvalData = {
      approvalLevel: 'manager',
      comments: 'Approved for implementation'
    };

    const result = await ChangeManagement.approveChange(changeId, 'manager-001', approvalData);
    assert(result.success, 'Change approval should succeed');

    const change = SOX_DATA.changeLogs.get(changeId);
    assert(change.approvals.length > 0, 'Change should have approvals recorded');
    results.tests.push({ name: 'Change Approval', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Change Approval', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testAccessControls(results) {
  console.log('\n🔐 Testing Access Controls...');

  // Test Access Grant
  try {
    const accessData = {
      userId: 'accountant-001',
      dataType: 'financial-reports',
      accessLevel: 'read',
      permissions: ['view', 'export'],
      justification: 'Required for monthly reporting'
    };

    const result = await AccessControls.grantAccess(accessData);
    assert(result.accessId, 'Access grant should return access ID');
    assert(SOX_DATA.accessControls.has(result.accessId), 'Access should be stored');

    const access = SOX_DATA.accessControls.get(result.accessId);
    assert(access.status === 'active', 'Access should be active');
    assert(access.permissions.includes('view'), 'Access should include granted permissions');
    results.tests.push({ name: 'Access Grant', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Access Grant', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Access Check
  try {
    const hasAccess = AccessControls.hasAccess('accountant-001', 'financial-reports', 'view');
    assert(hasAccess, 'User should have access to granted data');

    const noAccess = AccessControls.hasAccess('accountant-001', 'financial-reports', 'delete');
    assert(!noAccess, 'User should not have un-granted permissions');
    results.tests.push({ name: 'Access Check', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Access Check', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testCertifications(results) {
  console.log('\n📜 Testing Certifications...');

  // Test Certification Recording
  try {
    const certData = {
      certifier: 'External Audit Firm',
      scope: 'Financial Reporting Controls',
      period: 'FY 2024',
      controlEffectiveness: 'effective',
      keyFindings: 'All material controls operating effectively',
      recommendations: []
    };

    const result = await Certifications.recordCertification(certData);
    assert(result.certId, 'Certification should return cert ID');
    assert(SOX_DATA.certifications.has(result.certId), 'Certification should be stored');

    const cert = SOX_DATA.certifications.get(result.certId);
    assert(cert.status === 'active', 'Certification should be active');
    assert(cert.attestations.length === 0, 'Certification should have no attestations initially');
    results.tests.push({ name: 'Certification Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Certification Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Attestation Recording
  try {
    const certId = Array.from(SOX_DATA.certifications.keys())[0];
    const attestationData = {
      attester: 'CEO',
      role: 'Chief Executive Officer',
      statement: 'I certify that the financial controls are effective'
    };

    const result = await Certifications.recordAttestation(certId, attestationData);
    assert(result.success, 'Attestation should succeed');

    const cert = SOX_DATA.certifications.get(certId);
    assert(cert.attestations.length > 0, 'Certification should have attestations');
    results.tests.push({ name: 'Attestation Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Attestation Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testWhistleblowerProtection(results) {
  console.log('\n🗣️  Testing Whistleblower Protection...');

  // Test Report Submission
  try {
    const reportData = {
      category: 'financial-misconduct',
      description: 'Suspected revenue manipulation in Q4 reports',
      severity: 'high',
      evidence: 'Email communications and spreadsheet anomalies',
      reporterName: 'Anonymous',
      anonymous: true
    };

    const result = await WhistleblowerProtection.submitReport(reportData);
    assert(result.reportId, 'Report submission should return report ID');
    assert(result.anonymous, 'Report should be anonymous');

    const report = SOX_DATA.whistleblowerReports.find(r => r.reportId === result.reportId);
    assert(report.status === 'received', 'Report should be received');
    assert(report.anonymous, 'Report should be marked as anonymous');
    results.tests.push({ name: 'Whistleblower Report Submission', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Whistleblower Report Submission', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;
}

async function testMaterialEvents(results) {
  console.log('\n📢 Testing Material Events...');

  // Test Event Recording
  try {
    const eventData = {
      eventType: 'restatement',
      description: 'Financial restatement due to accounting error',
      dateOccurred: new Date().toISOString(),
      financialImpact: 5000000,
      operationalDisruption: 'moderate',
      regulatoryImpact: true,
      reputationImpact: 'moderate'
    };

    const result = await MaterialEvents.recordEvent(eventData);
    assert(result.eventId, 'Event recording should return event ID');
    assert(result.requiresDisclosure, 'High impact event should require disclosure');

    const event = SOX_DATA.materialEvents.find(e => e.eventId === result.eventId);
    assert(event.impact.level === 'medium', 'Event should be assessed as medium impact');
    assert(event.disclosureStatus === 'pending', 'Event disclosure should be pending');
    results.tests.push({ name: 'Material Event Recording', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Material Event Recording', status: 'failed', error: error.message });
    results.failed++;
  }
  results.total++;

  // Test Event Disclosure
  try {
    const eventId = SOX_DATA.materialEvents[0].eventId;
    const disclosureData = {
      method: 'SEC Filing',
      audience: 'public',
      details: 'Filed Form 8-K with SEC disclosing material event'
    };

    const result = await MaterialEvents.recordDisclosure(eventId, disclosureData);
    assert(result.success, 'Disclosure recording should succeed');

    const event = SOX_DATA.materialEvents.find(e => e.eventId === eventId);
    assert(event.disclosureStatus === 'disclosed', 'Event should be marked as disclosed');
    assert(event.disclosures.length > 0, 'Event should have disclosure records');
    results.tests.push({ name: 'Material Event Disclosure', status: 'passed' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Material Event Disclosure', status: 'failed', error: error.message });
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
    console.log(`\n🎯 SOX Compliance Test ${result.passed ? 'PASSED' : 'FAILED'}`);
    process.exit(result.passed ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
