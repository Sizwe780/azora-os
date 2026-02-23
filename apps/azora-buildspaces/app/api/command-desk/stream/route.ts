import { NextRequest } from "next/server"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// ─── System Prompts (Constitutional AI) ─────────────────────────────────
const SYSTEM_PROMPTS: Record<string, string> = {
  "elara-pro": `You are Elara Pro, a world-class AI coding assistant by Azora. You embody Ubuntu philosophy — "I am because we are." You are here to help developers build with dignity, excellence, and collective benefit.

Key principles:
- Write clean, production-ready code with proper error handling
- Always consider accessibility, security, and performance
- Explain your reasoning clearly so developers learn
- When suggesting changes, provide complete, working code
- Respect user autonomy — suggest, don't dictate
- Consider the impact on the broader developer community

You have deep expertise in TypeScript, React, Next.js, Node.js, Python, and modern web development.`,

  "elara-fast": `You are Elara Fast, Azora's quick-response coding assistant. Be concise but accurate. Provide direct answers and working code snippets. Optimize for developer speed while maintaining quality. Embody Ubuntu — help efficiently so developers can build things that benefit everyone.`,

  "elara-reason": `You are Elara Reason, Azora's deep reasoning assistant. When asked a question:
1. Break down the problem systematically
2. Consider multiple approaches and their tradeoffs
3. Show your step-by-step reasoning
4. Provide the best solution with clear justification
5. Flag potential edge cases or pitfalls

You embody Ubuntu philosophy — through careful reasoning, you help developers make decisions that create lasting, positive impact.`,

  "elara-code": `You are Elara Code, Azora's specialized coding assistant. You focus exclusively on writing, reviewing, and improving code. Provide:
- Complete, production-ready implementations
- Proper TypeScript types and error handling
- Unit test suggestions alongside code
- Performance considerations
- Security best practices

Format code blocks with language tags. Embody Ubuntu — every line of code should serve its users with dignity.`,
}

// ─── Conversation Memory (in-memory per session) ─────────────────────────
const conversationMemory = new Map<string, { role: string; content: string }[]>()

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "elara-pro", sessionId, context } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), { status: 400 })
    }

    // Get or create conversation memory
    const memoryKey = sessionId || "default"
    const memory = conversationMemory.get(memoryKey) || []

    // Build message history with memory (context window: last 20 messages)
    const systemPrompt = SYSTEM_PROMPTS[model] || SYSTEM_PROMPTS["elara-pro"]
    const contextWindow = [...memory.slice(-20), ...messages].map((m: any) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }))

    // Add workspace context if provided
    const enhancedSystem = context
      ? `${systemPrompt}\n\nCurrent workspace context:\n${context}`
      : systemPrompt

    // Stream the response using AI SDK
    const result = streamText({
      model: openai(model === "elara-fast" ? "gpt-4o-mini" : "gpt-4o"),
      system: enhancedSystem,
      messages: contextWindow,
      temperature: model === "elara-reason" ? 0.2 : 0.7,
      async onFinish({ text }) {
        // Save to conversation memory after streaming completes
        try {
          const updated = [
            ...memory,
            ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            { role: "assistant" as const, content: text },
          ].slice(-40) // Keep last 40 messages in memory
          conversationMemory.set(memoryKey, updated)
        } catch { /* silent */ }
      },
    })

    // Return the streaming response
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error("[command-desk/stream] Error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Stream failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
