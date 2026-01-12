import { test, expect } from '@playwright/test'

const base = process.env.E2E_BASE_URL || 'http://localhost:3000'

// These tests require the server to have permission to write to /tmp or a workspace directory
// They initialize a repo, create a file, commit, and inspect git log

test.describe('Git E2E', () => {
  test('init, add, commit, log', async ({ request }) => {
    const repoPath = `/tmp/e2e-git-${Date.now()}`

    // init
    let resp = await request.post(`${base}/api/fs`, { data: { operation: 'mkdir', path: repoPath } })
    expect(resp.ok()).toBeTruthy()

    resp = await request.post(`${base}/api/fs`, { data: { operation: 'gitInit', path: repoPath } })
    expect(resp.ok()).toBeTruthy()

    // write file
    resp = await request.post(`${base}/api/fs`, { data: { operation: 'write', path: `${repoPath}/README.md`, content: '# E2E' } })
    expect(resp.ok()).toBeTruthy()

    // add
    resp = await request.post(`${base}/api/fs`, { data: { operation: 'gitAdd', path: repoPath, files: ['README.md'] } })
    expect(resp.ok()).toBeTruthy()

    // commit
    resp = await request.post(`${base}/api/fs`, { data: { operation: 'gitCommit', path: repoPath, message: 'E2E commit' } })
    expect(resp.ok()).toBeTruthy()

    // log
    resp = await request.get(`${base}/api/fs?operation=gitLog&path=${encodeURIComponent(repoPath)}&limit=5`)
    expect(resp.ok()).toBeTruthy()
    const json = await resp.json()
    expect(Array.isArray(json.commits)).toBeTruthy()
  })
})