import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function PassExamPage() {
  const [practiceQuestions, setPracticeQuestions] = useState([])
  const [studentAnswers, setStudentAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [score, setScore] = useState(null)

  useEffect(() => {
    fetch("/api/pass-exam").then(res => res.json()).then(setPracticeQuestions)
  }, [])

  function handleAnswer(qid, answer) {
    setStudentAnswers({ ...studentAnswers, [qid]: answer })
  }

  async function handleSubmit() {
    const res = await fetch("/api/pass-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: studentAnswers })
    })
    const data = await res.json()
    setFeedback(data.feedback)
    setScore(data.score)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Premium: Pass Exam Approach</h1>
          <div className="mb-6 text-gray-700">
            Practice with real exam-style questions, get instant feedback, and targeted teaching to help you pass.
          </div>
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <ul>
              {practiceQuestions.map(q => (
                <li key={q.id} className="mb-6 p-4 bg-white rounded shadow">
                  <div className="font-semibold mb-2">{q.question}</div>
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="block mb-1">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={studentAnswers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}
                  {feedback[q.id] && (
                    <div className={`mt-2 font-semibold ${feedback[q.id].correct ? "text-green-700" : "text-red-700"}`}>
                      {feedback[q.id].message}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button className="mt-4 px-4 py-2 bg-blue-700 text-white rounded" type="submit">
              Submit Answers
            </button>
          </form>
          {score !== null && (
            <div className="mt-6 text-lg font-bold text-green-700">
              Your Score: {score}/{practiceQuestions.length}
            </div>
          )}
        </MainLayout>
      </div>
    </div>
  )
}