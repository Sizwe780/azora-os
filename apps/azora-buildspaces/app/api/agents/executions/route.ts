import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const statusFilter = searchParams.get('status')?.split(',') || []

    // Build where clause based on status filter
    const whereClause: any = {}
    if (statusFilter.length > 0) {
      whereClause.status = { in: statusFilter }
    }

    // Fetch recent agent executions with related task and agent data
    const executions = await prisma.agentExecution.findMany({
      where: whereClause,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
    })

    return NextResponse.json({ executions })
  } catch (error: any) {
    console.error('Error fetching agent executions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent executions', details: error.message },
      { status: 500 }
    )
  }
}
