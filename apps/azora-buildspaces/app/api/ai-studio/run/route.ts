import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { workflowName, nodes } = body

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: "Invalid nodes" }, { status: 400 })
    }

    const runId = `run-${Date.now()}`
    const startedAt = new Date().toISOString()
    const nodeResults: Record<string, { status: string; output?: string }> = {}

    let currentInput = ""

    // Simple sequential execution for demo purposes
    for (const node of nodes) {
      nodeResults[node.id] = { status: "running" }

      try {
        if (node.type === "input") {
          currentInput = node.config.prompt || "Hello"
          nodeResults[node.id] = { status: "success", output: currentInput }
        } else if (node.type === "llm") {
          const modelName = node.config.model || "gpt-4o-mini"
          const systemPrompt = node.config.system || "You are a helpful assistant."
          
          const { text } = await generateText({
            model: openai(modelName),
            system: systemPrompt,
            prompt: currentInput,
          })
          
          currentInput = text
          nodeResults[node.id] = { status: "success", output: text }
        } else if (node.type === "tool") {
          // Mock tool execution
          currentInput = `[Tool Executed: ${node.config.toolName || "Unknown"}] ${currentInput}`
          nodeResults[node.id] = { status: "success", output: currentInput }
        } else if (node.type === "transform") {
          // Mock transform
          currentInput = currentInput.toUpperCase()
          nodeResults[node.id] = { status: "success", output: currentInput }
        } else if (node.type === "output") {
          nodeResults[node.id] = { status: "success", output: currentInput }
        } else {
          nodeResults[node.id] = { status: "success" }
        }
      } catch (error) {
        console.error(`Error in node ${node.id}:`, error)
        nodeResults[node.id] = { status: "error" }
        break // Stop execution on error
      }
    }

    const duration = (Date.now() - new Date(startedAt).getTime()) / 1000
    const stepsCompleted = Object.values(nodeResults).filter((r) => r.status === "success").length

    const run = {
      id: runId,
      status: stepsCompleted === nodes.length ? "completed" : "failed",
      startedAt,
      duration,
      steps: nodes.length,
      stepsCompleted,
    }

    return NextResponse.json({ run, nodeResults })
  } catch (error) {
    console.error("Workflow run error:", error)
    return NextResponse.json({ error: "Failed to run workflow" }, { status: 500 })
  }
}
