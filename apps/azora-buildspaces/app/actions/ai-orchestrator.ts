"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function chat(message: string, context: { activeFile: string; route: string }) {
  try {
    const systemPrompt = `You are Elara, the AI coordinator for BuildSpaces. You help users build software by coordinating between different AI agents and providing guidance.

Current context:
- Active file: ${context.activeFile}
- Route: ${context.route}

Be helpful, concise, and coordinate with the appropriate AI agents when complex tasks are needed.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: message,
      maxOutputTokens: 500,
    })

    return text
  } catch (error) {
    console.error("AI chat error:", error)
    return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
  }
}