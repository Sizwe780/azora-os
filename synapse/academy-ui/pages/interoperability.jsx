import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function InteroperabilityPage() {
  const [plugins, setPlugins] = useState([])
  useEffect(() => {
    fetch("/api/interoperability").then(res => res.json()).then(setPlugins)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Interoperability</h1>
          <ul>
            {plugins.map(plugin => (
              <li key={plugin.id} className="mb-4 p-4 bg-white rounded shadow">
                <div className="font-semibold">{plugin.name}</div>
                <div className="text-xs text-gray-600">{plugin.type} • {plugin.status}</div>
                <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Configure</button>
              </li>
            ))}
          </ul>
        </MainLayout>
      </div>
    </div>
  )
}