import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function QAPage() {
  const [policies, setPolicies] = useState([])
  const [audits, setAudits] = useState([])
  useEffect(() => {
    fetch("/api/qa").then(res => res.json()).then(data => {
      setPolicies(data.policies)
      setAudits(data.audits)
    })
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Quality Assurance & Accreditation</h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Policies</h2>
            <ul>
              {policies.map(policy => (
                <li key={policy.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{policy.title}</div>
                  <div className="text-xs text-gray-600">{policy.updatedAt}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Audit Logs</h2>
            <ul>
              {audits.map(audit => (
                <li key={audit.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{audit.title}</div>
                  <div className="text-xs text-gray-600">{audit.date}</div>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}