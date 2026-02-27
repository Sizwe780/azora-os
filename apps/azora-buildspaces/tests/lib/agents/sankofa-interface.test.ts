/**
 * Tests for Sankofa Agent - The Archivist
 */

import { SankofaAgent, getSankofa, findContext, askSankofa } from '../../../lib/agents/sankofa-interface'
import { KnowledgeIndexer } from '../../../lib/knowledge/indexer'

// Mock the indexer
jest.mock('../../../lib/knowledge/indexer', () => {
  const mockChunks = [

    {
      id: 'auth.ts:function:authenticate',
      path: '/src/auth.ts',
      fileName: 'auth.ts',
      type: 'function',
      name: 'authenticate',
      content: 'async function authenticate() { // authentication handled here }',
      language: 'typescript',
      relevanceScore: 0.95
    },
    {
      id: 'auth.ts:function:login',
      path: '/src/auth.ts',
      fileName: 'auth.ts',
      type: 'function',
      name: 'login',
      content: 'async function login(username: string, password: string) { ... }',
      language: 'typescript',
      relevanceScore: 0.9
    },
    {
      id: 'auth.ts:function:logout',
      path: '/src/auth.ts',
      fileName: 'auth.ts',
      type: 'function',
      name: 'logout',
      content: 'function logout() { ... }',
      language: 'typescript',
      relevanceScore: 0.85
    },
    {
      id: 'components/LoginForm.tsx:component:LoginForm',
      path: '/src/components/LoginForm.tsx',
      fileName: 'LoginForm.tsx',
      type: 'component',
      name: 'LoginForm',
      content: 'export default function LoginForm() { ... }',
      language: 'typescript',
      relevanceScore: 0.9
    }
  ]

  return {
    KnowledgeIndexer: jest.fn().mockImplementation(() => ({
      search: jest.fn((query: string, limit: number) => {
        return mockChunks
          .filter(chunk => 
            chunk.name.toLowerCase().includes(query.toLowerCase()) ||
            chunk.content.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, limit)
          .map(chunk => ({
            ...chunk,
            score: 0.9,
            match: {}
          }))
      }),
      getChunksByType: jest.fn((type: string) => {
        return mockChunks.filter(chunk => chunk.type === type)
      }),
      getChunksForFile: jest.fn((path: string) => {
        return mockChunks.filter(chunk => chunk.path === path)
      }),
      getStats: jest.fn(() => ({
        totalFiles: 10,
        totalChunks: 50,
        languages: { typescript: 8, javascript: 2 },
        lastIndexed: new Date()
      }))
    })),
    getKnowledgeIndexer: jest.fn(() => new (require('../../../lib/knowledge/indexer').KnowledgeIndexer)())
  }
})

// Mock agent bridge
jest.mock('../../../lib/agent-bridge', () => ({
  agentBridge: {
    sendSignal: jest.fn(async () => ({
      status: 'success',
      data: { result: 'AI-enhanced response' }
    }))
  }
}))

