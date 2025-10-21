import { degrees } from "../data/degrees"

export default function Degrees() {
  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Azora Academy Degree Programs</h2>
      <p className="mb-6 text-gray-700">
        Our degree programs are designed to meet and exceed all academic requirements, with full transparency of modules, credits, outcomes, and AI professors. While not yet accredited, they follow DHET/SAQA standards and prepare you for real-world impact.
      </p>
      <ul>
        {degrees.map(degree => (
          <li key={degree.id} className="mb-8 p-6 bg-white rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xl">{degree.title}</span>
              <span className="ml-2 text-green-700 font-bold">NQF Level: {degree.nqfLevel} | Credits: {degree.credits}</span>
            </div>
            <div className="mb-2 text-gray-600">{degree.description}</div>
            <div className="mb-2 text-purple-700">SAQA ID: {degree.saqaId}</div>
            <div className="mb-2">
              <span className="font-semibold">Modules:</span>
              <ul className="list-disc ml-6">
                {degree.modules.map((m, i) => (
                  <li key={i}>
                    <span className="font-bold">{m.code}:</span> {m.title} ({m.credits} credits) — <span className="text-blue-700">{m.professor}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Outcomes:</span>
              <ul className="list-disc ml-6">
                {degree.outcomes.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Requirements:</span>
              <ul className="list-disc ml-6">
                {degree.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}