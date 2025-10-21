import { useState } from "react"

export default function CreateAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch("/api/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    setMsg(data.ok ? "Admin created!" : data.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-96" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6">Create Admin User</h1>
        <input
          type="email"
          placeholder="Admin Email"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded w-full" type="submit">
          Create Admin
        </button>
        {msg && <div className="mt-4 text-red-700 text-center">{msg}</div>}
      </form>
    </div>
  )
}