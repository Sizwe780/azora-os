import { useEffect, useState } from "react"

export default function AllUsersPage() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch("/api/all-users")
      .then(res => res.json())
      .then(setUsers)
  }, [])
  async function handleDeactivate(email) {
    const res = await fetch("/api/deactivate-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (data.ok) setUsers(users.map(u => u.email === email ? { ...u, deactivated: true } : u))
  }
  async function handleReactivate(email) {
    const res = await fetch("/api/reactivate-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (data.ok) setUsers(users.map(u => u.email === email ? { ...u, deactivated: false } : u))
  }
  async function handleLock(email) {
    const res = await fetch("/api/lock-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (data.ok) setUsers(users.map(u => u.email === email ? { ...u, locked: true } : u))
  }
  async function handleUnlock(email) {
    const res = await fetch("/api/unlock-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (data.ok) setUsers(users.map(u => u.email === email ? { ...u, locked: false } : u))
  }
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">All Users</h1>
      <ul>
        {users.map((user, idx) => (
          <li key={idx} className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
            <span>{user.email}</span>
            <span className="ml-2 px-2 py-1 rounded text-white text-xs"
              style={{
                backgroundColor:
                  user.role === "admin" ? "#b91c1c" :
                  user.role === "employer" ? "#7c3aed" :
                  user.role === "alumni" ? "#059669" : "#2563eb"
              }}>
              {user.role}
            </span>
            {user.deactivated ? (
              <button
                className="ml-4 px-2 py-1 bg-green-700 text-white rounded text-xs"
                onClick={() => handleReactivate(user.email)}
              >
                Reactivate
              </button>
            ) : (
              <button
                className="ml-4 px-2 py-1 bg-red-700 text-white rounded text-xs"
                onClick={() => handleDeactivate(user.email)}
              >
                Deactivate
              </button>
            )}
            {user.locked ? (
              <button
                className="ml-4 px-2 py-1 bg-green-700 text-white rounded text-xs"
                onClick={() => handleUnlock(user.email)}
              >
                Unlock
              </button>
            ) : (
              <button
                className="ml-4 px-2 py-1 bg-yellow-700 text-white rounded text-xs"
                onClick={() => handleLock(user.email)}
              >
                Lock
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}