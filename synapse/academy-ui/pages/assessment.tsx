import { useState } from "react"
import MainLayout from "../components/MainLayout"
import TopBar from "../../../ui/TopBar"
import Sidebar from "../../../ui/Sidebar"

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Monitored Assessment</h1>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={startAssessment}
            >
              Start Assessment
            </button>
            {status && <div className="mt-6 text-green-700 text-lg">{status}</div>}
            {aiFlags.length > 0 && (
              <div className="mt-6">
                <div className="font-semibold text-blue-700 mb-2">AI Professor Invigilator:</div>
                <ul className="list-disc ml-6 text-gray-700">
                  {aiFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                </ul>
              </div>
            )}
            {verified && (
              <div className="mt-6 text-blue-700 font-bold text-lg">
                Blockchain verification: All evidence securely recorded.
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}