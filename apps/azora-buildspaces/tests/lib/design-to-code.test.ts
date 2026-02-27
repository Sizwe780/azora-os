import { describe, it, expect, jest, beforeAll } from '@jest/globals'
import { figmaToJson } from '@/lib/utils/figma'

// we will import executeTool dynamically so we can mock fetch and ai

describe('figma utilities', () => {
  it('cleans a node by removing extraneous fields', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
      other: 'unnecessary',
      children: [{ id: '2', name: 'Child', type: 'RECTANGLE' }],
    }
    const cleaned = figmaToJson(node)
    expect(cleaned).toEqual({
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      bounds: { x: 0, y: 0, width: 100, height: 50 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
      children: [{ id: '2', name: 'Child', type: 'RECTANGLE' }],
    })
  })
})

describe('designToCode agent tool', () => {
  beforeAll(() => {
    // mock fetch globally
    global.fetch = jest.fn()
    process.env.FIGMA_TOKEN = 'test-token'
    // stub file system to avoid real disk writes
    jest.mock('@/lib/workspace/file-system', () => ({
      fileSystem: {
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue(''),
        listFiles: jest.fn().mockResolvedValue([]),
      },
    }))
  })

  it('fetches figma node and calls LLM, then writes file', async () => {
    const fakeDoc = { id: '1', name: 'Test', type: 'FRAME', children: [] }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ document: fakeDoc })
    })

    // stub generateText to return a simple component string
    const gen = jest.fn().mockResolvedValue({ text: 'export default () => <div>Hi</div>' })
    // standard jest.mock should intercept both static and dynamic imports
    jest.mock('ai', () => ({ generateText: gen }))
    jest.mock('@ai-sdk/openai', () => ({ openai: () => 'dummy-model' }))

    const { executeTool } = await import('@/lib/agents/tools.ts')
    const result = await executeTool('designToCode', '', {
      figmaUrl: 'file/abc/Name?node-id=1',
      filePath: '/tmp/Comp.tsx',
    })
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1)
    expect(gen).toHaveBeenCalled()
    expect(result).toHaveProperty('success', true)
  })
})
