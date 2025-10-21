export default function Achievements({ achievements }: { achievements: { title: string; icon: string }[] }) {
  if (!achievements.length) return null
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-green-700">Achievements</h3>
      <ul className="flex flex-wrap gap-3">
        {achievements.map((ach, i) => (
          <li key={i} className="bg-green-100 px-3 py-1 rounded shadow text-green-800 flex items-center gap-2">
            <span>{ach.icon}</span>
            <span>{ach.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}