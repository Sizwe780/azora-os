import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string || "test-user-id"
  const notes = await prisma.notification.findMany({ where: { userId } })
  res.status(200).json(notes.map(n => n.message))
}