import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function CourseCataloguePage() {
  const [courses, setCourses] = useState([])
  const [user, setUser] = useState({ access: "free" })

  useEffect(() => {
    fetch("/api/course-catalogue")
      .then(res => res.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    fetch("/api/onboarding")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setUser(data[data.length - 1])
      })
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Course Catalogue</h1>
            <ul>
              {courses.map(course => (
                <li key={course.id} className="mb-4 p-4 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-xs text-gray-600">{course.description}</div>
                  </div>
                  <div>
                    {course.access === "free" ? (
                      <span className="px-3 py-1 bg-green-600 text-white rounded">Free</span>
                    ) : user.access === "premium" ? (
                      <span className="px-3 py-1 bg-blue-700 text-white rounded">Premium</span>
                    ) : (
                      <a href="/upgrade" className="px-3 py-1 bg-yellow-500 text-white rounded">Upgrade Required</a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <a
                href="/pricing"
                className="px-4 py-2 bg-blue-700 text-white rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Upgrade to Premium
              </a>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}