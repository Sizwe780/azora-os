import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const credentialsPath = path.resolve(process.cwd(), "backend/ledger/issued-credentials.json")
const onboardingPath = path.resolve(process.cwd(), "backend/ledger/onboarding.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let alumni: any[] = []
  try {
    let creds: any[] = []
    let onboard: any[] = []
    if (fs.existsSync(credentialsPath)) {
      creds = JSON.parse(fs.readFileSync(credentialsPath, "utf8"))
    }
    if (fs.existsSync(onboardingPath)) {
      onboard = JSON.parse(fs.readFileSync(onboardingPath, "utf8"))
    }
    alumni = creds.map(c => {
      const profile = onboard.find(o => o.name && o.email && o.name.includes(c.studentId))
      return {
        studentId: c.studentId,
        name: profile?.name ?? c.studentId,
        email: profile?.email ?? "",
        programme: c.programme,
        issuedAt: c.issuedAt,
        credentialId: c.id
      }
    })
  } catch {}
  res.status(200).json(alumni)
}