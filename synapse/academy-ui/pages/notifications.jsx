import { useEffect, useState } from "react"

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(setNotifs)
  }, [])
  async function markRead(id) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    setNotifs(notifs.map(n => n.timestamp === id ? { ...n, read: true } : n))
  }
  async function handleDelete(id) {
    await fetch("/api/delete-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    setNotifs(notifs.filter(n => n.timestamp !== id))
  }
  async function markAllRead() {
    for (const n of notifs.filter(n => !n.read)) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.timestamp })
      })
    }
    setNotifs(notifs.map(n => ({ ...n, read: true })))
  }
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Notifications</h1>
      <button
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded"
        onClick={markAllRead}
        disabled={notifs.filter(n => !n.read).length === 0}
      >
        Mark All as Read
      </button>
      <ul>
        {notifs.map((n, idx) => (
          <li key={idx} className={`mb-2 p-2 rounded flex justify-between items-center ${n.read ? "bg-gray-200" : "bg-yellow-100"}`}>
            <span>{n.message}</span>
            {!n.read && (
              <button
                className="ml-4 px-2 py-1 bg-blue-700 text-white rounded text-xs"
                onClick={() => markRead(n.timestamp)}
              >
                Mark as Read
              </button>
            )}
            <button
              className="ml-2 px-2 py-1 bg-red-700 text-white rounded text-xs"
              onClick={() => handleDelete(n.timestamp)}
            >
              Delete
            </button>
            <span className="ml-4 text-xs text-gray-600">{new Date(n.timestamp).toLocaleString()}</span>
          </li>
        ))}
        {notifs.length === 0 && <li className="text-sm text-gray-500">No notifications</li>}
      </ul>
    </div>
  )
}