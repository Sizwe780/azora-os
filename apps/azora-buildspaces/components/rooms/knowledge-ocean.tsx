"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  Search,
  FileText,
  FolderTree,
  Database,
  Clock,
  RefreshCw,
  Code2,
  Brain,
  Layers,
  FileCode,
  Zap,
  Globe,
  BookOpen,
  Link2,
  Upload,
  Trash2,
  Filter,
  ChevronRight,
  Star,
  Eye,
  ArrowUpRight,
  Hash,
  Sparkles,
  Network,
  GitBranch,
  Package,
  Shield,
  BarChart3,
  X,
  Check,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Download,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/* ─── types ─── */
interface KnowledgeItem {
  id: string
  title: string
  type: "file" | "function" | "component" | "api" | "schema" | "doc" | "external" | "package" | "test"
  path?: string
  description?: string
  relevance?: number
  source?: string
  language?: string
  size?: number
  lastModified?: string
  tags?: string[]
}

/* ─── highlight helper ─── */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

interface IndexStats {
  totalFiles: number
  totalFunctions: number
  totalComponents: number
  totalApis: number
  totalDocs: number
  lastScan: Date | null
}

/* ─── type config ─── */
const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  file: { icon: FileText, color: "text-blue-400", label: "File" },
  function: { icon: Code2, color: "text-emerald-400", label: "Function" },
  component: { icon: Layers, color: "text-purple-400", label: "Component" },
  api: { icon: Globe, color: "text-orange-400", label: "API" },
  schema: { icon: Database, color: "text-red-400", label: "Schema" },
  doc: { icon: BookOpen, color: "text-yellow-400", label: "Doc" },
  external: { icon: Link2, color: "text-cyan-400", label: "External" },
  package: { icon: Package, color: "text-pink-400", label: "Package" },
  test: { icon: Shield, color: "text-green-400", label: "Test" },
}

const TABS = [
  { id: "all", label: "All", icon: Layers },
  { id: "files", label: "Files", icon: FileText },
  { id: "functions", label: "Functions", icon: Code2 },
  { id: "components", label: "Components", icon: Layers },
  { id: "apis", label: "APIs", icon: Globe },
  { id: "docs", label: "Docs", icon: BookOpen },
]

