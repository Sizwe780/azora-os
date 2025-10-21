import { useState } from "react"

export default function SearchUsersPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])

  async function handleSearch(e) {
    e.preventDefault()
    const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data)
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Search Users</h1>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by email or name"
          className="px-4 py-2 border rounded w-full"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
          Search
        </button>
      </form>
      <ul>
        {results.map((user, idx) => (
          <li key={idx} className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
            <span>{user.email}</span>
            <span className="ml-2 px-2 py-1 rounded text-white text-xs"
              style={{
                backgroundColor:
                  user.role === "admin" ? "#b91c1c" :
                  user.role === "employer" ? "#7c3aed" :
                  user.role === "alumni" ? "#059669" : "#2563eb"
              }}>
              {user.role}
            </span>
            {user.deactivated && (
              <span className="ml-2 px-2 py-1 bg-gray-400 text-white rounded text-xs">Deactivated</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}