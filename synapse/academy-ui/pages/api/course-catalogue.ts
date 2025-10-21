import type { NextApiRequest, NextApiResponse } from "next"
let coursesStore = [
  { id: "course-1", title: "Introduction to Programming", description: "Learn the basics of coding.", access: "free" },
  { id: "course-2", title: "Cloud & DevOps Fundamentals", description: "Deploy and manage cloud infrastructure.", access: "free" },
  { id: "course-3", title: "AI Foundations", description: "Master the basics of artificial intelligence.", access: "premium" },
  { id: "course-4", title: "Blockchain & Crypto", description: "Understand distributed ledgers and tokens.", access: "premium" },
  { id: "course-5", title: "Cybersecurity Essentials", description: "Protect systems and data.", access: "free" },
  { id: "course-6", title: "Advanced Data Science", description: "Deep dive into machine learning.", access: "premium" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(coursesStore)
  res.status(405).json({ error: "Method not allowed" })
}