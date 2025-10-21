import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const feedbackPath = path.resolve(process.cwd(), "backend/ledger/feedback.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    let reviews: any[] = []
    try {
      if (fs.existsSync(feedbackPath)) {
        reviews = JSON.parse(fs.readFileSync(feedbackPath, "utf8"))
      }
    } catch {}
    return res.status(200).json(reviews)
  }
  if (req.method === "POST") {
    let reviews: any[] = []
    try {
      if (fs.existsSync(feedbackPath)) {
        reviews = JSON.parse(fs.readFileSync(feedbackPath, "utf8"))
      }
    } catch {}
    const review = { ...req.body, timestamp: Date.now() }
    reviews.push(review)
    fs.writeFileSync(feedbackPath, JSON.stringify(reviews, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}