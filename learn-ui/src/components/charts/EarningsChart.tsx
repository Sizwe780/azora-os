import { EarningsData } from '../../types'

interface EarningsChartProps {
  earnings: EarningsData
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">{earnings.total} AZR</p>
          <p className="text-sm text-gray-500">Total Earned</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xl font-semibold text-green-600">{earnings.thisWeek}</p>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-blue-600">{earnings.thisMonth}</p>
            <p className="text-xs text-gray-500">This Month</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Earnings</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {earnings.history.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{entry.source}</span>
                <span className="font-medium">+{entry.amount} AZR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}