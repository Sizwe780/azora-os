import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

const moduleTitles = [
  "AI Foundations", "Machine Learning", "Deep Learning", "Data Science", "Cloud Computing", "DevOps", "Cybersecurity", "Software Engineering", "Blockchain", "IoT",
  "Robotics", "Digital Finance", "Product Design", "UX", "Embedded Systems", "Education Technology", "Ethics", "Statistics", "Programming", "Control Systems",
  "Edge Computing", "Visualization", "Testing", "Incident Response", "Payments", "Regulation", "Portfolio", "Capstone", "Research Methods", "Team Leadership",
  "Project Management", "Mobile Development", "Web Development", "AI Policy", "Big Data", "Natural Language Processing", "Computer Vision", "Reinforcement Learning",
  "Simulation", "Cloud Security", "CI/CD", "Usability", "Assessment", "Personalization", "Mentoring", "Community", "Career", "Marketplace", "Credentialing", "Governance"
]

const lessonData = Array.from({ length: 50 }, (_, i) => ({
  id: `module-${i + 1}`,
  title: `Module ${i + 1}: ${moduleTitles[i]}`,
  content: `This is a deep, interactive lesson on ${moduleTitles[i]}.`,
  quiz: {
    question: `What is a key concept in ${moduleTitles[i]}?`,
    options: [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    answer: i % 4
  }
}))

export default function AIProfessor() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [progress, setProgress] = useState({ completed: [], score: 0 })
  const [aiHint, setAiHint] = useState("")

  async function saveProgressToBackend(newProgress) {
    await fetch("/api/professor-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProgress)
    })
  }

  function handleQuiz(optionIdx) {
    setQuizAnswer(optionIdx)
    const correct = lessonData[currentLesson].quiz.answer === optionIdx
    setFeedback(correct ? "Correct! Well done." : "Incorrect. Let's review together.")
    const newProgress = {
      completed: [...progress.completed, lessonData[currentLesson].id],
      score: progress.score + (correct ? 1 : 0),
      lastLesson: lessonData[currentLesson].id,
      timestamp: Date.now()
    }
    setProgress(newProgress)
    saveProgressToBackend(newProgress)
  }

  function nextLesson() {
    setQuizAnswer(null)
    setFeedback("")
    setAiHint("")
    setCurrentLesson(l => l + 1)
  }

  async function getAIHint() {
    const res = await fetch("/api/ai-hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lessonData[currentLesson].id, studentProgress: progress })
    })
    const data = await res.json()
    setAiHint(data.hint)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">AI Professor: Interactive Lesson</h1>
            <div className="mb-4 font-semibold text-lg text-gray-800">
              Lesson {currentLesson + 1}: {lessonData[currentLesson].title}
            </div>
            <div className="mb-6 text-gray-700">{lessonData[currentLesson].content}</div>
            <div className="mb-4 font-semibold text-blue-700">Quiz:</div>
            <div className="mb-4">{lessonData[currentLesson].quiz.question}</div>
            <ul className="mb-4">
              {lessonData[currentLesson].quiz.options.map((opt, idx) => (
                <li key={idx}>
                  <button
                    className={`px-4 py-2 rounded border mr-2 mb-2 ${quizAnswer === idx ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                    onClick={() => handleQuiz(idx)}
                    disabled={quizAnswer !== null}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
            {feedback && (
              <div className={`mb-4 font-semibold ${feedback.startsWith("Correct") ? "text-green-700" : "text-red-700"}`}>
                {feedback}
              </div>
            )}
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
              onClick={getAIHint}
              disabled={quizAnswer === null}
            >
              Ask AI Professor for a Hint
            </button>
            {aiHint && (
              <div className="mt-4 text-purple-700 font-semibold">
                AI Professor Hint: {aiHint}
              </div>
            )}
            {quizAnswer !== null && currentLesson < lessonData.length - 1 && (
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded mt-2"
                onClick={nextLesson}
              >
                Next Lesson
              </button>
            )}
            {quizAnswer !== null && currentLesson === lessonData.length - 1 && (
              <div className="mt-4 font-bold text-green-700">
                Course complete! Your score: {progress.score}/{lessonData.length}
              </div>
            )}
            <div className="mt-8 text-xs text-gray-500">
              Progress: {progress.completed.length}/{lessonData.length} lessons completed
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}