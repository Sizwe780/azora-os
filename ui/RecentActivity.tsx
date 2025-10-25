import { formatDistanceToNow } from 'date-fns'
import { AuditLogEntry } from '../../types'

interface RecentActivityProps {
  activities: AuditLogEntry[]
}

const actionIcons: Record<string, string> = {
  compliance_status_update: '🔄',
  alert_acknowledged: '✅',
  compliance_report_generated: '📊',
  alert_generated: '🚨',
  notification_sent: '📧',
  framework_status_check: '🔍'
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const recentActivities = activities.slice(0, 10)

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          recentActivities.map((activity) => (
            <div key={activity.logId} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {actionIcons[activity.action] || '📝'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {activity.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
                {activity.details && (
                  <div className="mt-1 text-xs text-gray-600">
                    {typeof activity.details === 'string'
                      ? activity.details
                      : Object.entries(activity.details).slice(0, 2).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {String(value)}
                          </span>
                        ))
                    }
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
