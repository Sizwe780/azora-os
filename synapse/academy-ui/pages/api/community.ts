import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch forum topics and upcoming events
    const topics = await prisma.forum.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
    const events = await prisma.event.findMany({ orderBy: { date: "asc" }, take: 10 })
    res.status(200).json({ topics, events })
  } else if (req.method === "POST") {
    const { userId, type, title, content, name, details, date } = req.body
    if (type === "topic") {
      const topic = await prisma.forum.create({
        data: { title, content, userId }
      })
      return res.status(201).json(topic)
    }
    if (type === "event") {
      const event = await prisma.event.create({
        data: { name, details, date: new Date(date), userId }
      })
      return res.status(201).json(event)
    }
    return res.status(400).json({ error: "Invalid type" })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}