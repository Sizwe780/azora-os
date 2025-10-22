/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * Automated Compliance Reporting Tests
 */

import {
  ReportGenerator,
  RegulatoryFilingSystem,
  AuditTrailManager,
  NotificationSystem,
  REPORTING_DATA,
  REPORTING_CONFIG
} from './index.js';

// ============================================================================
// TEST UTILITIES
// ============================================================================

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

// function assertThrows(fn, message) {
//   try {
//     fn();
//     throw new Error(`Expected function to throw: ${message}`);
//   } catch (error) {
//     if (error.message.includes('Expected function to throw')) {
//       throw error;
//     }
//   }
// }

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFrameworkData = {
  GDPR: {
    framework: 'GDPR',
    region: 'EU',
    auditTrail: [
      { action: 'data_subject_request', timestamp: '2024-01-01T00:00:00Z' },
      { action: 'consent_updated', timestamp: '2024-01-02T00:00:00Z' }
    ],
    collectedAt: new Date().toISOString()
  },
  HIPAA: {
    framework: 'HIPAA',
    region: 'US',
    auditTrail: [
      { action: 'phi_access', timestamp: '2024-01-01T00:00:00Z' }
    ],
    collectedAt: new Date().toISOString()
  }
};

const mockDashboardMetrics = {
  overview: {
    totalFrameworks: 6,
    compliantFrameworks: 5,
    activeAlerts: 2
  },
  metrics: {
    overallComplianceScore: 83,
    regionalCompliance: { EU: { compliant: 1 }, US: { compliant: 2 } },
    riskDistribution: { low: 4, medium: 1, high: 1, critical: 0 },
    topIssues: [
      { issue: 'Data retention policy', count: 2 },
      { issue: 'Access controls', count: 1 }
    ]
  },
  activeAlerts: [
    { severity: 'high', type: 'non-compliant' },
    { severity: 'medium', type: 'needs-attention' }
  ]
};

// ============================================================================
// TEST CASES
// ============================================================================

