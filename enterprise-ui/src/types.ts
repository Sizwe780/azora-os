/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface ComplianceOverview {
  compliantFrameworks: number;
  totalFrameworks: number;
  needsAttentionFrameworks: number;
  activeAlerts: Alert[];
  frameworks: Framework[];
  metrics: ComplianceMetrics;
  recentActivity: AuditLogEntry[];
}

export interface Framework {
  id: string;
  name: string;
  status: 'compliant' | 'needs-attention' | 'non-compliant';
  region: string;
  category: string;
  complianceScore: number;
  issues: string[];
  lastUpdated: string;
}

export interface ComplianceMetrics {
  overallComplianceScore: number;
  regionalCompliance: Record<string, RegionalMetrics>;
  riskDistribution: RiskDistribution;
  topIssues: IssueCount[];
}

export interface RegionalMetrics {
  total: number;
  compliant: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface IssueCount {
  issue: string;
  count: number;
}

export interface Alert {
  alertId: string;
  framework: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  acknowledged: boolean;
  timestamp: string;
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
}

export interface ActivityItem {
  id: string;
  type: 'alert' | 'compliance-check' | 'policy-update' | 'system';
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual';
  generatedAt: string;
  downloadUrl: string;
  status: 'ready' | 'generating';
}