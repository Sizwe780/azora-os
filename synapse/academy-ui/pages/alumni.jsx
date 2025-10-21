import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AlumniPage() {
  const [alumni, setAlumni] = useState([])

  useEffect(() => {
    fetch("/api/alumni")
      .then(res => res.json())
      .then(setAlumni)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Alumni Showcase</h1>
            <ul>
              {alumni.map(a => (
                <li key={a.studentId} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-gray-600">Programme: {a.programme}</div>
                  <div className="text-xs text-gray-600">Graduated: {new Date(a.issuedAt).toLocaleDateString()}</div>
                  <a
                    href={`/verify-credential?id=${a.credentialId}`}
                    className="mt-2 inline-block text-blue-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verify Credential
                  </a>
                  <a
                    href={`mailto:${a.email}`}
                    className="ml-4 inline-block text-green-700 underline"
                  >
                    Contact
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}