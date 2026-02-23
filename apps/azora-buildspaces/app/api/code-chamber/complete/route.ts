import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Inline AI Code Completion — Cursor/Copilot-style ghost text
 * POST /api/code-chamber/complete
 * 
 * Provides intelligent code completions based on the current
 * cursor context, language, and file. Uses gpt-4o-mini for
 * fast, low-latency inline suggestions.
 */
export async function POST(req: NextRequest) {
  try {
    const { prefix, language, filename } = await req.json()

    if (!prefix || prefix.trim().length < 10) {
      return NextResponse.json({ completion: "" })
    }

    // Use gpt-4o-mini for speed — inline completions need <500ms response
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: 0,
      prompt: `You are an inline code completion engine. Complete the code ONLY — output raw code continuation, no markdown, no explanation, no backticks. Output ONLY the next logical code that would follow. Keep completions short (1-5 lines). If unsure, output nothing.

Language: ${language || "typescript"}
File: ${filename || "unknown"}

Code before cursor:
${prefix.slice(-1500)}

Continue the code:`,
    })

    // Clean the completion — remove any markdown artifacts
    let completion = text.trim()
    if (completion.startsWith("```")) {
      completion = completion.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")
    }

    return NextResponse.json({ completion })
  } catch (error) {
    console.error("Inline completion failed:", error)
    return NextResponse.json({ completion: "" })
  }
}
