import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function JobMarketplacePage() {
  const [jobs, setJobs] = useState([])
  const [applied, setApplied] = useState([])
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(setJobs)
    fetch("/api/apply-job")
      .then(res => res.json())
      .then(setApplied)
  }, [])

  async function handleApply(jobId) {
    const res = await fetch("/api/apply-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId })
    })
    const data = await res.json()
    setMsg(data.ok ? "Applied!" : data.error)
    if (data.ok) setApplied([...applied, { jobId }])
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Job Marketplace</h1>
            <ul>
              {jobs.map(job => (
                <li key={job.id} className="mb-4 p-4 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-xs text-gray-600">{job.company} • {job.location}</div>
                    <div className="text-xs text-gray-600">{job.description}</div>
                  </div>
                  <div>
                    {applied.find(a => a.jobId === job.id) ? (
                      <span className="px-2 py-1 bg-green-700 text-white rounded text-xs">Applied</span>
                    ) : (
                      <button
                        className="px-4 py-2 bg-blue-700 text-white rounded"
                        onClick={() => handleApply(job.id)}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {msg && <div className="mt-4 text-green-700">{msg}</div>}
            <div className="mt-8 text-center">
              <a
                href="/alumni"
                className="px-4 py-2 bg-green-700 text-white rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Verified Alumni
              </a>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}