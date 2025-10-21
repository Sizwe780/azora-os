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
    const { email } = req.body
    const idx = store.findIndex(u => u.email === email)
    if (idx !== -1) {
      store[idx].access = "premium"
      fs.writeFileSync(onboardingPath, JSON.stringify(store, null, 2), "utf8")
      return res.status(200).json({ ok: true })
    }
    return res.status(404).json({ error: "User not found" })
  }
  res.status(405).json({ error: "Method not allowed" })
}