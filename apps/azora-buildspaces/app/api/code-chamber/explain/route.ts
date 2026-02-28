import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

/**
 * Code Explanation — Copilot /explain parity
 * POST /api/code-chamber/explain
 *
 * Given a code selection and optional question, returns a structured
 * explanation covering purpose, how it works, key concepts, and
 * potential improvements. Supports any language.
 *
 * Industry parity: GitHub Copilot Chat /explain + Sourcegraph Cody
 */

/** Maximum characters of source code sent to the LLM for analysis */
const MAX_CODE_INPUT_LENGTH = 6000
export async function POST(req: NextRequest) {
  try {
    const { code, language, question } = await req.json()

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: 'Code selection is required' }, { status: 400 })
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        summary: z.string().describe('One-sentence plain-English summary'),
        explanation: z.string().describe('Detailed walk-through of the code'),
        keyConcepts: z
          .array(
            z.object({
              concept: z.string(),
              description: z.string(),
            }),
          )
          .describe('Programming concepts used'),
        complexity: z.object({
          time: z.string().describe('Big-O time complexity if applicable'),
          space: z.string().describe('Big-O space complexity if applicable'),
          readability: z.enum(['simple', 'moderate', 'complex']),
        }),
        improvements: z.array(z.string()).describe('Suggested improvements'),
      }),
      prompt: `Explain the following ${language || 'code'} clearly and thoroughly.

${question ? `User question: ${question}\n` : ''}
\`\`\`${language || ''}
${code.slice(0, MAX_CODE_INPUT_LENGTH)}
\`\`\`

Explain what this code does, how it works, and what concepts it uses.
Be concise yet complete. Use Ubuntu philosophy — help the user learn.`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[CodeChamber:explain] Error:', error)
    return NextResponse.json(
      { error: 'Explanation generation failed' },
      { status: 500 },
    )
  }
}
