/**
 * Sankofa Agent Interface - "The Archivist" (Phase 11)
 * 
 * Constitutional Compliance:
 * - Sankofa does NOT write code
 * - Sankofa finds TRUTH through deep retrieval
 * - Prioritizes production code over comments/mocks
 * 
 * Sankofa Principle: "Se wo were fi na wosankofa a yenkyi"
 * "It is not wrong to go back for that which you have forgotten"
 * 
 * The Archivist specializes in:
 * - Finding relevant context from the codebase
 * - Answering "where is X handled?" questions
 * - Building knowledge graphs of dependencies
 * - Retrieving historical context
 */

import { getKnowledgeIndexer, type CodeChunk } from '../knowledge/indexer'
import { agentBridge, type AgentSignalPayload } from '../agent-bridge'

export interface ContextRequest {
  query: string
  maxResults?: number
  filterTypes?: Array<'file' | 'function' | 'class' | 'component' | 'api' | 'interface' | 'type'>
  language?: string
}

export interface ContextResult {
  chunks: CodeChunk[]
  totalFound: number
  query: string
  timestamp: Date
}

export interface DependencyNode {
  path: string
  name: string
  type: 'file' | 'component' | 'module'
  imports: string[]
  importedBy: string[]
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>
  edges: Array<{ from: string; to: string }>
}

/**
 * Sankofa Agent - The Archivist
 * Specializes in knowledge retrieval and context finding
 */
export class SankofaAgent {
  private static instance: SankofaAgent

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SankofaAgent {
    if (!SankofaAgent.instance) {
      SankofaAgent.instance = new SankofaAgent()
    }
    return SankofaAgent.instance
  }

  /**
   * Find context for a query
   * Returns the top N most relevant code snippets
   * 
   * Example: "Where is authentication handled?"
   * Returns: auth.ts, login-form.tsx, session-handler.ts
   */
  async findContext(request: ContextRequest): Promise<ContextResult> {
    const indexer = getKnowledgeIndexer()
    const maxResults = request.maxResults || 5

    console.log(`[Sankofa] Searching for: "${request.query}"`)

    // Search the knowledge base
    const searchResults = indexer.search(request.query, maxResults * 2)

    // Filter by type if specified
    let filteredChunks = searchResults.map(r => {
      const { score, match, ...chunk } = r
      return chunk
    })

    if (request.filterTypes && request.filterTypes.length > 0) {
      filteredChunks = filteredChunks.filter(chunk => 
        request.filterTypes!.includes(chunk.type)
      )
    }

    // Filter by language if specified
    if (request.language) {
      filteredChunks = filteredChunks.filter(chunk => 
        chunk.language === request.language
      )
    }

    // Limit to maxResults
    const chunks = filteredChunks.slice(0, maxResults)

    console.log(`[Sankofa] Found ${chunks.length} relevant code snippets`)

    return {
      chunks,
      totalFound: searchResults.length,
      query: request.query,
      timestamp: new Date()
    }
  }

  /**
   * Find specific code elements by name
   * Example: findByName("handleLogin") returns all functions/methods named handleLogin
   */
  async findByName(name: string, type?: CodeChunk['type']): Promise<CodeChunk[]> {
    const indexer = getKnowledgeIndexer()
    const results = indexer.search(name, 50)

    let chunks = results.map(r => {
      const { score, match, ...chunk } = r
      return chunk
    })

    // Filter by exact name match (case-insensitive)
    chunks = chunks.filter(chunk => 
      chunk.name.toLowerCase() === name.toLowerCase()
    )

    // Filter by type if specified
    if (type) {
      chunks = chunks.filter(chunk => chunk.type === type)
    }

    return chunks
  }

  /**
   * Get all code in a specific file
   */
  async getFileContext(filePath: string): Promise<CodeChunk[]> {
    const indexer = getKnowledgeIndexer()
    return indexer.getChunksForFile(filePath)
  }

  /**
   * Find all functions/classes in the codebase
   */
  async findAllByType(type: CodeChunk['type']): Promise<CodeChunk[]> {
    const indexer = getKnowledgeIndexer()
    return indexer.getChunksByType(type)
  }

  /**
   * Answer conceptual questions using semantic search
   * Example: "How does the login work?" -> finds login-related code
   */
  async answerQuestion(question: string): Promise<ContextResult> {
    console.log(`[Sankofa] Answering: "${question}"`)

    // Extract key terms from the question
    const keyTerms = this.extractKeyTerms(question)
    
    // Search using key terms
    const searchQuery = keyTerms.join(' ')
    
    return await this.findContext({
      query: searchQuery,
      maxResults: 5
    })
  }

