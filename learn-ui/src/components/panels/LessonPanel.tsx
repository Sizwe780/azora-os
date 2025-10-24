import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'

interface LessonPanelProps {
  courseId: string
  userId: string
  onBack: () => void
}

interface Module {
  id: string
  title: string
  order_index: number
}

interface Lesson {
  id: string
  title: string
  content: string
  video_url?: string
  order_index: number
}

interface Quiz {
  id: string
  question: string
  options: string[]
  correct_answer: string
}

export function LessonPanel({ courseId, userId, onBack }: LessonPanelProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [quizResult, setQuizResult] = useState<string>('')

  useEffect(() => {
    fetchModules()
  }, [courseId])

  useEffect(() => {
    if (selectedModule) {
      fetchLessons(selectedModule.id)
    }
  }, [selectedModule])

  useEffect(() => {
    if (selectedLesson) {
      fetchQuizzes(selectedLesson.id)
    }
  }, [selectedLesson])

  const fetchModules = async () => {
    try {
      const response = await fetch(`http://localhost:4500/api/courses/${courseId}/modules`)
      const data = await response.json()
      setModules(data)
      if (data.length > 0) setSelectedModule(data[0])
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const fetchLessons = async (moduleId: string) => {
    try {
      const response = await fetch(`http://localhost:4500/api/modules/${moduleId}/lessons`)
      const data = await response.json()
      setLessons(data)
      if (data.length > 0) setSelectedLesson(data[0])
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
    }
  }

  const fetchQuizzes = async (lessonId: string) => {
    try {
      const response = await fetch(`http://localhost:4500/api/lessons/${lessonId}/quizzes`)
      const data = await response.json()
      setQuizzes(data)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    }
  }

  const handleLessonComplete = async () => {
    if (!selectedLesson) return
    try {
      await fetch('http://localhost:4500/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId: selectedLesson.id,
          completed: true
        })
      })
      alert('Lesson completed! Earned 0.1 AZR')
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleQuizSubmit = async () => {
    if (!currentQuiz || !selectedLesson) return
    const isCorrect = selectedAnswer === currentQuiz.correct_answer
    setQuizResult(isCorrect ? 'Correct!' : `Incorrect. The answer was ${currentQuiz.correct_answer}`)

    try {
      await fetch('http://localhost:4500/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId: selectedLesson.id,
          completed: true,
          quizScore: isCorrect ? 100 : 0
        })
      })
      if (isCorrect) alert('Quiz passed! Earned 0.5 AZR')
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>
        <h1 className="text-2xl font-bold">Course Content</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Modules</h3>
          <div className="space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module)}
                className={`w-full text-left p-3 rounded-lg border ${selectedModule?.id === module.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {module.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {/* Lessons List */}
          {selectedModule && lessons.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Lessons</h3>
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg border ${selectedLesson?.id === lesson.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {lesson.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedLesson && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">{selectedLesson.title}</h2>
                {selectedLesson.video_url && (
                  <div className="mb-4">
                    <iframe
                      src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-64 rounded-lg"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                <button
                  onClick={handleLessonComplete}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </button>
              </div>

              {/* Quizzes */}
              {quizzes.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quiz</h3>
                  {currentQuiz ? (
                    <div className="space-y-4">
                      <p className="font-medium">{currentQuiz.question}</p>
                      <div className="space-y-2">
                        {currentQuiz.options.map((option, index) => (
                          <label key={index} className="flex items-center">
                            <input
                              type="radio"
                              name="quiz"
                              value={option}
                              checked={selectedAnswer === option}
                              onChange={(e) => setSelectedAnswer(e.target.value)}
                              className="mr-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleQuizSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Submit Answer
                      </button>
                      {quizResult && (
                        <p className={`mt-2 font-medium ${quizResult.startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                          {quizResult}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setCurrentQuiz(quizzes[0])}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}