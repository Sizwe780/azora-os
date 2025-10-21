import { useState } from "react"

export default function InteractiveLesson({
  courseId,
  lessonId,
  lessonTitle,
  professor,
  quiz
}: {
  courseId: string
  lessonId: string
  lessonTitle: string
  professor: string
  quiz: { q: string; a: string }[]
}) {
  const [completed, setCompleted] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")

  async function handleComplete() {
    // Call backend to update progress and AZR
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, lessonId })
    })
    if (res.ok) {
      setCompleted(true)
      setProgressMsg("Congrats! Progress saved and AZR earned.")
    } else {
      setProgressMsg("Error saving progress. Please try again.")
    }
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-2 text-blue-700">{lessonTitle}</h2>
      <p className="mb-4 text-gray-700">
        Learn interactively with your AI Professor and test your understanding with a fun quiz!
      </p>
      <button
        onClick={() => setShowQuiz(s => !s)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showQuiz ? "Hide Quiz" : "Take Quiz"}
      </button>
      {showQuiz && quiz.length > 0 && (
        <div className="mb-4">
          {/* You can replace this with your AdaptiveQuiz component */}
          {quiz.map((qz, idx) => (
            <div key={idx} className="mb-2">
              <strong>Q{idx + 1}:</strong> {qz.q}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleComplete}
        disabled={completed}
        className={`px-4 py-2 rounded ${completed ? "bg-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        {completed ? "Lesson Completed!" : "Mark Lesson Complete"}
      </button>
      {progressMsg && <div className="mt-2 text-green-700 font-bold">{progressMsg}</div>}
    </section>
  )
}