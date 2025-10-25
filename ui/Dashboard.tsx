import { ComplianceOverview } from '../../types'
import { ComplianceScoreChart } from '../charts/ComplianceScoreChart'
import { FrameworkStatusGrid } from '../shared/FrameworkStatusGrid'
import { RegionalComplianceChart } from '../charts/RegionalComplianceChart'
import { RecentActivity } from '../shared/RecentActivity'

interface DashboardProps {
  data: ComplianceOverview
}

export function Dashboard({ data }: DashboardProps) {
  const compliancePercentage = Math.round((data.compliantFrameworks / data.totalFrameworks) * 100)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {compliancePercentage}%
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Compliance Score</h3>
              <p className="text-2xl font-bold text-gray-900">
                {data.metrics?.overallComplianceScore || 0}/100
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Compliant</h3>
              <p className="text-2xl font-bold text-gray-900">{data.compliantFrameworks}</p>
              <p className="text-xs text-gray-500">of {data.totalFrameworks} frameworks</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">!</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Needs Attention</h3>
              <p className="text-2xl font-bold text-gray-900">{data.needsAttentionFrameworks}</p>
              <p className="text-xs text-gray-500">frameworks require review</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">⚠</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Active Alerts</h3>
              <p className="text-2xl font-bold text-gray-900">{data.activeAlerts?.length || 0}</p>
              <p className="text-xs text-gray-500">require immediate action</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceScoreChart metrics={data.metrics} />
        <RegionalComplianceChart regional={data.metrics?.regionalCompliance} />
      </div>

      {/* Framework Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FrameworkStatusGrid frameworks={data.frameworks} />
        </div>
        <div>
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </div>
  )
}
