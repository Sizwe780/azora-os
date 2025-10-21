import type { NextApiRequest, NextApiResponse } from "next"
let pluginsStore = [
  { id: "plugin-1", name: "LTI 1.3 Integration", type: "External Tool", status: "Active" },
  { id: "plugin-2", name: "Open Badge 3.0", type: "Credential", status: "Active" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(pluginsStore)
  res.status(405).json({ error: "Method not allowed" })
}