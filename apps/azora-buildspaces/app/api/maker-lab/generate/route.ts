import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

/**
 * Maker Lab — NL→App Generator (Bolt/v0 parity)
 * POST /api/maker-lab/generate
 *
 * Takes a natural language prompt and generates a complete
 * working application with multiple files. Returns a file tree
 * with content, dependencies, and run instructions.
 *
 * Industry parity: Vercel v0, Bolt.new, Lovable
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, framework, features } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const fw = framework || 'react'

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        projectName: z.string().describe('kebab-case project name'),
        description: z.string().describe('One-sentence description'),
        framework: z.string(),
        files: z.array(
          z.object({
            path: z.string().describe('File path relative to project root'),
            content: z.string().describe('Complete file content'),
            language: z.string().describe('File language/type'),
          }),
        ),
        dependencies: z.record(z.string()).describe('npm dependencies'),
        devDependencies: z.record(z.string()).describe('npm devDependencies'),
        scripts: z.record(z.string()).describe('package.json scripts'),
        setupInstructions: z.array(z.string()).describe('Steps to run the app'),
      }),
      prompt: `Generate a complete, working ${fw} application from this prompt:

"${prompt}"

${features ? `Required features: ${features.join(', ')}` : ''}

Requirements:
- Every file must contain COMPLETE, WORKING code — NO placeholders, NO "TODO" comments
- Use modern best practices (TypeScript, responsive design, accessibility)
- Include proper error handling and loading states
- Include a package.json with all dependencies
- Include all required config files (tsconfig.json, etc.)
- App must work immediately after npm install && npm run dev

Generate ALL files needed for a working app.`,
    })

    return NextResponse.json({
      success: true,
      project: object,
      fileCount: object.files.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[MakerLab:generate] Error:', error)
    return NextResponse.json(
      { error: 'App generation failed' },
      { status: 500 },
    )
  }
}
