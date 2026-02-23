import { NextResponse } from "next/server"

// In-memory store for demo purposes
let currentWorkflow = {
  name: "Agent Workflow",
  nodes: [
    {
      id: "node-1",
      name: "Input",
      type: "input",
      status: "idle",
      config: { prompt: "Analyze this text" },
    },
    {
      id: "node-2",
      name: "LLM Call",
      type: "llm",
      status: "idle",
      config: { model: "gpt-4o-mini", system: "You are a helpful assistant." },
    },
    {
      id: "node-3",
      name: "Output",
      type: "output",
      status: "idle",
      config: {},
    },
  ],
}

let runs = [
  {
    id: "run-1",
    status: "completed",
    startedAt: new Date(Date.now() - 10000).toISOString(),
    duration: 2.5,
    steps: 3,
    stepsCompleted: 3,
  },
]

let metrics = [
  { label: "Total Runs", value: "1", change: "+1", trend: "up" },
  { label: "Avg Duration", value: "2.5s", change: "-0.5s", trend: "down" },
  { label: "Success Rate", value: "100%", change: "0%", trend: "flat" },
  { label: "Tokens Used", value: "1,240", change: "+1,240", trend: "up" },
]

export async function GET() {
  return NextResponse.json({
    workflow: currentWorkflow,
    runs,
    metrics,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.name && body.nodes) {
      currentWorkflow = {
        name: body.name,
        nodes: body.nodes,
      }
    }
    return NextResponse.json({ success: true, workflow: currentWorkflow })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save workflow" }, { status: 500 })
  }
}
