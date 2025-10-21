import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({})
  useEffect(() => {
    fetch("/api/analytics").then(res => res.json()).then(setAnalytics)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Analytics Dashboard</h1>
          <div className="mb-8">
            <div className="font-semibold text-lg">Learning KPIs</div>
            <div className="text-gray-700">Active Students: {analytics.activeStudents}</div>
            <div className="text-gray-700">Credentials Issued: {analytics.credentialsIssued}</div>
            <div className="text-gray-700">Job Placements: {analytics.jobPlacements}</div>
          </div>
          <div>
            <div className="font-semibold text-lg">Quality & Trust Metrics</div>
            <div className="text-gray-700">Completion Rate: {analytics.completionRate}%</div>
            <div className="text-gray-700">Verification Success: {analytics.verificationSuccess}%</div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}