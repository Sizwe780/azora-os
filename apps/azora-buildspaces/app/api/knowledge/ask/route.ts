import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, context } = body

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Build a context-aware prompt from retrieved documents
    const contextText = Array.isArray(context)
      ? context
          .map(
            (doc: any, i: number) =>
              `[Document ${i + 1}] ${doc.title || doc.name || "Untitled"}\nPath: ${doc.path || "N/A"}\n${doc.content || doc.description || ""}`
          )
          .join("\n\n---\n\n")
      : "No additional context provided."

    const systemPrompt = `You are a knowledgeable codebase assistant called Sankofa, embedded in the Azora Buildspaces Knowledge Ocean.
Your role is to answer questions about the codebase using the retrieved documents as context.

Rules:
- Answer based ONLY on the provided context. If the context doesn't contain enough information, say so.
- Reference specific file paths, function names, and line numbers when possible.
- Provide code examples when relevant.
- Keep answers concise but thorough.
- Format your response with markdown for readability.

Retrieved Documents:
${contextText}`

    const { text, usage } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: question,
    })

    return NextResponse.json({
      answer: text,
      usage: usage
        ? { inputTokens: (usage as any).promptTokens ?? (usage as any).inputTokens, outputTokens: (usage as any).completionTokens ?? (usage as any).outputTokens }
        : undefined,
      sources: Array.isArray(context)
        ? context.map((doc: any) => ({
            title: doc.title || doc.name,
            path: doc.path,
            relevance: doc.relevance || doc.score,
          }))
        : [],
    })
  } catch (error) {
    console.error("RAG Q&A error:", error)
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 })
  }
}
