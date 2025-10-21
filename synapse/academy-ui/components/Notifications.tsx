import { useState } from "react"

export default function Notifications({ notes }: { notes: string[] }) {
  const [visible, setVisible] = useState(notes)
  function dismiss(idx: number) {
    setVisible(list => list.filter((_, i) => i !== idx))
  }
  if (!visible.length) return null
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-purple-700">Notifications</h3>
      <ul>
        {visible.map((n, i) => (
          <li key={i} className="bg-purple-50 px-3 py-2 rounded mb-2 text-purple-800 flex justify-between items-center">
            <span>{n}</span>
            <button
              onClick={() => dismiss(i)}
              className="ml-2 px-2 py-1 bg-purple-200 rounded hover:bg-purple-300"
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}