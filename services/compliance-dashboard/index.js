#!/usr/bin/env node

/**
 * Compliance Monitoring Dashboard
 *
 * Unified dashboard for monitoring compliance across all regulatory frameworks:
 * - GDPR (EU General Data Protection Regulation)
 * - HIPAA (US Health Insurance Portability and Accountability Act)
 * - SOX (US Sarbanes-Oxley Act)
 * - CCPA (California Consumer Privacy Act)
 * - PIPEDA (Personal Information Protection and Electronic Documents Act)
 * - LGPD (Lei Geral de Proteção de Dados - Brazilian GDPR)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
// import fs from 'fs';
// import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.COMPLIANCE_DASHBOARD_PORT || 4086;

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

// Connection pooling for framework service calls
class ConnectionPool {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.activeConnections--;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.activeConnections++;
      resolve();
    }
  }
}

const connectionPool = new ConnectionPool(5);

// Response caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Circuit breaker for service calls
class CircuitBreaker {
  constructor(failureThreshold = 5, recoveryTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

const circuitBreakers = new Map();

// ============================================================================
// COMPLIANCE DASHBOARD DATA STRUCTURES
// ============================================================================

const DASHBOARD_DATA = {
  complianceFrameworks: new Map(), // All compliance framework statuses
  alerts: [], // Active compliance alerts
  auditLogs: [], // Cross-framework audit logs
  metrics: new Map(), // Compliance metrics
  reports: new Map(), // Generated compliance reports
  notifications: [] // Notification queue
};

// Compliance framework configurations
const COMPLIANCE_FRAMEWORKS = {
  gdpr: {
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    region: 'EU',
    port: process.env.GDPR_COMPLIANCE_PORT || 4080,
    endpoint: '/gdpr/dashboard',
    criticalAlerts: ['non-compliant', 'high_risk'],
    refreshInterval: 300000 // 5 minutes
  },
  hipaa: {
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    region: 'US',
    port: process.env.HIPAA_COMPLIANCE_PORT || 4081,
    endpoint: '/hipaa/dashboard',
    criticalAlerts: ['breach_detected', 'non_compliant'],
    refreshInterval: 300000
  },
  sox: {
    name: 'SOX',
    fullName: 'Sarbanes-Oxley Act',
    region: 'US',
    port: process.env.SOX_COMPLIANCE_PORT || 4082,
    endpoint: '/sox/dashboard',
    criticalAlerts: ['material_weakness', 'non_compliant'],
    refreshInterval: 600000 // 10 minutes
  },
  ccpa: {
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    region: 'US-CA',
    port: process.env.CCPA_COMPLIANCE_PORT || 4083,
    endpoint: '/ccpa/dashboard',
    criticalAlerts: ['non-compliant', 'breach_30_days'],
    refreshInterval: 300000
  },
  pipeda: {
    name: 'PIPEDA',
    fullName: 'Personal Information Protection and Electronic Documents Act',
    region: 'CA',
    port: process.env.PIPEDA_COMPLIANCE_PORT || 4084,
    endpoint: '/pipeda/dashboard',
    criticalAlerts: ['non-compliant', 'breach_72_hours'],
    refreshInterval: 300000
  },
  lgpd: {
    name: 'LGPD',
    fullName: 'Lei Geral de Proteção de Dados',
    region: 'BR',
    port: process.env.LGPD_COMPLIANCE_PORT || 4085,
    endpoint: '/lgpd/dashboard',
    criticalAlerts: ['non-compliant', 'breach_72_hours'],
    refreshInterval: 300000
  },
  south_african: {
    name: 'SA',
    fullName: 'South African Compliance',
    region: 'ZA',
    port: process.env.SA_COMPLIANCE_PORT || 4090,
    endpoint: '/compliance',
    criticalAlerts: ['non-compliant', 'breach_detected'],
    refreshInterval: 300000
  }
};

// ============================================================================
// COMPLIANCE STATUS MONITORING
// ============================================================================

class ComplianceMonitor {
  static async fetchFrameworkStatus(framework) {
    const cacheKey = `framework_${framework.name}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // Get or create circuit breaker for this framework
    if (!circuitBreakers.has(framework.name)) {
      circuitBreakers.set(framework.name, new CircuitBreaker());
    }
    const circuitBreaker = circuitBreakers.get(framework.name);

    try {
      await connectionPool.acquire();

      const result = await circuitBreaker.execute(async () => {
        const response = await fetch(`http://localhost:${framework.port}${framework.endpoint}`, {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'Azora-Compliance-Dashboard/1.0'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          framework: framework.name,
          status: data.data.complianceStatus.overall,
          issues: data.data.complianceStatus.issues,
          lastUpdated: new Date().toISOString(),
          data: data.data
        };
      });

      setCached(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`Failed to fetch ${framework.name} status:`, error.message);
      const errorResult = {
        framework: framework.name,
        status: 'unreachable',
        issues: [`Service unreachable: ${error.message}`],
        lastUpdated: new Date().toISOString(),
        error: error.message
      };

      // Cache error results for shorter time
      cache.set(cacheKey, {
        data: errorResult,
        timestamp: Date.now()
      });

      return errorResult;
    } finally {
      connectionPool.release();
    }
  }

  static async updateAllFrameworkStatuses() {
    const promises = Object.values(COMPLIANCE_FRAMEWORKS).map(framework =>
      this.fetchFrameworkStatus(framework)
    );

    const results = await Promise.allSettled(promises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const status = result.value;
        DASHBOARD_DATA.complianceFrameworks.set(status.framework, status);

        // Generate alerts for critical issues
        this.generateAlerts(status);
      } else {
        console.error(`Failed to update framework status:`, result.reason);
      }
    });

    AuditLogger.log('compliance_status_update', {
      frameworksUpdated: results.filter(r => r.status === 'fulfilled').length,
      totalFrameworks: Object.keys(COMPLIANCE_FRAMEWORKS).length
    });
  }

  static generateAlerts(frameworkStatus) {
    const framework = COMPLIANCE_FRAMEWORKS[frameworkStatus.framework.toLowerCase()];

    if (framework.criticalAlerts.includes(frameworkStatus.status)) {
      const alert = {
        alertId: crypto.randomUUID(),
        framework: frameworkStatus.framework,
        severity: 'critical',
        type: frameworkStatus.status,
        message: `${framework.fullName} is ${frameworkStatus.status}`,
        details: frameworkStatus.issues,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };

      DASHBOARD_DATA.alerts.push(alert);

      AuditLogger.log('compliance_alert_generated', {
        alertId: alert.alertId,
        framework: frameworkStatus.framework,
        severity: 'critical',
        type: frameworkStatus.status
      });
    }
  }

  static getActiveAlerts() {
    return DASHBOARD_DATA.alerts.filter(alert => !alert.acknowledged);
  }

  static acknowledgeAlert(alertId) {
    const alert = DASHBOARD_DATA.alerts.find(a => a.alertId === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();

      AuditLogger.log('alert_acknowledged', {
        alertId,
        framework: alert.framework
      });

      return true;
    }
    return false;
  }

  static getComplianceOverview() {
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values());
    const overview = {
      totalFrameworks: Object.keys(COMPLIANCE_FRAMEWORKS).length,
      compliantFrameworks: frameworks.filter(f => f.status === 'compliant').length,
      needsAttentionFrameworks: frameworks.filter(f => f.status === 'needs-attention').length,
      nonCompliantFrameworks: frameworks.filter(f => f.status === 'non-compliant').length,
      unreachableFrameworks: frameworks.filter(f => f.status === 'unreachable').length,
      activeAlerts: this.getActiveAlerts().length,
      lastUpdated: new Date().toISOString()
    };

    return overview;
  }
}

// ============================================================================
// COMPLIANCE METRICS & ANALYTICS
// ============================================================================

class ComplianceMetrics {
  static calculateGlobalMetrics() {
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values());

    const metrics = {
      overallComplianceScore: this.calculateComplianceScore(frameworks),
      regionalCompliance: this.calculateRegionalCompliance(frameworks),
      riskDistribution: this.calculateRiskDistribution(frameworks),
      trendAnalysis: this.calculateTrendAnalysis(),
      topIssues: this.identifyTopIssues(frameworks),
      timestamp: new Date().toISOString()
    };

    DASHBOARD_DATA.metrics.set('global', metrics);
    return metrics;
  }

  static calculateComplianceScore(frameworks) {
    if (frameworks.length === 0) return 0;

    const weights = {
      'compliant': 100,
      'needs-attention': 60,
      'non-compliant': 20,
      'unreachable': 0
    };

    const totalScore = frameworks.reduce((sum, framework) => {
      return sum + (weights[framework.status] || 0);
    }, 0);

    return Math.round(totalScore / frameworks.length);
  }

  static calculateRegionalCompliance(frameworks) {
    const regions = {};

    frameworks.forEach(framework => {
      const region = COMPLIANCE_FRAMEWORKS[framework.framework.toLowerCase()].region;
      if (!regions[region]) {
        regions[region] = { total: 0, compliant: 0 };
      }
      regions[region].total++;
      if (framework.status === 'compliant') {
        regions[region].compliant++;
      }
    });

    // Calculate percentages
    Object.keys(regions).forEach(region => {
      regions[region].percentage = Math.round(
        (regions[region].compliant / regions[region].total) * 100
      );
    });

    return regions;
  }

  static calculateRiskDistribution(frameworks) {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    frameworks.forEach(framework => {
      if (framework.status === 'compliant') {
        distribution.low++;
      } else if (framework.status === 'needs-attention') {
        distribution.medium++;
      } else if (framework.status === 'non-compliant') {
        distribution.high++;
      } else {
        distribution.critical++;
      }
    });

    return distribution;
  }

  static calculateTrendAnalysis() {
    // This would analyze historical data for trends
    // For now, return a placeholder
    return {
      complianceTrend: 'stable', // improving, stable, declining
      alertTrend: 'decreasing', // increasing, stable, decreasing
      period: 'last_30_days'
    };
  }

  static identifyTopIssues(frameworks) {
    const issueCount = {};

    frameworks.forEach(framework => {
      framework.issues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }
}

// ============================================================================
// COMPLIANCE REPORTING
// ============================================================================

class ComplianceReporting {
  static async generateComplianceReport(reportType = 'comprehensive') {
    const reportId = crypto.randomUUID();
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values());
    const metrics = ComplianceMetrics.calculateGlobalMetrics();
    const alerts = DASHBOARD_DATA.alerts;

    const report = {
      reportId,
      type: reportType,
      generatedAt: new Date().toISOString(),
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      executiveSummary: this.generateExecutiveSummary(metrics, frameworks),
      frameworkDetails: frameworks,
      metrics,
      activeAlerts: alerts.filter(a => !a.acknowledged),
      recommendations: this.generateRecommendations(metrics, frameworks),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    DASHBOARD_DATA.reports.set(reportId, report);

    AuditLogger.log('compliance_report_generated', {
      reportId,
      type: reportType,
      frameworksCovered: frameworks.length
    });

    return report;
  }

  static generateExecutiveSummary(metrics, frameworks) {
    const compliantCount = frameworks.filter(f => f.status === 'compliant').length;
    const totalFrameworks = frameworks.length;

    return {
      overallCompliance: `${Math.round((compliantCount / totalFrameworks) * 100)}%`,
      complianceScore: metrics.overallComplianceScore,
      criticalIssues: metrics.topIssues.length,
      activeAlerts: DASHBOARD_DATA.alerts.filter(a => !a.acknowledged).length,
      keyFindings: [
        `${compliantCount} out of ${totalFrameworks} compliance frameworks are fully compliant`,
        `Overall compliance score: ${metrics.overallComplianceScore}/100`,
        `${metrics.topIssues.length} recurring compliance issues identified`
      ]
    };
  }

  static generateRecommendations(metrics, frameworks) {
    const recommendations = [];

    if (metrics.overallComplianceScore < 70) {
      recommendations.push({
        priority: 'high',
        area: 'Overall Compliance',
        recommendation: 'Immediate action required to address critical compliance gaps',
        timeframe: 'Immediate'
      });
    }

    const nonCompliantFrameworks = frameworks.filter(f => f.status === 'non-compliant');
    if (nonCompliantFrameworks.length > 0) {
      recommendations.push({
        priority: 'high',
        area: 'Framework Compliance',
        recommendation: `Address non-compliance issues in: ${nonCompliantFrameworks.map(f => f.framework).join(', ')}`,
        timeframe: 'Within 30 days'
      });
    }

    if (metrics.topIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        area: 'Recurring Issues',
        recommendation: `Implement systemic fixes for top issues: ${metrics.topIssues.slice(0, 3).map(i => i.issue).join('; ')}`,
        timeframe: 'Within 90 days'
      });
    }

    return recommendations;
  }

  static getReport(reportId) {
    return DASHBOARD_DATA.reports.get(reportId);
  }

  static listReports() {
    return Array.from(DASHBOARD_DATA.reports.values())
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  }
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

class NotificationSystem {
  static async sendNotification(notification) {
    const notificationRecord = {
      notificationId: crypto.randomUUID(),
      type: notification.type,
      recipient: notification.recipient,
      subject: notification.subject,
      message: notification.message,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    DASHBOARD_DATA.notifications.push(notificationRecord);

    // In a real implementation, this would integrate with email/SMS services
    console.log(`📧 Notification sent: ${notification.subject}`);

    AuditLogger.log('notification_sent', {
      notificationId: notificationRecord.notificationId,
      type: notification.type,
      recipient: notification.recipient
    });

    return notificationRecord;
  }

  static async sendComplianceAlert(framework, alert) {
    const notification = {
      type: 'compliance_alert',
      recipient: 'compliance_team@azora-os.com',
      subject: `🚨 ${framework} Compliance Alert: ${alert.type}`,
      message: `
Compliance Alert for ${framework}

Type: ${alert.type}
Details: ${alert.details.join(', ')}
Timestamp: ${alert.timestamp}

Please review and take appropriate action.

Azora OS Compliance Monitoring System
      `.trim()
    };

    return await this.sendNotification(notification);
  }

  static async sendWeeklyComplianceReport() {
    const report = await ComplianceReporting.generateComplianceReport('weekly');

    const notification = {
      type: 'weekly_report',
      recipient: 'compliance_officer@azora-os.com',
      subject: `📊 Weekly Compliance Report - ${new Date().toLocaleDateString()}`,
      message: `
Weekly Compliance Report Summary

Overall Compliance Score: ${report.executiveSummary.complianceScore}/100
Compliant Frameworks: ${report.executiveSummary.overallCompliance}
Active Alerts: ${report.activeAlerts.length}
Critical Issues: ${report.executiveSummary.criticalIssues}

Key Findings:
${report.executiveSummary.keyFindings.map(finding => `• ${finding}`).join('\n')}

Please review the full report for detailed analysis.

Azora OS Compliance Monitoring System
      `.trim()
    };

    return await this.sendNotification(notification);
  }
}

// ============================================================================
// AUDIT LOGGER
// ============================================================================

class AuditLogger {
  static log(action, details) {
    const logEntry = {
      logId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      details,
      ipAddress: 'system',
      userAgent: 'system'
    };

    DASHBOARD_DATA.auditLogs.push(logEntry);
  }

  static getAuditTrail(startDate, endDate, action) {
    let filteredLogs = DASHBOARD_DATA.auditLogs;

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    return filteredLogs;
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

// Rate limiting for dashboard requests
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many dashboard requests from this IP, please try again later.'
});

app.use('/dashboard', dashboardLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Compliance Monitoring Dashboard',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main dashboard
app.get('/dashboard', async (req, res) => {
  try {
    // Update all framework statuses
    await ComplianceMonitor.updateAllFrameworkStatuses();

    // Calculate metrics
    const metrics = ComplianceMetrics.calculateGlobalMetrics();

    const dashboard = {
      overview: ComplianceMonitor.getComplianceOverview(),
      frameworks: Object.fromEntries(DASHBOARD_DATA.complianceFrameworks),
      metrics,
      activeAlerts: ComplianceMonitor.getActiveAlerts(),
      recentActivity: DASHBOARD_DATA.auditLogs.slice(-20),
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Framework-specific status
app.get('/dashboard/framework/:framework', (req, res) => {
  try {
    const { framework } = req.params;
    const status = DASHBOARD_DATA.complianceFrameworks.get(framework.toUpperCase());

    if (!status) {
      return res.status(404).json({ success: false, error: 'Framework not found' });
    }

    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alerts management
app.get('/dashboard/alerts', (req, res) => {
  try {
    const alerts = ComplianceMonitor.getActiveAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/dashboard/alerts/:alertId/acknowledge', (req, res) => {
  try {
    const { alertId } = req.params;
    const acknowledged = ComplianceMonitor.acknowledgeAlert(alertId);

    if (!acknowledged) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compliance reporting
app.post('/dashboard/reports', async (req, res) => {
  try {
    const { type } = req.body;
    const report = await ComplianceReporting.generateComplianceReport(type);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/dashboard/reports', (req, res) => {
  try {
    const reports = ComplianceReporting.listReports();
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/dashboard/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = ComplianceReporting.getReport(reportId);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Metrics endpoint for UI
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = ComplianceMetrics.calculateGlobalMetrics();
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values()).map(f => ({
      name: f.framework,
      score: f.score,
      violations: f.issues.length,
      lastAudit: f.lastUpdated
    }));

    // Generate mock historical data for the last 30 days
    const historicalData = [];
    const baseDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      historicalData.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(metrics.overallComplianceScore + (Math.random() - 0.5) * 10),
        violations: Math.floor(Math.random() * 20)
      });
    }

    const metricsResponse = {
      overallScore: metrics.overallComplianceScore,
      trend: metrics.complianceTrend === 'improving' ? 'up' : metrics.complianceTrend === 'declining' ? 'down' : 'stable',
      trendPercentage: Math.floor(Math.random() * 10) - 5, // Mock trend percentage
      frameworks,
      violations: {
        total: metrics.totalViolations,
        critical: Math.floor(metrics.totalViolations * 0.3),
        resolved: Math.floor(metrics.totalViolations * 0.6),
        pending: Math.floor(metrics.totalViolations * 0.1)
      },
      audits: {
        completed: Math.floor(Math.random() * 50) + 20,
        scheduled: Math.floor(Math.random() * 10) + 5,
        overdue: Math.floor(Math.random() * 5)
      },
      performance: {
        responseTime: Math.floor(Math.random() * 200) + 50,
        uptime: Math.floor(Math.random() * 10) + 95,
        errorRate: Math.floor(Math.random() * 2)
      },
      historicalData
    };

    res.json({ success: true, data: metricsResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audit trail
app.get('/dashboard/audit', (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;
    const auditTrail = AuditLogger.getAuditTrail(startDate, endDate, action);
    res.json({ success: true, data: auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual refresh
app.post('/dashboard/refresh', async (req, res) => {
  try {
    await ComplianceMonitor.updateAllFrameworkStatuses();
    const metrics = ComplianceMetrics.calculateGlobalMetrics();

    res.json({
      success: true,
      message: 'Compliance status refreshed',
      data: {
        overview: ComplianceMonitor.getComplianceOverview(),
        metrics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// AUTOMATED TASKS
// ============================================================================

// Auto-refresh compliance status every 5 minutes
setInterval(async () => {
  try {
    await ComplianceMonitor.updateAllFrameworkStatuses();
    console.log('🔄 Compliance status auto-refreshed');
  } catch (error) {
    console.error('Failed to auto-refresh compliance status:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

// Weekly compliance report (every Monday at 9 AM)
setInterval(async () => {
  const now = new Date();
  if (now.getDay() === 1 && now.getHours() === 9) { // Monday 9 AM
    try {
      await NotificationSystem.sendWeeklyComplianceReport();
      console.log('📧 Weekly compliance report sent');
    } catch (error) {
      console.error('Failed to send weekly compliance report:', error);
    }
  }
}, 60 * 60 * 1000); // Check every hour

// ============================================================================
// SERVER STARTUP (only when run directly)
// ============================================================================

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, async () => {
    console.log('📊 Compliance Monitoring Dashboard running on port', PORT);
    console.log('🌍 Monitoring compliance across:');
    Object.values(COMPLIANCE_FRAMEWORKS).forEach(framework => {
      console.log(`   • ${framework.name} (${framework.region}) - ${framework.fullName}`);
    });
    console.log('🔗 Dashboard: http://localhost:' + PORT + '/dashboard');
    console.log('📋 Health check: http://localhost:' + PORT + '/health');

    // Initial status update
    console.log('🔄 Performing initial compliance status check...');
    await ComplianceMonitor.updateAllFrameworkStatuses();
    console.log('✅ Initial compliance status check completed');
  });
}

// Export for testing
export {
  ComplianceMonitor,
  ComplianceMetrics,
  ComplianceReporting,
  NotificationSystem,
  AuditLogger,
  DASHBOARD_DATA,
  COMPLIANCE_FRAMEWORKS
};