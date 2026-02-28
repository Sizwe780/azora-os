/** @jest-environment node */

import { AgentOrchestrator, type AgentTask } from '@/lib/services/agent-orchestrator'
import { resetSingleton } from '../../helpers/reset-singleton'

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator

  beforeEach(() => {
    resetSingleton(AgentOrchestrator)
    orchestrator = AgentOrchestrator.getInstance()
  })

  afterEach(() => {
    resetSingleton(AgentOrchestrator)
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const a = AgentOrchestrator.getInstance()
      const b = AgentOrchestrator.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('createTask', () => {
    it('should create a task with correct fields', async () => {
      const task = await orchestrator.createTask('Build a login page', 'engineer')
      expect(task.id).toMatch(/^TASK-/)
      expect(task.description).toBe('Build a login page')
      expect(task.assignedTo).toBe('engineer')
      expect(task.status).toBe('pending')
      expect(task.output).toBeUndefined()
    })

    it('should assign tasks to different roles', async () => {
      const roles: Array<'manager' | 'architect' | 'engineer' | 'designer'> = [
        'manager', 'architect', 'engineer', 'designer'
      ]
      for (const role of roles) {
        const task = await orchestrator.createTask(`Task for ${role}`, role)
        expect(task.assignedTo).toBe(role)
      }
    })

    it('should reject a task that violates the constitution', async () => {
      await expect(
        orchestrator.createTask('delete database completely', 'engineer')
      ).rejects.toThrow(/Constitution/)
    })

    it('should generate unique task IDs', async () => {
      const t1 = await orchestrator.createTask('Task A', 'engineer')
      // Small delay to ensure Date.now() differs
      await new Promise(r => setTimeout(r, 5))
      const t2 = await orchestrator.createTask('Task B', 'designer')
      expect(t1.id).not.toBe(t2.id)
    })
  })

  describe('executeTask', () => {
    it('should transition task from pending to review', async () => {
      const task = await orchestrator.createTask('Design the header', 'designer')
      expect(task.status).toBe('pending')

      await orchestrator.executeTask(task.id)

      // Re-read task via the same reference (stored in the internal Map)
      expect(task.status).toBe('review')
      expect(task.output).toBeDefined()
      expect(task.output).toContain('Design the header')
    }, 10_000) // Generous timeout for 2s simulated delay

    it('should throw when task ID is not found', async () => {
      await expect(orchestrator.executeTask('TASK-nonexistent')).rejects.toThrow('Task not found')
    })
  })
})
