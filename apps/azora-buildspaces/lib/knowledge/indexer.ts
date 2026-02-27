/**
 * Knowledge Engine Indexer - Phase 9 of Phoenix Protocol
 * 
 * Constitutional Compliance:
 * - Truth as Currency: Prioritizes production code over comments/mocks
 * - Privacy: Uses local keyword search (minisearch) by default
 * - Prepares hooks for vector embeddings when needed
 * 
 * This indexer crawls the Virtual File System (VFS) and builds
 * a searchable index using MiniSearch for fast, local keyword search.
 */

import MiniSearch from 'minisearch'
import { fileSystem, type FileNode } from '../workspace/file-system'

export interface CodeChunk {
  id: string
  path: string
  fileName: string
  type: 'file' | 'function' | 'class' | 'component' | 'api' | 'interface' | 'type'
  name: string
  content: string
  lineStart?: number
  lineEnd?: number
  language?: string
  relevanceScore?: number
}

export interface SearchResult extends CodeChunk {
  score: number
  match: Record<string, string[]>
}

export interface IndexStats {
  totalFiles: number
  totalChunks: number
  languages: Record<string, number>
  lastIndexed: Date
}

/**
 * Knowledge Indexer for BuildSpaces
 * Scans VFS and builds searchable index
 */
export class KnowledgeIndexer {
  private miniSearch: MiniSearch<CodeChunk>
  private chunks: Map<string, CodeChunk> = new Map()
  private stats: IndexStats = {
    totalFiles: 0,
    totalChunks: 0,
    languages: {},
    lastIndexed: new Date()
  }

  constructor() {
    // Initialize MiniSearch with configuration
    this.miniSearch = new MiniSearch<CodeChunk>({
      fields: ['name', 'content', 'fileName', 'path', 'type'], // fields to index
      storeFields: ['id', 'path', 'fileName', 'type', 'name', 'content', 'lineStart', 'lineEnd', 'language'], // fields to return
      searchOptions: {
        boost: { name: 3, fileName: 2, type: 2 }, // boost certain fields in search
        fuzzy: 0.2, // enable fuzzy matching
        prefix: true, // enable prefix search
      }
    })
  }

  /**
   * Index the entire VFS starting from a root directory
   */
  async indexProject(rootPath: string = '/'): Promise<IndexStats> {
    console.log(`[KnowledgeIndexer] Starting indexing from ${rootPath}`)
    
    this.chunks.clear()
    this.stats = {
      totalFiles: 0,
      totalChunks: 0,
      languages: {},
      lastIndexed: new Date()
    }

    try {
      // Check if root path exists
      const exists = await fileSystem.exists(rootPath)
      if (!exists) {
        console.warn(`[KnowledgeIndexer] Root path ${rootPath} does not exist`)
        return this.stats
      }

      // Recursively scan directories
      await this.scanDirectory(rootPath)

      // Build the search index
      const chunksArray = Array.from(this.chunks.values())
      if (chunksArray.length > 0) {
        this.miniSearch.removeAll()
        this.miniSearch.addAll(chunksArray)
      }

      console.log(`[KnowledgeIndexer] Indexed ${this.stats.totalFiles} files, ${this.stats.totalChunks} chunks`)
      return this.stats

    } catch (error) {
      console.error('[KnowledgeIndexer] Indexing failed:', error)
      throw error
    }
  }

  /**
   * Recursively scan a directory
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const files = await fileSystem.listFiles(dirPath)

      for (const file of files) {
        if (file.type === 'directory') {
          // Recursively scan subdirectories
          if (file.children) {
            await this.scanDirectory(file.path)
          }
        } else if (file.type === 'file') {
          await this.indexFile(file)
        }
      }
    } catch (error) {
      // Ignore directory read errors (permissions, etc)
      console.warn(`[KnowledgeIndexer] Failed to scan ${dirPath}:`, error)
    }
  }

  /**
   * Index a single file
   */
  private async indexFile(file: FileNode): Promise<void> {
    try {
      // Skip non-code files
      const ext = this.getFileExtension(file.name)
      if (!this.isCodeFile(ext)) {
        return
      }

      const language = this.getLanguageFromExtension(ext)
      
      // Read file content
      const content = await fileSystem.readFile(file.path)
      
      this.stats.totalFiles++
      this.stats.languages[language] = (this.stats.languages[language] || 0) + 1

      // Add the file itself as a chunk
      const fileChunk: CodeChunk = {
        id: file.path,
        path: file.path,
        fileName: file.name,
        type: 'file',
        name: file.name,
        content: this.truncateContent(content, 500),
        language,
        relevanceScore: 0.6 // Base relevance for whole files
      }
      this.chunks.set(fileChunk.id, fileChunk)
      this.stats.totalChunks++

      // Extract and chunk code elements
      await this.chunkFile(file.path, file.name, content, language)

    } catch (error) {
      console.warn(`[KnowledgeIndexer] Failed to index ${file.path}:`, error)
    }
  }

