/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * Automated Compliance Reporting System
 *
 * Generates periodic compliance reports, audit trails, and regulatory filings:
 * - Daily compliance snapshots
 * - Weekly comprehensive reports
 * - Monthly regulatory filings
 * - Quarterly executive summaries
 * - Annual compliance certifications
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import PDFDocument from 'pdfkit';
// import archiver from 'archiver';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.AUTOMATED_REPORTING_PORT || 4087;

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

// Connection pooling for data collection
class DataCollectionPool {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.active = 0;
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.active < this.maxConcurrent) {
        this.active++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.active--;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.active++;
      resolve();
    }
  }
}

const dataCollectionPool = new DataCollectionPool(3);

// Response caching with TTL
const responseCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key, data) {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });

  // Auto-cleanup old cache entries
  if (responseCache.size > 100) {
    const oldestKey = Array.from(responseCache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
    responseCache.delete(oldestKey);
  }
}

// Circuit breaker for external service calls
class ServiceCircuitBreaker {
  constructor(serviceName, failureThreshold = 3, recoveryTimeout = 300000) {
    this.serviceName = serviceName;
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker OPEN for ${this.serviceName}`);
      }
    }

    try {
      const result = await operation();
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

const serviceBreakers = new Map();

// ============================================================================
// REPORTING CONFIGURATION
// ============================================================================

const REPORTING_CONFIG = {
  daily: {
    frequency: '0 6 * * *', // 6 AM daily
    retention: 90, // days
    formats: ['json', 'pdf'],
    recipients: ['compliance_team@azora-os.com']
  },
  weekly: {
    frequency: '0 9 * * 1', // 9 AM Mondays
    retention: 365, // days
    formats: ['json', 'pdf', 'xlsx'],
    recipients: ['compliance_officer@azora-os.com', 'executives@azora-os.com']
  },
  monthly: {
    frequency: '0 10 1 * *', // 10 AM first day of month
    retention: 2555, // 7 years
    formats: ['json', 'pdf', 'xlsx'],
    recipients: ['regulatory_affairs@azora-os.com', 'legal@azora-os.com']
  },
  quarterly: {
    frequency: '0 14 1 */3 *', // 2 PM first day of quarter
    retention: 2555, // 7 years
    formats: ['json', 'pdf', 'xlsx'],
    recipients: ['board@azora-os.com', 'auditors@azora-os.com']
  },
  annual: {
    frequency: '0 8 1 1 *', // 8 AM January 1st
    retention: 2555, // 7 years
    formats: ['json', 'pdf', 'xlsx'],
    recipients: ['board@azora-os.com', 'regulatory_bodies@gov']
  }
};

const COMPLIANCE_FRAMEWORKS = {
  gdpr: { name: 'GDPR', port: 4080, region: 'EU' },
  hipaa: { name: 'HIPAA', port: 4081, region: 'US' },
  sox: { name: 'SOX', port: 4082, region: 'US' },
  ccpa: { name: 'CCPA', port: 4083, region: 'US-CA' },
  pipeda: { name: 'PIPEDA', port: 4084, region: 'CA' },
  lgpd: { name: 'LGPD', port: 4085, region: 'BR' }
};

// ============================================================================
// REPORTING DATA STRUCTURES
// ============================================================================

const REPORTING_DATA = {
  reports: new Map(), // Generated reports
  auditTrails: new Map(), // Framework audit trails
  regulatoryFilings: new Map(), // Filed regulatory documents
  reportQueue: [], // Pending report generation
  filingQueue: [] // Pending regulatory filings
};

// ============================================================================
// COMPLIANCE DATA COLLECTOR
// ============================================================================

class ComplianceDataCollector {
  static async collectFrameworkData(framework) {
    const cacheKey = `framework_data_${framework.name}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Get or create circuit breaker
    if (!serviceBreakers.has(framework.name)) {
      serviceBreakers.set(framework.name, new ServiceCircuitBreaker(framework.name));
    }
    const breaker = serviceBreakers.get(framework.name);

    try {
      await dataCollectionPool.acquire();

      const result = await breaker.execute(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch(`http://localhost:${framework.port}/audit`, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Azora-Automated-Reporting/1.0',
              'Accept': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          return {
            framework: framework.name,
            region: framework.region,
            auditTrail: data.data,
            collectedAt: new Date().toISOString()
          };
        } finally {
          clearTimeout(timeoutId);
        }
      });

      setCachedResponse(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`Failed to collect ${framework.name} data:`, error.message);
      const errorResult = {
        framework: framework.name,
        region: framework.region,
        auditTrail: [],
        error: error.message,
        collectedAt: new Date().toISOString()
      };

      // Cache error results briefly
      setCachedResponse(cacheKey, errorResult);
      return errorResult;
    } finally {
      dataCollectionPool.release();
    }
  }

  static async collectAllFrameworkData() {
    const promises = Object.values(COMPLIANCE_FRAMEWORKS).map(framework =>
      this.collectFrameworkData(framework)
    );

    const results = await Promise.allSettled(promises);
    const frameworkData = {};

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        frameworkData[data.framework] = data;
      } else {
        console.error('Framework data collection failed:', result.reason);
      }
    });

    return frameworkData;
  }

  static async collectDashboardMetrics() {
    const cacheKey = 'dashboard_metrics';
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Get or create circuit breaker for dashboard
    if (!serviceBreakers.has('dashboard')) {
      serviceBreakers.set('dashboard', new ServiceCircuitBreaker('dashboard'));
    }
    const breaker = serviceBreakers.get('dashboard');

    try {
      await dataCollectionPool.acquire();

      const result = await breaker.execute(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch('http://localhost:4086/dashboard', {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Azora-Automated-Reporting/1.0',
              'Accept': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          return data.data;
        } finally {
          clearTimeout(timeoutId);
        }
      });

      setCachedResponse(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Failed to collect dashboard metrics:', error.message);
      return null;
    } finally {
      dataCollectionPool.release();
    }
  }
}

