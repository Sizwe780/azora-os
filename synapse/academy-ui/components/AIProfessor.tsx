import { useState } from "react"

export default function AIProfessor({ module, professor }: { module: string, professor: string }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [teaching, setTeaching] = useState(false)
  const [lesson, setLesson] = useState("")

  async function askProfessor() {
    const res = await fetch("/api/ai-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, module, professor }),
    })
    const data = await res.json()
    setAnswer(data.answer)
  }

  async function startTeaching() {
    setTeaching(true)
    const res = await fetch("/api/ai-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: `Teach me ${module} step by step`, module, professor }),
    })
    const data = await res.json()
    setLesson(data.answer)
  }

  return (
    <div className="border p-4 rounded mb-4 bg-yellow-50 shadow">
      <h3 className="font-bold mb-2 text-yellow-700">{professor} (AI Professor)</h3>
      <button
        onClick={startTeaching}
        className="mb-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        disabled={teaching}
      >
        {teaching ? "Teaching..." : `Start Lesson: ${module}`}
      </button>
      {lesson && <div className="mb-4 text-gray-800 whitespace-pre-line">{lesson}</div>}
      <div className="flex mb-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder={`Ask about ${module}...`}
          className="border px-2 py-1 mr-2 flex-1 rounded"
        />
        <button onClick={askProfessor} className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">Ask</button>
      </div>
      {answer && <div className="mt-2 text-gray-700">{answer}</div>}
    </div>
  )
}