  /**
   * Build a dependency graph for a file
   * Shows what imports what (import/require relationships)
   * 
   * Note: This is a simplified version. Full implementation would
   * parse import statements and build a complete graph.
   */
  async buildDependencyGraph(rootPath: string): Promise<DependencyGraph> {
    console.log(`[Sankofa] Building dependency graph from ${rootPath}`)

    const graph: DependencyGraph = {
      nodes: new Map(),
      edges: []
    }

    // This is a stub for future implementation
    // Full implementation would:
    // 1. Parse all files for import/require statements
    // 2. Build a graph of dependencies
    // 3. Detect circular dependencies
    // 4. Calculate dependency depth

    console.log('[Sankofa] Dependency graph generation not fully implemented yet')
    console.log('[Sankofa] Future: Will parse import statements and build full graph')

    return graph
  }

  /**
   * Get recommendations for similar code
   * "You wrote X, you might also need Y"
   */
  async getSimilarCode(codeChunk: CodeChunk): Promise<CodeChunk[]> {
    // Search for code with similar names or in similar files
    const indexer = getKnowledgeIndexer()
    
    // Build search query from the chunk
    const searchTerms = [
      codeChunk.name,
      codeChunk.fileName.replace(/\.[^.]+$/, ''), // filename without extension
      codeChunk.type
    ]

    const results = indexer.search(searchTerms.join(' '), 10)
    
    // Filter out the original chunk
    return results
      .filter(r => r.id !== codeChunk.id)
      .map(r => {
        const { score, match, ...chunk } = r
        return chunk
      })
      .slice(0, 5)
  }

  /**
   * Get statistics about the codebase
   */
  async getCodebaseStats() {
    const indexer = getKnowledgeIndexer()
    const stats = indexer.getStats()

    const functions = indexer.getChunksByType('function').length
    const classes = indexer.getChunksByType('class').length
    const components = indexer.getChunksByType('component').length
    const interfaces = indexer.getChunksByType('interface').length
    const apis = indexer.getChunksByType('api').length

    return {
      ...stats,
      breakdown: {
        functions,
        classes,
        components,
        interfaces,
        apis
      }
    }
  }

  /**
   * Extract key terms from a natural language question
   * Removes stop words and focuses on meaningful terms
   */
  private extractKeyTerms(question: string): string[] {
    const stopWords = new Set([
      'how', 'does', 'the', 'what', 'where', 'when', 'why', 'is', 'are',
      'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through',
      'work', 'works', 'do', 'i', 'we', 'you', 'it', 'they'
    ])

    // Split into words, lowercase, remove stop words
    const words = question
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))

    return words
  }

  /**
   * Format context results for display
   * Creates a human-readable summary
   */
  formatContextForDisplay(result: ContextResult): string {
    let output = `# Search Results for: "${result.query}"\n\n`
    output += `Found ${result.totalFound} total matches, showing top ${result.chunks.length}\n\n`

    result.chunks.forEach((chunk, index) => {
      output += `## ${index + 1}. ${chunk.name} (${chunk.type})\n`
      output += `**File:** ${chunk.path}\n`
      if (chunk.lineStart) {
        output += `**Lines:** ${chunk.lineStart}-${chunk.lineEnd || '?'}\n`
      }
      output += `\n\`\`\`${chunk.language || ''}\n${chunk.content}\n\`\`\`\n\n`
    })

    return output
  }

  /**
   * Integration with agent bridge for AI-powered context
   * When local search isn't enough, escalate to AI
   */
  async enhanceWithAI(contextResult: ContextResult): Promise<string> {
    const payload: AgentSignalPayload = {
      fileContent: this.formatContextForDisplay(contextResult),
      context: `User query: ${contextResult.query}`,
      room: 'KNOWLEDGE',
      projectName: 'BuildSpaces'
    }

    try {
      const response = await agentBridge.sendSignal('Sankofa', 'FIND_CONTEXT' as any, payload)

      if (response.status === 'success' && response.data) {
        return response.data.result || this.formatContextForDisplay(contextResult)
      }

      return this.formatContextForDisplay(contextResult)
    } catch (error) {
      console.error('[Sankofa] AI enhancement failed:', error)
      return this.formatContextForDisplay(contextResult)
    }
  }
}

/**
 * Helper function to get Sankofa instance
 */
export function getSankofa(): SankofaAgent {
  return SankofaAgent.getInstance()
}

/**
 * Quick helper: Find context for a query
 */
export async function findContext(query: string, maxResults: number = 5): Promise<ContextResult> {
  const sankofa = getSankofa()
  return await sankofa.findContext({ query, maxResults })
}

/**
 * Quick helper: Answer a question about the codebase
 */
export async function askSankofa(question: string): Promise<ContextResult> {
  const sankofa = getSankofa()
  return await sankofa.answerQuestion(question)
}