// ============================================================================
// REPORT GENERATOR
// ============================================================================

class ReportGenerator {
  static async generateReport(reportType, period) {
    const reportId = crypto.randomUUID();
    const frameworkData = await ComplianceDataCollector.collectAllFrameworkData();
    const dashboardMetrics = await ComplianceDataCollector.collectDashboardMetrics();

    const report = {
      reportId,
      type: reportType,
      period,
      generatedAt: new Date().toISOString(),
      frameworkData,
      dashboardMetrics,
      summary: this.generateSummary(reportType, frameworkData, dashboardMetrics),
      recommendations: this.generateRecommendations(reportType, frameworkData, dashboardMetrics),
      complianceScore: this.calculateComplianceScore(frameworkData, dashboardMetrics),
      riskAssessment: this.assessRisks(frameworkData, dashboardMetrics)
    };

    // Generate different formats
    const formats = REPORTING_CONFIG[reportType].formats;
    report.formats = {};

    for (const format of formats) {
      try {
        report.formats[format] = await this.generateFormat(report, format);
      } catch (error) {
        console.error(`Failed to generate ${format} format:`, error);
        report.formats[format] = { error: error.message };
      }
    }

    REPORTING_DATA.reports.set(reportId, report);

    console.log(`📊 Generated ${reportType} report: ${reportId}`);
    return report;
  }

  static generateSummary(reportType, frameworkData, dashboardMetrics) {
    const frameworks = Object.values(frameworkData);
    const totalFrameworks = frameworks.length;
    const compliantFrameworks = frameworks.filter(f => !f.error && f.auditTrail.length > 0).length;

    return {
      reportType,
      period: this.getPeriodDescription(reportType),
      totalFrameworks,
      compliantFrameworks,
      compliancePercentage: Math.round((compliantFrameworks / totalFrameworks) * 100),
      overallScore: dashboardMetrics?.metrics?.overallComplianceScore || 0,
      criticalIssues: this.countCriticalIssues(frameworkData),
      regionsCovered: [...new Set(frameworks.map(f => f.region))],
      generatedAt: new Date().toISOString()
    };
  }

