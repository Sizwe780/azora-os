import { useState } from "react"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  function validate(email, password) {
    if (!email.includes("@")) return "Invalid email address"
    if (password.length < 6) return "Password too short"
    return ""
  }
  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate(email, password)
    if (err) return setError(err)
    setError("")
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: mode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unknown error")
      setMsg(data.ok ? "Success!" : data.error)
      if (data.ok && mode === "login") window.location.href = "/dashboard"
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form aria-label={mode === "login" ? "Login Form" : "Registration Form"} className="bg-white p-8 rounded shadow w-96" onSubmit={handleSubmit}>
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          aria-required="true"
        />
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          aria-required="true"
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
        <div className="mt-4 text-center">
          <a href="/password-reset" className="text-blue-700 underline">Forgot password?</a>
        </div>
        {msg && <div className="mt-4 text-red-700 text-center">{msg}</div>}
        {error && <div className="mt-2 text-red-700 text-center">{error}</div>}
      </form>
    </div>
  )
}