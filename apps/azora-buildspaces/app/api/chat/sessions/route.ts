import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/chat/sessions - List all chat sessions for the current user
 * GET /api/chat/sessions?aiPersona=elara - Filter by AI persona
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const aiPersona = searchParams.get('aiPersona')
    const userId = searchParams.get('userId') || 'default-user' // TODO: Get from auth session

    const whereClause: any = { userId }
    if (aiPersona) {
      whereClause.aiPersona = aiPersona
    }

    const sessions = await prisma.chatSession.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1, // Just get the first message for preview
        }
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/sessions - Create a new chat session
 * Body: { aiPersona: string, title?: string, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aiPersona, title, userId = 'default-user', context } = body

    if (!aiPersona) {
      return NextResponse.json(
        { error: 'aiPersona is required' },
        { status: 400 }
      )
    }

    const session = await prisma.chatSession.create({
      data: {
        userId,
        aiPersona,
        title: title || `Chat with ${aiPersona}`,
        context: context || {},
      }
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create chat session', details: error.message },
      { status: 500 }
    )
  }
}
