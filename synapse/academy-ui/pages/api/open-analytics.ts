import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const onboardingPath = path.resolve(process.cwd(), "backend/ledger/onboarding.json")
const progressPath = path.resolve(process.cwd(), "backend/ledger/pass-exam-progress.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let users: any[] = []
  let progress: Record<string, any> = {}
  try {
    if (fs.existsSync(onboardingPath)) {
      users = JSON.parse(fs.readFileSync(onboardingPath, "utf8"))
    }
    if (fs.existsSync(progressPath)) {
      progress = JSON.parse(fs.readFileSync(progressPath, "utf8"))
    }
  } catch {}
  const totalUsers = users.length
  const freeUsers = users.filter(u => u.access === "free").length
  const premiumUsers = users.filter(u => u.access === "premium").length
  const avgScore =
    totalUsers > 0
      ? Math.round(
          Object.values(progress).reduce((sum: number, p: any) => sum + (p.score ?? 0), 0) / totalUsers
        )
      : 0
  res.status(200).json({
    totalUsers,
    freeUsers,
    premiumUsers,
    avgScore,
    users,
    progress
  })
}