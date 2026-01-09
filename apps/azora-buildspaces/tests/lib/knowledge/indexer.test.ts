/**
 * Tests for Knowledge Indexer
 */

import { KnowledgeIndexer, type CodeChunk } from '../../../lib/knowledge/indexer'

// Mock the file system
jest.mock('../../../lib/workspace/file-system', () => ({
  fileSystem: {
    exists: jest.fn(async (path: string) => path === '/test-project'),
    listFiles: jest.fn(async (path: string) => {
      if (path === '/test-project') {
        return [
          {
            path: '/test-project/src',
            name: 'src',
            type: 'directory' as const,
            children: []
          },
          {
            path: '/test-project/README.md',
            name: 'README.md',
            type: 'file' as const
          }
        ]
      }
      if (path === '/test-project/src') {
        return [
          {
            path: '/test-project/src/index.ts',
            name: 'index.ts',
            type: 'file' as const
          },
          {
            path: '/test-project/src/utils.ts',
            name: 'utils.ts',
            type: 'file' as const
          }
        ]
      }
      return []
    }),
    readFile: jest.fn(async (path: string) => {
      if (path === '/test-project/src/index.ts') {
        return `export function greet(name: string): string {
  return \`Hello, \${name}!\`
}

export class User {
  constructor(public name: string) {}
  
  getName() {
    return this.name
  }
}`
      }
      if (path === '/test-project/src/utils.ts') {
        return `export const formatDate = (date: Date): string => {
  return date.toISOString()
}

export interface Config {
  apiKey: string
  endpoint: string
}

export type Status = 'active' | 'inactive'
`
      }
      if (path === '/test-project/README.md') {
        return '# Test Project\n\nThis is a test project.'
      }
      return ''
    })
  }
}))

describe('KnowledgeIndexer', () => {
  let indexer: KnowledgeIndexer

  beforeEach(() => {
    indexer = new KnowledgeIndexer()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('indexProject', () => {
    it('should index a project and return stats', async () => {
      const stats = await indexer.indexProject('/test-project')

      expect(stats.totalFiles).toBeGreaterThan(0)
      expect(stats.totalChunks).toBeGreaterThan(0)
      expect(stats.languages).toBeDefined()
      expect(stats.lastIndexed).toBeInstanceOf(Date)
    })

    it('should handle non-existent root path', async () => {
      const stats = await indexer.indexProject('/non-existent')

      expect(stats.totalFiles).toBe(0)
      expect(stats.totalChunks).toBe(0)
    })

    it('should extract functions from code', async () => {
      await indexer.indexProject('/test-project')

      const functions = indexer.getChunksByType('function')
      expect(functions.length).toBeGreaterThan(0)
      
      const greetFunc = functions.find(f => f.name === 'greet')
      expect(greetFunc).toBeDefined()
      expect(greetFunc?.type).toBe('function')
      expect(greetFunc?.path).toBe('/test-project/src/index.ts')
    })

    it('should extract classes from code', async () => {
      await indexer.indexProject('/test-project')

      const classes = indexer.getChunksByType('class')
      expect(classes.length).toBeGreaterThan(0)
      
      const userClass = classes.find(c => c.name === 'User')
      expect(userClass).toBeDefined()
      expect(userClass?.type).toBe('class')
    })

    it('should extract arrow functions', async () => {
      await indexer.indexProject('/test-project')

      const functions = indexer.getChunksByType('function')
      const formatDateFunc = functions.find(f => f.name === 'formatDate')
      
      expect(formatDateFunc).toBeDefined()
      expect(formatDateFunc?.type).toBe('function')
    })

    it('should extract interfaces', async () => {
      await indexer.indexProject('/test-project')

      const interfaces = indexer.getChunksByType('interface')
      expect(interfaces.length).toBeGreaterThan(0)
      
      const configInterface = interfaces.find(i => i.name === 'Config')
      expect(configInterface).toBeDefined()
      expect(configInterface?.type).toBe('interface')
    })

    it('should extract type aliases', async () => {
      await indexer.indexProject('/test-project')

      const types = indexer.getChunksByType('type')
      expect(types.length).toBeGreaterThan(0)
      
      const statusType = types.find(t => t.name === 'Status')
      expect(statusType).toBeDefined()
      expect(statusType?.type).toBe('type')
    })

    it('should track language statistics', async () => {
      const stats = await indexer.indexProject('/test-project')

      expect(stats.languages.typescript).toBeGreaterThan(0)
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      await indexer.indexProject('/test-project')
    })

    it('should find results by name', () => {
      const results = indexer.search('greet')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toBe('greet')
      expect(results[0].type).toBe('function')
    })

    it('should support fuzzy search', () => {
      const results = indexer.search('gret') // typo

      // Fuzzy matching should still find it
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return results with scores', () => {
      const results = indexer.search('User')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].score).toBeDefined()
      expect(results[0].score).toBeGreaterThan(0)
    })

    it('should limit results', () => {
      const results = indexer.search('function', 2)

      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should return empty array for no matches', () => {
      const results = indexer.search('nonexistentxyz')

      expect(results).toEqual([])
    })
  })

  describe('findContext', () => {
    beforeEach(async () => {
      await indexer.indexProject('/test-project')
    })

    it('should find context for a query', async () => {
      const context = await indexer.findContext('greet', 5)

      expect(Array.isArray(context)).toBe(true)
      expect(context.length).toBeGreaterThan(0)
      expect(context[0]).toHaveProperty('name')
      expect(context[0]).toHaveProperty('content')
    })

    it('should respect maxResults', async () => {
      const context = await indexer.findContext('function', 2)

      expect(context.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getChunksByType', () => {
    beforeEach(async () => {
      await indexer.indexProject('/test-project')
    })

    it('should return chunks of specified type', () => {
      const functions = indexer.getChunksByType('function')
      
      expect(Array.isArray(functions)).toBe(true)
      functions.forEach(chunk => {
        expect(chunk.type).toBe('function')
      })
    })

    it('should return empty array for non-existent type', () => {
      const apis = indexer.getChunksByType('api')
      
      expect(apis).toEqual([])
    })
  })

  describe('getChunksForFile', () => {
    beforeEach(async () => {
      await indexer.indexProject('/test-project')
    })

    it('should return all chunks for a file', () => {
      const chunks = indexer.getChunksForFile('/test-project/src/index.ts')

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach(chunk => {
        expect(chunk.path).toBe('/test-project/src/index.ts')
      })
    })

    it('should return empty array for non-existent file', () => {
      const chunks = indexer.getChunksForFile('/non-existent.ts')

      expect(chunks).toEqual([])
    })
  })

  describe('getStats', () => {
    it('should return statistics', async () => {
      await indexer.indexProject('/test-project')
      const stats = indexer.getStats()

      expect(stats).toHaveProperty('totalFiles')
      expect(stats).toHaveProperty('totalChunks')
      expect(stats).toHaveProperty('languages')
      expect(stats).toHaveProperty('lastIndexed')
      expect(stats.lastIndexed).toBeInstanceOf(Date)
    })
  })
})
