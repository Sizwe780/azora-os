import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function CertificatesPage() {
  const [certs, setCerts] = useState([])

  useEffect(() => {
    fetch("/api/graduation")
      .then(res => res.json())
      .then(setCerts)
  }, [])

  function handleDownload(cert) {
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${cert.studentId}-${cert.programme}-certificate.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Your Certificates</h1>
            <ul>
              {certs.map(cert => (
                <li key={cert.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">Programme: {cert.programme}</div>
                  <div className="text-xs text-gray-600">Issued: {new Date(cert.issuedAt).toLocaleString()}</div>
                  <button
                    className="mt-2 px-4 py-2 bg-green-700 text-white rounded"
                    onClick={() => handleDownload(cert)}
                  >
                    Download Certificate
                  </button>
                  <a
                    href={`/verify-credential?id=${cert.id}`}
                    className="ml-4 text-blue-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verify
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