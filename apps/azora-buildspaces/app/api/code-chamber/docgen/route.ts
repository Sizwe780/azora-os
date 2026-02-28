import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

/**
 * Documentation Generator — Auto-generate JSDoc/TSDoc/docstrings
 * POST /api/code-chamber/docgen
 *
 * Generates comprehensive documentation for code: JSDoc comments,
 * README sections, usage examples, and type descriptions.
 *
 * Industry parity: Mintlify Doc Writer + GitHub Copilot /doc
 */

/** Maximum characters of source code sent to the LLM for analysis */
const MAX_CODE_INPUT_LENGTH = 6000
export async function POST(req: NextRequest) {
  try {
    const { code, language, style } = await req.json()

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const docStyle = style || (language === 'python' ? 'docstring' : 'jsdoc')

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        documentedCode: z.string().describe('The code with inline documentation added'),
        readme: z.string().describe('README.md section documenting this code'),
        usage: z.string().describe('Usage example showing how to call this code'),
        types: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              properties: z.array(
                z.object({
                  name: z.string(),
                  type: z.string(),
                  description: z.string(),
                }),
              ),
            }),
          )
          .describe('Type/interface documentation'),
      }),
      prompt: `Generate ${docStyle} documentation for the following ${language || 'typescript'} code.

\`\`\`${language || 'typescript'}
${code.slice(0, MAX_CODE_INPUT_LENGTH)}
\`\`\`

Generate:
1. The code with complete inline documentation (${docStyle} style)
2. A README.md section describing the API
3. A usage example
4. Type/interface documentation

Documentation should be precise, follow ${docStyle} conventions, and include @param, @returns, @throws, @example where appropriate.`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[CodeChamber:docgen] Error:', error)
    return NextResponse.json(
      { error: 'Documentation generation failed' },
      { status: 500 },
    )
  }
}
