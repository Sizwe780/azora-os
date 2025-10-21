import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function JobAnalyticsPage() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    applicationsPerJob: "0",
    jobs: [],
    applications: []
  })

  useEffect(() => {
    fetch("/api/job-analytics")
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
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Job Placement Analytics</h1>
            <div className="mb-4 font-semibold text-lg">
              Total Jobs Posted: {stats.totalJobs}
            </div>
            <div className="mb-4 font-semibold text-lg">
              Total Applications: {stats.totalApplications}
            </div>
            <div className="mb-4 font-semibold text-lg">
              Avg Applications per Job: {stats.applicationsPerJob}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Applications</h2>
              <ul>
                {stats.applications.slice(-10).reverse().map((app, idx) => (
                  <li key={idx} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">Job ID: {app.jobId}</span>
                    <span className="ml-4 text-xs text-gray-600">Applied: {new Date(app.timestamp).toLocaleString()}</span>
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