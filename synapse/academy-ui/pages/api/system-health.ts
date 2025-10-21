import type { NextApiRequest, NextApiResponse } from "next"
import { execSync } from "child_process"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const uptime = execSync("uptime -p").toString().trim()
    const disk = execSync("df -h / | tail -1 | awk '{print $5 \" used of \" $2}'").toString().trim()
    res.status(200).json({ status: "OK", uptime, disk })
  } catch {
    res.status(200).json({ status: "Error", uptime: "", disk: "" })
  }
}