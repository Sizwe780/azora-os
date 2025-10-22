/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert } from '../../types'

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    className: 'bg-red-50 border-red-200 text-red-800',
    badge: 'destructive' as const
  },
  high: {
    icon: AlertTriangle,
    className: 'bg-orange-50 border-orange-200 text-orange-800',
    badge: 'secondary' as const
  },
  medium: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badge: 'secondary' as const
  },
  low: {
    icon: AlertTriangle,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    badge: 'outline' as const
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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Failed to load alerts</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
              <Button
                key={severity}
                onClick={() => setFilter(severity)}
                variant={filter === severity ? "default" : "outline"}
                size="sm"
                className="capitalize"
              >
                {severity} ({severity === 'all' ? (alerts?.length || 0) : (alerts?.filter(a => a.severity === severity).length || 0)})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon

            return (
              <Card key={alert.alertId} className={`border-2 ${config.className}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg bg-${config.badge === 'destructive' ? 'red' : config.badge === 'secondary' ? 'yellow' : 'blue'}-500 mr-4`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium mr-2">{alert.framework}</h4>
                          <Badge variant={config.badge} className="capitalize">
                            {alert.severity}
                          </Badge>
                        </div>

                        <p className="text-sm mb-3">{alert.message}</p>

                        {alert.message && alert.message.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {alert.message}
                          </div>
                        )}

                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => acknowledgeAlert(alert.alertId)}
                      variant="outline"
                      size="sm"
                    >
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}