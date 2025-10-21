import { useEffect, useState } from "react"

export default function ProfilePage() {
  const [profile, setProfile] = useState({ email: "", name: "" })
  const [name, setName] = useState("")
  const [msg, setMsg] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [emailMsg, setEmailMsg] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [pwMsg, setPwMsg] = useState("")
  const [roleHistory, setRoleHistory] = useState([])
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [notifMsg, setNotifMsg] = useState("")

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        setProfile(data)
        setName(data.name || "")
      })
  }, [])

  useEffect(() => {
    fetch("/api/role-history")
      .then(res => res.json())
      .then(setRoleHistory)
  }, [])

  useEffect(() => {
    fetch("/api/notification-settings")
      .then(res => res.json())
      .then(data => setNotifEnabled(data.enabled))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
    const data = await res.json()
    setMsg(data.ok ? "Profile updated!" : data.error)
    setProfile({ ...profile, name })
  }

  async function handleEmailChange(e) {
    e.preventDefault()
    const res = await fetch("/api/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail })
    })
    const data = await res.json()
    setEmailMsg(data.ok ? "Email updated!" : data.error)
    if (data.ok) setProfile({ ...profile, email: newEmail })
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword })
    })
    const data = await res.json()
    setPwMsg(data.ok ? "Password updated!" : data.error)
    if (data.ok) {
      setOldPassword("")
      setNewPassword("")
    }
  }

  async function handleNotifChange(e) {
    e.preventDefault()
    const res = await fetch("/api/notification-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: notifEnabled })
    })
    const data = await res.json()
    setNotifMsg(data.ok ? "Notification preference updated!" : data.error)
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || profile.email)}`}
        alt="Avatar"
        className="mb-4 rounded-full w-24 h-24 mx-auto"
      />
      <h1 className="text-3xl font-bold mb-6 text-blue-700">My Profile</h1>
      <div className="mb-4"><strong>Email:</strong> {profile.email}</div>
      <form onSubmit={handleSave}>
        <label className="block font-semibold mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full"
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
          Save
        </button>
        {msg && <div className="mt-4 text-green-700">{msg}</div>}
      </form>
      <form onSubmit={handleEmailChange} className="mb-4">
        <label className="block font-semibold mb-1">Change Email</label>
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          className="mb-2 px-4 py-2 border rounded w-full"
          placeholder="New email"
          required
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
          Change Email
        </button>
        {emailMsg && <div className="mt-2 text-green-700">{emailMsg}</div>}
      </form>
      <form onSubmit={handlePasswordChange} className="mb-4">
        <label className="block font-semibold mb-1">Change Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          className="mb-2 px-4 py-2 border rounded w-full"
          placeholder="Current password"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="mb-2 px-4 py-2 border rounded w-full"
          placeholder="New password"
          required
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
          Change Password
        </button>
        {pwMsg && <div className="mt-2 text-green-700">{pwMsg}</div>}
      </form>
      <form onSubmit={handleNotifChange} className="mb-4">
        <label className="block font-semibold mb-1">Notification Preferences</label>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={notifEnabled}
            onChange={e => setNotifEnabled(e.target.checked)}
            className="mr-2"
          />
          Enable notifications
        </label>
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
          Save Preferences
        </button>
        {notifMsg && <div className="mt-2 text-green-700">{notifMsg}</div>}
      </form>
      <div className="mb-4">
        <strong>Role History:</strong>
        <ul>
          {roleHistory.map((h, idx) => (
            <li key={idx} className="text-sm">
              {h.newRole} ({new Date(h.timestamp).toLocaleString()})
            </li>
          ))}
          {roleHistory.length === 0 && <li className="text-sm text-gray-500">No role changes</li>}
        </ul>
      </div>
    </div>
  )
}