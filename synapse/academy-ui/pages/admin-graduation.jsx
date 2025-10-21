import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AdminGraduationPage() {
  const [requests, setRequests] = useState([])
  const [issued, setIssued] = useState(false)

  useEffect(() => {
    fetch("/api/graduation-requests")
      .then(res => res.json())
      .then(setRequests)
  }, [issued])

  async function handleIssue(studentId, programme) {
    await fetch("/api/admin-graduation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, programme })
    })
    setIssued(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin: Graduation & Credential Issuance</h1>
            <ul>
              {requests.filter(r => r.status === "Pending").map(r => (
                <li key={r.studentId + r.timestamp} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">Student: {r.studentId}</div>
                  <div className="text-xs text-gray-600">Programme: {r.programme}</div>
                  <button
                    className="mt-2 px-4 py-2 bg-green-700 text-white rounded"
                    onClick={() => handleIssue(r.studentId, r.programme)}
                  >
                    Issue Credential
                  </button>
                </li>
              ))}
            </ul>
            {issued && (
              <div className="text-green-700 font-bold mt-4">
                Credential issued and logged!
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}