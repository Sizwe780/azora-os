import { test, expect } from '@playwright/test'

// Basic smoke test for the MCP JSON-RPC interface

test.describe('MCP Server', () => {
  test('search_files returns array result', async ({ request, baseURL }) => {
    // kick off indexing so results exist
    await request.post(`${baseURL}/api/knowledge/index`)

    const rpc = {
      jsonrpc: '2.0',
      method: 'search_files',
      params: { query: 'Agent', limit: 5 },
      id: 1,
    }
    const resp = await request.post(`${baseURL}/api/mcp`, { data: rpc })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    expect(body).toHaveProperty('result')
    expect(Array.isArray(body.result)).toBe(true)
  })

  test('agent stream returns steps events', async ({ request, baseURL }) => {
    // simple workflow: send a single message
    const rpcResponse = await request.post(`${baseURL}/api/agents/stream`, {
      data: { messages: [{ role: 'user', content: 'Hello world' }], model: 'elara-pro' }
    })
    expect(rpcResponse.ok()).toBeTruthy()
    const text = await rpcResponse.text()
    // should contain at least one event: step or done
    expect(text).toMatch(/event: step/)
  })
})
