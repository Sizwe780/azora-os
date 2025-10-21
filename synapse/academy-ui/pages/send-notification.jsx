import { useState } from "react"

export default function SendNotificationPage() {
  const [toEmail, setToEmail] = useState("")
  const [message, setMessage] = useState("")
  const [msg, setMsg] = useState("")

  async function handleSend(e) {
    e.preventDefault()
    const res = await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail, message })
    })
    const data = await res.json()
    setMsg(data.ok ? "Notification sent!" : data.error)
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Send Notification</h1>
      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="Recipient Email"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={toEmail}
          onChange={e => setToEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Message"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded w-full" type="submit">
          Send
        </button>
        {msg && <div className="mt-4 text-green-700 text-center">{msg}</div>}
      </form>
    </div>
  )
}