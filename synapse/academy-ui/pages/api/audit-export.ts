import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const blockchainPath = path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json")

function toCSV(data: any[]): string {
  if (!data.length) return ""
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
  )
  return [headers.join(","), ...rows].join("\n")
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (fs.existsSync(blockchainPath)) {
      const chain = JSON.parse(fs.readFileSync(blockchainPath, "utf8"))
      const events = chain.chain?.map(b => b.entries).flat() ?? []
      const csv = toCSV(events)
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=audit-log.csv")
      return res.status(200).send(csv)
    }
    return res.status(404).json({ error: "No audit data found" })
  } catch (err) {
    return res.status(500).json({ error: "Export failed" })
  }
}