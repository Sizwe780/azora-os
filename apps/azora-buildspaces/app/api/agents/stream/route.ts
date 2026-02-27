import { NextRequest } from 'next/server'
import { getOrchestrator, TraceStep } from '@/lib/agents/orchestrator'
import { loadExecutionState, upsertExecutionRecord } from '@/lib/agents/persistence'

interface StreamRequest {
  // instead of requiring an existing workflow, callers may provide
  // `messages` and `model` to run an ad-hoc agent workflow
  workflowId?: string
  triggerData?: any
  messages?: Array<{ role: string; content: string }>
  model?: string
  executionId?: string
  projectId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as StreamRequest
    const orchestrator = getOrchestrator()

    // if no workflowId supplied, build a simple on-the-fly workflow
    let workflowId = body.workflowId
    if (!workflowId) {
      // create a temporary unique id and store workflow in orchestrator
      workflowId = `temp-${Date.now()}`
      const wf = {
        id: workflowId,
        name: 'ad-hoc-chat',
        description: 'Temporary chat workflow',
        nodes: [
          { id: 'trigger', type: 'trigger', position: { x: 0, y: 0 }, data: { triggerType: 'manual' } },
          { id: 'agent1', type: 'agent', position: { x: 100, y: 0 }, data: { agentType: 'elara', systemPrompt: `${body.model || 'elara-pro'} chat conversation`, temperature: 0.7 } },
          { id: 'output', type: 'output', position: { x: 200, y: 0 }, data: {} },
        ],
        edges: [
          { id: 'e1', source: 'trigger', target: 'agent1' },
          { id: 'e2', source: 'agent1', target: 'output' },
        ],
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      // register the ad-hoc workflow so executeWorkflow can find it
      await orchestrator.saveWorkflow(wf as any)
      body.triggerData = { messages: body.messages }
    }

    // if executionId present, ensure we have a record with project metadata
    if (body.executionId) {
      await upsertExecutionRecord(body.executionId, {
        id: body.executionId,
        projectId: body.projectId || 'default',
        status: 'running',
      })
    }
    // create a readable stream that will emit SSE events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // if we loaded a previous record, replay its trace steps first
        if (body.executionId) {
          loadExecutionState(body.executionId).then((rec) => {
            if (rec && Array.isArray(rec.trace)) {
              for (const step of rec.trace) {
                const data = JSON.stringify(step)
                controller.enqueue(encoder.encode(`event: step\ndata: ${data}\n\n`))
              }
            }
          }).catch(() => {})
        }
        // register onStep callback
        orchestrator.onStep((step: TraceStep) => {
          const data = JSON.stringify(step)
          controller.enqueue(encoder.encode(`event: step\ndata: ${data}\n\n`))
        })

        orchestrator.executeWorkflow(workflowId!, body.triggerData, undefined, body.executionId).then((result) => {
          controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify(result)}\n\n`))
          controller.close()
        }).catch((err) => {
          controller.enqueue(encoder.encode(`event: error\ndata: ${err.message}\n\n`))
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      }
    })
  } catch (error) {
    console.error('[Agent Stream] error', error)
    return new Response('Failed to start stream', { status: 500 })
  }
}
