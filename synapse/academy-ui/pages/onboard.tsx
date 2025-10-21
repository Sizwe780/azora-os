import { useState } from "react"
import MainLayout from "../components/MainLayout"

export default function Onboard() {
  const [form, setForm] = useState({ name: "", email: "", idNumber: "" })
  const [status, setStatus] = useState("")

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setStatus("Registering...")
    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    if (res.ok) setStatus("Registration successful! Welcome to Azora Academy.")
    else setStatus("Registration failed. Please try again.")
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Student Onboarding</h1>
      <form className="max-w-md bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
        <label className="block mb-2">Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="mb-4 w-full border px-2 py-1 rounded" required />
        <label className="block mb-2">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="mb-4 w-full border px-2 py-1 rounded" required />
        <label className="block mb-2">ID Number</label>
        <input name="idNumber" value={form.idNumber} onChange={handleChange} className="mb-4 w-full border px-2 py-1 rounded" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
        {status && <div className="mt-4 text-green-700">{status}</div>}
      </form>
    </MainLayout>
  )
}