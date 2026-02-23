import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { AIFamilyServiceClient, AgentPersonality } from '@/lib/services/ai-family-client'
import { constitutionalAI, UserActionType } from '@/lib/services/constitutional-ai'

interface AgentRequest {
  action: string
  context: string
  code?: string
  language?: string
  userId?: string
  sessionId?: string
}

interface AgentResponse {
  agent: string
  action: string
  result: string
  suggestions?: string[]
  constitutionalVerdict?: {
    allowed: boolean
    score: number
    explanation: string
  }
}

// Map actions to responsible agents based on BUILDSPACES_CRITICAL_REPOS
const AGENT_ROUTING: Record<string, AgentPersonality> = {
  'code-review': 'sankofa', // Code Architect
  'generate-code': 'sankofa',
  'refactor': 'sankofa',
  'test-generation': 'themba', // Testing Specialist
  'security-review': 'jabari', // Security Expert
  'optimize': 'amara', // Performance Specialist
  'documentation': 'abeni', // Knowledge Manager
}

// POST /api/agents/invoke
export async function POST(request: NextRequest) {
  try {
        // SECURITY: Require authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
    const body: AgentRequest = await request.json()
    const result = await (await import('@/lib/handlers/agent-invoke-handler')).handleAgentInvoke(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Agent Routing] Error:', error)
    return NextResponse.json(
      { error: 'Failed to invoke agent' },
      { status: 500 }
    )
  }
}

// GET /api/agents/list
export async function GET() {
  try {
    const agents = [
      {
        id: 'sankofa',
        name: 'Sankofa',
        title: 'Code Architect',
        capabilities: ['code-review', 'generate-code', 'refactor'],
        status: 'online',
      },
      {
        id: 'themba',
        name: 'Themba',
        title: 'Testing Specialist',
        capabilities: ['test-generation', 'coverage-analysis'],
        status: 'online',
      },
      {
        id: 'jabari',
        name: 'Jabari',
        title: 'Security Expert',
        capabilities: ['security-review', 'vulnerability-scan'],
        status: 'online',
      },
      {
        id: 'nia',
        name: 'Nia',
        title: 'Performance Specialist',
        capabilities: ['optimize', 'profiling'],
        status: 'online',
      },
      {
        id: 'imani',
        name: 'Imani',
        title: 'Knowledge Manager',
        capabilities: ['documentation', 'knowledge-synthesis'],
        status: 'online',
      },
    ]

    return NextResponse.json({ agents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
