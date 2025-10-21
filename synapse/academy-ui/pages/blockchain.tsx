import { useEffect, useState } from "react"
import MainLayout from "../components/MainLayout"

export default function BlockchainPage() {
  const [stats, setStats] = useState<any>({})
  useEffect(() => {
    fetch("/api/blockchain-stats")
      .then(res => res.json())
      .then(setStats)
  }, [])
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Azora Blockchain Status</h1>
      <pre className="bg-white p-6 rounded shadow">{JSON.stringify(stats, null, 2)}</pre>
    </MainLayout>
  )
}