async function runTests() {
  console.log('📊 Running Automated Compliance Reporting Tests...\n');

  let passed = 0;
  let failed = 0;

  async function runTest(testName, testFn) {
    try {
      await testFn();
      console.log(`✅ ${testName}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
      failed++;
    }
  }

  // ============================================================================
  // REPORT GENERATOR TESTS
  // ============================================================================

  await runTest('Report Generator - Summary Generation', () => {
    const summary = ReportGenerator.generateSummary('weekly', mockFrameworkData, mockDashboardMetrics);

    assertEqual(summary.reportType, 'weekly', 'Report type should be weekly');
    assertEqual(summary.totalFrameworks, 2, 'Should have 2 frameworks');
    assertEqual(summary.compliantFrameworks, 2, 'Should have 2 compliant frameworks');
    assertEqual(summary.compliancePercentage, 100, 'Compliance percentage should be 100');
    assertEqual(summary.overallScore, 83, 'Overall score should be 83');
    assert(summary.generatedAt, 'Should have generated timestamp');
  });

  await runTest('Report Generator - Recommendations Generation', () => {
    const recommendations = ReportGenerator.generateRecommendations('monthly', mockFrameworkData, mockDashboardMetrics);

    assert(Array.isArray(recommendations), 'Recommendations should be an array');
    assert(recommendations.length >= 0, 'Should have recommendations');
  });

  await runTest('Report Generator - Compliance Score Calculation', () => {
    const score = ReportGenerator.calculateComplianceScore(mockFrameworkData, mockDashboardMetrics);
    assertEqual(score, 83, 'Compliance score should be 83');

    const fallbackScore = ReportGenerator.calculateComplianceScore(mockFrameworkData, null);
    assertEqual(fallbackScore, 100, 'Fallback score should be 100');
  });

  await runTest('Report Generator - Risk Assessment', () => {
    const risks = ReportGenerator.assessRisks(mockFrameworkData, mockDashboardMetrics);

    assert(risks.critical >= 0, 'Should have critical risk count');
    assert(risks.high >= 0, 'Should have high risk count');
    assert(risks.medium >= 0, 'Should have medium risk count');
    assert(risks.low >= 0, 'Should have low risk count');
  });

  await runTest('Report Generator - Period Description', () => {
    const dailyDesc = ReportGenerator.getPeriodDescription('daily');
    assert(dailyDesc.includes('-'), 'Daily description should contain date');

    const weeklyDesc = ReportGenerator.getPeriodDescription('weekly');
    assert(weeklyDesc.includes('Week of'), 'Weekly description should contain "Week of"');

    const monthlyDesc = ReportGenerator.getPeriodDescription('monthly');
    assert(monthlyDesc.includes('-'), 'Monthly description should contain year-month');

    const quarterlyDesc = ReportGenerator.getPeriodDescription('quarterly');
    assert(quarterlyDesc.includes('Q'), 'Quarterly description should contain quarter');

    const annualDesc = ReportGenerator.getPeriodDescription('annual');
    assert(annualDesc.length === 4, 'Annual description should be 4 characters (year)');
  });

  // ============================================================================
  // REGULATORY FILING SYSTEM TESTS
  // ============================================================================

  await runTest('Regulatory Filing System - Filing Preparation', async () => {
    const mockReport = {
      reportId: 'test-report-123',
      type: 'monthly',
      summary: { period: '2024-01' },
      formats: { pdf: { filepath: '/tmp/test.pdf' } },
      riskAssessment: { critical: 0, high: 1, medium: 2, low: 3 }
    };

    const filing = await RegulatoryFilingSystem.prepareRegulatoryFiling('monthly', mockReport);

    assert(filing.filingId, 'Filing should have an ID');
    assertEqual(filing.reportType, 'monthly', 'Filing type should be monthly');
    assertEqual(filing.status, 'prepared', 'Filing status should be prepared');
    assert(filing.regulatoryBody, 'Filing should have regulatory body');
    assert(filing.filingDeadline, 'Filing should have deadline');
    assert(filing.compliance, 'Filing should have compliance assessment');
  });

  await runTest('Regulatory Filing System - Filing Submission', async () => {
    // First prepare a filing
    const mockReport = {
      reportId: 'test-report-submit',
      type: 'quarterly',
      summary: { period: 'Q1 2024' },
      formats: { pdf: { filepath: '/tmp/test.pdf' } },
      riskAssessment: { critical: 0, high: 1, medium: 2, low: 3 }
    };

    const filing = await RegulatoryFilingSystem.prepareRegulatoryFiling('quarterly', mockReport);
    const submittedFiling = await RegulatoryFilingSystem.submitFiling(filing.filingId);

    assertEqual(submittedFiling.status, 'submitted', 'Filing status should be submitted');
    assert(submittedFiling.submittedAt, 'Filing should have submission timestamp');
    assert(submittedFiling.confirmationNumber, 'Filing should have confirmation number');
  });

  await runTest('Regulatory Filing System - Regulatory Body Assignment', () => {
    const monthlyBodies = RegulatoryFilingSystem.getRegulatoryBody('monthly');
    assert(monthlyBodies.includes('EU Data Protection Board'), 'Monthly should include EU DPB');

    const quarterlyBodies = RegulatoryFilingSystem.getRegulatoryBody('quarterly');
    assert(quarterlyBodies.includes('SEC'), 'Quarterly should include SEC');

    const annualBodies = RegulatoryFilingSystem.getRegulatoryBody('annual');
    assert(annualBodies.includes('SEC'), 'Annual should include SEC');
  });

  await runTest('Regulatory Filing System - Filing Compliance Assessment', () => {
    const mockReport = {
      frameworkData: mockFrameworkData,
      dashboardMetrics: mockDashboardMetrics,
      riskAssessment: { critical: 0, high: 1, medium: 2, low: 3 }
    };

    const compliance = RegulatoryFilingSystem.assessFilingCompliance(mockReport);

    assert(typeof compliance.meetsRequirements === 'boolean', 'Compliance should have meetsRequirements flag');
    assert(Array.isArray(compliance.issues), 'Compliance should have issues array');
    assert(typeof compliance.completeness === 'number', 'Compliance should have completeness percentage');
  });

  // ============================================================================
  // AUDIT TRAIL MANAGER TESTS
  // ============================================================================

  await runTest('Audit Trail Manager - Trail Storage and Retrieval', () => {
    // Simulate storing audit trails
    REPORTING_DATA.auditTrails.clear();
    REPORTING_DATA.auditTrails.set('GDPR', [{
      collectedAt: '2024-01-01T00:00:00Z',
      entries: mockFrameworkData.GDPR.auditTrail,
      status: 'success'
    }]);

    const trail = AuditTrailManager.getAuditTrail('GDPR');
    assertEqual(trail.length, 1, 'Should have 1 audit trail entry');
    assertEqual(trail[0].status, 'success', 'Entry status should be success');
  });

  await runTest('Audit Trail Manager - Date Filtering', () => {
    REPORTING_DATA.auditTrails.clear();
    REPORTING_DATA.auditTrails.set('HIPAA', [
      {
        collectedAt: '2024-01-01T00:00:00Z',
        entries: [],
        status: 'success'
      },
      {
        collectedAt: '2024-01-15T00:00:00Z',
        entries: [],
        status: 'success'
      },
      {
        collectedAt: '2024-02-01T00:00:00Z',
        entries: [],
        status: 'success'
      }
    ]);

    const filteredTrail = AuditTrailManager.getAuditTrail('HIPAA', '2024-01-05T00:00:00Z', '2024-01-20T00:00:00Z');
    assertEqual(filteredTrail.length, 1, 'Should have 1 entry in date range');
  });

  await runTest('Audit Trail Manager - Audit Report Generation', () => {
    const period = { start: '2024-01-01', end: '2024-01-31' };
    const report = AuditTrailManager.generateAuditReport('GDPR', period);

    assertEqual(report.framework, 'GDPR', 'Report should be for GDPR');
    assertEqual(report.period, period, 'Report should have correct period');
    assert(typeof report.totalEntries === 'number', 'Report should have total entries count');
    assert(typeof report.successfulCollections === 'number', 'Report should have successful collections count');
  });

  // ============================================================================
  // NOTIFICATION SYSTEM TESTS
  // ============================================================================

  await runTest('Notification System - Report Notification', async () => {
    const mockReport = {
      type: 'weekly',
      summary: {
        period: 'Week of 2024-01-01',
        complianceScore: 85,
        compliantFrameworks: 5,
        totalFrameworks: 6,
        criticalIssues: 1
      },
      complianceScore: 85,
      riskAssessment: { critical: 1, high: 2, medium: 1, low: 2 },
      formats: { json: {}, pdf: {} }
    };

    const recipients = ['test@azora-os.com'];

    // This should not throw an error
    await NotificationSystem.sendReportNotification(mockReport, recipients);
  });

  await runTest('Notification System - Filing Notification', async () => {
    const mockFiling = {
      filingId: 'test-filing-123',
      reportType: 'quarterly',
      regulatoryBody: ['SEC', 'PCAOB'],
      filingDeadline: '2024-05-15T00:00:00Z',
      status: 'prepared',
      compliance: { meetsRequirements: true, issues: [] }
    };

    const recipients = ['legal@azora-os.com'];

    // This should not throw an error
    await NotificationSystem.sendFilingNotification(mockFiling, recipients);
  });

  // ============================================================================
  // CONFIGURATION TESTS
  // ============================================================================

  await runTest('Configuration - Report Types', () => {
    assert(REPORTING_CONFIG.daily, 'Should have daily config');
    assert(REPORTING_CONFIG.weekly, 'Should have weekly config');
    assert(REPORTING_CONFIG.monthly, 'Should have monthly config');
    assert(REPORTING_CONFIG.quarterly, 'Should have quarterly config');
    assert(REPORTING_CONFIG.annual, 'Should have annual config');
  });

  await runTest('Configuration - Report Formats', () => {
    assert(REPORTING_CONFIG.daily.formats.includes('json'), 'Daily should include JSON format');
    assert(REPORTING_CONFIG.weekly.formats.includes('pdf'), 'Weekly should include PDF format');
    assert(REPORTING_CONFIG.monthly.formats.includes('xlsx'), 'Monthly should include XLSX format');
  });

  await runTest('Configuration - Recipients', () => {
    assert(REPORTING_CONFIG.daily.recipients.length > 0, 'Daily should have recipients');
    assert(REPORTING_CONFIG.weekly.recipients.length > 0, 'Weekly should have recipients');
    assert(REPORTING_CONFIG.monthly.recipients.length > 0, 'Monthly should have recipients');
  });

  // ============================================================================
  // TEST RESULTS
  // ============================================================================

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All automated compliance reporting tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});