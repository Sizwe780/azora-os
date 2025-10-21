import { useEffect, useState } from "react"

export default function Community() {
  const [topics, setTopics] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch("/api/community")
      .then(res => res.json())
      .then(data => {
        setTopics(data.topics)
        setEvents(data.events)
      })
  }, [])

  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Community Forum</h2>
      <section className="mb-8">
        <h3 className="font-bold text-lg mb-2 text-purple-700">Latest Topics</h3>
        <ul>
          {topics.map((t: any) => (
            <li key={t.id} className="mb-4 p-4 bg-white rounded shadow border">
              <div className="font-semibold">{t.title}</div>
              <div className="text-gray-600">{t.content}</div>
              <div className="text-xs text-gray-400">Posted: {new Date(t.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-bold text-lg mb-2 text-green-700">Upcoming Events</h3>
        <ul>
          {events.map((e: any) => (
            <li key={e.id} className="mb-4 p-4 bg-green-50 rounded shadow border">
              <div className="font-semibold">{e.name}</div>
              <div className="text-gray-600">{e.details}</div>
              <div className="text-xs text-gray-400">Date: {new Date(e.date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}