/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ComplianceMetrics } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface ComplianceScoreChartProps {
  metrics?: ComplianceMetrics
}

const COLORS = {
  low: 'hsl(var(--chart-1))',
  medium: 'hsl(var(--chart-2))',
  high: 'hsl(var(--chart-3))',
  critical: 'hsl(var(--chart-4))'
}

const chartConfig = {
  low: {
    label: 'Low Risk',
    color: COLORS.low,
  },
  medium: {
    label: 'Medium Risk',
    color: COLORS.medium,
  },
  high: {
    label: 'High Risk',
    color: COLORS.high,
  },
  critical: {
    label: 'Critical Risk',
    color: COLORS.critical,
  },
}

export function ComplianceScoreChart({ metrics }: ComplianceScoreChartProps) {
  if (!metrics?.riskDistribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = [
    {
      risk: 'low',
      value: metrics.riskDistribution.low,
      fill: COLORS.low
    },
    {
      risk: 'medium',
      value: metrics.riskDistribution.medium,
      fill: COLORS.medium
    },
    {
      risk: 'high',
      value: metrics.riskDistribution.high,
      fill: COLORS.high
    },
    {
      risk: 'critical',
      value: metrics.riskDistribution.critical,
      fill: COLORS.critical
    }
  ].filter(item => item.value > 0)

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <PieChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="risk"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total Frameworks: <span className="font-medium">{total}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}