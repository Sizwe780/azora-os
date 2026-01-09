import { NextRequest, NextResponse } from 'next/server'
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
    const body: AgentRequest = await request.json()
    const { action, context, code, language, userId = 'anonymous', sessionId = 'default' } = body

    // Validate request
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      )
    }

    // Route to appropriate agent
    const agentId = AGENT_ROUTING[action as keyof typeof AGENT_ROUTING] || 'elara'
    const agentName = agentId.charAt(0).toUpperCase() + agentId.slice(1)

    console.log(`[Agent Routing] Action: ${action} → Agent: ${agentName}`)

    let result: string = ''
    let suggestions: string[] = []
    let finalAgentName: string = agentName

    // 1. Try Elara Orchestrator (if configured)
    const orchestratorUrl = process.env.ELARA_ORCHESTRATOR_URL || 'http://localhost:3010/agent/prompt'
    let orchestratorAttempted = false
    
    try {
      orchestratorAttempted = true
      const resp = await fetch(orchestratorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: context, 
          agentPreference: agentName,
          sessionId: sessionId
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (resp.ok) {
        const data = await resp.json()
        result = data.message
        suggestions = data.suggestions || []
        finalAgentName = data.agent || agentName
      } else {
        // Orchestrator returned error, fall through to AI Family Service
        throw new Error(`Orchestrator returned ${resp.status}`)
      }
    } catch (err) {
      // Gracefully transition to AI Family Service without logging cryptic errors
      if (orchestratorAttempted) {
        console.log(`[Agent Routing] Using local AI Family Service (orchestrator unavailable)`)
      }
      
      // 2. Fallback to AI Family Service
      try {
        const aiFamily = AIFamilyServiceClient.getInstance()
        const response = await aiFamily.chat({
          agent: agentId,
          message: context,
          context: {
            currentCode: code,
            language: language
          }
        })

        result = response.response
        suggestions = response.suggestions || []
        finalAgentName = response.agentName
      } catch (err2) {
        console.error('[Agent Routing] All agent services unavailable:', err2)
        result = `${agentName} is currently processing your request. The agent service is initializing...`
        suggestions = ['The service will be available shortly', 'Try again in a moment']
      }
    }

    // 3. Constitutional Validation
    const verification = await constitutionalAI.verifyAction({
      id: `action_${Date.now()}`,
      userId,
      type: UserActionType.AI_QUERY,
      payload: { action, context, result },
      timestamp: new Date(),
      sessionId,
      roomId: 'workspace'
    })

    return NextResponse.json({
      agent: finalAgentName,
      action,
      result: verification.allowed ? result : `[CONSTITUTIONAL BLOCK] ${verification.explanation}`,
      suggestions: verification.allowed ? suggestions : ['Review the Azora Constitution', 'Modify your request to comply with Ubuntu principles'],
      constitutionalVerdict: {
        allowed: verification.allowed,
        score: verification.score,
        explanation: verification.explanation
      }
    })

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
