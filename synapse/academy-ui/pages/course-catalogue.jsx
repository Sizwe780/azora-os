import { useEffect, useState } from "react"

const courses = [
  { id: "course-1", title: "Intro to Linux" },
  { id: "course-2", title: "Web Development Basics" },
  { id: "course-3", title: "Cloud Fundamentals" }
]

export default function CourseCataloguePage() {
  const [enrolled, setEnrolled] = useState([])
  const [completed, setCompleted] = useState([])
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/enroll-course")
      .then(res => res.json())
      .then(setEnrolled)
  }, [])

  useEffect(() => {
    fetch("/api/complete-course")
      .then(res => res.json())
      .then(setCompleted)
  }, [])

  async function handleEnroll(courseId) {
    const res = await fetch("/api/enroll-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    })
    const data = await res.json()
    setMsg(data.ok ? "Enrolled!" : data.error)
    if (data.ok) setEnrolled([...enrolled, { courseId }])
  }

  async function handleComplete(courseId) {
    const res = await fetch("/api/complete-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    })
    const data = await res.json()
    setMsg(data.ok ? "Course marked complete!" : data.error)
    if (data.ok) setCompleted([...completed, { courseId }])
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Course Catalogue</h1>
      <ul>
        {courses.map(course => (
          <li key={course.id} className="mb-4 p-4 bg-gray-100 rounded flex justify-between items-center">
            <span>{course.title}</span>
            {enrolled.find(e => e.courseId === course.id) ? (
              <>
                <span className="px-2 py-1 bg-green-700 text-white rounded text-xs">Enrolled</span>
                {completed.find(c => c.courseId === course.id) ? (
                  <span className="ml-2 px-2 py-1 bg-gray-700 text-white rounded text-xs">Completed</span>
                ) : (
                  <button
                    className="ml-2 px-2 py-1 bg-green-700 text-white rounded"
                    onClick={() => handleComplete(course.id)}
                  >
                    Mark Complete
                  </button>
                )}
              </>
            ) : (
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded"
                onClick={() => handleEnroll(course.id)}
              >
                Enroll
              </button>
            )}
          </li>
        ))}
      </ul>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
    </div>
  )
}