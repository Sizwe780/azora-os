import { useEffect, useState } from "react"

export default function Marketplace() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch("/api/marketplace")
      .then(res => res.json())
      .then(setProjects)
  }, [])

  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Student Marketplace</h2>
      <ul>
        {projects.map((p: any) => (
          <li key={p.id} className="mb-4 p-4 bg-white rounded shadow border">
            <div className="font-semibold">{p.title}</div>
            <div className="text-gray-600">{p.description}</div>
            <div className="text-xs text-gray-400">By: {p.author}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}