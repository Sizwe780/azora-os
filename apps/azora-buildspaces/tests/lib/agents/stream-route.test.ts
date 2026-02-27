import { describe, it, expect, jest, beforeAll } from '@jest/globals'

// mock persistence so we control the replayed record
jest.mock('@/lib/agents/persistence', () => {
  return {
    loadExecutionState: jest.fn(async (id: string) => {
      return {
        id,
        userId: 'u1',
        projectId: 'p1',
        status: 'running',
        currentStepIndex: 0,
        trace: [
          {
            timestamp: new Date().toISOString(),
            type: 'thought',
            content: 'old-step',
            metadata: { tokensUsed: 0, model: '' },
          },
        ],
        snapshot: { activeFiles: [], variables: {}, mcpContext: '' },
      }
    }),
    upsertExecutionRecord: jest.fn(async () => undefined),
  }
})

// stub orchestrator so we can simulate steps being emitted
const onStepCbs: Array<(step: any) => void> = []
jest.mock('@/lib/agents/orchestrator', () => {
  return {
    getOrchestrator: () => ({
      onStep(cb: (step: any) => void) {
        onStepCbs.push(cb)
      },
      executeWorkflow(workflowId: string, triggerData: any, _?: any, executionId?: string) {
        // immediately emit a new step
        const step = {
          timestamp: new Date().toISOString(),
          type: 'thought',
          content: 'new-step',
          metadata: { tokensUsed: 0, model: '' },
        }
        onStepCbs.forEach((cb) => cb(step))
        return Promise.resolve({ success: true })
      },
      // saveWorkflow is used by the route when creating ad-hoc workflows
      saveWorkflow: jest.fn(async (wf: any) => {
        // no-op
      }),
    }),
    TraceStep: {} as any,
  }
})

// bring in the handler after mocks are defined
import { POST } from '@/app/api/agents/stream/route'

// helper to build a fake NextRequest
function makeReq(body: any) {
  return {
    json: async () => body,
  } as any
}

describe('agents stream route', () => {
  it('replays previous trace steps and emits new ones', async () => {
    const req = makeReq({ executionId: 'exec1' })
    const res: any = await POST(req)
    expect(res).toBeInstanceOf(Response)
    const text = await res.text()
    // should contain the old step content and the new step content
    expect(text).toContain('old-step')
    expect(text).toContain('new-step')
    expect(text).toContain('event: done')
  })
})
