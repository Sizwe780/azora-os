import type { NextApiRequest, NextApiResponse } from "next"
let incidentsStore = [
  { id: "incident-1", title: "Data Breach Investigation", date: "2025-09-01" },
  { id: "incident-2", title: "Consent Audit", date: "2025-08-15" }
]
let consentsStore = [
  { id: "consent-1", user: "Student A", date: "2025-10-01" },
  { id: "consent-2", user: "Student B", date: "2025-10-02" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ incidents: incidentsStore, consents: consentsStore })
  res.status(405).json({ error: "Method not allowed" })
}