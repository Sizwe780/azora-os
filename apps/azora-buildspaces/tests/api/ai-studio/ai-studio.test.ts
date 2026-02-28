/** @jest-environment node */

/**
 * Tests for AI Studio — Stop + Workflows API
 */

import { POST as stopPOST, GET as stopGET } from '@/app/api/ai-studio/stop/route'
import { GET as workflowsGET, POST as workflowsPOST } from '@/app/api/ai-studio/workflows/route'

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/ai-studio/workflows')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { nextUrl: url } as any
}

function makePostRequest(body: Record<string, unknown>) {
  return { json: () => Promise.resolve(body) } as any
}

describe('AI Studio Stop (/api/ai-studio/stop)', () => {
  it('POST should cancel a run by ID', async () => {
    const res = await stopPOST(makePostRequest({ runId: 'run-123', reason: 'User cancelled' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.runId).toBe('run-123')
    expect(data.reason).toBe('User cancelled')
    expect(data.cancelledAt).toBeDefined()
  })

  it('POST should return 400 without runId', async () => {
    const res = await stopPOST(makePostRequest({}))
    expect(res.status).toBe(400)
  })

  it('GET should list cancelled runs', async () => {
    const res = await stopGET()
    const data = await res.json()
    expect(Array.isArray(data.cancelledRuns)).toBe(true)
    expect(typeof data.count).toBe('number')
  })
})

describe('AI Studio Workflows (/api/ai-studio/workflows)', () => {
  it('GET should return workflows with metrics', async () => {
    const res = await workflowsGET(makeGetRequest())
    const data = await res.json()
    expect(Array.isArray(data.workflows)).toBe(true)
    expect(data.workflows.length).toBeGreaterThan(0)
    expect(Array.isArray(data.runs)).toBe(true)
    expect(Array.isArray(data.metrics)).toBe(true)
  })

  it('GET with id should return a specific workflow', async () => {
    const res = await workflowsGET(makeGetRequest({ id: 'wf-default' }))
    const data = await res.json()
    expect(data.workflow).toBeDefined()
    expect(data.workflow.name).toBe('Agent Workflow')
    expect(data.workflow.version).toBe(1)
  })

  it('GET should return 404 for unknown workflow', async () => {
    const res = await workflowsGET(makeGetRequest({ id: 'wf-nonexistent' }))
    expect(res.status).toBe(404)
  })

  it('POST should create a valid workflow', async () => {
    const res = await workflowsPOST(makePostRequest({
      name: 'Test Workflow',
      nodes: [
        { id: 'n1', name: 'Start', type: 'input', status: 'idle', config: {} },
        { id: 'n2', name: 'End', type: 'output', status: 'idle', config: {} },
      ],
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.workflow.name).toBe('Test Workflow')
    expect(data.workflow.version).toBe(1)
    expect(data.workflow.id).toBeDefined()
  })

  it('POST should increment version on update', async () => {
    const id = `wf-version-${Date.now()}`
    // Create
    await workflowsPOST(makePostRequest({
      id,
      name: 'Versioned WF',
      nodes: [{ id: 'n1', name: 'Start', type: 'input', status: 'idle', config: {} }],
    }))
    // Update
    const res = await workflowsPOST(makePostRequest({
      id,
      name: 'Versioned WF v2',
      nodes: [
        { id: 'n1', name: 'Start', type: 'input', status: 'idle', config: {} },
        { id: 'n2', name: 'End', type: 'output', status: 'idle', config: {} },
      ],
    }))
    const data = await res.json()
    expect(data.workflow.version).toBe(2)
  })

  it('POST should reject unknown node types', async () => {
    const res = await workflowsPOST(makePostRequest({
      name: 'Bad Workflow',
      nodes: [{ id: 'n1', name: 'X', type: 'alien', status: 'idle', config: {} }],
    }))
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.details).toBeDefined()
    expect(data.details[0]).toContain('unknown type')
  })

  it('POST should reject missing dependencies', async () => {
    const res = await workflowsPOST(makePostRequest({
      name: 'Broken WF',
      nodes: [
        { id: 'n1', name: 'Start', type: 'input', status: 'idle', config: {}, dependsOn: ['n99'] },
      ],
    }))
    expect(res.status).toBe(422)
  })

  it('POST should return 400 for missing name/nodes', async () => {
    const res = await workflowsPOST(makePostRequest({ name: 'No nodes' }))
    expect(res.status).toBe(400)
  })

  it('GET metrics should include computed values', async () => {
    const res = await workflowsGET(makeGetRequest())
    const data = await res.json()
    const labels = data.metrics.map((m: any) => m.label)
    expect(labels).toContain('Total Runs')
    expect(labels).toContain('Success Rate')
    expect(labels).toContain('Workflows')
  })
})
