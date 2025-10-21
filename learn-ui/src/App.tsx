import { useState, Suspense, lazy } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header, Sidebar } from './components'
import { LearningOverview } from './types'

// Lazy load panel components for code splitting
const Dashboard = lazy(() => import('./components/panels/Dashboard').then(module => ({ default: module.Dashboard })))
const CoursesPanel = lazy(() => import('./components/panels/CoursesPanel').then(module => ({ default: module.CoursesPanel })))
const ProgressPanel = lazy(() => import('./components/panels/ProgressPanel').then(module => ({ default: module.ProgressPanel })))
const EarningsPanel = lazy(() => import('./components/panels/EarningsPanel').then(module => ({ default: module.EarningsPanel })))

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'progress' | 'earnings'>('dashboard')
  function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'progress' | 'earnings' | 'lesson'>('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('user1') // Mock user ID

  // Fetch learning data from the backend API
  const { data: learningData, isLoading, error, refetch } = useQuery({
    queryKey: ['learning-overview', userId],
    queryFn: async (): Promise<LearningOverview> => {
      const response = await fetch(`http://localhost:4500/api/courses`)
      if (!response.ok) {
        throw new Error('Failed to fetch learning data')
      }
      const courses = await response.json()
      // Mock dashboard data
      return {
        totalCourses: courses.length,
        completedCourses: 0,
        inProgressCourses: 1,
        totalEarnings: 0,
        currentStreak: 0,
        lastUpdated: new Date().toISOString(),
        courses: courses.slice(0, 2),
        progress: { overallProgress: 25, weeklyProgress: 10, monthlyProgress: 25 },
        earnings: { total: 0, thisWeek: 0, thisMonth: 0, history: [] },
        achievements: []
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Learning Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Unable to connect to the learning service.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (!learningData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (activeView) {
      case 'courses':
        return <CoursesPanel courses={learningData.courses} onCourseSelect={(courseId) => {
          setSelectedCourseId(courseId)
          setActiveView('lesson')
        }} />
      case 'progress':
        return <ProgressPanel progress={learningData.progress} courses={learningData.courses} />
      case 'earnings':
        return <EarningsPanel earnings={learningData.earnings} />
      case 'lesson':
        return selectedCourseId ? <LessonPanel courseId={selectedCourseId} userId={userId} onBack={() => setActiveView('courses')} /> : <Dashboard data={learningData} />
      default:
        return <Dashboard data={learningData} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={() => refetch()} />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} data={learningData} />
        <main className="flex-1 p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            {renderActiveView()}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default App