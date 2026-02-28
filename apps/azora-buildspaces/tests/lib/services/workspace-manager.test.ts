/** @jest-environment node */

import { WorkspaceManager } from '@/lib/services/workspace-manager'
import { resetSingleton } from '../../helpers/reset-singleton'

describe('WorkspaceManager', () => {
  let manager: WorkspaceManager

  beforeEach(() => {
    resetSingleton(WorkspaceManager)
    manager = WorkspaceManager.getInstance()
  })

  afterEach(() => {
    resetSingleton(WorkspaceManager)
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const a = WorkspaceManager.getInstance()
      const b = WorkspaceManager.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('executeCommand', () => {
    it('should return success for deploy commands', async () => {
      const result = await manager.executeCommand({
        type: 'deploy',
        parameters: { environment: 'staging', projectName: 'test-app' },
      })
      expect(result.status).toBe('success')
      expect(result.message).toContain('deploy')
    })

    it('should return success for build commands', async () => {
      const result = await manager.executeCommand({
        type: 'build',
        parameters: { output: 'dist' },
      })
      expect(result.status).toBe('success')
      expect(result.message).toContain('build')
    })

    it('should include the command type in the response message', async () => {
      const result = await manager.executeCommand({
        type: 'custom-action',
        parameters: {},
      })
      expect(result.message).toContain('custom-action')
    })
  })
})
