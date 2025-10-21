import { useRouter } from "next/router"
import { courses } from "../../../../data/courses"
import InteractiveLesson from "../../../../components/InteractiveLesson"
import AIProfessor from "../../../../components/AIProfessor"

export default function LessonPage() {
  const router = useRouter()
  const { courseId, lessonId } = router.query
  const course = courses.find(c => c.id === courseId)
  const lesson = course?.lessons.find(l => l.id === lessonId)

  if (!course || !lesson) return <div>Lesson not found.</div>

  // Example quiz for the lesson
  const quiz = [
    { q: `What is the main concept of ${lesson.title}?`, a: "..." },
    { q: "Name one real-world application.", a: "..." }
  ]

  return (
    <main>
      <InteractiveLesson
        courseId={course.id}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        professor={course.professor}
        quiz={quiz}
      />
      <AIProfessor module={lesson.title} professor={course.professor} />
      <a href={`/courses/${course.id}`} className="text-blue-600 underline mt-6 block">Back to Course</a>
    </main>
  )
}