  /**
   * Chunk a file into logical code blocks
   * Extracts functions, classes, components, etc.
   */
  private async chunkFile(
    filePath: string,
    fileName: string,
    content: string,
    language: string
  ): Promise<void> {
    const lines = content.split('\n')

    // Extract functions
    // Note: Basic pattern for MVP. Future: Support type annotations like 'function myFunc(): string'
    const functionRegex = /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm
    let match
    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[1]
      const lineStart = content.substring(0, match.index).split('\n').length
      const funcContent = this.extractBlock(lines, lineStart - 1)
      
      const chunk: CodeChunk = {
        id: `${filePath}:function:${funcName}:${match.index}`,
        path: filePath,
        fileName,
        type: 'function',
        name: funcName,
        content: funcContent,
        lineStart,
        lineEnd: lineStart + funcContent.split('\n').length,
        language,
        relevanceScore: 0.85
      }
      this.chunks.set(chunk.id, chunk)
      this.stats.totalChunks++
    }

    // Extract arrow functions / const functions
    // Note: Improved pattern to support return types like ': string =>'
    const arrowFunctionRegex = /^\s*(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)(?:\s*:\s*[^{]+)?\s*=>/gm
    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      const funcName = match[1]
      const lineStart = content.substring(0, match.index).split('\n').length
      const funcContent = this.extractBlock(lines, lineStart - 1)
      
      const chunk: CodeChunk = {
        id: `${filePath}:arrow-func:${funcName}:${match.index}`,
        path: filePath,
        fileName,
        type: 'function',
        name: funcName,
        content: funcContent,
        lineStart,
        lineEnd: lineStart + funcContent.split('\n').length,
        language,
        relevanceScore: 0.85
      }
      this.chunks.set(chunk.id, chunk)
      this.stats.totalChunks++
    }

    // Extract classes
    const classRegex = /^\s*(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/gm
    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1]
      const lineStart = content.substring(0, match.index).split('\n').length
      const classContent = this.extractBlock(lines, lineStart - 1)
      
