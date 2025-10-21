import type { NextApiRequest, NextApiResponse } from "next"
let jobsStore = [
  { id: "job-1", title: "Junior AI Engineer", company: "Azora Tech", location: "Remote" },
  { id: "job-2", title: "Blockchain Developer", company: "Azora Labs", location: "Cape Town" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(jobsStore)
  if (req.method === "POST") {
    jobsStore.push(req.body)
    return res.status(201).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}