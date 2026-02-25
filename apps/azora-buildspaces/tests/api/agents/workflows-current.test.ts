/** @jest-environment node */

// Patch next/server
const ns = require('next/server')
ns.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

const { GET: workflowsCurrentGet, PUT: workflowsCurrentPut } =
  require('@/app/api/agents/workflows/current/route')

function makeRequest(body?: unknown) {
  return { json: async () => body }
}

describe('GET /api/agents/workflows/current', () => {
  it('returns the current workflow with nodes and edges', async () => {
    const res = await workflowsCurrentGet()
    const { body } = res as any
    expect(body.workflow).toBeDefined()
    expect(Array.isArray(body.workflow.nodes)).toBe(true)
    expect(Array.isArray(body.workflow.edges)).toBe(true)
  })
})

describe('PUT /api/agents/workflows/current', () => {
  it('updates the workflow name and returns updated workflow', async () => {
    const res = await workflowsCurrentPut(
      makeRequest({ name: 'Updated Workflow', nodes: [], edges: [] }) as any,
    )
    const { body } = res as any
    expect(body.success).toBe(true)
    expect(body.workflow.name).toBe('Updated Workflow')
  })
})
