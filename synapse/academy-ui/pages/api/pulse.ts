import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    activeUsers: 1245,
    azrMintedToday: 3200,
    coursesCompleted: 87
  })
}