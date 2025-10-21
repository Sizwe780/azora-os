import type { NextApiRequest, NextApiResponse } from "next"
let policiesStore = [
  { id: "policy-1", title: "Privacy Policy", updatedAt: "2025-10-01" },
  { id: "policy-2", title: "Assessment Policy", updatedAt: "2025-09-15" }
]
let auditsStore = [
  { id: "audit-1", title: "CHE Institutional Audit", date: "2025-08-01" },
  { id: "audit-2", title: "SAQA Programme Review", date: "2025-07-15" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ policies: policiesStore, audits: auditsStore })
  res.status(405).json({ error: "Method not allowed" })
}