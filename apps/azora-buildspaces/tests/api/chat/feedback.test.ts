/** @jest-environment node */

import os from 'os'
import path from 'path'
import fs from 'fs'

// Patch next/server
const ns = require('next/server')
ns.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

// Override process.cwd to use a temp dir so files don't pollute the repo
let tmpDir: string
const origCwd = process.cwd

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-feedback-test-'))
  jest.spyOn(process, 'cwd').mockReturnValue(tmpDir)
})

afterEach(() => {
  jest.restoreAllMocks()
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (_) {}
})

function makeRequest(body: unknown) {
  return { json: async () => body, url: 'http://localhost/api/chat/feedback' }
}

function makeGetRequest(params = '') {
  return { url: `http://localhost/api/chat/feedback${params}` }
}

describe('POST /api/chat/feedback', () => {
  it('saves positive feedback and returns entry', async () => {
    // require inside test so cwd mock is active
    jest.resetModules()
    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }
    const { POST } = require('@/app/api/chat/feedback/route')

    const res = await POST(makeRequest({
      sessionId: 'sess_1',
      messageId: 'msg_1',
      rating: 'positive',
      comment: 'Great answer!',
    }) as any)

    const { body, status } = res as any
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.feedback.rating).toBe('positive')
  })

  it('returns 400 when rating is missing', async () => {
    jest.resetModules()
    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }
    const { POST } = require('@/app/api/chat/feedback/route')

    const res = await POST(makeRequest({ sessionId: 's', messageId: 'm' }) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })

  it('returns 400 for invalid rating value', async () => {
    jest.resetModules()
    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }
    const { POST } = require('@/app/api/chat/feedback/route')

    const res = await POST(makeRequest({ sessionId: 's', messageId: 'm', rating: 'neutral' }) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })
})
