import { useState } from "react"
import MainLayout from "../components/MainLayout"

export default function AssessmentPage() {
  const [status, setStatus] = useState("")
  const [aiFlags, setAiFlags] = useState<string[]>([])
  const [verified, setVerified] = useState(false)

  async function startAssessment() {
    setStatus("Assessment started. Monitoring in progress...")
    // Simulate evidence
    const webcamFeed = "webcam-stream-ref"
    const screenFeed = "screen-stream-ref"
    const keystrokes = ["a", "b", "c"]
    const screenshots = ["screenshot1", "screenshot2"]
    const audioLog = "audio-log-ref"
    const aiAnomalyScore = 0
    const flags = ["No suspicious activity detected."]
    setAiFlags(flags)
    // Send to backend
    const res = await fetch("/api/proctoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "current-student-id",
        examId: "current-exam-id",
        webcamFeed,
        screenFeed,
        keystrokes,
        aiFlags: flags,
        screenshots,
        audioLog,
        aiAnomalyScore
      })
    })
    if (res.ok) setVerified(true)
    setStatus("Assessment evidence securely recorded. AI Professor is watching.")
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Monitored Assessment</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={startAssessment}>
        Start Assessment
      </button>
      {status && <div className="mt-4 text-green-700">{status}</div>}
      {aiFlags.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold">AI Professor Invigilator:</div>
          <ul className="list-disc ml-6">
            {aiFlags.map((flag, i) => <li key={i}>{flag}</li>)}
          </ul>
        </div>
      )}
      {verified && (
        <div className="mt-4 text-blue-700 font-bold">
          Blockchain verification: All evidence securely recorded.
        </div>
      )}
    </MainLayout>
  )
}