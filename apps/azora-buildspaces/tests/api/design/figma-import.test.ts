describe('API: /api/design/figma-import', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    delete process.env.FIGMA_TOKEN
    global.fetch = undefined
  })

  test('POST returns 501 when FIGMA_TOKEN not set', async () => {
    const route = require('../../../app/api/design/figma-import/route.test.js')
    const req = { json: async () => ({ url: 'https://www.figma.com/file/abc123' }) }
    const resp = await route.POST(req)
    expect(resp.status).toBe(501)
    const body = await resp.json()
    expect(body.error).toMatch(/Figma integration not configured/)
  })

  test('POST returns parsed frame when FIGMA_TOKEN set and API ok', async () => {
    process.env.FIGMA_TOKEN = 'tok'
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ name: 'My File', document: { children: [1,2] } }) }))

    const route = require('../../../app/api/design/figma-import/route.test.js')
    const req = { json: async () => ({ url: 'https://www.figma.com/file/abc123' }) }
    const resp = await route.POST(req)
    expect(resp.status).toBe(200)
    const body = await resp.json()
    expect(body.frame).toBeDefined()
    expect(body.frame.id).toBe('abc123')
    expect(body.frame.componentsCount).toBe(2)
  })

  test('POST returns 400 when url invalid', async () => {
    process.env.FIGMA_TOKEN = 'tok'
    const route = require('../../../app/api/design/figma-import/route.test.js')
    const req = { json: async () => ({ url: 'not-a-figma-url' }) }
    const resp = await route.POST(req)
    expect(resp.status).toBe(400)
  })
})
