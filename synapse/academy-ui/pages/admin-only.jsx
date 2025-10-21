import { useEffect, useState } from "react"

export default function AdminOnlyPage() {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    fetch("/api/auth-session")
      .then(res => res.json())
      .then(data => setAllowed(data.role === "admin"))
  }, [])
  if (!allowed) return <div className="p-8 text-center text-red-700">Access Denied</div>
  return (
    <div className="p-8 text-center text-green-700">
      Welcome, admin! You have access to this page.
    </div>
  )
}