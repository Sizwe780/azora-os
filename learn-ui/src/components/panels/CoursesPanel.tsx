import { useState } from 'react'
import { Course } from '../../types'

interface CoursesPanelProps {
  courses: Course[]
  onCourseSelect?: (courseId: string) => void
}

export function CoursesPanel({ courses, onCourseSelect }: CoursesPanelProps) {
  const [filter, setFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all')

  const filteredCourses = courses.filter(course =>
    filter === 'all' || course.status === filter
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Courses</h2>
        <div className="flex space-x-2">
          {(['all', 'not-started', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'All' :
               status === 'not-started' ? 'Not Started' :
               status === 'in-progress' ? 'In Progress' :
               'Completed'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCourseSelect?.(course.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                course.status === 'completed' ? 'bg-green-100 text-green-800' :
                course.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.status === 'completed' ? '✓ Completed' :
                 course.status === 'in-progress' ? 'In Progress' :
                 'Not Started'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Earnings</span>
              <span className="font-medium text-purple-600">{course.earnings} AZR</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses found with the selected filter.</p>
        </div>
      )}
    </div>
  )
}