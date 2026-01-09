"use client"

import { useState, useEffect } from "react"
import { Search, FileText, FolderTree, Database, Clock, RefreshCw, Code2, Brain, Layers, FileCode, Zap, Check, Globe, BookOpen, Link2, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface KnowledgeItem {
  id: string
  title: string
  type: "file" | "function" | "component" | "api" | "schema" | "doc" | "external"
  path?: string
  description?: string
  relevance?: number
  source?: string
}

interface KnowledgeOceanProps {
  onSwitchToCommand: () => void
}

export default function KnowledgeOcean({ onSwitchToCommand }: KnowledgeOceanProps) {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("files")

  // Dynamic file scanning function using new Knowledge Engine
  const scanProjectFiles = async () => {
    setIsScanning(true)
    try {
      // First, trigger indexing
      const indexResponse = await fetch('/api/knowledge/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootPath: '/' })
      })

      if (!indexResponse.ok) {
        console.error('Failed to index project')
        setKnowledgeItems([])
        setIsScanning(false)
        return
      }

      const indexData = await indexResponse.json()
      console.log('[KnowledgeOcean] Indexed:', indexData.stats)

      // Then, get a sample of items using a broad search
      const searchResponse = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '*', mode: 'local', maxResults: 1000 })
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        // Convert search results to KnowledgeItems
        const items: KnowledgeItem[] = (searchData.results || []).map((result: any) => ({
          id: result.id,
          title: result.name,
          type: result.type,
          path: result.path,
          description: result.content ? result.content.substring(0, 100) : undefined,
          relevance: result.score || result.relevanceScore
        }))
        setKnowledgeItems(items)
      } else {
        console.error('Failed to fetch indexed items')
        setKnowledgeItems([])
      }
    } catch (error) {
      console.error('Error scanning files:', error)
      setKnowledgeItems([])
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    scanProjectFiles()
  }, [])

  const filteredKnowledge = knowledgeItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.path?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'file': return FileText
      case 'function': return Code2
      case 'component': return Layers
      case 'api': return Globe
      case 'schema': return Database
      case 'doc': return BookOpen
      case 'external': return Link2
      default: return FileText
    }
  }

  const getTypeColor = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'file': return 'text-blue-500'
      case 'function': return 'text-green-500'
      case 'component': return 'text-purple-500'
      case 'api': return 'text-orange-500'
      case 'schema': return 'text-red-500'
      case 'doc': return 'text-yellow-500'
      case 'external': return 'text-cyan-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Knowledge Ocean</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={scanProjectFiles}
            disabled={isScanning}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Rescan'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="pl-10 pr-4 py-1 bg-muted/50 border border-border rounded-md text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="docs">Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
              {filteredKnowledge
                .filter(item => item.type === 'file')
                .map((item) => {
                  const Icon = getTypeIcon(item.type)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${getTypeColor(item.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            {item.relevance && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(item.relevance * 100)}% relevant
                              </span>
                            )}
                          </div>
                          {item.path && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {item.path}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
            {filteredKnowledge.filter(item => item.type === 'file').length === 0 && !isScanning && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files found. Click "Rescan" to index your project.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="functions" className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
              {filteredKnowledge
                .filter(item => item.type === 'function')
                .map((item) => {
                  const Icon = getTypeIcon(item.type)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${getTypeColor(item.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <code className="text-xs bg-muted px-2 py-1 rounded">function</code>
                          </div>
                          {item.path && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {item.path}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
            {filteredKnowledge.filter(item => item.type === 'function').length === 0 && !isScanning && (
              <div className="text-center py-8 text-muted-foreground">
                <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No functions found. Click "Rescan" to index your project.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="apis" className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
              {filteredKnowledge
                .filter(item => item.type === 'api')
                .map((item) => {
                  const Icon = getTypeIcon(item.type)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${getTypeColor(item.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <code className="text-xs bg-muted px-2 py-1 rounded">API</code>
                          </div>
                          {item.path && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {item.path}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
            {filteredKnowledge.filter(item => item.type === 'api').length === 0 && !isScanning && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No APIs found. Click "Rescan" to index your project.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="docs" className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
              {filteredKnowledge
                .filter(item => item.type === 'doc')
                .map((item) => {
                  const Icon = getTypeIcon(item.type)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${getTypeColor(item.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <code className="text-xs bg-muted px-2 py-1 rounded">DOC</code>
                          </div>
                          {item.path && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {item.path}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
            {filteredKnowledge.filter(item => item.type === 'doc').length === 0 && !isScanning && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documentation found. Click "Rescan" to index your project.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t flex items-center justify-between px-4 bg-muted/10 text-xs text-muted-foreground">
        <span>{filteredKnowledge.length} items indexed</span>
        <div className="flex items-center gap-4">
          <span>Last scan: {new Date().toLocaleTimeString()}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchToCommand}
            className="h-6 px-2 text-xs"
          >
            Ask AI
          </Button>
        </div>
      </div>
    </div>
  )
}
