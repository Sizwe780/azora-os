import { LearningProgress } from '../../types'

interface LearningProgressChartProps {
  progress: LearningProgress
}

export function LearningProgressChart({ progress }: LearningProgressChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(progress.overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress.overallProgress}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>This Week</span>
            <span>{Math.round(progress.weeklyProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${progress.weeklyProgress}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>This Month</span>
            <span>{Math.round(progress.monthlyProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${progress.monthlyProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}