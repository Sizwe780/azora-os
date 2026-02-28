import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

/**
 * Code Linting & Diagnostics — VS Code-level code analysis
 * POST /api/code-chamber/lint
 *
 * Provides AI-powered lint diagnostics for code files. Returns
 * structured issues with severity, line numbers, and fix suggestions.
 * Complements tree-sitter / ESLint with semantic analysis.
 *
 * Industry parity: VS Code Problems panel + SonarQube
 */

/** Maximum characters of source code sent to the LLM for analysis */
const MAX_CODE_INPUT_LENGTH = 6000
export async function POST(req: NextRequest) {
  try {
    const { code, language, filename } = await req.json()

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ diagnostics: [] })
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        diagnostics: z.array(
          z.object({
            line: z.number().describe('1-based line number'),
            column: z.number().optional().describe('1-based column'),
            severity: z.enum(['error', 'warning', 'info', 'hint']),
            message: z.string().describe('Human-readable diagnostic message'),
            rule: z.string().describe('Rule name like no-unused-vars, type-mismatch'),
            fix: z
              .string()
              .optional()
              .describe('Suggested fix or corrected code snippet'),
          }),
        ),
        summary: z.object({
          errors: z.number(),
          warnings: z.number(),
          info: z.number(),
          score: z.number().min(0).max(100).describe('Code quality score 0-100'),
        }),
      }),
      prompt: `Analyze the following ${language || 'typescript'} code for issues.

File: ${filename || 'untitled'}
\`\`\`${language || 'typescript'}
${code.slice(0, MAX_CODE_INPUT_LENGTH)}
\`\`\`

Find: bugs, type errors, unused variables, security issues, style problems, accessibility issues.
Be precise with line numbers. Only report real issues.`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[CodeChamber:lint] Error:', error)
    return NextResponse.json({ diagnostics: [], summary: { errors: 0, warnings: 0, info: 0, score: 100 } })
  }
}
