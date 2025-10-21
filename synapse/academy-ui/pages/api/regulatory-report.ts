import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const blockchainPath = path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json")

function generateTemplate(events: any[]): string {
  // Example: POPIA/ISO/CHE template
  return [
    "Event Type,Timestamp,Key,Details",
    ...events.map(e =>
      [
        e.type,
        e.timestamp ? new Date(e.timestamp).toISOString() : "",
        e.key ?? "",
        JSON.stringify(e.payload ?? e.details ?? {})
      ].map(v => `"${v.replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n")
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (fs.existsSync(blockchainPath)) {
      const chain = JSON.parse(fs.readFileSync(blockchainPath, "utf8"))
      const events = chain.chain?.map(b => b.entries).flat() ?? []
      const csv = generateTemplate(events)
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=regulatory-report.csv")
      return res.status(200).send(csv)
    }
    return res.status(404).json({ error: "No data found" })
  } catch (err) {
    return res.status(500).json({ error: "Export failed" })
  }
}