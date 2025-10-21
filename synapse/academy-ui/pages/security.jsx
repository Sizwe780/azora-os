import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function SecurityPage() {
  const [incidents, setIncidents] = useState([])
  const [consents, setConsents] = useState([])
  useEffect(() => {
    fetch("/api/security").then(res => res.json()).then(data => {
      setIncidents(data.incidents)
      setConsents(data.consents)
    })
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Security & Data Protection</h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Incidents</h2>
            <ul>
              {incidents.map(incident => (
                <li key={incident.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{incident.title}</div>
                  <div className="text-xs text-gray-600">{incident.date}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Consents</h2>
            <ul>
              {consents.map(consent => (
                <li key={consent.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{consent.user}</div>
                  <div className="text-xs text-gray-600">{consent.date}</div>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}