/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Compliance Dashboard Service
 *
 * Enterprise-grade compliance monitoring and reporting API
 * Provides real-time compliance status, metrics, and alerts
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store (in production, this would be a database)
const DASHBOARD_DATA = {
  complianceFrameworks: new Map(),
  alerts: [],
  notifications: [],
  auditLogs: []
};

// Compliance frameworks configuration
const COMPLIANCE_FRAMEWORKS = [
  { id: 'GDPR', name: 'General Data Protection Regulation', region: 'EU', category: 'Privacy' },
  { id: 'HIPAA', name: 'Health Insurance Portability and Accountability Act', region: 'US', category: 'Healthcare' },
  { id: 'SOX', name: 'Sarbanes-Oxley Act', region: 'US', category: 'Financial' },
  { id: 'CCPA', name: 'California Consumer Privacy Act', region: 'US', category: 'Privacy' },
  { id: 'PIPEDA', name: 'Personal Information Protection and Electronic Documents Act', region: 'Canada', category: 'Privacy' },
  { id: 'LGPD', name: 'Lei Geral de Proteção de Dados', region: 'Brazil', category: 'Privacy' }
];

// Initialize compliance frameworks with mock data
function initializeComplianceData() {
  COMPLIANCE_FRAMEWORKS.forEach(framework => {
    DASHBOARD_DATA.complianceFrameworks.set(framework.id, {
      framework: framework.id,
      name: framework.name,
      status: Math.random() > 0.7 ? 'non-compliant' : Math.random() > 0.5 ? 'needs-attention' : 'compliant',
      issues: [],
      lastUpdated: new Date().toISOString(),
      region: framework.region,
      category: framework.category,
      complianceScore: Math.floor(Math.random() * 40) + 60, // 60-100
      data: {
        complianceStatus: {
          overall: 'compliant',
          issues: [],
          lastAudit: new Date().toISOString()
        }
      }
    });
  });

  // Add some alerts
  DASHBOARD_DATA.alerts = [
    {
      alertId: 'alert-001',
      framework: 'GDPR',
      severity: 'high',
      message: 'Data retention policy requires review',
      acknowledged: false,
      timestamp: new Date().toISOString()
    },
    {
      alertId: 'alert-002',
      framework: 'HIPAA',
      severity: 'critical',
      message: 'PHI access controls need immediate attention',
      acknowledged: false,
      timestamp: new Date().toISOString()
    }
  ];
}

// Compliance Monitor Class
class ComplianceMonitor {
  static getComplianceOverview() {
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values());
    const totalFrameworks = frameworks.length;
    const compliantFrameworks = frameworks.filter(f => f.status === 'compliant').length;
    const needsAttentionFrameworks = frameworks.filter(f => f.status === 'needs-attention').length;
    const nonCompliantFrameworks = frameworks.filter(f => f.status === 'non-compliant').length;

    return {
      totalFrameworks,
      compliantFrameworks,
      needsAttentionFrameworks,
      nonCompliantFrameworks,
      lastUpdated: new Date().toISOString()
    };
  }

  static getActiveAlerts() {
    return DASHBOARD_DATA.alerts.filter(alert => !alert.acknowledged);
  }

  static acknowledgeAlert(alertId) {
    const alert = DASHBOARD_DATA.alerts.find(a => a.alertId === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

// Compliance Metrics Class
class ComplianceMetrics {
  static calculateComplianceScore(frameworks) {
    const scores = {
      'compliant': 100,
      'needs-attention': 60,
      'non-compliant': 20,
      'unreachable': 0
    };

    const totalScore = frameworks.reduce((sum, f) => sum + (scores[f.status] || 0), 0);
    return Math.round(totalScore / frameworks.length);
  }

  static calculateRegionalCompliance(frameworks) {
    const regions = {};

    frameworks.forEach(f => {
      if (!regions[f.region]) {
        regions[f.region] = { total: 0, compliant: 0 };
      }
      regions[f.region].total++;
      if (f.status === 'compliant') {
        regions[f.region].compliant++;
      }
    });

    return regions;
  }

  static calculateRiskDistribution(frameworks) {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };

    frameworks.forEach(f => {
      switch (f.status) {
        case 'compliant':
          distribution.low++;
          break;
        case 'needs-attention':
          distribution.medium++;
          break;
        case 'non-compliant':
          distribution.high++;
          break;
        default:
          distribution.critical++;
      }
    });

    return distribution;
  }

  static calculateGlobalMetrics() {
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values());

    return {
      overallComplianceScore: this.calculateComplianceScore(frameworks),
      regionalCompliance: this.calculateRegionalCompliance(frameworks),
      riskDistribution: this.calculateRiskDistribution(frameworks),
      topIssues: this.identifyTopIssues(frameworks),
      timestamp: new Date().toISOString()
    };
  }

  static identifyTopIssues(frameworks) {
    const issueCount = {};

    frameworks.forEach(f => {
      f.issues?.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// API Routes
app.get('/api/compliance/dashboard', (req, res) => {
  try {
    const overview = ComplianceMonitor.getComplianceOverview();
    const frameworks = Array.from(DASHBOARD_DATA.complianceFrameworks.values());
    const metrics = ComplianceMetrics.calculateGlobalMetrics();
    const activeAlerts = ComplianceMonitor.getActiveAlerts();
    const recentActivity = DASHBOARD_DATA.auditLogs.slice(-10);

    const dashboardData = {
      compliantFrameworks: overview.compliantFrameworks,
      totalFrameworks: overview.totalFrameworks,
      needsAttentionFrameworks: overview.needsAttentionFrameworks,
      activeAlerts,
      frameworks: frameworks.map(f => ({
        id: f.framework,
        name: f.name,
        status: f.status,
        region: f.region,
        category: f.category,
        complianceScore: f.complianceScore,
        issues: f.issues,
        lastUpdated: f.lastUpdated
      })),
      metrics: {
        overallComplianceScore: metrics.overallComplianceScore,
        regionalCompliance: metrics.regionalCompliance,
        riskDistribution: metrics.riskDistribution,
        topIssues: metrics.topIssues
      },
      recentActivity
    };

    res.json({ data: dashboardData });
  } catch (error) {
    console.error('Error fetching compliance dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch compliance dashboard data' });
  }
});

app.post('/api/compliance/alerts/:alertId/acknowledge', (req, res) => {
  try {
    const { alertId } = req.params;
    const acknowledged = ComplianceMonitor.acknowledgeAlert(alertId);

    if (acknowledged) {
      res.json({ success: true, message: 'Alert acknowledged successfully' });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'compliance-dashboard',
    timestamp: new Date().toISOString()
  });
});

// Initialize data and start server
initializeComplianceData();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`📊 Compliance Dashboard Service running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/compliance/dashboard`);
});