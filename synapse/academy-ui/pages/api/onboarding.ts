import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const onboardingPath = path.resolve(process.cwd(), "backend/ledger/onboarding.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    let store: any[] = []
    try {
      if (fs.existsSync(onboardingPath)) {
        store = JSON.parse(fs.readFileSync(onboardingPath, "utf8"))
      }
    } catch {}
    store.push({ ...req.body, timestamp: Date.now() })
    fs.writeFileSync(onboardingPath, JSON.stringify(store, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}