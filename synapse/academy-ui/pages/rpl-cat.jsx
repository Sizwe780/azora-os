import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function RPLCATPage() {
  const [portfolio, setPortfolio] = useState([])
  const [creditTransfers, setCreditTransfers] = useState([])
  useEffect(() => {
    fetch("/api/rpl-cat").then(res => res.json()).then(data => {
      setPortfolio(data.portfolio)
      setCreditTransfers(data.creditTransfers)
    })
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">RPL & Credit Transfer</h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Portfolio Evidence</h2>
            <ul>
              {portfolio.map(item => (
                <li key={item.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.date}</div>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">View Evidence</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Credit Transfers</h2>
            <ul>
              {creditTransfers.map(credit => (
                <li key={credit.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{credit.fromInstitution} → {credit.toProgramme}</div>
                  <div className="text-xs text-gray-600">Credits: {credit.credits}</div>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}