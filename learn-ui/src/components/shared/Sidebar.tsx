import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { LearningOverview } from '../../types'

interface SidebarProps {
  activeView: 'dashboard' | 'courses' | 'progress' | 'earnings'
  onViewChange: (view: 'dashboard' | 'courses' | 'progress' | 'earnings') => void
  data?: LearningOverview
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
      id: 'courses' as const,
      label: 'Courses',
      icon: BookOpen,
      count: data?.totalCourses || 0
    },
    {
      id: 'progress' as const,
      label: 'Progress',
      icon: TrendingUp,
      count: null
    },
    {
      id: 'earnings' as const,
      label: 'Earnings',
      icon: DollarSign,
      count: data?.totalEarnings ? `${data.totalEarnings} AZR` : null
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
                {item.count !== null && typeof item.count === 'number' && item.count > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
                {item.count !== null && typeof item.count === 'string' && (
                  <span className="text-xs text-gray-500">
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Learning Progress Summary */}
      {data && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Learning Progress</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completed Courses</span>
              <span className="font-medium text-green-600">{data.completedCourses}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">In Progress</span>
              <span className="font-medium text-blue-600">{data.inProgressCourses}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-medium text-yellow-600">{data.totalEarnings} AZR</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Streak</span>
              <span className="font-medium text-purple-600">{data.currentStreak} days</span>
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