import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '../../types'

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    className: 'bg-red-50 border-red-200 text-red-800',
    badge: 'bg-red-500'
  },
  high: {
    icon: AlertTriangle,
    className: 'bg-orange-50 border-orange-200 text-orange-800',
    badge: 'bg-orange-500'
  },
  medium: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badge: 'bg-yellow-500'
  },
  low: {
    icon: AlertTriangle,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    badge: 'bg-blue-500'
  }
}

export function AlertsPanel() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')

  const { data: alerts, isLoading, error, refetch } = useQuery({
    queryKey: ['compliance-alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const response = await fetch('http://localhost:4086/dashboard/alerts')
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      return response.json().then(data => data.data)
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const filteredAlerts = alerts?.filter(alert =>
    filter === 'all' || alert.severity === filter
  ) || []

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:4086/dashboard/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      })

      if (response.ok) {
        refetch() // Refetch alerts after acknowledging
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load alerts</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
        <div className="flex flex-wrap gap-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                filter === severity
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {severity} ({severity === 'all' ? (alerts?.length || 0) : (alerts?.filter(a => a.severity === severity).length || 0)})
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="card">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'No active alerts at this time.'
                  : `No ${filter} severity alerts.`
                }
              </p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon

            return (
              <div key={alert.alertId} className={`card border-2 ${config.className}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${config.badge} mr-4`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium mr-2">{alert.framework}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${config.badge} capitalize`}>
                          {alert.severity}
                        </span>
                      </div>

                      <p className="text-sm mb-3">{alert.message}</p>

                      {alert.details.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Details:</p>
                          <ul className="text-sm space-y-1">
                            {alert.details.map((detail, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-xs mr-2">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => acknowledgeAlert(alert.alertId)}
                    className="btn-secondary text-xs"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}