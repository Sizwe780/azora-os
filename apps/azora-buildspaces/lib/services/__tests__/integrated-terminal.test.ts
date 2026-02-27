import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { integratedTerminal } from '../integrated-terminal'
import { constitutionalAI } from '../constitutional-ai'

describe('IntegratedTerminal constitutional gating', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should execute command when constitutional verification allows', async () => {
    const userId = 'test_user'
    const sessionId = `sess_${Date.now()}`

    // Create session
    await integratedTerminal.createSession({ 
      id: sessionId, 
      containerId: 'cont1', 
      userId, 
      shell: 'bash',
      dimensions: { rows: 24, cols: 80 }
    })

    // Mock verification to allow
    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({
      allowed: true,
      violations: [],
      explanation: 'Action approved with constitutional compliance score of 100%.',
      score: 100,
      auditId: 'audit_allow'
    } as any)

    const res = await integratedTerminal.executeCommand(sessionId, 'ls', userId)

    expect(res.command).toBe('ls')
    expect(res.userId).toBe(userId)
  })

  it('should block command when constitutional verification disallows', async () => {
    const userId = 'test_user2'
    const sessionId = `sess_${Date.now()}`

    await integratedTerminal.createSession({ 
      id: sessionId, 
      containerId: 'cont2', 
      userId, 
      shell: 'bash',
      dimensions: { rows: 24, cols: 80 }
    })

    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({
      allowed: false,
      violations: [
        {
          article: 'ARTICLE_VIII',
          section: '8.1',
          principle: 'No Mock Protocol',
          severity: 'CRITICAL',
          description: 'Blocked',
          remediation: ['Remove mock data']
        }
      ],
      explanation: 'Action blocked due to constitutional violations',
      score: 0,
      auditId: 'audit_block'
    } as any)

    await expect(integratedTerminal.executeCommand(sessionId, 'rm -rf /', userId)).rejects.toThrow('Constitutional Violation')
  })
})