describe('SankofaAgent', () => {
  let sankofa: SankofaAgent

  beforeEach(() => {
    sankofa = SankofaAgent.getInstance()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SankofaAgent.getInstance()
      const instance2 = SankofaAgent.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should work with getSankofa helper', () => {
      const instance = getSankofa()

      expect(instance).toBe(sankofa)
    })
  })

  describe('findContext', () => {
    it('should find context for a query', async () => {
      const result = await sankofa.findContext({
        query: 'login',
        maxResults: 5
      })

      expect(result).toBeDefined()
      expect(result.chunks).toBeInstanceOf(Array)
      expect(result.query).toBe('login')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should respect maxResults parameter', async () => {
      const result = await sankofa.findContext({
        query: 'login',
        maxResults: 2
      })

      expect(result.chunks.length).toBeLessThanOrEqual(2)
    })

    it('should filter by type when specified', async () => {
      const result = await sankofa.findContext({
        query: 'login',
        filterTypes: ['function']
      })

      result.chunks.forEach(chunk => {
        expect(chunk.type).toBe('function')
      })
    })

    it('should filter by language when specified', async () => {
      const result = await sankofa.findContext({
        query: 'login',
        language: 'typescript'
      })

      result.chunks.forEach(chunk => {
        expect(chunk.language).toBe('typescript')
      })
    })

    it('should return totalFound count', async () => {
      const result = await sankofa.findContext({
        query: 'login'
      })

      expect(result.totalFound).toBeGreaterThanOrEqual(result.chunks.length)
    })
  })

  describe('findByName', () => {
    it('should find code by exact name', async () => {
      const chunks = await sankofa.findByName('login')

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach(chunk => {
        expect(chunk.name.toLowerCase()).toBe('login')
      })
    })

    it('should filter by type when specified', async () => {
      const chunks = await sankofa.findByName('login', 'function')

      chunks.forEach(chunk => {
        expect(chunk.type).toBe('function')
      })
    })

    it('should be case-insensitive', async () => {
      const chunks = await sankofa.findByName('LOGIN')

      expect(chunks.length).toBeGreaterThan(0)
    })
  })

  describe('getFileContext', () => {
    it('should get all chunks for a file', async () => {
      const chunks = await sankofa.getFileContext('/src/auth.ts')

      expect(Array.isArray(chunks)).toBe(true)
      chunks.forEach(chunk => {
        expect(chunk.path).toBe('/src/auth.ts')
      })
    })
  })

  describe('findAllByType', () => {
    it('should find all code of a specific type', async () => {
      const functions = await sankofa.findAllByType('function')

      expect(Array.isArray(functions)).toBe(true)
      functions.forEach(chunk => {
        expect(chunk.type).toBe('function')
      })
    })
  })

  describe('answerQuestion', () => {
    it('should answer a conceptual question', async () => {
      const result = await sankofa.answerQuestion('How does the login work?')

      expect(result).toBeDefined()
      expect(result.chunks).toBeInstanceOf(Array)
      expect(result.query).toBeDefined()
    })

    it('should extract key terms from question', async () => {
      const result = await sankofa.answerQuestion('Where is authentication handled?')

      expect(result).toBeDefined()
      expect(result.chunks.length).toBeGreaterThan(0)
    })
  })

  describe('getSimilarCode', () => {
    it('should find similar code chunks', async () => {
      const referenceChunk = {
        id: 'test.ts:function:test',
        path: '/src/test.ts',
        fileName: 'test.ts',
        type: 'function' as const,
        name: 'testFunction',
        content: 'function testFunction() {}',
        language: 'typescript'
      }

      const similar = await sankofa.getSimilarCode(referenceChunk)

      expect(Array.isArray(similar)).toBe(true)
      // Should not include the original chunk
      similar.forEach(chunk => {
        expect(chunk.id).not.toBe(referenceChunk.id)
      })
    })

    it('should limit results to 5', async () => {
      const referenceChunk = {
        id: 'test.ts:function:test',
        path: '/src/test.ts',
        fileName: 'test.ts',
        type: 'function' as const,
        name: 'login',
        content: 'function login() {}',
        language: 'typescript'
      }

      const similar = await sankofa.getSimilarCode(referenceChunk)

      expect(similar.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getCodebaseStats', () => {
    it('should return codebase statistics', async () => {
      const stats = await sankofa.getCodebaseStats()

      expect(stats).toBeDefined()
      expect(stats.totalFiles).toBeDefined()
      expect(stats.totalChunks).toBeDefined()
      expect(stats.languages).toBeDefined()
      expect(stats.breakdown).toBeDefined()
      expect(stats.breakdown.functions).toBeDefined()
      expect(stats.breakdown.classes).toBeDefined()
      expect(stats.breakdown.components).toBeDefined()
    })
  })

  describe('formatContextForDisplay', () => {
    it('should format context results as markdown', () => {
      const contextResult = {
        chunks: [
          {
            id: 'test:1',
            path: '/src/test.ts',
            fileName: 'test.ts',
            type: 'function' as const,
            name: 'testFunc',
            content: 'function testFunc() {}',
            language: 'typescript',
            lineStart: 10,
            lineEnd: 15
          }
        ],
        totalFound: 1,
        query: 'test',
        timestamp: new Date()
      }

      const formatted = sankofa.formatContextForDisplay(contextResult)

      expect(formatted).toContain('# Search Results')
      expect(formatted).toContain('testFunc')
      expect(formatted).toContain('/src/test.ts')
      expect(formatted).toContain('```typescript')
    })
  })

  describe('buildDependencyGraph', () => {
    it('should return a graph structure', async () => {
      const graph = await sankofa.buildDependencyGraph('/')

      expect(graph).toBeDefined()
      expect(graph.nodes).toBeInstanceOf(Map)
      expect(graph.edges).toBeInstanceOf(Array)
    })
  })
})

describe('helper functions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findContext', () => {
    it('should be a shortcut to sankofa.findContext', async () => {
      const result = await findContext('login', 5)

      expect(result).toBeDefined()
      expect(result.chunks).toBeInstanceOf(Array)
    })
  })

  describe('askSankofa', () => {
    it('should be a shortcut to sankofa.answerQuestion', async () => {
      const result = await askSankofa('How does login work?')

      expect(result).toBeDefined()
      expect(result.chunks).toBeInstanceOf(Array)
    })
  })
})
