import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { executeTool, getTool } from "@/lib/agents/tools"
import { runCommand } from "@/lib/runtime/command-runner"
import { fileSystem } from "@/lib/workspace/file-system"

// The AI Studio "run" endpoint used to contain a bunch of hard-coded
// behaviour (previously mocked tool execution/transform logic).  It's now
// backed by a pluggable tool registry so new capabilities can be added
// dynamically without editing this file.
//
// To comply with the Zero-Mock Policy we now perform real actions where
// possible and fall back to a documented TODO for more advanced tooling.
// This keeps the editor interactive while making sure users see genuine
// side effects (running commands, writing files, etc.) rather than fake
// responses.

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
          const toolName = node.config.toolName || ""
          try {
            const result = await executeTool(toolName, currentInput, node.config)
            if (typeof result === 'string') {
              currentInput = result
              nodeResults[node.id] = { status: 'success', output: currentInput }
            } else {
              currentInput = result.output || ''
              nodeResults[node.id] = { status: result.status, output: currentInput }
            }
          } catch (err) {
            currentInput = `[Tool error: ${(err as Error).message}] ${currentInput}`
            nodeResults[node.id] = { status: 'error', output: currentInput }
          }
        } else if (node.type === "transform") {
          // transform nodes are now implemented via the tool registry (see
          // lib/agents/tools).  this keeps the execution model uniform and
          // allows the LLM to discover "transform" as just another skill.
          try {
            const result = await executeTool('transform', currentInput, node.config)
            if (typeof result === 'string') {
              currentInput = result
              nodeResults[node.id] = { status: 'success', output: currentInput }
            } else {
              currentInput = result.output || ''
              nodeResults[node.id] = { status: result.status, output: currentInput }
            }
          } catch (err) {
            currentInput = `[Transform error: ${(err as Error).message}] ${currentInput}`
            nodeResults[node.id] = { status: 'error', output: currentInput }
          }
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
