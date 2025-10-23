/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ComplianceMetrics {
  overallScore: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  frameworks: {
    name: string
    score: number
    violations: number
    lastAudit: string
  }[]
  violations: {
    total: number
    critical: number
    resolved: number
    pending: number
  }
  audits: {
    completed: number
    scheduled: number
    overdue: number
  }
  performance: {
    responseTime: number
    uptime: number
    errorRate: number
  }
  historicalData: {
    date: string
    score: number
    violations: number
  }[]
}

export function MetricsPanel() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['compliance-metrics'],
    queryFn: async (): Promise<ComplianceMetrics> => {
      const response = await fetch('http://localhost:4086/api/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      return response.json().then(data => data.data)
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Failed to load metrics</p>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.overallScore}/100</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(metrics?.trend || 'stable')}
              <span className={`text-sm ml-1 ${getTrendColor(metrics?.trend || 'stable')}`}>
                {metrics?.trendPercentage > 0 ? '+' : ''}{metrics?.trendPercentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Violations</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.violations.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {metrics?.violations.critical} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.violations.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((metrics?.violations.resolved || 0) / (metrics?.violations.total || 1) * 100)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.performance.uptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {metrics?.performance.errorRate}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Framework Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.frameworks.map((framework) => (
              <div key={framework.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{framework.name}</h4>
                  <p className="text-sm text-gray-600">Last audit: {new Date(framework.lastAudit).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{framework.score}/100</div>
                  <div className="text-sm text-gray-600">{framework.violations} violations</div>
                </div>
                <div className="ml-4 w-24">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${framework.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Violations Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Violations Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Critical', value: metrics?.violations.critical || 0 },
                { name: 'Pending', value: metrics?.violations.pending || 0 },
                { name: 'Resolved', value: metrics?.violations.resolved || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Audit Status */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{metrics?.audits.completed}</div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{metrics?.audits.scheduled}</div>
              <div className="text-sm text-yellow-800">Scheduled</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{metrics?.audits.overdue}</div>
              <div className="text-sm text-red-800">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}