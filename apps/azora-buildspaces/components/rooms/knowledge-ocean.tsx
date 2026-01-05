"use client"

import { useState } from "react"
import {
  Search,
  FileText,
  FolderTree,
  Database,
  Clock,
  Plus,
  RefreshCw,
  Code2,
  Sparkles,
  Brain,
  Layers,
  FileCode,
  Zap,
  Check,
  Globe,
  BookOpen,
  Link2,
  Upload,
  Trash2,
} from "lucide-react"
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
  lastUpdated?: string
  relevance?: number
  source?: string
}

interface KnowledgeOceanProps {
  onSwitchToCommand: () => void
}

const projectKnowledge: KnowledgeItem[] = [
  {
    id: "1",
    title: "Authentication Flow",
    type: "doc",
    description: "User login, signup, and session management patterns",
    relevance: 95,
    lastUpdated: "2 min ago",
  },
  {
    id: "2",
    title: "LoginForm",
    type: "component",
    path: "components/auth/login-form.tsx",
    relevance: 88,
    description: "React component with form validation",
  },
  {
    id: "3",
    title: "useAuth",
    type: "function",
    path: "hooks/use-auth.ts",
    description: "Authentication hook with JWT token management",
    relevance: 85,
  },
  {
    id: "4",
    title: "/api/auth/login",
    type: "api",
    path: "app/api/auth/login/route.ts",
    relevance: 82,
    description: "POST endpoint for user authentication",
  },
  {
    id: "5",
    title: "User Schema",
    type: "schema",
    path: "lib/schema/user.ts",
    relevance: 78,
    description: "TypeScript types and Zod validation",
  },
  {
    id: "6",
    title: "Next.js App Router Docs",
    type: "external",
    source: "nextjs.org",
    relevance: 72,
    description: "Official routing documentation",
  },
]

const contextSources = [
  { id: "1", name: "Project Files", count: 42, icon: FolderTree, active: true },
  { id: "2", name: "Dependencies", count: 18, icon: Layers, active: true },
  { id: "3", name: "API Documentation", count: 7, icon: Globe, active: true },
  { id: "4", name: "External Docs", count: 12, icon: BookOpen, active: false },
]

export function KnowledgeOcean({ onSwitchToCommand }: KnowledgeOceanProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("context")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [activeSources, setActiveSources] = useState(["1", "2", "3"])

  const handleScan = () => {
    setIsScanning(true)
    setScanProgress(0)

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSource = (id: string) => {
    setActiveSources((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const getTypeIcon = (type: KnowledgeItem["type"]) => {
    switch (type) {
      case "component":
        return Code2
      case "function":
        return Zap
      case "api":
        return Database
      case "schema":
        return Layers
      case "doc":
        return FileText
      case "external":
        return Globe
      default:
        return FileCode
    }
  }

  const getTypeColor = (type: KnowledgeItem["type"]) => {
    switch (type) {
      case "component":
        return "text-accent"
      case "function":
        return "text-primary"
      case "api":
        return "text-amber-500"
      case "schema":
        return "text-blue-500"
      case "doc":
        return "text-pink-500"
      case "external":
        return "text-cyan-500"
      default:
        return "text-muted-foreground"
    }
  }

  const filteredKnowledge = projectKnowledge.filter(
    (item) =>
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
            <Brain className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Knowledge Ocean</h3>
            <p className="text-xs text-accent">
              {selectedItems.length > 0 ? `${selectedItems.length} selected` : "Project context for agents"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSwitchToCommand}>
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border focus-within:ring-2 focus-within:ring-accent/50">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 p-0 px-2">
          <TabsTrigger
            value="context"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent text-xs"
          >
            <Brain className="w-3.5 h-3.5 mr-1.5" />
            Context
          </TabsTrigger>
          <TabsTrigger
            value="sources"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent text-xs"
          >
            <Link2 className="w-3.5 h-3.5 mr-1.5" />
            Sources
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent text-xs"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="flex-1 overflow-auto p-3 space-y-4 mt-0">
          {/* Scan Status */}
          <div className="rounded-xl border border-border bg-card/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Project Context</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleScan} disabled={isScanning}>
                <RefreshCw className={`w-3 h-3 mr-1.5 ${isScanning ? "animate-spin" : ""}`} />
                {isScanning ? "Scanning..." : "Rescan"}
              </Button>
            </div>

            {isScanning ? (
              <div className="space-y-2">
                <Progress value={scanProgress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">Analyzing project structure and dependencies...</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-foreground">42</div>
                  <div className="text-[10px] text-muted-foreground">Files</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-foreground">18</div>
                  <div className="text-[10px] text-muted-foreground">Components</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-foreground">7</div>
                  <div className="text-[10px] text-muted-foreground">APIs</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-foreground">12</div>
                  <div className="text-[10px] text-muted-foreground">Hooks</div>
                </div>
              </div>
            )}
          </div>

          {/* Knowledge Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {searchQuery ? "Search Results" : "Relevant Context"}
              </h4>
              <span className="text-xs text-muted-foreground">{filteredKnowledge.length} items</span>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredKnowledge.map((item) => {
                const Icon = getTypeIcon(item.type)
                const isSelected = selectedItems.includes(item.id)

                return (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => toggleSelect(item.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected ? "border-accent/50 bg-accent/10" : "border-border bg-card/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${getTypeColor(item.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground capitalize">
                            {item.type}
                          </span>
                        </div>
                        {item.path && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">{item.path}</p>
                        )}
                        {item.source && <p className="text-xs text-cyan-500 truncate mt-0.5">{item.source}</p>}
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {item.relevance && (
                          <span
                            className={`text-xs font-medium ${item.relevance > 80 ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {item.relevance}%
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-accent" />}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Add to Context CTA */}
          <AnimatePresence>
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="sticky bottom-0 p-3 -mx-3 -mb-3 bg-gradient-to-t from-card via-card to-transparent"
              >
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedItems.length} items to agent context
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="sources" className="flex-1 overflow-auto p-3 mt-0 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Sources</h4>
            {contextSources.map((source) => (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  activeSources.includes(source.id)
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-card/50 opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSources.includes(source.id) ? "bg-accent/20" : "bg-muted"
                  }`}
                >
                  <source.icon
                    className={`w-5 h-5 ${activeSources.includes(source.id) ? "text-accent" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{source.name}</div>
                  <div className="text-xs text-muted-foreground">{source.count} items indexed</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    activeSources.includes(source.id) ? "border-accent bg-accent" : "border-muted-foreground"
                  }`}
                >
                  {activeSources.includes(source.id) && <Check className="w-3 h-3 text-background" />}
                </div>
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            <Upload className="w-4 h-4 mr-2" />
            Add External Source
          </Button>
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto p-3 mt-0">
          <ContextHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContextHistory() {
  const history = [
    { id: "1", action: "Added authentication context", agent: "Elara", time: "2 min ago", items: 3 },
    { id: "2", action: "Scanned project structure", agent: "System", time: "5 min ago", items: 42 },
    { id: "3", action: "Updated API schemas", agent: "Themba", time: "12 min ago", items: 2 },
    { id: "4", action: "Added component documentation", agent: "Sankofa", time: "1 hour ago", items: 8 },
    { id: "5", action: "Indexed external Next.js docs", agent: "System", time: "2 hours ago", items: 156 },
  ]

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <div key={item.id} className="p-3 rounded-xl border border-border bg-card/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.action}</span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-primary">{item.agent}</span>
            <span className="text-xs text-muted-foreground">• {item.items} items</span>
          </div>
        </div>
      ))}
    </div>
  )
}
