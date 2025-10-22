/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface LearningOverview {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalEarnings: number
  currentStreak: number
  lastUpdated: string
  courses: Course[]
  progress: LearningProgress
  earnings: EarningsData
  achievements: Achievement[]
}

export interface Course {
  id: string
  title: string
  progress: number
  status: 'not-started' | 'in-progress' | 'completed'
  earnings: number
}

export interface LearningProgress {
  overallProgress: number
  weeklyProgress: number
  monthlyProgress: number
}

export interface EarningsData {
  total: number
  thisWeek: number
  thisMonth: number
  history: EarningsEntry[]
}

export interface EarningsEntry {
  date: string
  amount: number
  source: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  earned: boolean
  date?: string
}

export interface ComplianceOverview {
  totalFrameworks: number
  compliantFrameworks: number
  needsAttentionFrameworks: number
  nonCompliantFrameworks: number
  unreachableFrameworks: number
  activeAlertsCount: number
  lastUpdated: string
  frameworks: Record<string, FrameworkStatus>
  metrics: ComplianceMetrics
  activeAlerts: Alert[]
  recentActivity: AuditLogEntry[]
}

export interface FrameworkStatus {
  framework: string
  status: 'compliant' | 'needs-attention' | 'non-compliant' | 'unreachable'
  issues: string[]
  lastUpdated: string
  data?: Record<string, unknown>
}

export interface ComplianceMetrics {
  overallComplianceScore: number
  regionalCompliance: Record<string, RegionalMetrics>
  riskDistribution: RiskDistribution
  trendAnalysis: TrendAnalysis
  topIssues: IssueCount[]
  timestamp: string
}

export interface RegionalMetrics {
  total: number
  compliant: number
  percentage: number
}

export interface RiskDistribution {
  low: number
  medium: number
  high: number
  critical: number
}

export interface TrendAnalysis {
  complianceTrend: 'improving' | 'stable' | 'declining'
  alertTrend: 'increasing' | 'stable' | 'decreasing'
  period: string
}

export interface IssueCount {
  issue: string
  count: number
}

export interface Alert {
  alertId: string
  framework: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  message: string
  details: string[]
  timestamp: string
  acknowledged: boolean
}

export interface AuditLogEntry {
  logId: string
  timestamp: string
  action: string
  details: Record<string, unknown>
}

export interface ComplianceReport {
  reportId: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  generatedAt: string
  summary: ReportSummary
  recommendations: Recommendation[]
  complianceScore: number
  riskAssessment: RiskDistribution
  formats: Record<string, FormatInfo>
}

export interface ReportSummary {
  reportType: string
  period: string
  totalFrameworks: number
  compliantFrameworks: number
  compliancePercentage: number
  overallScore: number
  criticalIssues: number
  regionsCovered: string[]
  generatedAt: string
}

export interface Recommendation {
  framework: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  type: string
  recommendation: string
  timeframe: string
}

export interface FormatInfo {
  filepath: string
  size: number
}