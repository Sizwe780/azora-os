import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeIndexer, SearchResult } from '@/lib/knowledge/indexer'

interface MCPRequest {
  jsonrpc: '2.0'
  method: string
  params?: any
  id?: string | number | null
}

interface MCPResponse {
  jsonrpc: '2.0'
  result?: any
  error?: { code: number; message: string; data?: any }
  id?: string | number | null
}

/**
 * Lightweight MCP server that routes JSON-RPC calls to internal tools.
 *
 * Currently exposes a small subset of operations the Knowledge Ocean
 * supports; additional methods (list_rooms, etc.) can be added later.
 */
export class AzoraMCPServer {
  private static indexer: KnowledgeIndexer | null = null

  private static getIndexer(): KnowledgeIndexer {
    if (!AzoraMCPServer.indexer) {
      AzoraMCPServer.indexer = new KnowledgeIndexer()
    }
    return AzoraMCPServer.indexer
  }

  /**
   * Handle an incoming JSON-RPC request and return a response object.
   */
  static async handle(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request
    try {
      switch (method) {
        case 'search_files': {
          // params: { query: string; limit?: number }
          const idx = AzoraMCPServer.getIndexer()
          // ensure index is built
          await idx.indexProject('/')
          const query = (params?.query as string) || ''
          const limit = params?.limit || 10
          const results: SearchResult[] = idx.search(query).slice(0, limit)
          return { jsonrpc: '2.0', result: results, id }
        }
        case 'get_file_context': {
          // params: { path: string; linesBefore?: number; linesAfter?: number }
          const path = params?.path
          if (!path) throw new Error('path is required')
          const linesBefore = params?.linesBefore || 3
          const linesAfter = params?.linesAfter || 3
          // read directly from VFS
          const { fileSystem } = await import('@/lib/workspace/file-system')
          const content = await fileSystem.readFile(path)
          const lines = content.split('\n')
          const lineNum = params?.lineNumber || 1
          const start = Math.max(0, lineNum - linesBefore - 1)
          const end = Math.min(lines.length, lineNum + linesAfter)
          return { jsonrpc: '2.0', result: lines.slice(start, end).join('\n'), id }
        }
        case 'list_rooms': {
          // return hardcoded room list for now
          const rooms = ['code-chamber', 'ai-studio', 'knowledge-ocean', 'command-desk']
          return { jsonrpc: '2.0', result: rooms, id }
        }
        default:
          return {
            jsonrpc: '2.0',
            error: { code: -32601, message: `Method ${method} not found` },
            id,
          }
      }
    } catch (err) {
      return {
        jsonrpc: '2.0',
        error: { code: -32000, message: (err as Error).message },
        id,
      }
    }
  }
}

/**
 * Next.js API route handler for MCP calls
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await AzoraMCPServer.handle(body as MCPRequest)
    return NextResponse.json(response)
  } catch (error) {
    console.error('[MCP] failed to handle request', error)
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }, { status: 400 })
  }
}
