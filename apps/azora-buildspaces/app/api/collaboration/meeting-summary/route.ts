import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, participants } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    const transcript = messages
      .map((m: any) => `[${m.sender || "Unknown"}]: ${m.content}`)
      .join("\n")

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: `You are an AI meeting assistant for Azora Buildspaces. 
Analyze the meeting transcript and extract a structured summary.
Be concise but thorough. Focus on decisions made, action items, and key discussion points.`,
      prompt: `Meeting Transcript:\n${transcript}\n\nParticipants: ${
        Array.isArray(participants) ? participants.join(", ") : "Team"
      }`,
      schema: z.object({
        title: z.string().describe("A concise title for the meeting"),
        summary: z.string().describe("A 2-3 sentence summary of the meeting"),
        keyPoints: z.array(z.string()).describe("Key discussion points"),
        decisions: z.array(z.string()).describe("Decisions that were made"),
        actionItems: z.array(
          z.object({
            task: z.string().describe("What needs to be done"),
            assignee: z.string().describe("Who is responsible"),
            priority: z.enum(["high", "medium", "low"]).describe("Priority level"),
          })
        ).describe("Action items from the meeting"),
        sentiment: z.enum(["positive", "neutral", "negative"]).describe("Overall meeting sentiment"),
        nextSteps: z.string().describe("Suggested next steps"),
      }),
    })

    return NextResponse.json({ summary: object })
  } catch (error) {
    console.error("Meeting summary error:", error)
    return NextResponse.json({ error: "Failed to generate meeting summary" }, { status: 500 })
  }
}
