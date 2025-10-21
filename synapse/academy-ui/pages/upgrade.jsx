import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function UpgradePage() {
  const [email, setEmail] = useState("")
  const [upgraded, setUpgraded] = useState(false)

  async function handleUpgrade(e) {
    e.preventDefault()
    await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    setUpgraded(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Upgrade to Premium</h1>
            {!upgraded ? (
              <form onSubmit={handleUpgrade}>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-4 py-2 border rounded w-full"
                    required
                  />
                </div>
                <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded" type="submit">
                  Upgrade Now
                </button>
              </form>
            ) : (
              <div className="text-green-700 font-bold text-lg">
                Upgrade successful! You now have premium access.
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}