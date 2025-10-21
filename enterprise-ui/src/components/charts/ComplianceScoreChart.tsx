import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ComplianceMetrics } from '../../types'

interface ComplianceScoreChartProps {
  metrics?: ComplianceMetrics
}

const COLORS = {
  compliant: '#10B981',     // green
  needsAttention: '#F59E0B', // yellow
  nonCompliant: '#EF4444',   // red
  unreachable: '#6B7280'     // gray
}

export function ComplianceScoreChart({ metrics }: ComplianceScoreChartProps) {
  if (!metrics?.riskDistribution) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    )
  }

  const data = [
    {
      name: 'Low Risk',
      value: metrics.riskDistribution.low,
      color: COLORS.compliant
    },
    {
      name: 'Medium Risk',
      value: metrics.riskDistribution.medium,
      color: COLORS.needsAttention
    },
    {
      name: 'High Risk',
      value: metrics.riskDistribution.high,
      color: COLORS.nonCompliant
    },
    {
      name: 'Critical Risk',
      value: metrics.riskDistribution.critical,
      color: COLORS.unreachable
    }
  ].filter(item => item.value > 0)

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} frameworks`, 'Count']}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total Frameworks: <span className="font-medium">{total}</span>
        </p>
      </div>
    </div>
  )
}