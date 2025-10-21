import { useState } from "react"

export default function ChangeRolePage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("student")
  const [msg, setMsg] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch("/api/change-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    })
    const data = await res.json()
    setMsg(data.ok ? "Role updated!" : data.error)
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Change User Role</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="User Email"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full"
        >
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
        <button className="px-4 py-2 bg-blue-700 text-white rounded w-full" type="submit">
          Change Role
        </button>
        {msg && <div className="mt-4 text-red-700 text-center">{msg}</div>}
      </form>
    </div>
  )
}