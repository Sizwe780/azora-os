import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function ComplianceReportPage() {
  const [report, setReport] = useState({
    policyEvents: [],
    blockchainEvents: [],
    totalPolicyEvents: 0,
    totalBlockchainEvents: 0
  })

  useEffect(() => {
    fetch("/api/compliance-report")
      .then(res => res.json())
      .then(setReport)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Compliance & Reporting Dashboard</h1>
            <div className="mb-4 font-semibold text-lg">
              Policy Events: {report.totalPolicyEvents}
            </div>
            <div className="mb-4 font-semibold text-lg">
              Blockchain Audit Events: {report.totalBlockchainEvents}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Policy Events</h2>
              <ul>
                {report.policyEvents.slice(-10).reverse().map((e, idx) => (
                  <li key={idx} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">{e.type}</span>
                    <span className="ml-4 text-xs text-gray-600">{e.timestamp ? new Date(e.timestamp).toLocaleString() : ""}</span>
                    <span className="ml-4">{e.details}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Blockchain Events</h2>
              <ul>
                {report.blockchainEvents.slice(-10).reverse().map((e, idx) => (
                  <li key={idx} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">{e.type}</span>
                    <span className="ml-4 text-xs text-gray-600">{e.timestamp ? new Date(e.timestamp).toLocaleString() : ""}</span>
                    <span className="ml-4">{e.key}</span>
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