import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const slotsPath = path.resolve(process.cwd(), "backend/ledger/exam-slots.json")
const bookingsPath = path.resolve(process.cwd(), "backend/ledger/exam-bookings.json")

function getSlots() {
  let slots = [
    { id: "slot-1", time: "2025-11-01 09:00", available: true },
    { id: "slot-2", time: "2025-11-01 13:00", available: true },
    { id: "slot-3", time: "2025-11-02 09:00", available: true }
  ]
  try {
    if (fs.existsSync(slotsPath)) {
      slots = JSON.parse(fs.readFileSync(slotsPath, "utf8"))
    }
  } catch {}
  return slots
}

function saveSlots(slots) {
  fs.writeFileSync(slotsPath, JSON.stringify(slots, null, 2), "utf8")
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(getSlots())
  }
  if (req.method === "POST") {
    const { slot, name, email } = req.body
    let slots = getSlots()
    const slotObj = slots.find(s => s.time === slot)
    if (!slotObj || !slotObj.available) {
      return res.status(400).json({ error: "Slot not available" })
    }
    slotObj.available = false
    saveSlots(slots)
    // Save booking
    let bookings: any[] = []
    try {
      if (fs.existsSync(bookingsPath)) {
        bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"))
      }
    } catch {}
    bookings.push({ slot, name, email, timestamp: Date.now() })
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}