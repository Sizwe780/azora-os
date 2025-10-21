import { useEffect, useState } from "react"

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([])
  useEffect(() => {
    fetch("/api/admin-users")
      .then(res => res.json())
      .then(setAdmins)
  }, [])
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Users</h1>
      <ul>
        {admins.map((admin, idx) => (
          <li key={idx} className="mb-2 p-2 bg-gray-100 rounded">
            <span className="font-semibold">{admin.email}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}