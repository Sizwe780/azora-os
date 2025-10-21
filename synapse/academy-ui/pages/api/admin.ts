import type { NextApiRequest, NextApiResponse } from "next"
let cohortsStore = [
  { id: "cohort-1", name: "2025 AI Engineers", year: "2025" },
  { id: "cohort-2", name: "2025 Blockchain Developers", year: "2025" }
]
let credentialsStore = [
  { id: "cred-1", title: "AI Foundations Badge", student: "Student A", issuedAt: "2025-10-21" },
  { id: "cred-2", title: "Blockchain Certificate", student: "Student B", issuedAt: "2025-10-21" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ cohorts: cohortsStore, credentials: credentialsStore })
  res.status(405).json({ error: "Method not allowed" })
}