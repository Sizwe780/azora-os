import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * GET /api/chat/sessions/[sessionId]/messages - Get all messages in a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    // For now, return BuildSpaceExecution records as messages
    // Since ChatSession model doesn't exist in schema
    const executions = await prisma.buildSpaceExecution.findMany({
      where: {
        specId: sessionId, // Using specId as sessionId for now
      },
      orderBy: { createdAt: 'asc' },
    })

    // Format executions as chat messages
    const messages = executions.map(exec => {
      // User messages have input, assistant messages have output
      const isUserMessage = exec.agentName === 'user';
      const content = isUserMessage ? exec.input : (exec.output || '');
      
      return {
        id: exec.id,
        sessionId: exec.specId || sessionId,
        role: isUserMessage ? 'user' : 'assistant',
        content,
        metadata: {
          agent: exec.agentName,
          status: exec.status,
          tokensUsed: exec.tokensUsed,
        },
        createdAt: exec.createdAt,
      };
    })

    return NextResponse.json({ 
      messages,
      session: { id: sessionId }
    })
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

    // Get current user session
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : 'anonymous'

    // Save to BuildSpaceExecution table for persistence
    const execution = await prisma.buildSpaceExecution.create({
      data: {
        specId: sessionId,
        agentName: role === 'user' ? 'user' : (metadata?.agent || 'Elara'),
        status: role === 'user' ? 'pending' : 'complete',
        input: role === 'user' ? content : '',
        output: role === 'assistant' ? content : null,
        tokensUsed: metadata?.tokensUsed || 0,
        startedAt: role === 'assistant' ? new Date() : null,
        finishedAt: role === 'assistant' ? new Date() : null,
      }
    })

    // Return in chat message format
    const message = {
      id: execution.id,
      sessionId,
      role,
      content,
      metadata: metadata || {},
      createdAt: execution.createdAt,
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    )
  }
}
