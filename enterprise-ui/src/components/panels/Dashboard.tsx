/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ComplianceOverview } from '../../types'
import { ComplianceScoreChart } from '../charts/ComplianceScoreChart'
import { FrameworkStatusGrid } from '../shared/FrameworkStatusGrid'
import { RegionalComplianceChart } from '../charts/RegionalComplianceChart'
import { RecentActivity } from '../shared/RecentActivity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'

interface DashboardProps {
  data: ComplianceOverview
}

export function Dashboard({ data }: DashboardProps) {
  const compliancePercentage = Math.round((data.compliantFrameworks / data.totalFrameworks) * 100)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics?.overallComplianceScore || 0}/100</div>
            <p className="text-xs text-muted-foreground">
              {compliancePercentage}% compliant frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.compliantFrameworks}</div>
            <p className="text-xs text-muted-foreground">
              of {data.totalFrameworks} frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.needsAttentionFrameworks}</div>
            <p className="text-xs text-muted-foreground">
              frameworks require review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeAlerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              require immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceScoreChart metrics={data.metrics} />
        <RegionalComplianceChart regional={data.metrics?.regionalCompliance} />
      </div>

      {/* Framework Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FrameworkStatusGrid frameworks={data.frameworks} />
        </div>
        <div>
          <RecentActivity activities={data.recentActivity.map(activity => ({
            id: activity.logId,
            type: 'system' as const,
            title: activity.action,
            description: JSON.stringify(activity.details),
            status: 'success' as const,
            timestamp: activity.timestamp
          }))} />
        </div>
      </div>
    </div>
  )
}