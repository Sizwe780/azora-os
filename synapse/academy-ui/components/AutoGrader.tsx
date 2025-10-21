import { useState } from "react"

export default function AutoGrader({ courseId, lessonId }: { courseId: string, lessonId: string }) {
  const [submission, setSubmission] = useState("")
  const [grade, setGrade] = useState("")

  async function gradeSubmission() {
    // TODO: Replace with real API call
    setGrade("AutoGrader: Your submission is excellent! (Simulated grade)")
  }

  return (
    <div className="border p-4 rounded mb-4 bg-green-50">
      <h3 className="font-bold mb-2">AutoGrader</h3>
      <textarea
        value={submission}
        onChange={e => setSubmission(e.target.value)}
        placeholder="Paste your answer here..."
        className="border px-2 py-1 w-full mb-2"
        rows={3}
      />
      <button onClick={gradeSubmission} className="bg-green-600 text-white px-3 py-1 rounded">Submit for Grading</button>
      {grade && <div className="mt-2 text-green-700">{grade}</div>}
    </div>
  )
}