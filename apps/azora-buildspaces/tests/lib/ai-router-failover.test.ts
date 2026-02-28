/** @jest-environment node */

import { FAILOVER_CHAIN, type AIProvider } from '../../../../packages/shared-api/ai-router'

describe('AI Router Failover Chain', () => {
  it('should define failover chain with correct providers', () => {
    expect(FAILOVER_CHAIN).toBeDefined()
    expect(FAILOVER_CHAIN).toEqual(['openai', 'anthropic', 'groq', 'ollama'])
  })

  it('should have at least 3 providers in the chain', () => {
    expect(FAILOVER_CHAIN.length).toBeGreaterThanOrEqual(3)
  })

  it('should include a free provider (groq) in the chain', () => {
    expect(FAILOVER_CHAIN).toContain('groq')
  })

  it('should include a local provider (ollama) as final fallback', () => {
    expect(FAILOVER_CHAIN[FAILOVER_CHAIN.length - 1]).toBe('ollama')
  })
})
