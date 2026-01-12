const { handleAgentInvoke } = require('@/lib/handlers/agent-invoke-handler')

jest.mock('@/lib/services/constitutional-ai', () => ({
  constitutionalAI: {
    verifyAction: jest.fn()
  },
  UserActionType: {
    AI_QUERY: 'AI_QUERY'
  }
}))

jest.mock('@/lib/services/ai-family-client', () => ({
  AIFamilyServiceClient: {
    getInstance: () => ({
      chat: jest.fn()
    })
  }
}))

// minimal Request-like object for route
function createReq(body: unknown) {
  return {
    json: async () => body
  } as any
}

const { constitutionalAI } = require('@/lib/services/constitutional-ai')
const { AIFamilyServiceClient } = require('@/lib/services/ai-family-client')

describe('/api/agents/invoke route', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns constitutionalVerdict with allowed=true when verification passes', async () => {
    // Mock AIFamily response
    const chatMock = jest.fn().mockResolvedValue({
      agentId: 'sankofa',
      agentName: 'Sankofa',
      response: 'Review completed',
      suggestions: ['LGTM']
    })
    AIFamilyServiceClient.getInstance = () => ({ chat: chatMock })

    constitutionalAI.verifyAction.mockResolvedValue({
      allowed: true,
      violations: [],
      explanation: 'OK',
      score: 99,
      auditId: 'audit_123'
    })

    const json = await handleAgentInvoke({ action: 'code-review', context: 'Please review this code' })

    expect(json.agent).toBe('Sankofa')
    expect(json.action).toBe('code-review')
    expect(json.constitutionalVerdict).toBeDefined()
    expect(json.constitutionalVerdict.allowed).toBe(true)
    expect(json.result).toBe('Review completed')
  })

  it('blocks and returns a constitutional block when verification disallows', async () => {
    const chatMock = jest.fn().mockResolvedValue({
      agentId: 'sankofa',
      agentName: 'Sankofa',
      response: 'Potentially dangerous code',
      suggestions: []
    })
    AIFamilyServiceClient.getInstance = () => ({ chat: chatMock })

    constitutionalAI.verifyAction.mockResolvedValue({
      allowed: false,
      violations: [
        {
          article: 'ARTICLE_VIII',
          section: '8.1',
          principle: 'Truth Verification',
          severity: 'CRITICAL',
          description: 'Request violates truth policy',
          remediation: ['Do not request disallowed content']
        }
      ],
      explanation: 'Violates truth policy',
      score: 10,
      auditId: 'audit_456'
    })

    const json = await handleAgentInvoke({ action: 'security-review', context: 'Exploit code' })

    expect(json.constitutionalVerdict).toBeDefined()
    expect(json.constitutionalVerdict.allowed).toBe(false)
    expect(json.result).toMatch(/^\[CONSTITUTIONAL BLOCK\]/)
  })
})
