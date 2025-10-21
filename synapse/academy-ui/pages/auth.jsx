import { useState } from "react"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")
  const [msg, setMsg] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action: mode })
    })
    const data = await res.json()
    setMsg(data.ok ? "Success!" : data.error)
    if (data.ok && mode === "login") window.location.href = "/dashboard"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-96" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6">{mode === "login" ? "Login" : "Register"}</h1>
        <input
          type="email"
          placeholder="Email"
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
          {mode === "login" ? "Login" : "Register"}
        </button>
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-blue-700 underline"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setMsg("") }}
          >
            {mode === "login" ? "Create account" : "Back to login"}
          </button>
        </div>
        {msg && <div className="mt-4 text-red-700 text-center">{msg}</div>}
      </form>
    </div>
  )
}