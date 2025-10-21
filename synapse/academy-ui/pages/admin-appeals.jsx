import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [resolution, setResolution] = useState("")
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    fetch("/api/appeals")
      .then(res => res.json())
      .then(setAppeals)
  }, [resolved])

  async function handleResolve(e) {
    e.preventDefault()
    await fetch("/api/admin-appeals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, resolution })
    })
    setResolved(true)
    setResolution("")
    setSelectedId("")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin: Resolve Exam Appeals</h1>
            <form onSubmit={handleResolve}>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Select Appeal</label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="px-4 py-2 border rounded w-full"
                  required
                >
                  <option value="">Choose...</option>
                  {appeals.filter(a => a.status === "Pending").map(a => (
                    <option key={a.id} value={a.id}>
                      {a.studentId} - {a.examId} ({a.reason})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Resolution</label>
                <textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <button className="mt-2 px-4 py-2 bg-green-700 text-white rounded" type="submit">
                Resolve Appeal
              </button>
            </form>
            {resolved && (
              <div className="text-green-700 font-bold mt-4">
                Appeal resolved and logged!
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">All Appeals</h2>
              <ul>
                {appeals.map(a => (
                  <li key={a.id} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">Student: {a.studentId}</span>
                    <span className="ml-4">Exam: {a.examId}</span>
                    <span className="ml-4 text-xs text-gray-600">Reason: {a.reason}</span>
                    <span className="ml-4 text-xs text-gray-600">Status: {a.status}</span>
                    {a.resolution && (
                      <span className="ml-4 text-xs text-blue-700">Resolution: {a.resolution}</span>
                    )}
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