  static generateRecommendations(reportType, frameworkData, dashboardMetrics) {
    const recommendations = [];

    // Framework-specific recommendations
    Object.values(frameworkData).forEach(framework => {
      if (framework.error) {
        recommendations.push({
          framework: framework.framework,
          priority: 'critical',
          type: 'technical',
          recommendation: `Resolve service connectivity issues for ${framework.framework}`,
          timeframe: 'Immediate'
        });
      } else if (framework.auditTrail.length === 0) {
        recommendations.push({
          framework: framework.framework,
          priority: 'high',
          type: 'compliance',
          recommendation: `Initialize audit trail and compliance monitoring for ${framework.framework}`,
          timeframe: 'Within 7 days'
        });
      }
    });

    // Global recommendations based on dashboard metrics
    if (dashboardMetrics?.metrics) {
      const score = dashboardMetrics.metrics.overallComplianceScore;
      if (score < 70) {
        recommendations.push({
          framework: 'Global',
          priority: 'critical',
          type: 'compliance',
          recommendation: 'Implement immediate corrective actions to improve overall compliance score',
          timeframe: 'Immediate'
        });
      }

      if (dashboardMetrics.activeAlerts?.length > 5) {
        recommendations.push({
          framework: 'Global',
          priority: 'high',
          type: 'monitoring',
          recommendation: 'Review and resolve high volume of active compliance alerts',
          timeframe: 'Within 30 days'
        });
      }
    }

    return recommendations;
  }

  static calculateComplianceScore(frameworkData, dashboardMetrics) {
    if (dashboardMetrics?.metrics?.overallComplianceScore) {
      return dashboardMetrics.metrics.overallComplianceScore;
    }

    // Fallback calculation
    const frameworks = Object.values(frameworkData);
    const totalFrameworks = frameworks.length;
    const functionalFrameworks = frameworks.filter(f => !f.error).length;

    return Math.round((functionalFrameworks / totalFrameworks) * 100);
  }

  static assessRisks(frameworkData, dashboardMetrics) {
    const risks = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    // Assess framework-specific risks
    Object.values(frameworkData).forEach(framework => {
      if (framework.error) {
        risks.critical++;
      } else if (framework.auditTrail.length === 0) {
        risks.high++;
      } else {
        risks.low++;
      }
    });

    // Assess global risks from dashboard
    if (dashboardMetrics?.activeAlerts) {
      dashboardMetrics.activeAlerts.forEach(alert => {
        if (alert.severity === 'critical') risks.critical++;
        else if (alert.severity === 'high') risks.high++;
        else risks.medium++;
      });
    }

    return risks;
  }

  static countCriticalIssues(frameworkData) {
    let count = 0;
    Object.values(frameworkData).forEach(framework => {
      if (framework.error) count++;
    });
    return count;
  }

  static getPeriodDescription(reportType) {
    const now = new Date();
    switch (reportType) {
      case 'daily':
        return now.toISOString().split('T')[0];
      case 'weekly': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return `Week of ${weekStart.toISOString().split('T')[0]}`;
      }
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly': {
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      }
      case 'annual':
        return now.getFullYear().toString();
      default:
        return 'Unknown';
    }
  }

  static async generateFormat(report, format) {
    const outputDir = path.join(process.cwd(), 'reports', report.type);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `${report.type}-report-${report.reportId}.${format}`;
    const filepath = path.join(outputDir, filename);

    switch (format) {
      case 'json':
        return this.generateJSON(report, filepath);
      case 'pdf':
        return this.generatePDF(report, filepath);
      case 'xlsx':
        return this.generateXLSX(report, filepath);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  static async generateJSON(report, filepath) {
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    return { filepath, size: fs.statSync(filepath).size };
  }

  static async generatePDF(report, filepath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Title
      doc.fontSize(20).text(`${report.type.toUpperCase()} COMPLIANCE REPORT`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(14).text('EXECUTIVE SUMMARY', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Report Period: ${report.summary.period}`);
      doc.text(`Compliance Score: ${report.complianceScore}/100`);
      doc.text(`Frameworks Monitored: ${report.summary.totalFrameworks}`);
      doc.text(`Compliant Frameworks: ${report.summary.compliantFrameworks}`);
      doc.moveDown();

      // Risk Assessment
      doc.fontSize(14).text('RISK ASSESSMENT', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Critical Risks: ${report.riskAssessment.critical}`);
      doc.text(`High Risks: ${report.riskAssessment.high}`);
      doc.text(`Medium Risks: ${report.riskAssessment.medium}`);
      doc.text(`Low Risks: ${report.riskAssessment.low}`);
      doc.moveDown();

      // Recommendations
      if (report.recommendations.length > 0) {
        doc.fontSize(14).text('RECOMMENDATIONS', { underline: true });
        doc.moveDown();
        report.recommendations.forEach((rec, index) => {
          doc.fontSize(12).text(`${index + 1}. ${rec.recommendation}`);
          doc.fontSize(10).text(`   Priority: ${rec.priority} | Timeframe: ${rec.timeframe}`);
          doc.moveDown();
        });
      }

      doc.end();

      stream.on('finish', () => {
        resolve({ filepath, size: fs.statSync(filepath).size });
      });

      stream.on('error', reject);
    });
  }

  static async generateXLSX(report, filepath) {
    // For now, generate a simple CSV format
    // In a real implementation, you'd use a proper XLSX library
    const csvContent = this.generateCSVContent(report);
    fs.writeFileSync(filepath, csvContent);
    return { filepath, size: fs.statSync(filepath).size };
  }

  static generateCSVContent(report) {
    let csv = 'Framework,Region,Status,Audit Entries,Errors\n';

    Object.values(report.frameworkData).forEach(framework => {
      csv += `${framework.framework},${framework.region},`;
      csv += `${framework.error ? 'Error' : 'OK'},`;
      csv += `${framework.auditTrail.length},`;
      csv += `${framework.error || 'None'}\n`;
    });

    return csv;
  }
}

