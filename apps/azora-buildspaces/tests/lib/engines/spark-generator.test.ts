/** @jest-environment node */

/**
 * Tests for SparkGenerator Engine
 *
 * The SparkGenerator depends on external services (kwame-scaffolder, file-system,
 * history-manager). We mock those dependencies to test the generator's own logic:
 * - Blueprint creation flow
 * - Scaffold orchestration
 * - Schema generation for DB apps
 * - README generation
 * - Error handling
 */

// --- Mocks must be declared before imports ---

const mockWriteFile = jest.fn().mockResolvedValue(undefined)
const mockMkdir = jest.fn().mockResolvedValue(undefined)

jest.mock('@/lib/workspace/file-system', () => ({
  fileSystem: {
    writeFile: (...args: any[]) => mockWriteFile(...args),
    mkdir: (...args: any[]) => mockMkdir(...args),
    readFile: jest.fn().mockResolvedValue(''),
    readdir: jest.fn().mockResolvedValue([]),
    exists: jest.fn().mockResolvedValue(false),
  },
}))

const mockScaffoldMicroApp = jest.fn()

jest.mock('@/lib/agents/kwame-scaffolder', () => ({
  createKwameScaffolder: () => ({
    scaffoldMicroApp: mockScaffoldMicroApp,
  }),
}))

jest.mock('@/lib/maker/history-manager', () => ({
  getHistoryManager: () => ({
    getLatest: jest.fn().mockReturnValue(null),
  }),
}))

import { SparkGenerator, createSparkGenerator, type ProjectBlueprint } from '@/lib/engines/spark-generator'

describe('SparkGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default: scaffolder returns a successful analysis
    mockScaffoldMicroApp.mockResolvedValue({
      success: true,
      analysis: {
        name: 'test-app',
        features: ['counter'],
        components: ['Button', 'Display'],
        styling: 'tailwind',
        dataModel: {},
      },
    })
  })

  describe('createSparkGenerator factory', () => {
    it('should return a SparkGenerator instance', () => {
      const gen = createSparkGenerator('proj-1')
      expect(gen).toBeInstanceOf(SparkGenerator)
    })
  })

  describe('generate — micro-app mode', () => {
    it('should succeed for a simple micro-app prompt', async () => {
      const gen = new SparkGenerator('test-proj')
      const result = await gen.generate('Build a counter app', 'micro-app')

      expect(result.success).toBe(true)
      expect(result.projectRoot).toBe('/test-proj')
      expect(result.blueprint).toBeDefined()
      expect(result.blueprint.mode).toBe('micro-app')
      expect(result.error).toBeUndefined()
    })

    it('should write a project.json blueprint to VFS', async () => {
      const gen = new SparkGenerator('proj-write')
      await gen.generate('Build a todo list', 'micro-app')

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/proj-write/project.json',
        expect.stringContaining('"name"')
      )
    })

    it('should create the project root directory', async () => {
      const gen = new SparkGenerator('proj-dir')
      await gen.generate('Build something', 'micro-app')

      expect(mockMkdir).toHaveBeenCalledWith('/proj-dir')
    })

    it('should generate a README', async () => {
      const gen = new SparkGenerator('proj-readme')
      await gen.generate('Build a notes app', 'micro-app')

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/proj-readme/README.md',
        expect.stringContaining('Build a notes app')
      )
    })

    it('should include micro-app dependencies in the blueprint', async () => {
      const gen = new SparkGenerator('proj-deps')
      const result = await gen.generate('A react app', 'micro-app')

      expect(result.blueprint.dependencies).toHaveProperty('react')
      expect(result.blueprint.dependencies).toHaveProperty('vite')
      expect(result.blueprint.scripts).toHaveProperty('dev', 'vite')
    })

    it('should collect generation logs', async () => {
      const gen = new SparkGenerator('proj-logs')
      const result = await gen.generate('Build something', 'micro-app')

      expect(result.logs.length).toBeGreaterThan(0)
      const steps = result.logs.map(l => l.step)
      expect(steps).toContain('blueprint')
      expect(steps).toContain('scaffold')
      expect(steps).toContain('readme')
      expect(steps).toContain('complete')
    })
  })

  describe('generate — full-stack mode', () => {
    it('should produce a full-stack blueprint with next.js scripts', async () => {
      const gen = new SparkGenerator('full-proj')
      const result = await gen.generate('Build a blog', 'full-stack')

      expect(result.success).toBe(true)
      expect(result.blueprint.mode).toBe('full-stack')
      expect(result.blueprint.dependencies).toHaveProperty('next')
      expect(result.blueprint.scripts).toHaveProperty('dev', 'next dev')
    })
  })

  describe('generate — with database', () => {
    beforeEach(() => {
      mockScaffoldMicroApp.mockResolvedValue({
        success: true,
        analysis: {
          name: 'db-app',
          features: ['crud'],
          components: ['Form'],
          styling: 'css',
          dataModel: {
            Post: { id: 'string', title: 'string', createdAt: 'date' },
          },
        },
      })
    })

    it('should generate schema when data model is present', async () => {
      const gen = new SparkGenerator('db-proj')
      const result = await gen.generate('Blog with posts', 'full-stack')

      expect(result.blueprint.hasDatabase).toBe(true)
      expect(result.blueprint.schemaModel).toBeDefined()
      expect(result.blueprint.schemaModel).toContain('model Post')

      // Should write prisma schema file
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('schema.prisma'),
        expect.stringContaining('datasource db')
      )
    })

    it('should include prisma dependencies for db apps', async () => {
      const gen = new SparkGenerator('db-deps')
      const result = await gen.generate('Blog', 'full-stack')

      expect(result.blueprint.dependencies).toHaveProperty('@prisma/client')
      expect(result.blueprint.dependencies).toHaveProperty('prisma')
    })

    it('should create a .env file with DATABASE_URL', async () => {
      const gen = new SparkGenerator('db-env')
      await gen.generate('Blog', 'full-stack')

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('.env'),
        expect.stringContaining('DATABASE_URL')
      )
    })

    it('should include schema generation step in logs', async () => {
      const gen = new SparkGenerator('db-logs')
      const result = await gen.generate('Blog', 'full-stack')

      const steps = result.logs.map(l => l.step)
      expect(steps).toContain('schema')
    })
  })

  describe('error handling', () => {
    it('should return success:false when scaffolder fails', async () => {
      mockScaffoldMicroApp.mockResolvedValue({ success: false })

      const gen = new SparkGenerator('fail-proj')
      const result = await gen.generate('anything', 'micro-app')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return success:false when scaffolder throws', async () => {
      mockScaffoldMicroApp.mockRejectedValue(new Error('LLM timeout'))

      const gen = new SparkGenerator('err-proj')
      const result = await gen.generate('anything', 'micro-app')

      expect(result.success).toBe(false)
      expect(result.error).toContain('LLM timeout')
    })
  })

  describe('getLogs', () => {
    it('should return a copy of the logs array', async () => {
      const gen = new SparkGenerator('log-proj')
      await gen.generate('test', 'micro-app')

      const logs = gen.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      // Mutating returned array should not affect internal state
      const originalLength = logs.length
      logs.pop()
      expect(gen.getLogs().length).toBe(originalLength)
    })
  })
})
