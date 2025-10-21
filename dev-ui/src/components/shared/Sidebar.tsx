import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { ComplianceOverview } from '../../types'

interface SidebarProps {
  activeView: 'dashboard' | 'alerts' | 'reports' | 'metrics'
  onViewChange: (view: 'dashboard' | 'alerts' | 'reports' | 'metrics') => void
  data?: ComplianceOverview
}

export function Sidebar({ activeView, onViewChange, data }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null
    },
    {
      id: 'alerts' as const,
      label: 'Alerts',
      icon: AlertTriangle,
      count: Array.isArray(data?.activeAlerts) ? data.activeAlerts.length : data?.activeAlerts || 0
    },
    {
      id: 'reports' as const,
      label: 'Reports',
      icon: FileText,
      count: null
    },
    {
      id: 'metrics' as const,
      label: 'Metrics',
      icon: BarChart3,
      count: null
    }
  ]

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Compliance Status Summary */}
      {data && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Compliance Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-600">Compliant</span>
              </div>
              <span className="font-medium text-green-600">{data.compliantFrameworks}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-gray-600">Needs Attention</span>
              </div>
              <span className="font-medium text-yellow-600">{data.needsAttentionFrameworks}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-gray-600">Non-Compliant</span>
              </div>
              <span className="font-medium text-red-600">{data.nonCompliantFrameworks}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-600">Unreachable</span>
              </div>
              <span className="font-medium text-gray-600">{data.unreachableFrameworks}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}