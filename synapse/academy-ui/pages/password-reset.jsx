import { useState } from "react"

export default function PasswordResetPage() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState(1)
  const [msg, setMsg] = useState("")

  async function handleRequest(e) {
    e.preventDefault()
    const res = await fetch("/api/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    setMsg(data.ok ? `Reset token: ${data.token}` : data.error)
    if (data.ok) setStep(2)
  }

  async function handleReset(e) {
    e.preventDefault()
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword })
    })
    const data = await res.json()
    setMsg(data.ok ? "Password reset!" : data.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-96" onSubmit={step === 1 ? handleRequest : handleReset}>
        <h1 className="text-2xl font-bold mb-6">Password Reset</h1>
        <input
          type="email"
          placeholder="Email"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Reset Token"
              className="mb-4 px-4 py-2 border rounded w-full"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              className="mb-4 px-4 py-2 border rounded w-full"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </>
        )}
        <button className="px-4 py-2 bg-blue-700 text-white rounded w-full" type="submit">
          {step === 1 ? "Request Reset" : "Reset Password"}
        </button>
        {msg && <div className="mt-4 text-red-700 text-center">{msg}</div>}
      </form>
    </div>
  )
}