// ============================================================================
// REGULATORY FILING SYSTEM
// ============================================================================

class RegulatoryFilingSystem {
  static async prepareRegulatoryFiling(reportType, report) {
    const filingId = crypto.randomUUID();

    const filing = {
      filingId,
      reportType,
      reportId: report.reportId,
      preparedAt: new Date().toISOString(),
      status: 'prepared',
      documents: report.formats,
      regulatoryBody: this.getRegulatoryBody(reportType),
      filingDeadline: this.calculateFilingDeadline(reportType),
      compliance: this.assessFilingCompliance(report)
    };

    REPORTING_DATA.regulatoryFilings.set(filingId, filing);
    REPORTING_DATA.filingQueue.push(filing);

    console.log(`📋 Prepared regulatory filing: ${filingId} for ${reportType}`);
    return filing;
  }

  static async submitFiling(filingId) {
    const filing = REPORTING_DATA.regulatoryFilings.get(filingId);
    if (!filing) {
      throw new Error('Filing not found');
    }

    // In a real implementation, this would submit to actual regulatory bodies
    // For now, we'll simulate the submission
    filing.status = 'submitted';
    filing.submittedAt = new Date().toISOString();
    filing.confirmationNumber = crypto.randomUUID();

    console.log(`📤 Submitted regulatory filing: ${filingId}`);
    return filing;
  }

  static getRegulatoryBody(reportType) {
    const bodies = {
      monthly: ['EU Data Protection Board', 'Federal Trade Commission'],
      quarterly: ['SEC', 'PCAOB', 'EU Commission'],
      annual: ['SEC', 'CFTC', 'EU Data Protection Authorities']
    };
    return bodies[reportType] || [];
  }

  static calculateFilingDeadline(reportType) {
    const now = new Date();
    switch (reportType) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString();
      case 'quarterly': {
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 30);
        return new Date(quarterEnd.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(); // 45 days after quarter
      }
      case 'annual':
        return new Date(now.getFullYear() + 1, 3, 15).toISOString(); // April 15
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  static assessFilingCompliance(report) {
    // Assess whether the filing meets regulatory requirements
    const compliance = {
      meetsRequirements: true,
      issues: [],
      completeness: 100
    };

    // Check for required data
    if (!report.frameworkData || Object.keys(report.frameworkData).length === 0) {
      compliance.meetsRequirements = false;
      compliance.issues.push('Missing framework compliance data');
      compliance.completeness -= 30;
    }

    if (!report.dashboardMetrics) {
      compliance.issues.push('Missing dashboard metrics');
      compliance.completeness -= 20;
    }

    if (report.riskAssessment.critical > 0) {
      compliance.issues.push('Critical risks identified');
      compliance.completeness -= 15;
    }

    return compliance;
  }
}

// ============================================================================
// AUDIT TRAIL MANAGER
// ============================================================================

class AuditTrailManager {
  static async collectAndStoreAuditTrails() {
    const frameworkData = await ComplianceDataCollector.collectAllFrameworkData();

    Object.entries(frameworkData).forEach(([frameworkName, data]) => {
      if (!REPORTING_DATA.auditTrails.has(frameworkName)) {
        REPORTING_DATA.auditTrails.set(frameworkName, []);
      }

      const auditTrail = REPORTING_DATA.auditTrails.get(frameworkName);
      auditTrail.push({
        collectedAt: data.collectedAt,
        entries: data.auditTrail,
        status: data.error ? 'error' : 'success',
        error: data.error
      });

      // Keep only last 1000 entries per framework
      if (auditTrail.length > 1000) {
        auditTrail.splice(0, auditTrail.length - 1000);
      }
    });

    console.log('📝 Collected and stored audit trails for all frameworks');
  }

