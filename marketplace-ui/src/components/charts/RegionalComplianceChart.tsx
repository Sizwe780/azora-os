import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RegionalMetrics } from '../../types'

interface RegionalComplianceChartProps {
  regional?: Record<string, RegionalMetrics>
}

export function RegionalComplianceChart({ regional }: RegionalComplianceChartProps) {
  if (!regional) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Compliance</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No regional data available
        </div>
      </div>
    )
  }

  const data = Object.entries(regional).map(([region, metrics]) => ({
    region: region.toUpperCase(),
    compliant: metrics.compliant,
    total: metrics.total,
    percentage: metrics.percentage
  }))

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Compliance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'compliant') {
                  const item = data.find(d => d.compliant === value)
                  return [`${value}/${item?.total} (${item?.percentage}%)`, 'Compliant']
                }
                return [value, name]
              }}
            />
            <Bar dataKey="compliant" fill="#10B981" name="compliant" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {data.map((item) => (
          <div key={item.region} className="text-center">
            <div className="font-medium text-gray-900">{item.region}</div>
            <div className="text-gray-600">
              {item.compliant}/{item.total} ({item.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}