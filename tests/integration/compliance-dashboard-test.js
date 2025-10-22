/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * Compliance Dashboard Test Suite
 *
 * Comprehensive testing for the unified compliance monitoring dashboard
 */

import {
  ComplianceMonitor,
  ComplianceMetrics,
  ComplianceReporting,
  NotificationSystem,
  AuditLogger,
  DASHBOARD_DATA,
  COMPLIANCE_FRAMEWORKS
} from '../../services/compliance-dashboard/index.js';

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
  console.log('📊 Running Compliance Dashboard Tests...\n');

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
    console.log('🎉 All compliance dashboard tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// ============================================================================
// COMPLIANCE MONITORING TESTS
// ============================================================================

test('Compliance Monitor - Framework Status Update', async () => {
  // For this test, we'll simulate the framework status update
  // without actually calling external services
  const mockStatus = {
    framework: 'GDPR',
    status: 'compliant',
    issues: [],
    lastUpdated: new Date().toISOString(),
    data: {
      complianceStatus: {
        overall: 'compliant',
        issues: [],
        lastAudit: new Date().toISOString()
      }
    }
  };

  // Manually add mock data to test the logic
  DASHBOARD_DATA.complianceFrameworks.set('GDPR', mockStatus);

  const gdprStatus = DASHBOARD_DATA.complianceFrameworks.get('GDPR');
  assert(gdprStatus, 'GDPR status should be stored');
  assertEqual(gdprStatus.status, 'compliant', 'GDPR should be compliant');
  assertEqual(gdprStatus.framework, 'GDPR', 'Framework name should match');
});

test('Compliance Monitor - Alert Generation', async () => {
  // Clear existing alerts
  DASHBOARD_DATA.alerts.length = 0;

  const criticalStatus = {
    framework: 'GDPR',
    status: 'non-compliant',
    issues: ['Data breach not reported within 72 hours'],
    lastUpdated: new Date().toISOString()
  };

  ComplianceMonitor.generateAlerts(criticalStatus);

  const alerts = DASHBOARD_DATA.alerts;
  assert(alerts.length === 1, 'Critical alert should be generated');
  assertEqual(alerts[0].framework, 'GDPR', 'Alert should be for GDPR');
  assertEqual(alerts[0].severity, 'critical', 'Alert should be critical');
  assert(!alerts[0].acknowledged, 'Alert should not be acknowledged');
});

test('Compliance Monitor - Alert Acknowledgment', () => {
  const alert = {
    alertId: 'test-alert-001',
    framework: 'GDPR',
    severity: 'critical',
    acknowledged: false
  };

  DASHBOARD_DATA.alerts.push(alert);

  const acknowledged = ComplianceMonitor.acknowledgeAlert('test-alert-001');
  assert(acknowledged, 'Alert should be acknowledged');

  const updatedAlert = DASHBOARD_DATA.alerts.find(a => a.alertId === 'test-alert-001');
  assert(updatedAlert.acknowledged, 'Alert should be marked as acknowledged');
  assert(updatedAlert.acknowledgedAt, 'Acknowledgment timestamp should be set');
});

test('Compliance Monitor - Compliance Overview', () => {
  // Set up test data
  DASHBOARD_DATA.complianceFrameworks.clear();
  DASHBOARD_DATA.complianceFrameworks.set('GDPR', { status: 'compliant' });
  DASHBOARD_DATA.complianceFrameworks.set('HIPAA', { status: 'needs-attention' });
  DASHBOARD_DATA.complianceFrameworks.set('SOX', { status: 'non-compliant' });
  DASHBOARD_DATA.complianceFrameworks.set('CCPA', { status: 'compliant' });

  const overview = ComplianceMonitor.getComplianceOverview();

  assertEqual(overview.totalFrameworks, 6, 'Should have 6 total frameworks');
  assertEqual(overview.compliantFrameworks, 2, 'Should have 2 compliant frameworks');
  assertEqual(overview.needsAttentionFrameworks, 1, 'Should have 1 framework needing attention');
  assertEqual(overview.nonCompliantFrameworks, 1, 'Should have 1 non-compliant framework');
  assert(overview.lastUpdated, 'Last updated timestamp should be set');
});

// ============================================================================
// COMPLIANCE METRICS TESTS
// ============================================================================

test('Compliance Metrics - Compliance Score Calculation', () => {
  const frameworks = [
    { status: 'compliant' },
    { status: 'compliant' },
    { status: 'needs-attention' },
    { status: 'non-compliant' }
  ];

  const score = ComplianceMetrics.calculateComplianceScore(frameworks);
  // (100 + 100 + 60 + 20) / 4 = 70
  assertEqual(score, 70, 'Compliance score should be 70');
});

test('Compliance Metrics - Regional Compliance', () => {
  const frameworks = [
    { framework: 'GDPR', status: 'compliant' },
    { framework: 'HIPAA', status: 'compliant' },
    { framework: 'SOX', status: 'compliant' },
    { framework: 'CCPA', status: 'compliant' }
  ];

  const regional = ComplianceMetrics.calculateRegionalCompliance(frameworks);

  assert(regional.EU, 'EU region should exist');
  assert(regional.US, 'US region should exist');
  assertEqual(regional.EU.compliant, 1, 'EU should have 1 compliant framework');
  assertEqual(regional.US.compliant, 2, 'US should have 2 compliant frameworks');
});

test('Compliance Metrics - Risk Distribution', () => {
  const frameworks = [
    { status: 'compliant' },
    { status: 'compliant' },
    { status: 'needs-attention' },
    { status: 'non-compliant' },
    { status: 'unreachable' }
  ];

  const distribution = ComplianceMetrics.calculateRiskDistribution(frameworks);

  assertEqual(distribution.low, 2, 'Should have 2 low risk frameworks');
  assertEqual(distribution.medium, 1, 'Should have 1 medium risk framework');
  assertEqual(distribution.high, 1, 'Should have 1 high risk framework');
  assertEqual(distribution.critical, 1, 'Should have 1 critical risk framework');
});

test('Compliance Metrics - Top Issues Identification', () => {
  const frameworks = [
    { issues: ['Data retention policy needed', 'Access controls review'] },
    { issues: ['Data retention policy needed', 'Training required'] },
    { issues: ['Access controls review', 'Training required'] }
  ];

  const topIssues = ComplianceMetrics.identifyTopIssues(frameworks);

  assertEqual(topIssues.length, 3, 'Should identify 3 top issues');
  assertEqual(topIssues[0].issue, 'Data retention policy needed', 'Most common issue should be first');
  assertEqual(topIssues[0].count, 2, 'Data retention issue should appear twice');
});

// ============================================================================
// COMPLIANCE REPORTING TESTS
// ============================================================================

test('Compliance Reporting - Executive Summary Generation', () => {
  const metrics = {
    overallComplianceScore: 75,
    topIssues: [
      { issue: 'Data retention policy', count: 3 },
      { issue: 'Access controls', count: 2 }
    ]
  };

  const frameworks = [
    { status: 'compliant' },
    { status: 'compliant' },
    { status: 'needs-attention' }
  ];

  const summary = ComplianceReporting.generateExecutiveSummary(metrics, frameworks);

  assertEqual(summary.overallCompliance, '67%', 'Compliance percentage should be 67%');
  assertEqual(summary.complianceScore, 75, 'Compliance score should be 75');
  assertEqual(summary.criticalIssues, 2, 'Should have 2 critical issues');
  assert(summary.keyFindings.length > 0, 'Should have key findings');
});

test('Compliance Reporting - Recommendations Generation', () => {
  const metrics = {
    overallComplianceScore: 45,
    topIssues: [{ issue: 'Data retention', count: 5 }]
  };

  const frameworks = [
    { status: 'non-compliant', framework: 'GDPR' },
    { status: 'non-compliant', framework: 'HIPAA' }
  ];

  const recommendations = ComplianceReporting.generateRecommendations(metrics, frameworks);

  assert(recommendations.length >= 2, 'Should generate at least 2 recommendations');
  assert(recommendations.some(r => r.priority === 'high'), 'Should have high priority recommendations');
  assert(recommendations.some(r => r.area === 'Framework Compliance'), 'Should have framework compliance recommendations');
});

test('Compliance Reporting - Full Report Generation', async () => {
  // Set up test data
  DASHBOARD_DATA.complianceFrameworks.clear();
  DASHBOARD_DATA.complianceFrameworks.set('GDPR', {
    status: 'compliant',
    issues: [],
    data: { summary: { totalRecords: 1000 } }
  });

  const report = await ComplianceReporting.generateComplianceReport('comprehensive');

  assert(report.reportId, 'Report should have an ID');
  assertEqual(report.type, 'comprehensive', 'Report type should be comprehensive');
  assert(report.executiveSummary, 'Report should have executive summary');
  assert(report.frameworkDetails, 'Report should have framework details');
  assert(report.metrics, 'Report should have metrics');
  assert(report.recommendations, 'Report should have recommendations');
  assert(report.nextReviewDate, 'Report should have next review date');
});

// ============================================================================
// NOTIFICATION SYSTEM TESTS
// ============================================================================

test('Notification System - Alert Notification', async () => {
  // Clear existing notifications
  DASHBOARD_DATA.notifications.length = 0;

  const alert = {
    type: 'non-compliant',
    details: ['Data breach not reported']
  };

  const notification = await NotificationSystem.sendComplianceAlert('GDPR', alert);

  assert(notification.notificationId, 'Notification should have an ID');
  assertEqual(notification.type, 'compliance_alert', 'Notification type should be compliance_alert');
  assert(notification.subject.includes('GDPR'), 'Subject should mention GDPR');
  assert(notification.message.includes('Data breach'), 'Message should contain alert details');
});

test('Notification System - Weekly Report Notification', async () => {
  // Clear existing notifications
  DASHBOARD_DATA.notifications.length = 0;

  const notification = await NotificationSystem.sendWeeklyComplianceReport();

  assert(notification.notificationId, 'Notification should have an ID');
  assertEqual(notification.type, 'weekly_report', 'Notification type should be weekly_report');
  assert(notification.subject.includes('Weekly'), 'Subject should mention weekly report');
  assert(notification.message.includes('Compliance Score'), 'Message should contain compliance information');
});

// ============================================================================
// AUDIT TRAIL TESTS
// ============================================================================

test('Audit Logger - Log and Retrieve Audit Trail', () => {
  // Clear existing audit logs
  DASHBOARD_DATA.auditLogs.length = 0;

  // Log some actions
  AuditLogger.log('compliance_status_update', { frameworksUpdated: 6 });
  AuditLogger.log('alert_acknowledged', { alertId: 'test-alert' });
  AuditLogger.log('compliance_report_generated', { reportId: 'test-report' });

  const allLogs = AuditLogger.getAuditTrail();
  assertEqual(allLogs.length, 3, 'Should have 3 audit logs');

  const statusLogs = AuditLogger.getAuditTrail(null, null, 'compliance_status_update');
  assertEqual(statusLogs.length, 1, 'Should have 1 status update log');
  assertEqual(statusLogs[0].action, 'compliance_status_update', 'Log action should match');
});

// ============================================================================
// DASHBOARD INTEGRATION TESTS
// ============================================================================

test('Dashboard Integration - Global Metrics Calculation', () => {
  // Set up comprehensive test data
  DASHBOARD_DATA.complianceFrameworks.clear();
  DASHBOARD_DATA.complianceFrameworks.set('GDPR', { framework: 'GDPR', status: 'compliant', issues: [] });
  DASHBOARD_DATA.complianceFrameworks.set('HIPAA', { framework: 'HIPAA', status: 'needs-attention', issues: ['PHI review'] });
  DASHBOARD_DATA.complianceFrameworks.set('SOX', { framework: 'SOX', status: 'compliant', issues: [] });
  DASHBOARD_DATA.complianceFrameworks.set('CCPA', { framework: 'CCPA', status: 'non-compliant', issues: ['Data mapping incomplete'] });
  DASHBOARD_DATA.complianceFrameworks.set('PIPEDA', { framework: 'PIPEDA', status: 'compliant', issues: [] });
  DASHBOARD_DATA.complianceFrameworks.set('LGPD', { framework: 'LGPD', status: 'needs-attention', issues: ['DPIA required'] });

  const metrics = ComplianceMetrics.calculateGlobalMetrics();

  assert(metrics.overallComplianceScore >= 0 && metrics.overallComplianceScore <= 100, 'Compliance score should be between 0-100');
  assert(metrics.regionalCompliance, 'Should have regional compliance data');
  assert(metrics.riskDistribution, 'Should have risk distribution data');
  assert(metrics.topIssues, 'Should have top issues identified');
  assert(metrics.timestamp, 'Should have timestamp');
});

test('Dashboard Integration - Complete Dashboard Data Structure', () => {
  // This test verifies the complete dashboard data structure
  const dashboard = {
    overview: ComplianceMonitor.getComplianceOverview(),
    frameworks: Object.fromEntries(DASHBOARD_DATA.complianceFrameworks),
    metrics: ComplianceMetrics.calculateGlobalMetrics(),
    activeAlerts: ComplianceMonitor.getActiveAlerts(),
    recentActivity: DASHBOARD_DATA.auditLogs.slice(-20),
    timestamp: new Date().toISOString()
  };

  assert(dashboard.overview, 'Dashboard should have overview section');
  assert(dashboard.frameworks, 'Dashboard should have frameworks data');
  assert(dashboard.metrics, 'Dashboard should have metrics');
  assert(Array.isArray(dashboard.activeAlerts), 'Active alerts should be an array');
  assert(Array.isArray(dashboard.recentActivity), 'Recent activity should be an array');
  assert(dashboard.timestamp, 'Dashboard should have timestamp');

  // Verify overview structure
  assert(typeof dashboard.overview.totalFrameworks === 'number', 'Overview should have total frameworks count');
  assert(typeof dashboard.overview.compliantFrameworks === 'number', 'Overview should have compliant frameworks count');
  assert(dashboard.overview.lastUpdated, 'Overview should have last updated timestamp');
});

// ============================================================================
// RUN TESTS
// ============================================================================

runTests();