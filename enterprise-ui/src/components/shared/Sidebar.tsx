/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
              <Button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {item.count}
                  </Badge>
                )}
              </Button>
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
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                {data.compliantFrameworks}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-gray-600">Needs Attention</span>
              </div>
              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                {data.needsAttentionFrameworks}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-gray-600">Non-Compliant</span>
              </div>
              <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                {data.totalFrameworks - data.compliantFrameworks}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-600">Unreachable</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                {data.needsAttentionFrameworks}
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}