import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeIndexer } from '@/lib/knowledge/indexer'
import { getSankofa } from '@/lib/agents/sankofa-interface'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, mode = 'local', maxResults = 10 } = body

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required', success: false },
        { status: 400 }
      )
    }

    let results

    // Handle wildcard query to get all items
    if (query === '*') {
      const indexer = getKnowledgeIndexer()
      const allChunks = Array.from((indexer as any).chunks.values())
      results = allChunks.slice(0, maxResults).map((chunk: any, index: number) => ({
        ...chunk,
        score: 1 - (index * 0.001), // Slight descending score
        match: {}
      }))
    } else if (mode === 'concept') {
      // Use Sankofa for concept search
      const sankofa = getSankofa()
      const contextResult = await sankofa.answerQuestion(query)
      
      results = contextResult.chunks.map((chunk, index) => ({
        ...chunk,
        score: 1 - (index * 0.1),
        match: {}
      }))
    } else {
      // Use direct keyword search
      const indexer = getKnowledgeIndexer()
      results = indexer.search(query, maxResults)
    }

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query,
      mode
    })

  } catch (error) {
    console.error('[API] Knowledge search error:', error)
    return NextResponse.json(
      { error: 'Search failed', success: false },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('query')
    const mode = searchParams.get('mode') || 'local'
    const maxResults = parseInt(searchParams.get('limit') || '10', 10)

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required', success: false },
        { status: 400 }
      )
    }

    let results

    // Handle wildcard query to get all items
    if (query === '*') {
      const indexer = getKnowledgeIndexer()
      const allChunks = Array.from((indexer as any).chunks.values())
      results = allChunks.slice(0, maxResults).map((chunk: any, index: number) => ({
        ...chunk,
        score: 1 - (index * 0.001),
        match: {}
      }))
    } else if (mode === 'concept') {
      const sankofa = getSankofa()
      const contextResult = await sankofa.answerQuestion(query)
      
      results = contextResult.chunks.map((chunk, index) => ({
        ...chunk,
        score: 1 - (index * 0.1),
        match: {}
      }))
    } else {
      const indexer = getKnowledgeIndexer()
      results = indexer.search(query, maxResults)
    }

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query,
      mode
    })

  } catch (error) {
    console.error('[API] Knowledge search error:', error)
    return NextResponse.json(
      { error: 'Search failed', success: false },
      { status: 500 }
    )
  }
}
