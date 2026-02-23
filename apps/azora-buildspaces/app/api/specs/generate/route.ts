import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { content, type } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    let prompt = ''
    if (type === 'component') {
      prompt = `Generate a React component based on the following specification. Use Tailwind CSS for styling and Lucide React for icons if needed. Ensure it's a functional component using TypeScript.\n\nSpecification:\n${content}`
    } else if (type === 'api') {
      prompt = `Generate a Next.js API route (App Router) based on the following specification. Use TypeScript.\n\nSpecification:\n${content}`
    } else if (type === 'database') {
      prompt = `Generate a Prisma schema based on the following specification.\n\nSpecification:\n${content}`
    } else if (type === 'workflow') {
      prompt = `Generate a TypeScript class or function that implements the following workflow specification.\n\nSpecification:\n${content}`
    } else if (type === 'feature') {
      prompt = `Generate a comprehensive implementation plan and initial boilerplate code for the following feature specification.\n\nSpecification:\n${content}`
    } else {
      prompt = `Generate code based on the following specification.\n\nSpecification:\n${content}`
    }

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      system: 'You are an expert software engineer. Generate clean, modern, and well-documented code based on the provided specifications. Only output the code, without markdown formatting blocks like ```typescript if possible, or if you do, I will strip them.',
    })

    // Strip markdown code blocks if present
    const cleanText = text.replace(/^```[\w]*\n/m, '').replace(/\n```$/m, '')

    return NextResponse.json({ result: cleanText })
  } catch (error: any) {
    console.error('Spec generation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate code' }, { status: 500 })
  }
}
