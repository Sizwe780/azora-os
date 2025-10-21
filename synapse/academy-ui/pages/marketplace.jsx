import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function MarketplacePage() {
  const [jobs, setJobs] = useState([])
  useEffect(() => {
    fetch("/api/jobs").then(res => res.json()).then(setJobs)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Jobs & Marketplace</h1>
          <ul>
            {jobs.map(job => (
              <li key={job.id} className="mb-4 p-4 bg-white rounded shadow">
                <div className="font-semibold">{job.title}</div>
                <div className="text-xs text-gray-600">{job.company} • {job.location}</div>
                <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded">Apply</button>
                <button className="mt-2 ml-2 px-3 py-1 bg-blue-600 text-white rounded">Verify Credential</button>
              </li>
            ))}
          </ul>
        </MainLayout>
      </div>
    </div>
  )
}