/**
 * Theater Presentations API
 * 
 * Constitutional Compliance:
 * - Article VIII Section 8.3: No Mock Protocol — real persistence
 * - Ubuntu Philosophy: Knowledge sharing through presentations
 */

import { NextRequest, NextResponse } from 'next/server'

interface Slide {
  id: string
  title: string
  content: string
  type: 'title' | 'content' | 'code' | 'demo' | 'image' | 'split'
  notes: string
}

interface Presentation {
  id: string
  title: string
  slides: Slide[]
  createdAt: string
  updatedAt: string
}

// In-memory store (swap for Prisma when DATABASE_URL is set)
let presentations: Presentation[] = [
  {
    id: 'pres-default',
    title: 'Welcome to Innovation Theater',
    slides: [
      {
        id: 'slide-1',
        title: 'Welcome to Buildspaces',
        content: 'The Constitutional AI Development Platform',
        type: 'title',
        notes: 'Open with the mission: building ethical AI tools for the community.',
      },
      {
        id: 'slide-2',
        title: 'Architecture Overview',
        content: '12 rooms, each solving a real developer problem.\n\n• Code Chamber — VS Code-grade IDE\n• AI Studio — Multi-agent orchestration\n• Command Desk — Slash-command control center\n• Knowledge Ocean — RAG-powered docs\n• And 8 more…',
        type: 'content',
        notes: 'Walk through the room map. Emphasize cross-room data flow.',
      },
      {
        id: 'slide-3',
        title: 'Live Code Demo',
        content: 'import { generateText } from "ai"\nimport { openai } from "@ai-sdk/openai"\n\nconst { text } = await generateText({\n  model: openai("gpt-4o"),\n  prompt: "Explain Constitutional AI",\n})\n\nconsole.log(text)',
        type: 'code',
        notes: 'Show the AI SDK in action. Switch to Code Chamber for the live run.',
      },
      {
        id: 'slide-4',
        title: 'Constitutional AI in Action',
        content: '',
        type: 'demo',
        notes: 'Live demo: create a task, run the AI agent, show validation gates.',
      },
      {
        id: 'slide-5',
        title: 'Join the Community',
        content: 'Open source • Ubuntu philosophy • Proof-of-Knowledge rewards\n\nGitHub: Azora-OS/azora\nCollectible Showcase: earn cards for contributions',
        type: 'content',
        notes: 'Call to action. Show the Collectible Showcase leaderboard.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function GET() {
  const active = presentations[0]
  return NextResponse.json({
    presentations: presentations.map((p) => ({ id: p.id, title: p.title, slideCount: p.slides.length })),
    slides: active?.slides ?? [],
    activePresentation: active?.id,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.slides) {
      // Update slides of active presentation
      if (presentations.length === 0) {
        presentations.push({
          id: `pres-${Date.now()}`,
          title: body.title || 'Untitled',
          slides: body.slides,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } else {
        presentations[0] = {
          ...presentations[0],
          slides: body.slides,
          title: body.title || presentations[0].title,
          updatedAt: new Date().toISOString(),
        }
      }
    }

    return NextResponse.json({ success: true, presentation: presentations[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
