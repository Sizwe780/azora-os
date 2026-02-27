import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { fileSystemService } from '../file-system'
import { constitutionalAI } from '../constitutional-ai'

describe('FileSystemService git push gating', () => {
  beforeEach(async () => {
    jest.restoreAllMocks()

    // Mock fetch for FileSystem operations
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('ok'),
        json: () => Promise.resolve({ status: 'ok', branch: 'main' }),
      })
    ) as jest.Mock
  })

  it('should allow git push when verification allows', async () => {
    const containerId = `cont_${Date.now()}`
    const path = '/'

    await fileSystemService.initGitRepository(containerId, path)

    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({
      allowed: true,
      violations: [],
      explanation: 'Push allowed',
      score: 100,
      auditId: 'audit_push_allow'
    } as any)

    await expect(fileSystemService.gitPush(containerId, path, 'origin', 'main', 'user_git')).resolves.toBeUndefined()
  })

  it('should block git push when verification disallows', async () => {
    const containerId = `cont2_${Date.now()}`
    const path = '/'

    await fileSystemService.initGitRepository(containerId, path)

    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({
      allowed: false,
      violations: [{ article: 'ARTICLE_VII', section: '7.1', principle: 'No External Push', severity: 'CRITICAL', description: 'Blocked', remediation: ['Use internal registry'] }],
      explanation: 'Push blocked',
      score: 0,
      auditId: 'audit_push_block'
    } as any)

    await expect(fileSystemService.gitPush(containerId, path, 'origin', 'main', 'user_git')).rejects.toThrow('Constitutional Violation')
  })
})
