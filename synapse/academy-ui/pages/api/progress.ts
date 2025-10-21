import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string || "test-user-id"
  if (req.method === "POST") {
    const { courseId, lessonId } = req.body
    // Mark lesson as completed and increment AZR
    await prisma.studyTask.updateMany({
      where: { userId, title: lessonId },
      data: { done: true }
    })
    await prisma.user.update({
      where: { id: userId },
      data: { azrEarned: { increment: 1 } }
    })
    return res.status(200).json({ ok: true })
  }
  // GET: return progress
  const tasks = await prisma.studyTask.findMany({ where: { userId } })
  res.status(200).json(tasks)
}