import { NextRequest, NextResponse } from 'next/server'
import { initializeKnowledgeEngine } from '@/lib/knowledge/indexer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rootPath = '/' } = body

    console.log(`[API] Starting indexing from ${rootPath}`)

    const stats = await initializeKnowledgeEngine(rootPath)

    return NextResponse.json({
      success: true,
      stats,
      message: `Indexed ${stats.totalFiles} files with ${stats.totalChunks} code chunks`
    })

  } catch (error) {
    console.error('[API] Indexing error:', error)
    return NextResponse.json(
      { error: 'Indexing failed', success: false },
      { status: 500 }
    )
  }
}
