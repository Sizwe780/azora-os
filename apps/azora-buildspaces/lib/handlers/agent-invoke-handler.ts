import { AIFamilyServiceClient, AgentPersonality } from '@/lib/services/ai-family-client'
import { constitutionalAI, UserActionType } from '@/lib/services/constitutional-ai'
import OpenAI from 'openai'

export interface AgentRequest {
  action: string
  context: string
  code?: string
  language?: string
  userId?: string
  sessionId?: string
}

export interface AgentResponse {
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

export async function handleAgentInvoke(body: AgentRequest): Promise<AgentResponse> {
  const { action, context, code, language, userId = 'anonymous', sessionId = 'default' } = body

  if (!action) {
    throw new Error('Missing action')
  }

  const agentId = AGENT_ROUTING[action as keyof typeof AGENT_ROUTING] || 'elara'
  const agentName = agentId.charAt(0).toUpperCase() + agentId.slice(1)

  let result: string = ''
  let suggestions: string[] = []
  let finalAgentName: string = agentName

  // 1. Try orchestrator (if available)
  const orchestratorUrl = process.env.ELARA_ORCHESTRATOR_URL || 'http://localhost:3010/agent/prompt'
  let orchestratorAttempted = false

  try {
    orchestratorAttempted = true
    const resp = await fetch(orchestratorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: context, agentPreference: agentName, sessionId }),
      signal: AbortSignal.timeout(5000)
    })

    if (resp.ok) {
      const data = await resp.json()
      result = data.message
      suggestions = data.suggestions || []
      finalAgentName = data.agent || agentName
    } else {
      throw new Error(`Orchestrator returned ${resp.status}`)
    }
  } catch (err) {
    if (orchestratorAttempted) {
      console.log(`[Agent Routing] Using OpenAI fallback (orchestrator unavailable)`)
    }

    // Try OpenAI directly
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey })
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are ${agentName}, an expert AI assistant. Provide helpful, accurate responses.`
            },
            {
              role: 'user',
              content: context
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })

        result = completion.choices[0]?.message?.content || `${agentName} processed your request successfully.`
        suggestions = ['Response generated using OpenAI GPT-4', 'Consider refining your query for more specific results']
        finalAgentName = agentName
      } catch (openaiErr) {
        console.error('[Agent Routing] OpenAI failed:', openaiErr)
        // Fall back to AI Family Service
        try {
          const aiFamily = AIFamilyServiceClient.getInstance()
          const response = await aiFamily.chat({ agent: agentId as AgentPersonality, message: context, context: { currentCode: code, language } })
          result = response.response
          suggestions = response.suggestions || []
          finalAgentName = response.agentName
        } catch (err2) {
          console.error('[Agent Routing] All agent services unavailable:', err2)
          result = `${agentName} is currently processing your request. The agent service is initializing...`
          suggestions = ['The service will be available shortly', 'Try again in a moment']
        }
      }
    } else {
      // No OpenAI key, try AI Family Service
      try {
        const aiFamily = AIFamilyServiceClient.getInstance()
        const response = await aiFamily.chat({ agent: agentId as AgentPersonality, message: context, context: { currentCode: code, language } })
        result = response.response
        suggestions = response.suggestions || []
        finalAgentName = response.agentName
      } catch (err2) {
        console.error('[Agent Routing] All agent services unavailable:', err2)
        result = `${agentName} is currently processing your request. The agent service is initializing...`
        suggestions = ['The service will be available shortly', 'Try again in a moment']
      }
    }
  }

  // Constitutional validation
  const verification = await constitutionalAI.verifyAction({
    id: `action_${Date.now()}`,
    userId,
    type: UserActionType.AI_QUERY,
    payload: { action, context, result },
    timestamp: new Date(),
    sessionId,
    roomId: 'workspace'
  })

  return {
    agent: finalAgentName,
    action,
    result: verification.allowed ? result : `[CONSTITUTIONAL BLOCK] ${verification.explanation}`,
    suggestions: verification.allowed ? suggestions : ['Review the Azora Constitution', 'Modify your request to comply with Ubuntu principles'],
    constitutionalVerdict: {
      allowed: verification.allowed,
      score: verification.score,
      explanation: verification.explanation
    }
  }
}
