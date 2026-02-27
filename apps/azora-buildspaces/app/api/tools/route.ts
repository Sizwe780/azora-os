import { NextResponse } from "next/server"
import { listTools } from "@/lib/agents/tools"

export async function GET() {
  const tools = listTools()
  return NextResponse.json({ tools })
}
