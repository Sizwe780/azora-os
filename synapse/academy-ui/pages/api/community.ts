import type { NextApiRequest, NextApiResponse } from "next"
let postsStore = [
  { id: "post-1", author: "Student A", content: "How do I prepare for the AI exam?" },
  { id: "post-2", author: "Student B", content: "Looking for a study group for blockchain." }
]
let mentorsStore = [
  { id: "mentor-1", name: "Dr. AI", expertise: "Artificial Intelligence" },
  { id: "mentor-2", name: "Ms. Blockchain", expertise: "Blockchain & Crypto" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ posts: postsStore, mentors: mentorsStore })
  if (req.method === "POST") {
    if (req.body.type === "post") postsStore.push(req.body.data)
    if (req.body.type === "mentor") mentorsStore.push(req.body.data)
    return res.status(201).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}