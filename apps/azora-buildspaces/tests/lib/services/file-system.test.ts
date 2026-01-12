jest.mock('../../../lib/services/ai-pilot-client', () => ({ azoraPilotClient: { ingest: jest.fn() } }))

import { FileSystemService } from '../../../lib/services/file-system'

describe('FileSystemService git helpers', () => {
  const fsService = new FileSystemService()

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('parses git status including branch', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: " M file1.js\n?? file2.txt\n", branch: 'feature/abc' })
    } as any)

    const status = await fsService.getGitStatus('c1', '/tmp/project')

    expect(status.branch).toBe('feature/abc')
    expect(status.staged).toEqual([])
    expect(status.unstaged).toContain('file1.js')
    expect(status.untracked).toContain('file2.txt')
  })

  it('gets git history', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ commits: [
        { hash: 'h1', author: 'Alice', email: 'a@example.com', date: 'Mon Jan 1 2024', message: 'Initial commit' }
      ]})
    } as any)

    const commits = await fsService.getGitHistory('c1', '/tmp/project')
    expect(commits.length).toBe(1)
    expect(commits[0].hash).toBe('h1')
  })

  it('creates and switches branches and adds remote', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) } as any)

    await expect(fsService.createBranch('c1', '/tmp/project', 'new-branch')).resolves.toBeUndefined()
    await expect(fsService.switchBranch('c1', '/tmp/project', 'new-branch', true)).resolves.toBeUndefined()
    await expect(fsService.addRemote('c1', '/tmp/project', 'origin', 'git@example.com:repo.git')).resolves.toBeUndefined()

    expect((global as any).fetch).toHaveBeenCalled()
  })
})