import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"
import path from "path"

export default function ExportHistoryPage() {
  const [exports, setExports] = useState([])

  useEffect(() => {
    fetch("/api/export-history")
      .then(res => res.json())
      .then(setExports)
  }, [])

  function handleDownload(file) {
    window.open(`/api/export-download?file=${encodeURIComponent(file)}`, "_blank")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Regulatory Export History</h1>
            <ul>
              {exports.map((exp, idx) => (
                <li key={idx} className="mb-4 p-4 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{exp.file}</div>
                    <div className="text-xs text-gray-600">Exported: {new Date(exp.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Notification: {exp.notified ? "Sent" : "Not Sent"}</div>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-700 text-white rounded"
                    onClick={() => handleDownload(exp.file)}
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}