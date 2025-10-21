import { useEffect, useState } from "react"

export default function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState(true)
  const [msg, setMsg] = useState("")
  useEffect(() => {
    fetch("/api/notification-settings")
      .then(res => res.json())
      .then(data => setEnabled(data.enabled))
  }, [])
  async function handleSave(e) {
    e.preventDefault()
    const res = await fetch("/api/notification-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled })
    })
    const data = await res.json()
    setMsg(data.ok ? "Settings updated!" : data.error)
  }
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Notification Settings</h1>
      <form onSubmit={handleSave}>
        <label className="block mb-4">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="mr-2"
          />
          Enable notifications
        </label>
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
          Save
        </button>
        {msg && <div className="mt-4 text-green-700">{msg}</div>}
      </form>
    </div>
  )
}