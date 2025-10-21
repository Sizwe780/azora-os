import { useEffect, useState } from "react"

export default function Compliance() {
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetch("/api/compliance")
      .then(res => res.json())
      .then(data => setStatus(data.status))
  }, [])

  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Compliance Status</h2>
      <div className="mb-4">{status}</div>
    </main>
  )
}