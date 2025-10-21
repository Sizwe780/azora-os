import { useState } from "react"
type Question = { q: string; a: string }
export default function AdaptiveQuiz({ questions }: { questions: Question[] }) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState("")
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  function submit() {
    if (input.trim().toLowerCase() === questions[idx].a.trim().toLowerCase()) setScore(s => s + 1)
    setInput("")
    if (idx + 1 < questions.length) setIdx(i => i + 1)
    else setDone(true)
  }
  if (done) return <div className="mb-6 text-green-700 font-bold">Quiz complete! Score: {score}/{questions.length}</div>
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-blue-700">Quiz</h3>
      <div className="mb-2">{questions[idx].q}</div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button onClick={submit} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Submit</button>
    </section>
  )
}