  static getAuditTrail(framework, startDate, endDate) {
    const trail = REPORTING_DATA.auditTrails.get(framework) || [];
    return trail.filter(entry => {
      const entryDate = new Date(entry.collectedAt);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return entryDate >= start && entryDate <= end;
    });
  }

  static generateAuditReport(framework, period) {
    const auditTrail = this.getAuditTrail(framework, period.start, period.end);

    return {
      framework,
      period,
      totalEntries: auditTrail.length,
      successfulCollections: auditTrail.filter(e => e.status === 'success').length,
      failedCollections: auditTrail.filter(e => e.status === 'error').length,
      entries: auditTrail
    };
  }
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

class NotificationSystem {
  static async sendReportNotification(report, recipients) {
    console.log(`📧 Report notification sent to ${recipients.length} recipients`);
    console.log(`   Subject: ${report.type.toUpperCase()} Compliance Report - ${report.summary.period}`);
    // In a real implementation, this would send actual emails
  }

  static async sendFilingNotification(filing, recipients) {
    console.log(`📧 Filing notification sent to ${recipients.length} recipients`);
    console.log(`   Subject: Regulatory Filing Prepared - ${filing.reportType}`);
  }
}

// ============================================================================
// EXPRESS SERVER SETUP
// ============================================================================

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests'
});

