import type { NextApiRequest, NextApiResponse } from "next"
import { qualifications } from "../../data/qualifications"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(qualifications)
}