/* ─── knowledge item card ─── */
function KnowledgeCard({
  item,
  searchQuery = "",
  onDelete,
}: {
  item: KnowledgeItem
  searchQuery?: string
  onDelete?: (id: string) => void
}) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.file
  const Icon = config.icon
  const [copied, setCopied] = useState(false)

  const copyPath = () => {
    if (item.path) {
      navigator.clipboard.writeText(item.path)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLink = () => {
    // construct a real shareable URL using the current origin; the
    // knowledge explorer page handles deep linking by ID.
    const url = `${window.location.origin}/knowledge/${encodeURIComponent(item.id)}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportMarkdown = () => {
    const content = [
      `# ${item.title}`,
      "",
      item.description || "",
      "",
      item.path ? `**Path:** \`${item.path}\`` : "",
      item.tags?.length ? `**Tags:** ${item.tags.join(", ")}` : "",
    ]
      .filter((l) => l !== undefined)
      .join("\n")
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.title.replace(/\s+/g, "-").toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-1.5 rounded-md bg-zinc-800/50 ${config.color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
              {highlightText(item.title, searchQuery)}
            </h4>
            <Badge variant="outline" className={`text-[9px] h-4 px-1 border-zinc-700/50 ${config.color}`}>
              {config.label}
            </Badge>
            {item.relevance != null && item.relevance > 0 && (
              <span className="text-[10px] text-zinc-600 ml-auto flex-shrink-0">
                {Math.round(item.relevance * 100)}%
              </span>
            )}
          </div>

          {item.path && (
            <div className="flex items-center gap-1.5 group/path">
              <p className="text-[11px] text-zinc-500 truncate font-mono">{item.path}</p>
              <button
                onClick={(e) => { e.stopPropagation(); copyPath() }}
                className="opacity-0 group-hover/path:opacity-100 transition-opacity flex-shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-400" />}
              </button>
            </div>
          )}

          {item.description && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
              {highlightText(item.description, searchQuery)}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.language && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-zinc-800 text-zinc-500">
                {item.language}
              </Badge>
            )}
            {item.size != null && (
              <span className="text-[10px] text-zinc-600">
                {item.size > 1024 ? `${(item.size / 1024).toFixed(1)} KB` : `${item.size} B`}
              </span>
            )}
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] h-4 px-1.5 border-blue-800/50 text-blue-400/80 bg-blue-500/5">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-zinc-500 hover:text-white"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-white">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs w-44">
              <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer hover:bg-zinc-800">
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportMarkdown} className="gap-2 cursor-pointer hover:bg-zinc-800">
                <Download className="w-3.5 h-3.5" /> Export as Markdown
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="gap-2 cursor-pointer text-red-400 hover:bg-zinc-800 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════ */
/*              KNOWLEDGE OCEAN                    */
/* ═══════════════════════════════════════════════ */
export default function KnowledgeOcean() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchMode, setSearchMode] = useState<"local" | "semantic">("local")
  const [ragQuestion, setRagQuestion] = useState("")
  const [ragAnswer, setRagAnswer] = useState("")
  const [ragSources, setRagSources] = useState<any[]>([])
  const [isAskingRag, setIsAskingRag] = useState(false)
  const [showAskPanel, setShowAskPanel] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string; sources: any[]; timestamp: string }[]>([])
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [stats, setStats] = useState<IndexStats>({
    totalFiles: 0,
    totalFunctions: 0,
    totalComponents: 0,
    totalApis: 0,
    totalDocs: 0,
    lastScan: null,
  })

  // New document dialog state
  const [showNewDocDialog, setShowNewDocDialog] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState("")
  const [newDocContent, setNewDocContent] = useState("")
  const [newDocTags, setNewDocTags] = useState("")

  // Active tag filter
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)

  // Scan project files using Knowledge Engine
  const scanProjectFiles = useCallback(async () => {
    setIsScanning(true)
    try {
      // Trigger indexing
      const indexResponse = await fetch("/api/knowledge/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rootPath: "/" }),
      })

      if (indexResponse.ok) {
        const indexData = await indexResponse.json()
        console.log("[KnowledgeOcean] Indexed:", indexData.stats)

        if (indexData.stats) {
          setStats({
            totalFiles: indexData.stats.files || 0,
            totalFunctions: indexData.stats.functions || 0,
            totalComponents: indexData.stats.components || 0,
            totalApis: indexData.stats.apis || 0,
            totalDocs: indexData.stats.docs || 0,
            lastScan: new Date(),
          })
        }
      }

      // Get items via search
      const searchResponse = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "*", mode: "local", maxResults: 1000 }),
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        const items: KnowledgeItem[] = (searchData.results || []).map((result: any) => ({
          id: result.id,
          title: result.name,
          type: result.type,
          path: result.path,
          description: result.content ? result.content.substring(0, 150) : undefined,
          relevance: result.score || result.relevanceScore,
          language: result.language,
          size: result.size,
        }))
        setKnowledgeItems(items)
      } else {
        setKnowledgeItems([])
      }
    } catch (error) {
      console.error("Error scanning files:", error)
      setKnowledgeItems([])
    } finally {
      setIsScanning(false)
    }
  }, [])

  // Semantic search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    try {
      const resp = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, mode: searchMode, maxResults: 50 }),
      })

      if (resp.ok) {
        const data = await resp.json()
        const items: KnowledgeItem[] = (data.results || []).map((r: any) => ({
          id: r.id,
          title: r.name,
          type: r.type,
          path: r.path,
          description: r.content ? r.content.substring(0, 150) : undefined,
          relevance: r.score || r.relevanceScore,
          language: r.language,
        }))
        setKnowledgeItems(items)
      }
    } catch (error) {
      console.error("Search failed:", error)
    }
  }, [searchMode])

  // RAG Q&A — Ask questions about the codebase
  const askQuestion = useCallback(async () => {
    if (!ragQuestion.trim() || isAskingRag) return
    setIsAskingRag(true)
    setRagAnswer("")
    setRagSources([])

    // Emit cross-room event for achievement tracking
    try {
      fetch('/api/collectibles/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'knowledge-ask', room: 'knowledge-ocean' }),
      }).catch(() => {})
    } catch { /* silent */ }

    try {
      // First, retrieve relevant context via search
      const searchResp = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ragQuestion, mode: "local", maxResults: 10 }),
      })

      let context: any[] = []
      if (searchResp.ok) {
        const searchData = await searchResp.json()
        context = (searchData.results || []).map((r: any) => ({
          title: r.name,
          path: r.path,
          content: r.content ? r.content.substring(0, 500) : r.name,
          relevance: r.score,
        }))
      }

      // Then, ask the RAG endpoint
      const ragResp = await fetch("/api/knowledge/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: ragQuestion, context }),
      })

      if (ragResp.ok) {
        const ragData = await ragResp.json()
        const answer = ragData.answer || "No answer generated."
        const sources = ragData.sources || []
        setRagAnswer(answer)
        setRagSources(sources)

        // Save to conversation history
        const entry = { question: ragQuestion, answer, sources, timestamp: new Date().toISOString() }
        setConversationHistory(prev => [...prev, entry])

        // Fetch related follow-up questions
        try {
          const relResp = await fetch("/api/knowledge/graph", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "suggest-related", question: ragQuestion, answer }),
          })
          if (relResp.ok) {
            const relData = await relResp.json()
            setRelatedQuestions(relData.suggestions || [])
          }
        } catch { /* silent */ }
      } else {
        setRagAnswer("Sorry, I couldn't generate an answer. Please try again.")
      }
    } catch (error) {
      console.error("RAG Q&A failed:", error)
      setRagAnswer("An error occurred while processing your question.")
    } finally {
      setIsAskingRag(false)
    }
  }, [ragQuestion, isAskingRag])

  // Save new document
  const saveNewDocument = useCallback(() => {
    if (!newDocTitle.trim()) return
    const tags = newDocTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const newItem: KnowledgeItem = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      type: "doc",
      description: newDocContent.trim() || undefined,
      size: newDocContent.length,
      tags,
      lastModified: new Date().toISOString(),
    }
    setKnowledgeItems((prev) => [newItem, ...prev])
    setNewDocTitle("")
    setNewDocContent("")
    setNewDocTags("")
    setShowNewDocDialog(false)
  }, [newDocTitle, newDocContent, newDocTags])

  // Delete item from state
  const deleteItem = useCallback((id: string) => {
    setKnowledgeItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  useEffect(() => {
    scanProjectFiles()
  }, [scanProjectFiles])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) return
    const timer = setTimeout(() => performSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // Filter by tab + tag
  const filteredItems = useMemo(() => {
    let items = knowledgeItems

    if (activeTab !== "all") {
      const typeMap: Record<string, string[]> = {
        files: ["file"],
        functions: ["function"],
        components: ["component"],
        apis: ["api"],
        docs: ["doc", "external"],
      }
      const types = typeMap[activeTab] || []
      items = items.filter((item) => types.includes(item.type))
    }

    if (searchQuery && !searchMode) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.path?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (activeTagFilter) {
      items = items.filter((item) => item.tags?.includes(activeTagFilter))
    }

    return items
  }, [knowledgeItems, activeTab, searchQuery, searchMode, activeTagFilter])

  // All unique tags across all items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    knowledgeItems.forEach((item) => item.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [knowledgeItems])

  // Storage used derived from content lengths (in KB)
  const storageUsedKB = useMemo(() => {
    return (knowledgeItems.reduce((acc, item) => acc + (item.size || (item.description?.length ?? 0)), 0) / 1024).toFixed(1)
  }, [knowledgeItems])

  const totalIndexed = knowledgeItems.length

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── New Document Dialog ── */}
      <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              New Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Title</Label>
              <Input
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Document title"
                className="h-9 bg-zinc-950/50 border-zinc-700/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Content (Markdown)</Label>
              <Textarea
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                placeholder="Write markdown content..."
                className="min-h-[120px] bg-zinc-950/50 border-zinc-700/50 text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Tags (comma-separated)</Label>
              <Input
                value={newDocTags}
                onChange={(e) => setNewDocTags(e.target.value)}
                placeholder="e.g. auth, api, frontend"
                className="h-9 bg-zinc-950/50 border-zinc-700/50 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewDocDialog(false)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveNewDocument}
              disabled={!newDocTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Header ── */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Brain className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="font-semibold text-base">Knowledge Ocean</h1>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-zinc-700 text-zinc-500">
            {totalIndexed} indexed
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Mode Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchMode("local")}
              className={`h-7 px-2.5 text-xs gap-1 ${searchMode === "local" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
            >
              <Search className="w-3 h-3" />
              Text
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchMode("semantic")}
              className={`h-7 px-2.5 text-xs gap-1 ${searchMode === "semantic" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
            >
              <Sparkles className="w-3 h-3" />
              Semantic
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAskPanel(!showAskPanel)}
            className={`h-8 gap-1.5 border-zinc-700 ${showAskPanel ? "text-blue-400 border-blue-500/50" : "text-zinc-300"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewDocDialog(true)}
            className="h-8 gap-1.5 border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            New Doc
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={scanProjectFiles}
            disabled={isScanning}
            className="h-8 gap-1.5 border-zinc-700 text-zinc-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning…" : "Rescan"}
          </Button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="px-6 py-3 border-b border-zinc-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchMode === "semantic" ? "Search with natural language..." : "Search knowledge base..."}
            className="pl-10 h-9 bg-zinc-900/50 border-zinc-700/50 text-sm text-zinc-200 placeholder:text-zinc-600"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchQuery(""); scanProjectFiles() }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Ask AI Panel (RAG) ── */}
      <AnimatePresence>
        {showAskPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-800/50 overflow-hidden"
          >
            <div className="px-6 py-4 bg-zinc-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-zinc-200">Ask about your codebase</span>
                {conversationHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="ml-auto text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    {conversationHistory.length} previous {conversationHistory.length === 1 ? "question" : "questions"}
                  </button>
                )}
              </div>

              {/* Conversation History */}
              {showHistory && conversationHistory.length > 0 && (
                <div className="mb-3 max-h-40 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
                  {conversationHistory.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => { setRagQuestion(entry.question); setShowHistory(false) }}
                      className="w-full text-left p-2 rounded-md bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800/50 transition-colors"
                    >
                      <div className="text-xs text-zinc-400 truncate">{entry.question}</div>
                      <div className="text-[10px] text-zinc-600 truncate mt-0.5">{entry.answer.substring(0, 80)}…</div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={ragQuestion}
                  onChange={(e) => setRagQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                  placeholder="e.g. How does the authentication flow work?"
                  className="flex-1 h-9 bg-zinc-900/50 border-zinc-700/50 text-sm text-zinc-200 placeholder:text-zinc-600"
                  disabled={isAskingRag}
                />
                <Button
                  onClick={askQuestion}
                  disabled={isAskingRag || !ragQuestion.trim()}
                  size="sm"
                  className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAskingRag ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isAskingRag ? "Thinking…" : "Ask"}
                </Button>
              </div>
              {ragAnswer && (
                <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
                  <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{ragAnswer}</div>
                  {ragSources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-zinc-700/30">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Sources</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {ragSources.map((src: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px] h-5 px-1.5 border-zinc-700 text-zinc-500">
                            {src.title || src.path}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Related Questions */}
              {relatedQuestions.length > 0 && (
                <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/20">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Related Questions</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {relatedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setRagQuestion(q); setRelatedQuestions([]) }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Index Statistics Dashboard ── */}
      <div className="px-6 py-3 border-b border-zinc-800/30 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Documents</div>
          <div className="text-lg font-semibold text-zinc-200">{totalIndexed}</div>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Indexed</div>
          <div className="text-lg font-semibold text-zinc-200">
            {stats.totalFiles + stats.totalFunctions + stats.totalComponents + stats.totalApis + stats.totalDocs}
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Storage Used</div>
          <div className="text-lg font-semibold text-zinc-200">{storageUsedKB} KB</div>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Last Indexed</div>
          <div className="text-sm font-medium text-zinc-200 truncate">
            {stats.lastScan ? stats.lastScan.toLocaleTimeString() : "—"}
          </div>
        </div>
      </div>

      {/* ── Tag Filter Bar ── */}
      {allTags.length > 0 && (
        <div className="px-6 py-2 border-b border-zinc-800/30 flex items-center gap-2 flex-wrap">
          <Tag className="w-3 h-3 text-zinc-600 flex-shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                activeTagFilter === tag
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                  : "bg-zinc-800/30 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              #{tag}
            </button>
          ))}
          {activeTagFilter && (
            <button
              onClick={() => setActiveTagFilter(null)}
              className="text-[10px] text-zinc-600 hover:text-zinc-400 flex items-center gap-0.5 ml-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Tabs + Content ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-2">
          <TabsList className="bg-zinc-900/50 h-8 p-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const count = tab.id === "all"
                ? filteredItems.length
                : knowledgeItems.filter((i) => {
                    const typeMap: Record<string, string[]> = {
                      files: ["file"], functions: ["function"], components: ["component"], apis: ["api"], docs: ["doc", "external"],
                    }
                    return (typeMap[tab.id] || []).includes(i.type)
                  }).length
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 text-[11px] h-7 data-[state=active]:bg-zinc-800"
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                  <span className="text-zinc-600 ml-0.5">{count}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Content for all tabs */}
        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                  <p className="text-sm text-zinc-400">Scanning project files…</p>
                  <p className="text-xs text-zinc-600 mt-1">Indexing code, docs, and APIs</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div>
                  {filteredItems.map((item) => (
                    <KnowledgeCard key={item.id} item={item} searchQuery={searchQuery} onDelete={deleteItem} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Brain className="w-10 h-10 text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-500 mb-1">
                    {searchQuery ? "No results found" : "No items indexed"}
                  </p>
                  <p className="text-xs text-zinc-600 mb-4">
                    {searchQuery ? "Try different search terms" : 'Click "Rescan" to index your project'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={scanProjectFiles}
                      size="sm"
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Scan Project
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Status Bar ── */}
      <div className="h-7 border-t border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/20 text-[11px] text-zinc-600">
        <span>{filteredItems.length} items</span>
        <div className="flex items-center gap-3">
          <span>Mode: {searchMode === "semantic" ? "AI Semantic" : "Text Search"}</span>
          {stats.lastScan && <span>Last scan: {stats.lastScan.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  )
}
