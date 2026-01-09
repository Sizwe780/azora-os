import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeIndexer } from '@/lib/knowledge/indexer'
import { getSankofa } from '@/lib/agents/sankofa-interface'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, mode = 'local', maxResults = 10 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required', success: false },
        { status: 400 }
      )
    }

    let results

    if (mode === 'concept') {
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

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required', success: false },
        { status: 400 }
      )
    }

    let results

    if (mode === 'concept') {
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
