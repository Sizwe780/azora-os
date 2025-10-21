import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AdminNotificationsPage() {
  const [history, setHistory] = useState([])
  const [resendStatus, setResendStatus] = useState("")

  useEffect(() => {
    fetch("/api/export-history")
      .then(res => res.json())
      .then(setHistory)
  }, [])

  async function handleResend(file) {
    setResendStatus("Sending...")
    const res = await fetch("/api/resend-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file })
    })
    if (res.ok) setResendStatus("Notification resent!")
    else setResendStatus("Failed to resend.")
    setTimeout(() => setResendStatus(""), 3000)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Export Notifications & Scheduling</h1>
            <ul>
              {history.map((exp, idx) => (
                <li key={idx} className="mb-4 p-4 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{exp.file}</div>
                    <div className="text-xs text-gray-600">Exported: {new Date(exp.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Notification: {exp.notified ? "Sent" : "Not Sent"}</div>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-700 text-white rounded"
                    onClick={() => handleResend(exp.file)}
                  >
                    Resend Notification
                  </button>
                </li>
              ))}
            </ul>
            {resendStatus && (
              <div className="mt-4 text-green-700 font-bold">{resendStatus}</div>
            )}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Export Scheduling</h2>
              <div className="text-gray-700 mb-2">
                <strong>Current schedule:</strong> Daily at 01:00 (via cron)
              </div>
              <div className="text-xs text-gray-600">
                To change schedule, update your crontab:<br />
                <code>crontab -e</code>
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}