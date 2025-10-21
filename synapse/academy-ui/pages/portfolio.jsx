import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState({ projects: [], credentials: [] })
  useEffect(() => {
    fetch("/api/portfolio").then(res => res.json()).then(setPortfolio)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Your Portfolio</h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Projects</h2>
            <ul>
              {portfolio.projects.map(p => (
                <li key={p.id} className="mb-2 p-2 bg-gray-100 rounded">{p.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Credentials</h2>
            <ul>
              {portfolio.credentials.map(c => (
                <li key={c.id} className="mb-2 p-2 bg-gray-100 rounded">{c.title}</li>
              ))}
            </ul>
          </div>
          <button className="mt-6 px-4 py-2 bg-blue-700 text-white rounded">Export Résumé</button>
        </MainLayout>
      </div>
    </div>
  )
}