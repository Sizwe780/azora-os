import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import crypto from 'crypto'

/**
 * GET /api/chat/sessions - List all chat sessions for the current user
 * GET /api/chat/sessions?aiPersona=elara - Filter by AI persona
 * 
 * Note: Using BuildSpaceExecution as storage since ChatSession model doesn't exist in schema
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const aiPersona = searchParams.get('aiPersona')
    
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : 'anonymous'

    // Get distinct session IDs from BuildSpaceExecution (using specId as sessionId)
    // Note: Filtering by aiPersona will include both user and agent messages
    // The current schema doesn't support proper chat sessions - this is a workaround
    const executions = await prisma.buildSpaceExecution.findMany({
      where: aiPersona ? { agentName: aiPersona } : {},
      select: {
        specId: true,
        agentName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Group by specId to create session-like structure
    const sessionMap = new Map()
    executions.forEach((exec: any) => {
      const specId = exec.specId || 'default-session'
      if (!sessionMap.has(specId)) {
        sessionMap.set(specId, {
          id: specId,
          aiPersona: exec.agentName,
          title: `Chat with ${exec.agentName}`,
          createdAt: exec.createdAt,
          updatedAt: exec.createdAt,
          messages: []
        })
      }
    })

    const sessions = Array.from(sessionMap.values())

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
 * Body: { aiPersona: string, title?: string }
 * 
 * Note: Using BuildSpaceExecution as storage since ChatSession model doesn't exist in schema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aiPersona, title } = body

    if (!aiPersona) {
      return NextResponse.json(
        { error: 'aiPersona is required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : 'anonymous'

    // Generate a cryptographically secure session ID
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`

    // Return a virtual session object
    const virtualSession = {
      id: sessionId,
      userId,
      aiPersona,
      title: title || `Chat with ${aiPersona}`,
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json({ session: virtualSession }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create chat session', details: error.message },
      { status: 500 }
    )
  }
}
