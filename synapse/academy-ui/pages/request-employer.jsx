import { useState } from "react"

export default function RequestEmployerPage() {
  const [msg, setMsg] = useState("")
  async function handleRequest() {
    const res = await fetch("/api/request-employer", { method: "POST" })
    const data = await res.json()
    setMsg(data.ok ? "Request submitted!" : data.error)
  }
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8 text-center">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Request Employer Access</h1>
      <button
        className="px-4 py-2 bg-blue-700 text-white rounded"
        onClick={handleRequest}
      >
        Request Employer Role
      </button>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
    </div>
  )
}