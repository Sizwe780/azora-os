import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const prompt = `Analyze the following React component code for WCAG 2.2 accessibility compliance.
Identify any issues such as missing aria attributes, poor contrast, missing alt text, keyboard navigation issues, etc.
Return the results as a JSON array of objects, where each object has:
- "rule": The name of the accessibility rule violated.
- "description": A brief description of the issue.
- "suggestion": A code snippet showing how to fix it.

If there are no issues, return an empty array [].

Code:
${code}
`

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      system: 'You are an expert accessibility auditor. Only output valid JSON. Do not include markdown formatting like \`\`\`json.',
    })

    // Strip markdown code blocks if present
    const cleanText = text.replace(/^```[\w]*\n/m, '').replace(/\n```$/m, '')
    
    let results = []
    try {
      results = JSON.parse(cleanText)
    } catch (e) {
      console.error('Failed to parse a11y results:', cleanText)
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('A11y check error:', error)
    return NextResponse.json({ error: error.message || 'Failed to check accessibility' }, { status: 500 })
  }
}
