import { useEffect, useState } from "react"

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    fetch("/api/profile?userId=test-user-id")
      .then(res => res.json())
      .then(setProfile)
  }, [])

  if (!profile) return <div>Loading...</div>

  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Your Portfolio</h2>
      <div className="mb-4 font-semibold">Name: {profile.name}</div>
      <div className="mb-4 font-semibold">AZR Earned: {profile.azrEarned}</div>
      <h3 className="font-bold text-lg mb-2 text-green-700">Achievements</h3>
      <ul>
        {profile.achievements.map((a: any) => (
          <li key={a.id} className="mb-2">{a.title} {a.icon}</li>
        ))}
      </ul>
      <h3 className="font-bold text-lg mb-2 text-purple-700">Completed Lessons</h3>
      <ul>
        {profile.studyTasks.filter((t: any) => t.done).map((t: any) => (
          <li key={t.id} className="mb-2">{t.title}</li>
        ))}
      </ul>
    </main>
  )
}