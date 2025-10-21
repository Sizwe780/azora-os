import { useEffect, useState } from "react"

export default function EcosystemStats() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    fetch("/api/pulse")
      .then(res => res.json())
      .then(setStats)
  }, [])

  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Azora Ecosystem Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-6">
          <div className="text-lg font-semibold">Active Users</div>
          <div className="text-2xl text-green-700">{stats.activeUsers ?? "..."}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="text-lg font-semibold">AZR Minted Today</div>
          <div className="text-2xl text-blue-700">{stats.azrMintedToday ?? "..."}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="text-lg font-semibold">Courses Completed</div>
          <div className="text-2xl text-purple-700">{stats.coursesCompleted ?? "..."}</div>
        </div>
      </div>
    </main>
  )
}