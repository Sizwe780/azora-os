import { useState, useEffect } from "react"

export default function PostJobPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [msg, setMsg] = useState("")
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    fetch("/api/post-job")
      .then(res => res.json())
      .then(setJobs)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch("/api/post-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    })
    const data = await res.json()
    setMsg(data.ok ? "Job posted!" : data.error)
    if (data.ok) setJobs([...jobs, { id: data.jobId, title, description }])
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Post a Job</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Job Description"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded w-full" type="submit">
          Post Job
        </button>
        {msg && <div className="mt-4 text-green-700 text-center">{msg}</div>}
      </form>
      <h2 className="text-xl font-bold mt-8 mb-4">My Posted Jobs</h2>
      <ul>
        {jobs.map((job, idx) => (
          <li key={idx} className="mb-2 p-2 bg-gray-100 rounded">
            <span className="font-semibold">{job.title}</span>
            <span className="ml-2 text-xs text-gray-600">{job.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}