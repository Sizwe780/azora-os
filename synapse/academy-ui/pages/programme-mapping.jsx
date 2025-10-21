import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function ProgrammeMappingPage() {
  const [programmes, setProgrammes] = useState([])
  useEffect(() => {
    fetch("/api/programme-mapping").then(res => res.json()).then(setProgrammes)
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Programme NQF/HEQSF Mapping</h1>
          <ul>
            {programmes.map(prog => (
              <li key={prog.id} className="mb-4 p-4 bg-white rounded shadow">
                <div className="font-semibold">{prog.title}</div>
                <div className="text-xs text-gray-600">
                  NQF Level: {prog.nqfLevel} • Credits: {prog.credits} • HEQSF Category: {prog.heqsfCategory}
                </div>
              </li>
            ))}
          </ul>
        </MainLayout>
      </div>
    </div>
  )
}