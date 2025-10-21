import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function FeedbackPage() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ reviewer: "", target: "", role: "employer", feedback: "" })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/feedback")
      .then(res => res.json())
      .then(setReviews)
  }, [submitted])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSubmitted(true)
    setForm({ reviewer: "", target: "", role: "employer", feedback: "" })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Feedback & Reviews</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Your Name/Org</label>
                <input
                  type="text"
                  name="reviewer"
                  value={form.reviewer}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Review Target (Alumni or Employer)</label>
                <input
                  type="text"
                  name="target"
                  value={form.target}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                >
                  <option value="employer">Employer reviewing Alumni</option>
                  <option value="alumni">Alumni reviewing Employer</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Feedback</label>
                <textarea
                  name="feedback"
                  value={form.feedback}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded" type="submit">
                Submit Feedback
              </button>
            </form>
            {submitted && (
              <div className="text-green-700 font-bold mt-4">
                Feedback submitted!
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Reviews</h2>
              <ul>
                {reviews.slice(-10).reverse().map((r, idx) => (
                  <li key={idx} className="mb-2 p-2 bg-white rounded shadow">
                    <span className="font-semibold">{r.role === "employer" ? "Employer" : "Alumni"}:</span>
                    <span className="ml-2">{r.reviewer}</span>
                    <span className="ml-4">Target: {r.target}</span>
                    <span className="ml-4 text-xs text-gray-600">Feedback: {r.feedback}</span>
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