      const chunk: CodeChunk = {
        id: `${filePath}:class:${className}:${match.index}`,
        path: filePath,
        fileName,
        type: 'class',
        name: className,
        content: classContent,
        lineStart,
        lineEnd: lineStart + classContent.split('\n').length,
        language,
        relevanceScore: 0.9
      }
      this.chunks.set(chunk.id, chunk)
      this.stats.totalChunks++
    }

    // Extract React components (default exports)
    if (language === 'typescript' || language === 'javascript') {
      const componentRegex = /export\s+default\s+(?:function\s+)?(\w+)/g
      while ((match = componentRegex.exec(content)) !== null) {
        const componentName = match[1]
        const lineStart = content.substring(0, match.index).split('\n').length
        
        const chunk: CodeChunk = {
          id: `${filePath}:component:${componentName}:${match.index}`,
          path: filePath,
          fileName,
          type: 'component',
          name: componentName,
          content: this.truncateContent(content, 300),
          lineStart,
          language,
          relevanceScore: 0.9
        }
        this.chunks.set(chunk.id, chunk)
        this.stats.totalChunks++
      }
    }

    // Extract interfaces
    const interfaceRegex = /^\s*(?:export\s+)?interface\s+(\w+)/gm
    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1]
      const lineStart = content.substring(0, match.index).split('\n').length
      const interfaceContent = this.extractBlock(lines, lineStart - 1, '{', '}')
      
      const chunk: CodeChunk = {
        id: `${filePath}:interface:${interfaceName}:${match.index}`,
        path: filePath,
        fileName,
        type: 'interface',
        name: interfaceName,
        content: interfaceContent,
        lineStart,
        lineEnd: lineStart + interfaceContent.split('\n').length,
        language,
        relevanceScore: 0.8
      }
      this.chunks.set(chunk.id, chunk)
      this.stats.totalChunks++
    }

    // Extract type aliases
    const typeRegex = /^\s*(?:export\s+)?type\s+(\w+)\s*=/gm
    while ((match = typeRegex.exec(content)) !== null) {
      const typeName = match[1]
      const lineStart = content.substring(0, match.index).split('\n').length
      const typeLine = lines[lineStart - 1]
      
      const chunk: CodeChunk = {
        id: `${filePath}:type:${typeName}:${match.index}`,
        path: filePath,
        fileName,
        type: 'type',
        name: typeName,
        content: typeLine,
        lineStart,
        lineEnd: lineStart + 1,
        language,
        relevanceScore: 0.75
      }
      this.chunks.set(chunk.id, chunk)
      this.stats.totalChunks++
    }

    // Detect API routes (Next.js convention)
    if (filePath.includes('/api/') && fileName === 'route.ts') {
      const apiPath = filePath.replace(/\/route\.ts$/, '').replace(/^.*\/api/, '/api')
      const chunk: CodeChunk = {
        id: `${filePath}:api:${apiPath}`,
        path: filePath,
        fileName,
        type: 'api',
        name: apiPath,
        content: this.truncateContent(content, 300),
        language,
        relevanceScore: 0.95
      }
      this.chunks.set(chunk.id, chunk)
      this.stats.totalChunks++
    }
  }

  /**
   * Extract a code block starting from a line
   * Handles balanced braces
   */
  private extractBlock(
    lines: string[],
    startLine: number,
    openChar: string = '{',
    closeChar: string = '}'
  ): string {
    const result: string[] = []
    let braceCount = 0
    let started = false

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i]
      result.push(line)

      // Count braces
      for (const char of line) {
        if (char === openChar) {
          braceCount++
          started = true
        } else if (char === closeChar) {
          braceCount--
        }
      }

      // Stop when braces are balanced and we've started
      if (started && braceCount === 0) {
        break
      }

      // Safety limit: max 100 lines per block
      if (result.length > 100) {
        break
      }
    }

    return result.join('\n')
  }

  /**
   * Truncate content to a maximum length
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength) + '...'
  }

  /**
   * Search the indexed content
   */
  search(query: string, limit: number = 10): SearchResult[] {
    try {
      const results = this.miniSearch.search(query, { 
        boost: { name: 3, fileName: 2, type: 2 },
        fuzzy: 0.2,
        prefix: true,
      })

      // Convert to SearchResult and limit
      return results.slice(0, limit).map(result => ({
        ...result,
        score: result.score,
        match: result.match || {}
      } as unknown as SearchResult))
    } catch (error) {
      console.error('[KnowledgeIndexer] Search failed:', error)
      return []
    }
  }

  /**
   * Find context for a query (returns top relevant code snippets)
   * Used by agents to gather context
   */
  async findContext(query: string, maxResults: number = 5): Promise<CodeChunk[]> {
    const results = this.search(query, maxResults)
    return results.map(r => {
      const { score, match, ...chunk } = r
      return chunk
    })
  }

  /**
   * Get chunks by type
   */
  getChunksByType(type: CodeChunk['type']): CodeChunk[] {
    return Array.from(this.chunks.values()).filter(chunk => chunk.type === type)
  }

  /**
   * Get all chunks for a file
   */
  getChunksForFile(filePath: string): CodeChunk[] {
    return Array.from(this.chunks.values()).filter(chunk => chunk.path === filePath)
  }

  /**
   * Get indexing statistics
   */
  getStats(): IndexStats {
    return { ...this.stats }
  }

  /**
   * Check if a file extension is a code file
   */
  private isCodeFile(ext: string): boolean {
    const codeExtensions = [
      'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
      'py', 'java', 'cpp', 'c', 'h', 'hpp',
      'go', 'rs', 'rb', 'php', 'cs', 'swift',
      'kt', 'scala', 'sh', 'bash', 'sql',
      'md', 'json', 'yaml', 'yml', 'xml',
      'html', 'css', 'scss', 'sass', 'less'
    ]
    return codeExtensions.includes(ext.toLowerCase())
  }

  /**
   * Get file extension without dot
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.')
    if (lastDot === -1) return ''
    return fileName.substring(lastDot + 1)
  }

  /**
   * Map file extension to language
   */
  private getLanguageFromExtension(ext: string): string {
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'mjs': 'javascript',
      'cjs': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'h': 'c',
      'hpp': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'cs': 'csharp',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'shell',
      'bash': 'shell',
      'sql': 'sql',
      'md': 'markdown',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less'
    }
    return languageMap[ext.toLowerCase()] || ext.toLowerCase()
  }

  /**
   * Stub for future embedding support
   * When we add vector embeddings, this will generate embeddings for chunks
   */
  async generateEmbeddings(apiKey?: string): Promise<void> {
    console.log('[KnowledgeIndexer] Embedding generation not yet implemented')
    console.log('[KnowledgeIndexer] To enable embeddings, integrate with OpenAI/Cohere/local model')
    
    if (apiKey) {
      console.warn('[KnowledgeIndexer] Warning: Sending code to external API for embeddings')
      console.warn('[KnowledgeIndexer] Ensure user consent for privacy compliance')
    }
    
    // Future implementation:
    // 1. Iterate through chunks
    // 2. Generate embeddings via API or local model
    // 3. Store embeddings with chunks for semantic search
    // 4. Add vector similarity search capability
  }
}

// Singleton instance
let indexerInstance: KnowledgeIndexer | null = null

/**
 * Get the global Knowledge Indexer instance
 */
export function getKnowledgeIndexer(): KnowledgeIndexer {
  if (!indexerInstance) {
    indexerInstance = new KnowledgeIndexer()
  }
  return indexerInstance
}

/**
 * Initialize and index a project
 */
export async function initializeKnowledgeEngine(rootPath: string = '/'): Promise<IndexStats> {
  const indexer = getKnowledgeIndexer()
  return await indexer.indexProject(rootPath)
}
