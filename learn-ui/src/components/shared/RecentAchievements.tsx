import { Achievement } from '../../types'

interface RecentAchievementsProps {
  achievements: Achievement[]
}

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
  const recentAchievements = achievements.filter(a => a.earned).slice(0, 5)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
      <div className="space-y-3">
        {recentAchievements.length > 0 ? (
          recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">🏆</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                <p className="text-xs text-gray-500">{achievement.description}</p>
                {achievement.date && (
                  <p className="text-xs text-gray-400">{achievement.date}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No achievements yet. Keep learning to earn badges!
          </p>
        )}
      </div>
    </div>
  )
}