"use client"

/**
 * OmniSearch Component - Command Palette on Steroids (Phase 10)
 * 
 * Constitutional Compliance:
 * - Universal search across files, symbols, and concepts
 * - Integrates with Knowledge Engine and Sankofa
 * - Privacy-first: local search by default
 * 
 * Features:
 * - Cmd+K (Mac) / Ctrl+K (Windows/Linux) to open
 * - Search files, functions, classes, components
 * - Semantic concept search: "Where is auth handled?"
 * - Agent integration: Elara can query this automatically
 */

import { useEffect, useState, useCallback } from 'react'
import { Search, FileText, Code2, Box, Zap, BookOpen, Database, Loader2, AlertCircle, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getKnowledgeIndexer, type SearchResult } from '@/lib/knowledge/indexer'
import { getSankofa } from '@/lib/agents/sankofa-interface'

interface OmniSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectFile?: (filePath: string, lineNumber?: number) => void
}

export default function OmniSearch({ open, onOpenChange, onSelectFile }: OmniSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchMode, setSearchMode] = useState<'local' | 'concept'>('local')
  const [indexStatus, setIndexStatus] = useState<'idle' | 'indexing' | 'ready'>('idle')

  // Initialize indexer on mount
  useEffect(() => {
    const initIndexer = async () => {
      try {
        setIndexStatus('indexing')
        const indexer = getKnowledgeIndexer()
        await indexer.indexProject('/')
        setIndexStatus('ready')
      } catch (error) {
        console.error('[OmniSearch] Failed to initialize indexer:', error)
        setIndexStatus('idle')
      }
    }

    if (open && indexStatus === 'idle') {
      initIndexer()
    }
  }, [open, indexStatus])

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    try {
      const indexer = getKnowledgeIndexer()
      
      if (searchMode === 'local') {
        // Direct keyword search
        const searchResults = indexer.search(searchQuery, 20)
        setResults(searchResults)
      } else {
        // Concept search using Sankofa
        const sankofa = getSankofa()
        const contextResult = await sankofa.answerQuestion(searchQuery)
        
        // Convert chunks to search results
        const searchResults: SearchResult[] = contextResult.chunks.map((chunk, index) => ({
          ...chunk,
          score: 1 - (index * 0.1), // Descending score
          match: {}
        }))
        setResults(searchResults)
      }
    } catch (error) {
      console.error('[OmniSearch] Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchMode])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex, onOpenChange])

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    if (onSelectFile) {
      onSelectFile(result.path, result.lineStart)
    }
    onOpenChange(false)
  }

  // Get icon for result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'function':
        return Code2
      case 'class':
        return Box
      case 'component':
        return Zap
      case 'api':
        return Database
      case 'interface':
      case 'type':
        return FileText
      default:
        return FileText
    }
  }

  // Get color for result type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'function':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'class':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'component':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'api':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'interface':
      case 'type':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'file':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            OmniSearch - Knowledge Ocean
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                searchMode === 'local'
                  ? 'Search files, functions, classes...'
                  : 'Ask a question: "Where is authentication handled?"'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Mode Toggle */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setSearchMode('local')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                searchMode === 'local'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Keyword Search
            </button>
            <button
              onClick={() => setSearchMode('concept')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                searchMode === 'concept'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Concept Search
            </button>
            
            {indexStatus === 'indexing' && (
              <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Indexing...
              </div>
            )}
            {indexStatus === 'ready' && (
              <div className="flex items-center gap-2 ml-auto text-xs text-green-600">
                <Info className="w-3 h-3" />
                Index ready
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="h-[400px]">
          {results.length === 0 && query && !isSearching && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or switching search modes
              </p>
            </div>
          )}

          {results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">Search the Knowledge Ocean</p>
              <p className="text-sm text-muted-foreground mt-2">
                Find files, functions, classes, or ask conceptual questions
              </p>
            </div>
          )}

          <div className="p-2">
            {results.map((result, index) => {
              const Icon = getTypeIcon(result.type)
              const isSelected = index === selectedIndex

              return (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                    isSelected
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {result.name}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 ${getTypeColor(result.type)}`}
                        >
                          {result.type}
                        </Badge>
                        {result.language && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {result.language}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {result.path}
                        {result.lineStart && ` :${result.lineStart}`}
                      </p>
                      
                      {result.content && (
                        <pre className="text-xs text-muted-foreground mt-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full font-mono">
                          {result.content.substring(0, 100)}
                          {result.content.length > 100 && '...'}
                        </pre>
                      )}
                    </div>

                    {result.score !== undefined && (
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        {Math.round(result.score * 100)}%
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>{results.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to use OmniSearch with global keyboard shortcut
 */
export function useOmniSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
