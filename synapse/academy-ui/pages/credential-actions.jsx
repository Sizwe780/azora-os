import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function CredentialActionsPage() {
  const [credentialId, setCredentialId] = useState("")
  const [actor, setActor] = useState("")
  const [reason, setReason] = useState("")
  const [action, setAction] = useState("revoke")
  const [result, setResult] = useState(null)

  async function handleAction() {
    const res = await fetch("/api/credential-actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: credentialId, action, actor, reason })
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Credential Actions</h1>
          <div className="mb-4">
            <input
              type="text"
              value={credentialId}
              onChange={e => setCredentialId(e.target.value)}
              placeholder="Credential ID"
              className="px-4 py-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              value={actor}
              onChange={e => setActor(e.target.value)}
              placeholder="Your Name/Org"
              className="px-4 py-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="px-4 py-2 border rounded w-full mb-2"
            />
            <select
              value={action}
              onChange={e => setAction(e.target.value)}
              className="px-4 py-2 border rounded w-full mb-2"
            >
              <option value="revoke">Revoke</option>
              <option value="endorse">Endorse</option>
            </select>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleAction}
            >
              Submit
            </button>
          </div>
          {result && (
            <div className="mt-6 p-4 bg-white rounded shadow">
              <div className="font-bold text-green-700">{result.action} action completed!</div>
              <pre className="mt-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </MainLayout>
      </div>
    </div>
  )
}