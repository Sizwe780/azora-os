type Leader = { name: string; azr: number; avatar?: string }
export default function Leaderboard({ leaders }: { leaders: Leader[] }) {
  if (!leaders.length) return null
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-blue-700">Leaderboard</h3>
      <ul>
        {leaders.map((l, i) => (
          <li key={i} className="flex items-center justify-between py-1 border-b">
            <div className="flex items-center gap-2">
              {l.avatar && <img src={l.avatar} alt={l.name} className="w-6 h-6 rounded-full" />}
              <span>{i + 1}. {l.name}</span>
            </div>
            <span className="font-bold text-green-700">{l.azr} AZR</span>
          </li>
        ))}
      </ul>
    </section>
  )
}