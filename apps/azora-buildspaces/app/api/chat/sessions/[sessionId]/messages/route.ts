import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Constants for agent roles
const AGENT_ROLE_USER = 'user';
const AGENT_ROLE_ASSISTANT = 'assistant';

/**
 * GET /api/chat/sessions/[sessionId]/messages - Get all messages in a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // For now, return BuildSpaceExecution records as messages
    // Since ChatSession model doesn't exist in schema
    const executions = await prisma.buildSpaceExecution.findMany({
      where: {
        specId: sessionId, // Using specId as sessionId for now
      },
      orderBy: { createdAt: 'asc' },
    })

    // Format executions as chat messages
    // Note: User messages are stored with agentName='user' (not the target agent name)
    // This is a limitation of using BuildSpaceExecution for chat storage
    // Consider adding proper ChatSession/ChatMessage models in the future [Target: Q1 2026]
    const messages = executions.map((exec: any) => {
      // User messages have input, assistant messages have output
      const isUserMessage = exec.agentName === AGENT_ROLE_USER;
      const content = isUserMessage ? exec.input : (exec.output || '');
      
      return {
        id: exec.id,
        sessionId: exec.specId || sessionId,
        role: isUserMessage ? AGENT_ROLE_USER : AGENT_ROLE_ASSISTANT,
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
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { role, content, metadata } = body

    if (!role || !content) {
      return NextResponse.json(
        { error: 'role and content are required' },
        { status: 400 }
      )
    }

    if (role !== AGENT_ROLE_USER && role !== AGENT_ROLE_ASSISTANT) {
      return NextResponse.json(
        { error: `role must be "${AGENT_ROLE_USER}" or "${AGENT_ROLE_ASSISTANT}"` },
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
        agentName: role === AGENT_ROLE_USER ? AGENT_ROLE_USER : (metadata?.agent || 'Elara'),
        status: role === AGENT_ROLE_USER ? 'pending' : 'complete',
        input: role === AGENT_ROLE_USER ? content : '',
        output: role === AGENT_ROLE_ASSISTANT ? content : null,
        tokensUsed: metadata?.tokensUsed || 0,
        startedAt: role === AGENT_ROLE_ASSISTANT ? new Date() : null,
        finishedAt: role === AGENT_ROLE_ASSISTANT ? new Date() : null,
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
