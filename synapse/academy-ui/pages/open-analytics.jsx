import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function OpenAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    avgScore: 0,
    users: [],
    progress: {}
  })

  useEffect(() => {
    fetch("/api/open-analytics")
      .then(res => res.json())
      .then(setStats)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Open Learning Analytics</h1>
            <div className="mb-4 font-semibold text-lg">
              Total Users: {stats.totalUsers}
            </div>
            <div className="mb-4 font-semibold text-green-700">
              Free Users: {stats.freeUsers}
            </div>
            <div className="mb-4 font-semibold text-blue-700">
              Premium Users: {stats.premiumUsers}
            </div>
            <div className="mb-4 font-semibold text-lg">
              Average Exam Score: {stats.avgScore}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Learner Progress</h2>
              <ul>
                {stats.users.slice(-10).reverse().map((u, idx) => (
                  <li key={idx} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">{u.name || u.email}</span>
                    <span className="ml-4">Access: {u.access}</span>
                    <span className="ml-4">Score: {stats.progress[u.email]?.score ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}