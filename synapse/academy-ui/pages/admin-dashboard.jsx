import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [health, setHealth] = useState({ status: "Checking...", uptime: "", disk: "" })
  useEffect(() => {
    fetch("/api/system-health")
      .then(res => res.json())
      .then(setHealth)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>
            <ul className="mb-8">
              <li><a href="/notification-audit" className="text-blue-700 underline">Notification Audit Log</a></li>
              <li><a href="/export-history" className="text-blue-700 underline">Export History</a></li>
              <li><a href="/admin-notification-preferences" className="text-blue-700 underline">Notification Preferences</a></li>
              <li><a href="/compliance-report" className="text-blue-700 underline">Compliance Report</a></li>
              <li><a href="/regulatory-report" className="text-blue-700 underline">Regulatory Reporting</a></li>
            </ul>
            <div className="mt-8 p-4 bg-gray-100 rounded">
              <h2 className="text-lg font-bold mb-2">System Health</h2>
              <div>Status: {health.status}</div>
              <div>Uptime: {health.uptime}</div>
              <div>Disk Usage: {health.disk}</div>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}