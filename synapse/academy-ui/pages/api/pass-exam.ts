import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
import path from "path"
import fs from "fs"

const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

// Load question bank from file if available, else use default
const questionBankPath = path.resolve(process.cwd(), "backend/ledger/exam-question-bank.json")
let examQuestions: Array<{
  id: string
  question: string
  options: string[]
  answer: string
}> = []

try {
  if (fs.existsSync(questionBankPath)) {
    examQuestions = JSON.parse(fs.readFileSync(questionBankPath, "utf8"))
  } else {
    examQuestions = [
      {
        id: "q1",
        question: "What is supervised learning?",
        options: ["Learning without labeled data", "Learning with labeled data", "Learning by reinforcement", "Learning by memorization"],
        answer: "Learning with labeled data"
      },
      {
        id: "q2",
        question: "Which protocol secures data in transit?",
        options: ["HTTP", "FTP", "TLS", "SMTP"],
        answer: "TLS"
      },
      {
        id: "q3",
        question: "What is a blockchain?",
        options: ["A type of database", "A programming language", "A cloud service", "A web browser"],
        answer: "A type of database"
      }
    ]
  }
} catch (err) {
  examQuestions = []
}

// Helper: get student progress
function getStudentProgress(studentId: string) {
  const progressPath = path.resolve(process.cwd(), "backend/ledger/pass-exam-progress.json")
  try {
    if (fs.existsSync(progressPath)) {
      const progressStore = JSON.parse(fs.readFileSync(progressPath, "utf8"))
      return progressStore[studentId] || null
    }
  } catch {}
  return null
}

// Helper: select questions (prioritize missed/weak areas)
function selectQuestions(studentId: string, count = 3) {
  const progress = getStudentProgress(studentId)
  if (!progress || !progress.feedback) return examQuestions.slice(0, count)
  // Prioritize incorrect answers from last attempt
  const missedIds = Object.entries(progress.feedback)
    .filter(([_, v]: any) => !v.correct)
    .map(([qid]) => qid)
  const missedQuestions = examQuestions.filter(q => missedIds.includes(q.id))
  // Fill up with other questions if needed
  const others = examQuestions.filter(q => !missedIds.includes(q.id))
  return [...missedQuestions, ...others].slice(0, count)
}

// Helper: stub for personalized hints
function getHint(questionId: string) {
  const hints: Record<string, string> = {
    q1: "Remember: supervised learning uses labeled data for training.",
    q2: "TLS (Transport Layer Security) is the standard for securing data in transit.",
    q3: "A blockchain is a distributed, append-only database."
  }
  return hints[questionId] || "Review your notes and course materials for this topic."
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const studentId = (req.query.studentId as string) || "anonymous"
    const selectedQuestions = selectQuestions(studentId, 3)
    // Attach hints for each question (premium feature)
    const questionsWithHints = selectedQuestions.map(q => ({
      ...q,
      hint: getHint(q.id)
    }))
    return res.status(200).json(questionsWithHints)
  }
  if (req.method === "POST") {
    const { answers, studentId = "anonymous" } = req.body
    let score = 0
    const feedback: Record<string, { correct: boolean; message: string; hint: string }> = {}
    for (const q of examQuestions) {
      const correct = answers[q.id] === q.answer
      if (correct) score++
      feedback[q.id] = {
        correct,
        message: correct
          ? "Correct! Well done."
          : `Incorrect. The correct answer is: ${q.answer}.`,
        hint: getHint(q.id)
      }
    }

    // Adaptive feedback stub (expand with AI later)
    let adaptiveMessage = "Keep practicing! Review incorrect answers for mastery."
    if (score === examQuestions.length) adaptiveMessage = "Excellent! You're ready for the exam."
    else if (score === 0) adaptiveMessage = "Let's focus on foundational concepts together."

    // Log attempt to blockchain for analytics/compliance
    blockchain.addEntry(`pass-exam-${studentId}-${Date.now()}`, {
      type: "pass-exam-attempt",
      studentId,
      answers,
      score,
      feedback,
      timestamp: Date.now()
    })

    // Track student progress (simple file-based for dev)
    const progressPath = path.resolve(process.cwd(), "backend/ledger/pass-exam-progress.json")
    let progressStore: Record<string, any> = {}
    try {
      if (fs.existsSync(progressPath)) {
        progressStore = JSON.parse(fs.readFileSync(progressPath, "utf8"))
      }
    } catch {}
    progressStore[studentId] = {
      lastAttempt: Date.now(),
      score,
      feedback,
      answers
    }
    fs.writeFileSync(progressPath, JSON.stringify(progressStore, null, 2), "utf8")

    return res.status(200).json({ feedback, score, adaptiveMessage })
  }
  res.status(405).json({ error: "Method not allowed" })
}