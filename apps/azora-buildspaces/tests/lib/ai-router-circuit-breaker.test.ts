/** @jest-environment node */

import {
  FAILOVER_CHAIN,
  getProviderHealth,
  resetCircuitBreaker,
  type AIProvider,
} from '../../../../packages/shared-api/ai-router'

describe('AI Router — Circuit Breaker & Health (B6)', () => {
  beforeEach(() => {
    // Reset all circuit breakers before each test
    for (const p of FAILOVER_CHAIN) {
      resetCircuitBreaker(p)
    }
  })

  describe('FAILOVER_CHAIN', () => {
    it('should define failover chain with correct providers', () => {
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

  describe('getProviderHealth', () => {
    it('should return health status for all failover providers', () => {
      const health = getProviderHealth()
      for (const provider of FAILOVER_CHAIN) {
        expect(health[provider]).toBeDefined()
        expect(health[provider].state).toBe('CLOSED')
        expect(health[provider].failures).toBe(0)
      }
    })
  })

  describe('resetCircuitBreaker', () => {
    it('should reset a provider circuit to CLOSED', () => {
      resetCircuitBreaker('openai')
      const health = getProviderHealth()
      expect(health.openai.state).toBe('CLOSED')
      expect(health.openai.failures).toBe(0)
    })
  })
})
