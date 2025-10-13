/**
 * Azora OS - South African Compliance Service
 *
 * Comprehensive compliance monitoring for South African regulations including:
 * - POPIA (Protection of Personal Information Act)
 * - ECT Act (Electronic Communications and Transactions Act)
 * - Consumer Protection Act
 * - National Credit Act
 * - Financial Intelligence Centre Act
 * - Labour Relations Act
 * - Basic Conditions of Employment Act
 */

// @ts-check
/**
 * @fileoverview South African compliance monitoring service
 */
import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.SA_COMPLIANCE_PORT || 4090;

// South African compliance frameworks
const SA_COMPLIANCE_FRAMEWORKS = {
  POPIA: {
    name: 'Protection of Personal Information Act',
    regulations: [
      'Data subject rights',
      'Lawful processing',
      'Purpose limitation',
      'Data minimization',
      'Accuracy',
      'Storage limitation',
      'Integrity and confidentiality',
      'Accountability'
    ],
    penalties: 'Up to 10 years imprisonment or R10 million fine'
  },
  ECT: {
    name: 'Electronic Communications and Transactions Act',
    regulations: [
      'Electronic signatures',
      'Electronic evidence',
      'Domain name disputes',
      'Consumer protection online',
      'Data messages',
      'Cryptography controls'
    ],
    penalties: 'Up to 2 years imprisonment or R1 million fine'
  },
  CPA: {
    name: 'Consumer Protection Act',
    regulations: [
      'Unfair marketing',
      'Unconscionable conduct',
      'False representations',
      'Consumer rights',
      'Product liability',
      'Lay-by agreements'
    ],
    penalties: 'Up to 12 months imprisonment or R1 million fine'
  },
  NCA: {
    name: 'National Credit Act',
    regulations: [
      'Credit agreements',
      'Debt collection',
      'Credit bureau regulations',
      'Over-indebtedness',
      'Prescription of debt',
      'Credit life insurance'
    ],
    penalties: 'Up to 12 months imprisonment or R1 million fine'
  },
  FICA: {
    name: 'Financial Intelligence Centre Act',
    regulations: [
      'Anti-money laundering',
      'Counter-terrorist financing',
      'Customer due diligence',
      'Record keeping',
      'Reporting suspicious transactions',
      'Risk assessment'
    ],
    penalties: 'Up to 15 years imprisonment or R100 million fine'
  },
  LRA: {
    name: 'Labour Relations Act',
    regulations: [
      'Unfair dismissal',
      'Unfair labour practices',
      'Strike procedures',
      'Lock-out procedures',
      'Collective bargaining',
      'Workplace forums'
    ],
    penalties: 'Up to 12 months imprisonment or R500,000 fine'
  },
  BCEA: {
    name: 'Basic Conditions of Employment Act',
    regulations: [
      'Working hours',
      'Overtime pay',
      'Annual leave',
      'Sick leave',
      'Maternity leave',
      'Termination notice',
      'Minimum wage'
    ],
    penalties: 'Up to 6 months imprisonment or R100,000 fine'
  }
};

// Compliance monitoring data
let complianceData = {
  POPIA: { status: 'monitoring', violations: 0, lastAudit: new Date() },
  ECT: { status: 'monitoring', violations: 0, lastAudit: new Date() },
  CPA: { status: 'monitoring', violations: 0, lastAudit: new Date() },
  NCA: { status: 'monitoring', violations: 0, lastAudit: new Date() },
  FICA: { status: 'monitoring', violations: 0, lastAudit: new Date() },
  LRA: { status: 'monitoring', violations: 0, lastAudit: new Date() },
  BCEA: { status: 'monitoring', violations: 0, lastAudit: new Date() }
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'South African Compliance Service',
    timestamp: new Date().toISOString(),
    frameworks: Object.keys(SA_COMPLIANCE_FRAMEWORKS).length
  });
});

app.get('/compliance', (req, res) => {
  res.json({
    frameworks: SA_COMPLIANCE_FRAMEWORKS,
    monitoring: complianceData,
    summary: {
      totalFrameworks: Object.keys(SA_COMPLIANCE_FRAMEWORKS).length,
      activeMonitoring: Object.values(complianceData).filter(f => f.status === 'monitoring').length,
      totalViolations: Object.values(complianceData).reduce((sum, f) => sum + f.violations, 0)
    }
  });
});

app.get('/compliance/:framework', (req, res) => {
  const { framework } = req.params;

  if (!SA_COMPLIANCE_FRAMEWORKS[framework.toUpperCase()]) {
    return res.status(404).json({ error: 'Framework not found' });
  }

  res.json({
    framework: framework.toUpperCase(),
    details: SA_COMPLIANCE_FRAMEWORKS[framework.toUpperCase()],
    monitoring: complianceData[framework.toUpperCase()]
  });
});

app.post('/compliance/:framework/audit', (req, res) => {
  const { framework } = req.params;
  const frameworkKey = framework.toUpperCase();

  if (!SA_COMPLIANCE_FRAMEWORKS[frameworkKey]) {
    return res.status(404).json({ error: 'Framework not found' });
  }

  // Simulate audit process
  const auditResult = {
    framework: frameworkKey,
    timestamp: new Date().toISOString(),
    status: Math.random() > 0.1 ? 'compliant' : 'violations_found',
    violations: Math.random() > 0.1 ? 0 : Math.floor(Math.random() * 3) + 1,
    recommendations: [
      'Review data processing procedures',
      'Update privacy policies',
      'Conduct employee training',
      'Implement additional security measures'
    ]
  };

  // Update compliance data
  complianceData[frameworkKey].lastAudit = new Date();
  if (auditResult.violations > 0) {
    complianceData[frameworkKey].violations += auditResult.violations;
    complianceData[frameworkKey].status = 'needs_attention';
  } else {
    complianceData[frameworkKey].status = 'compliant';
  }

  res.json(auditResult);
});

app.get('/compliance/:framework/report', (req, res) => {
  const { framework } = req.params;
  const frameworkKey = framework.toUpperCase();

  if (!SA_COMPLIANCE_FRAMEWORKS[frameworkKey]) {
    return res.status(404).json({ error: 'Framework not found' });
  }

  const report = {
    framework: frameworkKey,
    generated: new Date().toISOString(),
    compliance: SA_COMPLIANCE_FRAMEWORKS[frameworkKey],
    monitoring: complianceData[frameworkKey],
    riskAssessment: {
      overall: complianceData[frameworkKey].violations === 0 ? 'low' : 'medium',
      recommendations: [
        'Regular compliance audits',
        'Employee training programs',
        'Technical security updates',
        'Policy documentation updates'
      ]
    }
  };

  res.json(report);
});

// Start server
app.listen(PORT, () => {
  console.log(`🇿🇦 South African Compliance Service running on port ${PORT}`);
  console.log(`Monitoring ${Object.keys(SA_COMPLIANCE_FRAMEWORKS).length} South African regulatory frameworks`);
});

export default app;