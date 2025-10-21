import { LearningProgress, Course } from '../../types'

interface ProgressPanelProps {
  progress: LearningProgress
  courses: Course[]
}

export function ProgressPanel({ progress, courses }: ProgressPanelProps) {
  const completedCourses = courses.filter(c => c.status === 'completed')
  const inProgressCourses = courses.filter(c => c.status === 'in-progress')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Learning Progress</h2>

      {/* Overall Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {Math.round(progress.overallProgress)}%
          </div>
          <p className="text-gray-600">of your learning journey completed</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress.overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{completedCourses.length}</div>
          <p className="text-sm text-gray-600">Courses Completed</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{inProgressCourses.length}</div>
          <p className="text-sm text-gray-600">Courses In Progress</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{courses.length - completedCourses.length - inProgressCourses.length}</div>
          <p className="text-sm text-gray-600">Courses Available</p>
        </div>
      </div>

      {/* Weekly/Monthly Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(progress.weeklyProgress)}%
            </div>
            <p className="text-gray-600">progress this week</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${progress.weeklyProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(progress.monthlyProgress)}%
            </div>
            <p className="text-gray-600">progress this month</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${progress.monthlyProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Course Progress Details */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Course Progress Details</h3>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{course.title}</h4>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-3 flex-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{course.progress}%</span>
                </div>
              </div>
              <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                course.status === 'completed' ? 'bg-green-100 text-green-800' :
                course.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}