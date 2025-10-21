import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get top 10 users by AZR earned
  const leaders = await prisma.user.findMany({
    orderBy: { azrEarned: "desc" },
    take: 10,
    select: { name: true, azrEarned: true }
  })
  // Rename azrEarned to azr for frontend compatibility
  res.status(200).json(leaders.map(l => ({ name: l.name, azr: l.azrEarned })))
}