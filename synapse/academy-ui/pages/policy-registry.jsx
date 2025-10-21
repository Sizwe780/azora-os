import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function PolicyRegistryPage() {
  const [policies, setPolicies] = useState([])
  useEffect(() => {
    fetch("/api/policy-registry").then(res => res.json()).then(setPolicies)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Policy Registry</h1>
          <ul>
            {policies.map(policy => (
              <li key={policy.id} className="mb-4 p-4 bg-white rounded shadow">
                <div className="font-semibold">{policy.title}</div>
                <div className="text-xs text-gray-600">{policy.updatedAt}</div>
                <div className="text-gray-700">{policy.summary}</div>
                <a href={policy.link} className="text-blue-600 underline mt-2 block" target="_blank" rel="noopener noreferrer">View Full Policy</a>
              </li>
            ))}
          </ul>
        </MainLayout>
      </div>
    </div>
  )
}