import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AdminPage() {
  const [cohorts, setCohorts] = useState([])
  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    fetch("/api/admin").then(res => res.json()).then(data => {
      setCohorts(data.cohorts)
      setCredentials(data.credentials)
    })
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Console</h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Cohorts</h2>
            <ul>
              {cohorts.map(cohort => (
                <li key={cohort.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{cohort.name}</div>
                  <div className="text-xs text-gray-600">{cohort.year}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Credentials Issued</h2>
            <ul>
              {credentials.map(cred => (
                <li key={cred.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{cred.title}</div>
                  <div className="text-xs text-gray-600">{cred.student} • {cred.issuedAt}</div>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}