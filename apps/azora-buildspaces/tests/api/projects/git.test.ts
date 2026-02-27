(globalThis as any).Request = (globalThis as any).Request || function Request() {}
;(globalThis as any).Response = (globalThis as any).Response || function Response() {}

// Patch next/server import to return plain JSON in tests
const ns = require('next/server')
ns.NextResponse = { json: (body: any) => body }

const { POST: commitRoute } = require('@/app/api/projects/[projectId]/git/commit/route')
const { GET: statusRoute } = require('@/app/api/projects/[projectId]/git/status/route')

// Mock next-auth/next getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: () => Promise.resolve({
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg'
    },
    expires: '2099-01-01T00:00:00.000Z'
  })
}))

import fs from 'fs'
import os from 'os'
import path from 'path'
import { execSync } from 'child_process'

describe('project git endpoints', () => {
  let tmpDir: string
  let origCwd: string

  beforeEach(() => {
    jest.setTimeout(15000)
    origCwd = process.cwd()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildspaces-test-'))
    process.chdir(tmpDir)
    // init repo
    execSync('git init', { cwd: tmpDir })
    execSync('git config user.email "test@example.com"', { cwd: tmpDir })
    execSync('git config user.name "Test User"', { cwd: tmpDir })
  })

  afterEach(() => {
    process.chdir(origCwd)
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (e) {}
  })

  it('commits changes and returns commit hash', async () => {
    const file = path.join(tmpDir, 'README.md')
    fs.writeFileSync(file, '# test')

    const res = await commitRoute({ json: async () => ({ message: 'test commit' }) }, { params: Promise.resolve({ projectId: 'p1' }) } as any)
    const json = res.json ? await res.json() : (res.body || res)

    if (!json || !json.success) {
      console.error('Commit route returned error or no success:', json)
    }

    expect(json.success).toBe(true)
    expect(json.commitHash).toMatch(/^[0-9a-f]{7,40}$/)
  })

  it('returns git status (no changes after commit)', async () => {
    const file = path.join(tmpDir, 'file.txt')
    fs.writeFileSync(file, 'hello')
    execSync('git add .', { cwd: tmpDir })
    execSync('git commit -m "init"', { cwd: tmpDir })

    const res = await statusRoute({ url: `http://localhost/?projectId=p1` } as any, { params: Promise.resolve({ projectId: 'p1' }) } as any)
    const json = res.json ? await res.json() : (res.body || res)

    expect(json.branch).toBeDefined()
    expect(json.hasChanges).toBe(false)
  })
})