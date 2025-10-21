import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function EmployerJobPostPage() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: ""
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch("/api/employer-job-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSubmitted(true)
    setForm({ title: "", company: "", location: "", description: "" })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Post a Job</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded w-full"
                  required
                />
              </div>
              <button className="mt-2 px-4 py-2 bg-blue-700 text-white rounded" type="submit">
                Post Job
              </button>
            </form>
            {submitted && (
              <div className="text-green-700 font-bold mt-4">
                Job posted successfully!
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}