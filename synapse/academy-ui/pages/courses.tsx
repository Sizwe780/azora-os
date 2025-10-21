import Link from "next/link"
import { courses } from "../data/courses"

export default function Courses() {
  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Top Qualifications</h2>
      <ul>
        {courses.map(course => (
          <li key={course.id} className="mb-6 p-6 bg-white rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xl">{course.title}</span>
              <span className="ml-2 text-green-700 font-bold">Earn: {course.azrReward} AZR</span>
            </div>
            <div className="text-gray-600 mb-1">{course.description}</div>
            <div className="mb-2 text-purple-700">AI Professor: {course.professor}</div>
            <Link href={`/courses/${course.id}`} className="text-blue-600 underline font-semibold">View Modules</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}