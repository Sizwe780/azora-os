import { NextRequest, NextResponse } from 'next/server'
import { loadExecutionState } from '@/lib/agents/persistence'

const serialize = (record: any) => {
  if (!record) return null
  const updatedAt = record?.updatedAt?.toDate
    ? record.updatedAt.toDate().toISOString()
    : record.updatedAt
  const trace = Array.isArray(record.trace)
    ? record.trace.map((step: any) => ({
        ...step,
        timestamp: step.timestamp?.toDate
          ? step.timestamp.toDate().toISOString()
          : step.timestamp,
      }))
    : []
  return {
    ...record,
    updatedAt,
    trace,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const record = await loadExecutionState(params.executionId)
    if (!record) {
      return NextResponse.json({ record: null }, { status: 200 })
    }
    return NextResponse.json({ record: serialize(record) }, { status: 200 })
  } catch (error) {
    console.error('[agents/sessions] failed to load', error)
    return NextResponse.json({ record: null }, { status: 200 })
  }
}