/** @jest-environment node */

import os from 'os'
import path from 'path'
import fs from 'fs'

// Patch next/server
const ns = require('next/server')
ns.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

// Mock next-auth (no real session in tests)
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth/config', () => ({ authOptions: {} }))

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'marketplace-install-test-'))
  jest.spyOn(process, 'cwd').mockReturnValue(tmpDir)

  // Seed a templates catalog
  const marketplaceDir = path.join(tmpDir, 'data', 'marketplace')
  fs.mkdirSync(marketplaceDir, { recursive: true })
  fs.writeFileSync(
    path.join(marketplaceDir, 'templates.json'),
    JSON.stringify([
      {
        id: 'tmpl-free-1',
        name: 'Free Starter',
        description: 'Free template',
        category: 'Full-Stack',
        author: 'Azora',
        rating: 5,
        downloads: 10,
        price: 'Free',
        tags: ['React'],
        icon: 'Code2',
        color: 'text-blue-500',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tmpl-paid-1',
        name: 'Pro Kit',
        description: 'Paid template',
        category: 'AI',
        author: 'Azora',
        rating: 5,
        downloads: 5,
        price: '50 AZR',
        tags: ['AI'],
        icon: 'Sparkles',
        color: 'text-purple-500',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]),
  )
})

afterEach(() => {
  jest.restoreAllMocks()
  jest.resetModules()
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (_) {}
})

function makeReq(body: unknown) {
  return { json: async () => body, url: 'http://localhost/api/marketplace/install' }
}

describe('POST /api/marketplace/install', () => {
  it('installs a free template without auth', async () => {
    jest.resetModules()
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

    const { POST } = require('@/app/api/marketplace/install/route')
    const res = await POST(makeReq({ templateId: 'tmpl-free-1' }) as any)
    const { body, status } = res as any
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.template.id).toBe('tmpl-free-1')
    expect(Array.isArray(body.template.scaffoldCommands)).toBe(true)
  })

  it('returns 401 for paid template without auth', async () => {
    jest.resetModules()
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

    const { POST } = require('@/app/api/marketplace/install/route')
    const res = await POST(makeReq({ templateId: 'tmpl-paid-1' }) as any)
    const { status } = res as any
    expect(status).toBe(401)
  })

  it('returns 404 for unknown template', async () => {
    jest.resetModules()
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

    const { POST } = require('@/app/api/marketplace/install/route')
    const res = await POST(makeReq({ templateId: 'does-not-exist' }) as any)
    const { status } = res as any
    expect(status).toBe(404)
  })

  it('returns 400 when templateId is missing', async () => {
    jest.resetModules()
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

    const { POST } = require('@/app/api/marketplace/install/route')
    const res = await POST(makeReq({}) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })

  it('marks install as alreadyInstalled on second call', async () => {
    jest.resetModules()
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({ user: { id: 'user-123' } })

    const ns2 = require('next/server')
    ns2.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

    const { POST } = require('@/app/api/marketplace/install/route')
    await POST(makeReq({ templateId: 'tmpl-free-1' }) as any)
    const res = await POST(makeReq({ templateId: 'tmpl-free-1' }) as any)
    const { body } = res as any
    expect(body.alreadyInstalled).toBe(true)
  })
})
