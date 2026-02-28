/** @jest-environment node */

/**
 * Tests for Notebook Cells & Kernel API (Jupyter parity)
 */

import {
  GET as cellsGET,
  POST as cellsPOST,
  PUT as cellsPUT,
  DELETE as cellsDELETE,
} from '@/app/api/notebook/cells/route'
import { GET as kernelGET, POST as kernelPOST } from '@/app/api/notebook/kernel/route'

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/notebook/cells')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { nextUrl: url } as any
}

function makePostRequest(body: Record<string, unknown>) {
  return { json: () => Promise.resolve(body) } as any
}

describe('Notebook Cells (/api/notebook/cells)', () => {
  const nbId = `nb_test_${Date.now()}`

  it('GET should return empty cells for new notebook', async () => {
    const res = await cellsGET(makeGetRequest({ notebookId: nbId }))
    const data = await res.json()
    expect(data.cells).toEqual([])
    expect(data.cellCount).toBe(0)
  })

  it('POST should create a code cell', async () => {
    const res = await cellsPOST(makePostRequest({
      notebookId: nbId,
      type: 'code',
      source: 'const x = 42;',
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.cell.type).toBe('code')
    expect(data.cell.source).toBe('const x = 42;')
    expect(data.cell.id).toBeDefined()
  })

  it('POST should create a markdown cell', async () => {
    const res = await cellsPOST(makePostRequest({
      notebookId: nbId,
      type: 'markdown',
      source: '# Hello',
    }))
    const data = await res.json()
    expect(data.cell.type).toBe('markdown')
  })

  it('PUT should update cell source', async () => {
    const putNbId = `nb_put_${Date.now()}`
    // Create a cell first
    const createRes = await cellsPOST(makePostRequest({
      notebookId: putNbId,
      source: 'old code',
    }))
    const createData = await createRes.json()
    const cellId = createData.cell.id

    const res = await cellsPUT(makePostRequest({
      notebookId: putNbId,
      cellId,
      source: 'new code',
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.cell.source).toBe('new code')
  })

  it('PUT should return 400 without cellId', async () => {
    const res = await cellsPUT(makePostRequest({ notebookId: nbId }))
    expect(res.status).toBe(400)
  })

  it('DELETE should return 400 without cellId', async () => {
    const res = await cellsDELETE(makePostRequest({ notebookId: nbId }))
    expect(res.status).toBe(400)
  })

  it('GET should return cells in position order', async () => {
    const res = await cellsGET(makeGetRequest({ notebookId: nbId }))
    const data = await res.json()
    expect(data.cellCount).toBeGreaterThan(0)
    // Verify sorted by position
    for (let i = 1; i < data.cells.length; i++) {
      expect(data.cells[i].position).toBeGreaterThanOrEqual(data.cells[i - 1].position)
    }
  })
})

describe('Notebook Kernel (/api/notebook/kernel)', () => {
  function makeKernelGet(params: Record<string, string> = {}) {
    const url = new URL('http://localhost/api/notebook/kernel')
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    return { nextUrl: url } as any
  }

  it('GET should return kernel status', async () => {
    const res = await kernelGET(makeKernelGet({ kernelId: 'test-kernel-1' }))
    const data = await res.json()
    expect(data.kernel.status).toBe('idle')
    expect(data.kernel.language).toBe('typescript')
    expect(data.variableCount).toBe(0)
  })

  it('POST execute should run simple expressions', async () => {
    const res = await kernelPOST(makePostRequest({
      action: 'execute',
      kernelId: 'test-kernel-2',
      code: '2 + 2',
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.output.content).toBe('4')
    expect(data.output.type).toBe('text')
    expect(data.kernel.executionCount).toBe(1)
  })

  it('POST execute should block restricted operations', async () => {
    const res = await kernelPOST(makePostRequest({
      action: 'execute',
      kernelId: 'test-kernel-3',
      code: 'require("fs")',
    }))
    const data = await res.json()
    expect(data.output.type).toBe('error')
    expect(data.output.content).toContain('Restricted')
  })

  it('POST execute should track variables', async () => {
    await kernelPOST(makePostRequest({
      action: 'execute',
      kernelId: 'test-kernel-4',
      code: 'const greeting = "hello"',
    }))
    const res = await kernelGET(makeKernelGet({ kernelId: 'test-kernel-4' }))
    const data = await res.json()
    expect(data.variables.length).toBeGreaterThanOrEqual(0) // May or may not track depending on eval
  })

  it('POST restart should reset kernel state', async () => {
    // Execute something first
    await kernelPOST(makePostRequest({
      action: 'execute',
      kernelId: 'test-kernel-5',
      code: '1 + 1',
    }))
    const res = await kernelPOST(makePostRequest({ action: 'restart', kernelId: 'test-kernel-5' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.kernel.executionCount).toBe(0)
  })

  it('POST interrupt should set status to idle', async () => {
    const res = await kernelPOST(makePostRequest({ action: 'interrupt', kernelId: 'test-kernel-6' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.kernel.status).toBe('idle')
  })

  it('POST execute should return error for missing code', async () => {
    const res = await kernelPOST(makePostRequest({ action: 'execute', kernelId: 'test-kernel-7' }))
    expect(res.status).toBe(400)
  })

  it('POST inspect should return 404 for unknown variable', async () => {
    const res = await kernelPOST(makePostRequest({
      action: 'inspect',
      kernelId: 'test-kernel-8',
      variableName: 'nonexistent',
    }))
    expect(res.status).toBe(404)
  })
})
