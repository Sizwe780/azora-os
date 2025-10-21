import { EarningsData } from '../../types'

interface EarningsPanelProps {
  earnings: EarningsData
}

export function EarningsPanel({ earnings }: EarningsPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Earnings Dashboard</h2>

      {/* Total Earnings */}
      <div className="card">
        <div className="text-center">
          <div className="text-5xl font-bold text-purple-600 mb-2">{earnings.total}</div>
          <p className="text-xl text-gray-600">Total AZR Earned</p>
        </div>
      </div>

      {/* Period Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{earnings.thisWeek}</div>
          <p className="text-gray-600">Earned This Week</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{earnings.thisMonth}</div>
          <p className="text-gray-600">Earned This Month</p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
        {earnings.history.length > 0 ? (
          <div className="space-y-3">
            {earnings.history.map((entry, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium">{entry.source}</p>
                  <p className="text-sm text-gray-500">{entry.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+{entry.amount} AZR</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No earnings history yet.</p>
            <p className="text-sm text-gray-400 mt-1">Complete lessons and quizzes to start earning AZR!</p>
          </div>
        )}
      </div>

      {/* Earnings Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">💡 Earning Tips</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Complete lessons to earn AZR tokens</li>
          <li>• Pass quizzes with high scores for bonus rewards</li>
          <li>• Maintain learning streaks for multiplier bonuses</li>
          <li>• Participate in advanced courses for higher payouts</li>
        </ul>
      </div>
    </div>
  )
}