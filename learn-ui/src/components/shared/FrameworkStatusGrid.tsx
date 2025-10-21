import { CheckCircle, AlertCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import { FrameworkStatus } from '../../types'

interface FrameworkStatusGridProps {
  frameworks: Record<string, FrameworkStatus>
}

const statusConfig = {
  compliant: {
    icon: CheckCircle,
    className: 'status-compliant',
    label: 'Compliant'
  },
  'needs-attention': {
    icon: AlertCircle,
    className: 'status-needs-attention',
    label: 'Needs Attention'
  },
  'non-compliant': {
    icon: XCircle,
    className: 'status-non-compliant',
    label: 'Non-Compliant'
  },
  unreachable: {
    icon: Clock,
    className: 'status-unreachable',
    label: 'Unreachable'
  }
}

export function FrameworkStatusGrid({ frameworks }: FrameworkStatusGridProps) {
  const frameworkList = Object.values(frameworks)

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Framework Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworkList.map((framework) => {
          const config = statusConfig[framework.status]
          const Icon = config.icon

          return (
            <div
              key={framework.framework}
              className={`border rounded-lg p-4 ${config.className}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-2" />
                  <div>
                    <h4 className="font-medium">{framework.framework}</h4>
                    <p className="text-sm opacity-75">{config.label}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {framework.issues.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Issues:</p>
                  <ul className="text-sm space-y-1">
                    {framework.issues.slice(0, 3).map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-xs mr-2">•</span>
                        <span className="flex-1">{issue}</span>
                      </li>
                    ))}
                    {framework.issues.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{framework.issues.length - 3} more issues
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-3 text-xs opacity-75">
                Updated: {new Date(framework.lastUpdated).toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}