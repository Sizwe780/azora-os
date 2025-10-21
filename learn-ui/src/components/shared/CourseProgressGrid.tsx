import { Course } from '../../types'

interface CourseProgressGridProps {
  courses: Course[]
}

export function CourseProgressGrid({ courses }: CourseProgressGridProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{course.title}</h4>
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
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {course.progress}%</span>
              <span>{course.earnings} AZR earned</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}