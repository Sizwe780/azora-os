/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { RegionalMetrics } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface RegionalComplianceChartProps {
  regional?: Record<string, RegionalMetrics>
}

const chartConfig = {
  compliant: {
    label: 'Compliant',
    color: 'hsl(var(--chart-1))',
  },
}

export function RegionalComplianceChart({ regional }: RegionalComplianceChartProps) {
  if (!regional) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No regional data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = Object.entries(regional).map(([region, metrics]) => ({
    region: region.toUpperCase(),
    compliant: metrics.compliant,
    total: metrics.total,
    percentage: Math.round((metrics.compliant / metrics.total) * 100)
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Compliance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="region"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="compliant" fill="var(--color-compliant)" radius={8} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {data.map((item) => (
            <div key={item.region} className="text-center">
              <div className="font-medium">{item.region}</div>
              <div className="text-muted-foreground">
                {item.compliant}/{item.total} ({item.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}