/**
 * AI Studio — Current Workflow Route
 *
 * Returns the active workflow definition that the UI should display/edit.
 * Delegates to the parent workflows store so there is a single source of truth.
 */

import { NextResponse } from "next/server"

// Shared in-memory store (mirrors the parent workflows route's state until a DB is wired)
let currentWorkflow = {
  id: "workflow-current",
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
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
  ],
  updatedAt: new Date().toISOString(),
}

export async function GET() {
  return NextResponse.json({ workflow: currentWorkflow })
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    if (body.name) currentWorkflow.name = body.name
    if (Array.isArray(body.nodes)) currentWorkflow.nodes = body.nodes
    if (Array.isArray(body.edges)) currentWorkflow.edges = body.edges
    currentWorkflow.updatedAt = new Date().toISOString()
    return NextResponse.json({ success: true, workflow: currentWorkflow })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update workflow" }, { status: 500 })
  }
}
