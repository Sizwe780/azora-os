import { useEffect, useState } from "react"

export default function AlumniRequestsPage() {
  const [requests, setRequests] = useState([])
  const [msg, setMsg] = useState("")
  useEffect(() => {
    fetch("/api/alumni-requests")
      .then(res => res.json())
      .then(setRequests)
  }, [])
  async function handleApprove(email) {
    const res = await fetch("/api/approve-alumni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    setMsg(data.ok ? "Approved!" : data.error)
    if (data.ok) setRequests(requests.map(r => r.email === email ? { ...r, status: "approved" } : r))
  }
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Alumni Role Requests</h1>
      <ul>
        {requests.map((r, idx) => (
          <li key={idx} className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
            <span>{r.email}</span>
            <span className="ml-2 text-xs">{r.status}</span>
            {r.status === "pending" && (
              <button
                className="ml-4 px-2 py-1 bg-green-700 text-white rounded"
                onClick={() => handleApprove(r.email)}
              >
                Approve
              </button>
            )}
          </li>
        ))}
      </ul>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
    </div>
  )
}