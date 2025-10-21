import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function Dashboard() {
  const [progress, setProgress] = useState({ completed: [], score: 0 })
  const [examAnalytics, setExamAnalytics] = useState(null)
  const [user, setUser] = useState({ name: "", access: "free", role: "student" })

  useEffect(() => {
    fetch("/api/professor-progress")
      .then(res => res.json())
      .then(setProgress)
    fetch("/api/pass-exam-analytics")
      .then(res => res.json())
      .then(setExamAnalytics)
  }, [])

  useEffect(() => {
    fetch("/api/onboarding")
      .then(res => res.json())
      .then(data => {
        // Assume last onboarded user is current for demo
        if (Array.isArray(data) && data.length > 0) setUser(data[data.length - 1])
      })
  }, [])

  useEffect(() => {
    fetch("/api/auth-session")
      .then(res => res.json())
      .then(data => { if (data.email) setUser(data) })
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Your Learning Dashboard</h1>
            <div className="mb-4 font-semibold text-lg text-gray-800">
              Lessons completed: {progress.completed.length}/50
            </div>
            <div className="mb-4 font-semibold text-green-700">
              Total Score: {progress.score}
            </div>
            <div className="mb-4 font-semibold text-lg text-gray-800">
              Welcome, {user.name || user.email} ({user.role})
            </div>
            {user.access === "premium" && examAnalytics && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 text-purple-700">Premium Exam Mastery</h2>
                <div>Total Attempts: {examAnalytics.totalAttempts}</div>
                <div>Average Score: {examAnalytics.avgScore}</div>
                <div>Mastery Rate: {examAnalytics.masteryPercent}%</div>
                <a
                  href="/pass-exam-analytics"
                  className="mt-2 inline-block px-4 py-2 bg-blue-700 text-white rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Exam Analytics
                </a>
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}