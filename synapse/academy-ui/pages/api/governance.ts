import type { NextApiRequest, NextApiResponse } from "next"
let proposalsStore = [
  { id: "prop-1", title: "Add new AI module", description: "Proposal to add advanced AI module to curriculum.", votes: 12 },
  { id: "prop-2", title: "Student Council Elections", description: "Elect new student council members.", votes: 30 }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(proposalsStore)
  if (req.method === "POST") {
    proposalsStore.push(req.body)
    return res.status(201).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}