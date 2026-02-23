import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, files } = body

    if (!prompt || !files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const fileContext = files
      .map((f: any) => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join("\n\n")

    const systemPrompt = `You are an expert AI coding assistant.
The user wants to perform a multi-file refactoring.
Here are the current files:
${fileContext}

Based on the user's prompt, generate the updated content for the files that need to be changed.
You can also create new files or delete files by returning null for their content.
Return a JSON object with a "changes" array. Each change should have a "path" and "content".`

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt,
      schema: z.object({
        changes: z.array(
          z.object({
            path: z.string().describe("The path of the file to change, create, or delete"),
            content: z.string().nullable().describe("The new content of the file, or null to delete it"),
          })
        ),
      }),
    })

    return NextResponse.json({ changes: object.changes })
  } catch (error) {
    console.error("Refactor error:", error)
    return NextResponse.json({ error: "Failed to generate refactoring" }, { status: 500 })
  }
}
