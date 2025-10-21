import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function PassExamAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    avgScore: 0,
    masteryPercent: 0,
    students: []
  })

  useEffect(() => {
    fetch("/api/pass-exam-analytics")
      .then(res => res.json())
      .then(setAnalytics)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Pass Exam Analytics (Premium)</h1>
          <div className="mb-6">
            <div className="font-semibold text-lg">Total Attempts: {analytics.totalAttempts}</div>
            <div className="font-semibold text-lg">Average Score: {analytics.avgScore}</div>
            <div className="font-semibold text-lg">Mastery Rate: {analytics.masteryPercent}%</div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Student Performance</h2>
            <ul>
              {analytics.students.map(s => (
                <li key={s.studentId} className="mb-2 p-2 bg-white rounded shadow">
                  <span className="font-semibold">{s.studentId}</span>
                  <span className="ml-4">Score: {s.score}</span>
                  <span className="ml-4 text-xs text-gray-600">Last Attempt: {new Date(s.lastAttempt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}