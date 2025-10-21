import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function GovernancePage() {
  const [proposals, setProposals] = useState([])
  useEffect(() => {
    fetch("/api/governance").then(res => res.json()).then(setProposals)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Governance Hub</h1>
          <ul>
            {proposals.map(prop => (
              <li key={prop.id} className="mb-4 p-4 bg-white rounded shadow">
                <div className="font-semibold">{prop.title}</div>
                <div className="text-gray-700">{prop.description}</div>
                <div className="text-xs text-gray-600">Votes: {prop.votes}</div>
                <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Vote</button>
              </li>
            ))}
          </ul>
        </MainLayout>
      </div>
    </div>
  )
}