import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/chat/sessions/[sessionId]/messages - Get all messages in a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages, session })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/sessions/[sessionId]/messages - Add a message to a session
 * Body: { role: 'user' | 'assistant', content: string, metadata?: object }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    const body = await request.json()
    const { role, content, metadata } = body

    if (!role || !content) {
      return NextResponse.json(
        { error: 'role and content are required' },
        { status: 400 }
      )
    }

    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { error: 'role must be "user" or "assistant"' },
        { status: 400 }
      )
    }

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata || {},
      }
    })

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    )
  }
}
