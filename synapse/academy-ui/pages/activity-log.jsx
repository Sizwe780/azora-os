import { useEffect, useState } from "react"

export default function ActivityLogPage() {
  const [log, setLog] = useState([])
  useEffect(() => {
    fetch("/api/activity-log")
      .then(res => res.json())
      .then(setLog)
  }, [])
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">My Activity Log</h1>
      <ul>
        {log.slice(-50).reverse().map((entry, idx) => (
          <li key={idx} className="mb-2 p-2 bg-gray-100 rounded">
            <span className="font-semibold">{entry.action}</span>
            <span className="ml-4 text-xs text-gray-600">{new Date(entry.timestamp).toLocaleString()}</span>
            <span className="ml-4 text-xs text-gray-600">{entry.details}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}