app.use('/api', apiLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Automated Compliance Reporting',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Manual report generation
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { type, period } = req.body;
    if (!REPORTING_CONFIG[type]) {
      return res.status(400).json({ success: false, error: 'Invalid report type' });
    }

    const report = await ReportGenerator.generateReport(type, period);
    await NotificationSystem.sendReportNotification(report, REPORTING_CONFIG[type].recipients);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reports
app.get('/api/reports', (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    let reports = Array.from(REPORTING_DATA.reports.values());

    if (type) {
      reports = reports.filter(r => r.type === type);
    }

    reports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    reports = reports.slice(0, parseInt(limit));

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = REPORTING_DATA.reports.get(reportId);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download report
app.get('/api/reports/:reportId/download/:format', (req, res) => {
  try {
    const { reportId, format } = req.params;
    const report = REPORTING_DATA.reports.get(reportId);

    if (!report || !report.formats[format]) {
      return res.status(404).json({ success: false, error: 'Report or format not found' });
    }

    const formatData = report.formats[format];
    if (!fs.existsSync(formatData.filepath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.download(formatData.filepath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regulatory filings
app.get('/api/filings', (req, res) => {
  try {
    const filings = Array.from(REPORTING_DATA.regulatoryFilings.values());
    filings.sort((a, b) => new Date(b.preparedAt) - new Date(a.preparedAt));

    res.json({ success: true, data: filings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/filings/:filingId/submit', async (req, res) => {
  try {
    const { filingId } = req.params;
    const filing = await RegulatoryFilingSystem.submitFiling(filingId);

    res.json({ success: true, data: filing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audit trails
app.get('/api/audit/:framework', (req, res) => {
  try {
    const { framework } = req.params;
    const { startDate, endDate } = req.query;

    const auditTrail = AuditTrailManager.getAuditTrail(framework, startDate, endDate);

    res.json({ success: true, data: auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

// Daily reports
cron.schedule(REPORTING_CONFIG.daily.frequency, async () => {
  try {
    console.log('📊 Generating daily compliance report...');
    const report = await ReportGenerator.generateReport('daily');
    await NotificationSystem.sendReportNotification(report, REPORTING_CONFIG.daily.recipients);
  } catch (error) {
    console.error('Failed to generate daily report:', error);
  }
});

// Weekly reports
cron.schedule(REPORTING_CONFIG.weekly.frequency, async () => {
  try {
    console.log('📊 Generating weekly compliance report...');
    const report = await ReportGenerator.generateReport('weekly');
    await NotificationSystem.sendReportNotification(report, REPORTING_CONFIG.weekly.recipients);
  } catch (error) {
    console.error('Failed to generate weekly report:', error);
  }
});

// Monthly reports and filings
cron.schedule(REPORTING_CONFIG.monthly.frequency, async () => {
  try {
    console.log('📊 Generating monthly compliance report...');
    const report = await ReportGenerator.generateReport('monthly');
    await NotificationSystem.sendReportNotification(report, REPORTING_CONFIG.monthly.recipients);

    console.log('📋 Preparing monthly regulatory filing...');
    const filing = await RegulatoryFilingSystem.prepareRegulatoryFiling('monthly', report);
    await NotificationSystem.sendFilingNotification(filing, REPORTING_CONFIG.monthly.recipients);
  } catch (error) {
    console.error('Failed to generate monthly report/filing:', error);
  }
});

// Quarterly reports and filings
cron.schedule(REPORTING_CONFIG.quarterly.frequency, async () => {
  try {
    console.log('📊 Generating quarterly compliance report...');
    const report = await ReportGenerator.generateReport('quarterly');
    await NotificationSystem.sendReportNotification(report, REPORTING_CONFIG.quarterly.recipients);

    console.log('📋 Preparing quarterly regulatory filing...');
    const filing = await RegulatoryFilingSystem.prepareRegulatoryFiling('quarterly', report);
    await NotificationSystem.sendFilingNotification(filing, REPORTING_CONFIG.quarterly.recipients);
  } catch (error) {
    console.error('Failed to generate quarterly report/filing:', error);
  }
});

// Annual reports and filings
cron.schedule(REPORTING_CONFIG.annual.frequency, async () => {
  try {
    console.log('📊 Generating annual compliance report...');
    const report = await ReportGenerator.generateReport('annual');
    await NotificationSystem.sendReportNotification(report, REPORTING_CONFIG.annual.recipients);

    console.log('📋 Preparing annual regulatory filing...');
    const filing = await RegulatoryFilingSystem.prepareRegulatoryFiling('annual', report);
    await NotificationSystem.sendFilingNotification(filing, REPORTING_CONFIG.annual.recipients);
  } catch (error) {
    console.error('Failed to generate annual report/filing:', error);
  }
});

// Daily audit trail collection
cron.schedule('0 2 * * *', async () => { // 2 AM daily
  try {
    console.log('📝 Collecting daily audit trails...');
    await AuditTrailManager.collectAndStoreAuditTrails();
  } catch (error) {
    console.error('Failed to collect audit trails:', error);
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, async () => {
    console.log('📊 Automated Compliance Reporting System running on port', PORT);
    console.log('📋 Scheduled reporting:');
    console.log('   • Daily reports at 6:00 AM');
    console.log('   • Weekly reports every Monday at 9:00 AM');
    console.log('   • Monthly reports on the 1st at 10:00 AM');
    console.log('   • Quarterly reports on the 1st of Q1/Q2/Q3/Q4 at 2:00 PM');
    console.log('   • Annual reports on January 1st at 8:00 AM');
    console.log('📝 Daily audit trail collection at 2:00 AM');
    console.log('🌍 API: http://localhost:' + PORT + '/api');
    console.log('📋 Health check: http://localhost:' + PORT + '/health');

    // Create reports directory
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }

    // Initial audit trail collection
    console.log('📝 Performing initial audit trail collection...');
    await AuditTrailManager.collectAndStoreAuditTrails();
    console.log('✅ Initial audit trail collection completed');
  });
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export {
  ReportGenerator,
  RegulatoryFilingSystem,
  AuditTrailManager,
  NotificationSystem,
  REPORTING_DATA,
  REPORTING_CONFIG
};