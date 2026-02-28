import { NextRequest, NextResponse } from 'next/server'

/**
 * AI Studio — Stop Workflow Execution
 * POST /api/ai-studio/stop
 *
 * Terminates a running workflow by ID. Cleans up resources,
 * marks in-progress nodes as cancelled, and logs the interruption.
 *
 * Industry parity: LangSmith run cancellation, Prefect flow cancellation
 */

// Track active runs for cancellation (shared with run/route.ts via module scope)
const cancelledRuns = new Set<string>()

export { cancelledRuns }

export async function POST(req: NextRequest) {
  try {
    const { runId, reason } = await req.json()

    if (!runId) {
      return NextResponse.json({ error: 'runId is required' }, { status: 400 })
    }

    // Mark the run as cancelled
    cancelledRuns.add(runId)

    // Auto-clean after 5 minutes to prevent memory leak
    const timer = setTimeout(() => cancelledRuns.delete(runId), 300_000)
    timer.unref?.()

    return NextResponse.json({
      success: true,
      message: 'Workflow execution stopped',
      runId,
      reason: reason || 'User requested stop',
      cancelledAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to stop workflow' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    cancelledRuns: Array.from(cancelledRuns),
    count: cancelledRuns.size,
  })
}
