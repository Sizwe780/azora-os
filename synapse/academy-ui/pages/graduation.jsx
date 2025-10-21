import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function GraduationPage() {
  const [form, setForm] = useState({ studentId: "", programme: "" })
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch("/api/graduation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Graduation & Credential Request</h1>
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    className="px-4 py-2 border rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Programme</label>
                  <input
                    type="text"
                    name="programme"
                    value={form.programme}
                    onChange={e => setForm({ ...form, programme: e.target.value })}
                    className="px-4 py-2 border rounded w-full"
                    required
                  />
                </div>
                <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded" type="submit">
                  Request Graduation
                </button>
              </form>
            ) : (
              <div className="text-green-700 font-bold text-lg">
                Graduation request submitted! You will be notified when your credential is issued.
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}