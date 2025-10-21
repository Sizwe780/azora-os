import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    fetch("/api/credentials").then(res => res.json()).then(setCredentials)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Your Credential Wallet</h1>
          <ul>
            {credentials.map(c => (
              <li key={c.id} className="mb-4 p-4 bg-white rounded shadow">
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-gray-600">{c.type} • {c.issuedAt}</div>
                <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Share</button>
                <button className="mt-2 ml-2 px-3 py-1 bg-green-600 text-white rounded">Verify</button>
              </li>
            ))}
          </ul>
        </MainLayout>
      </div>
    </div>
  )
}