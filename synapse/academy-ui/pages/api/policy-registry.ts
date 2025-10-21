import type { NextApiRequest, NextApiResponse } from "next"
let policiesStore = [
  { id: "policy-1", title: "Privacy Policy (POPIA)", updatedAt: "2025-10-01", summary: "How we protect your data and privacy.", link: "/docs/privacy-policy.pdf" },
  { id: "policy-2", title: "Assessment Integrity", updatedAt: "2025-09-15", summary: "Rules for fair and secure assessment.", link: "/docs/assessment-policy.pdf" },
  { id: "policy-3", title: "RPL & CAT Policy", updatedAt: "2025-09-10", summary: "Recognition of prior learning and credit transfer.", link: "/docs/rpl-cat-policy.pdf" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(policiesStore)
  res.status(405).json({ error: "Method not allowed" })
}