import { useRouter } from "next/router"
import Link from "next/link"
import { courses } from "../../data/courses"

export default function CourseDetail() {
  const router = useRouter()
  const { courseId } = router.query
  const course = courses.find(c => c.id === courseId)

  if (!course) return <div>Course not found.</div>

  return (
    <main>
      <h2 className="text-2xl font-bold mb-4 text-blue-700">{course.title}</h2>
      <div className="mb-2 text-gray-700">{course.description}</div>
      <div className="mb-2 text-purple-700">AI Professor: {course.professor}</div>
      <ul>
        {course.lessons.map(lesson => (
          <li key={lesson.id} className="mb-4 p-4 bg-gray-50 rounded border">
            <span className="font-semibold">{lesson.title}</span>
            <span className="ml-2 text-green-700 font-bold">Earn: {lesson.azrReward} AZR</span>
            <Link href={`/courses/${course.id}/lessons/${lesson.id}`} className="ml-4 text-blue-600 underline font-semibold">Start Lesson</Link>
          </li>
        ))}
      </ul>
      <Link href="/courses" className="text-blue-600 underline mt-6 block">Back to Courses</Link>
    </main>
  )
}