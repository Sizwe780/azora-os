import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const progressPath = path.resolve(process.cwd(), "backend/ledger/pass-exam-progress.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let progressStore: Record<string, any> = {}
  try {
    if (fs.existsSync(progressPath)) {
      progressStore = JSON.parse(fs.readFileSync(progressPath, "utf8"))
    }
  } catch {}
  // Aggregate analytics
  const students = Object.keys(progressStore)
  const totalAttempts = students.length
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          students.reduce((sum, sid) => sum + (progressStore[sid].score ?? 0), 0) / totalAttempts
        )
      : 0
  const mastery =
    totalAttempts > 0
      ? Math.round(
          (students.filter(sid => progressStore[sid].score === 3).length / totalAttempts) * 100
        )
      : 0
  res.status(200).json({
    totalAttempts,
    avgScore,
    masteryPercent: mastery,
    students: students.map(sid => ({
      studentId: sid,
      score: progressStore[sid].score,
      lastAttempt: progressStore[sid].lastAttempt
    }))
  })
}