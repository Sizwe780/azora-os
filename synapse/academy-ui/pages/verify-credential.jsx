import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function VerifyCredentialPage() {
  const [credentialId, setCredentialId] = useState("")
  const [result, setResult] = useState(null)

  async function handleVerify() {
    const res = await fetch(`/api/verify-credential?id=${encodeURIComponent(credentialId)}`)
    const data = await res.json()
    setResult(data)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Credential Verification Portal</h1>
          <div className="mb-4">
            <input
              type="text"
              value={credentialId}
              onChange={e => setCredentialId(e.target.value)}
              placeholder="Enter Credential ID"
              className="px-4 py-2 border rounded w-full"
            />
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
              onClick={handleVerify}
            >
              Verify
            </button>
          </div>
          {result && (
            <div className="mt-6 p-4 bg-white rounded shadow">
              {result.valid
                ? <div className="text-green-700 font-bold">Credential is valid!</div>
                : <div className="text-red-700 font-bold">Credential is NOT valid.</div>
              }
              <pre className="mt-2 text-xs">{JSON.stringify(result.credential, null, 2)}</pre>
            </div>
          )}
        </MainLayout>
      </div>
    </div>
  )
}