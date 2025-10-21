import type { NextApiRequest, NextApiResponse } from "next"
let analyticsStore = {
  activeStudents: 1200,
  credentialsIssued: 350,
  jobPlacements: 75,
  completionRate: 82,
  verificationSuccess: 99
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(analyticsStore)
  res.status(405).json({ error: "Method not allowed" })
}