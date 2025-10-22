/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Activity, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ActivityItem {
  id: string
  type: 'compliance-check' | 'policy-update' | 'alert' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  framework?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const activityConfig = {
  success: {
    icon: CheckCircle,
    badge: 'default' as const,
    className: 'text-green-600'
  },
  warning: {
    icon: AlertTriangle,
    badge: 'secondary' as const,
    className: 'text-yellow-600'
  },
  error: {
    icon: XCircle,
    badge: 'destructive' as const,
    className: 'text-red-600'
  },
  info: {
    icon: Clock,
    badge: 'outline' as const,
    className: 'text-blue-600'
  }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityConfig[activity.status]
            const Icon = config.icon

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${config.className}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <Badge variant={config.badge} className="ml-2">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.description}
                  </p>
                  {activity.framework && (
                    <p className="text-xs text-gray-400 mt-1">
                      Framework: {activity.framework}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}