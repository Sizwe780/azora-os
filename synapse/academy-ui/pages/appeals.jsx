import { useState, useEffect } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AppealsPage() {
  const [appeals, setAppeals] = useState([])
  const [form, setForm] = useState({ studentId: "", examId: "", reason: "" })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/appeals")
      .then(res => res.json())
      .then(setAppeals)
  }, [submitted])

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch("/api/appeals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSubmitted(true)
    setForm({ studentId: "", examId: "", reason: "" })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Exam Appeals & Moderation</h1>
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
                <label className="block font-semibold mb-1">Exam ID</label>
                <input
                  type="text"
                  name="examId"
                  value={form.examId}
                  onChange={e => setForm({ ...form, examId: e.target.value })}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Reason for Appeal</label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded" type="submit">
                Submit Appeal
              </button>
            </form>
            {submitted && (
              <div className="text-green-700 font-bold mt-4">
                Appeal submitted! You will be notified of the outcome.
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Appeals Submitted</h2>
              <ul>
                {appeals.map(a => (
                  <li key={a.id} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">Student: {a.studentId}</span>
                    <span className="ml-4">Exam: {a.examId}</span>
                    <span className="ml-4 text-xs text-gray-600">Reason: {a.reason}</span>
                    <span className="ml-4 text-xs text-gray-600">Status: {a.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}