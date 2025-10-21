import { LearningOverview } from '../../types'
import { LearningProgressChart } from '../charts/LearningProgressChart'
import { EarningsChart } from '../charts/EarningsChart'
import { CourseProgressGrid } from '../shared/CourseProgressGrid'
import { RecentAchievements } from '../shared/RecentAchievements'

interface DashboardProps {
  data: LearningOverview
}

export function Dashboard({ data }: DashboardProps) {
  const overallProgress = Math.round(data.progress.overallProgress)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {overallProgress}%
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Overall Progress</h3>
              <p className="text-2xl font-bold text-gray-900">
                {data.completedCourses}/{data.totalCourses}
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
              <h3 className="text-sm font-medium text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-gray-900">{data.completedCourses}</p>
              <p className="text-xs text-gray-500">courses finished</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">In Progress</h3>
              <p className="text-2xl font-bold text-gray-900">{data.inProgressCourses}</p>
              <p className="text-xs text-gray-500">courses active</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Total Earnings</h3>
              <p className="text-2xl font-bold text-gray-900">{data.totalEarnings}</p>
              <p className="text-xs text-gray-500">AZR earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningProgressChart progress={data.progress} />
        <EarningsChart earnings={data.earnings} />
      </div>

      {/* Course Progress and Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CourseProgressGrid courses={data.courses} />
        </div>
        <div>
          <RecentAchievements achievements={data.achievements} />
        </div>
      </div>
    </div>
  )
}