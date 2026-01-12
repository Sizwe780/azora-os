import { agentBridge } from '../../../lib/agent-bridge'

describe('AgentBridge integration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('calls /api/agents/invoke and maps the response', async () => {
    const mockJson = {
      agent: 'Sankofa',
      action: 'code-review',
      result: 'Real AI reply',
      constitutionalVerdict: { allowed: true, score: 98, explanation: 'OK' }
    }

    ;(global as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockJson,
    } as any)

    const response = await agentBridge.sendSignal('Sankofa', 'REVIEW_CODE', { fileContent: 'const a = 1' })

    expect((global as any).fetch).toHaveBeenCalled()
    expect(response.status).toBe('success')
    expect(response.data).toBeDefined()
    expect(response.data?.result).toContain('Real AI reply')
    expect(response.constitutionalCheck.passed).toBe(true)
  })

  it('falls back to simulated response when API fails', async () => {
    ;(global as any).fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'))

    const response = await agentBridge.sendSignal('Sankofa', 'REVIEW_CODE', { fileContent: 'const a = 1' })

    expect((global as any).fetch).toHaveBeenCalled()
    expect(response.status).toBe('success')
    expect(response.data?.metadata?.fallback).toBe(true)
  })

  it('blocks request when constitutional validation fails before calling the server', async () => {
    // spy on validateConstitution to force failure
    const guard = await import('../../../lib/constitutional-guard')
    jest.spyOn(guard, 'validateConstitution').mockReturnValue({
      passed: false,
      violations: [{ message: 'Contains secret key', severity: 'critical' }],
      healthScore: 10,
    } as any)

    const fetchSpy = jest.fn()
    ;(global as any).fetch = fetchSpy

    const response = await agentBridge.sendSignal('Elara', 'REVIEW_CODE', {
      fileContent: 'const SECRET = "top-secret"',
    })

    expect(response.status).toBe('error')
    expect(response.error).toMatch(/Constitutional violation/)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})