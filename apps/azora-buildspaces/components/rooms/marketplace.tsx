"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Download,
  ExternalLink,
  Sparkles,
  Code2,
  Palette,
  Database,
  RefreshCw,
  TrendingUp,
  Package,
  Shield,
  Zap,
  Brain,
  Globe,
  Layers,
  Terminal,
  GitBranch,
  Heart,
  Eye,
  ArrowUpRight,
  ChevronDown,
  X,
  Check,
  Crown,
  Flame,
  Clock,
  BarChart3,
  Users,
} from "lucide-react"

/* ─── types ─── */
interface Template {
  id: string
  name: string
  description: string
  category: string
  author: string
  rating: number
  downloads: number
  price: string
  tags: string[]
  icon: string
  color: string
  featured?: boolean
  verified?: boolean
  version?: string
  lastUpdated?: string
}

/* ─── categories ─── */
const CATEGORIES = [
  { id: "all", label: "All", icon: Layers },
  { id: "templates", label: "Templates", icon: Code2 },
  { id: "agents", label: "AI Agents", icon: Brain },
  { id: "components", label: "Components", icon: Package },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "devops", label: "DevOps", icon: Terminal },
]

const ICON_MAP: Record<string, any> = {
  Code2,
  Sparkles,
  Palette,
  Database,
  Brain,
  Shield,
  Globe,
  Terminal,
  GitBranch,
  Zap,
  Package,
  Layers,
}

/* ─── template card ─── */
function TemplateCard({ template, onInstall }: { template: Template; onInstall: (id: string) => void }) {
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)
  const Icon = ICON_MAP[template.icon] || Code2

  const handleInstall = async () => {
    setInstalling(true)
    onInstall(template.id)
    await new Promise((r) => setTimeout(r, 1500))
    setInstalling(false)
    setInstalled(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="bg-zinc-900/50 border-zinc-800/60 hover:border-zinc-700 transition-all h-full flex flex-col overflow-hidden">
        {template.featured && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Featured</span>
          </div>
        )}

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 ${template.color || "text-zinc-400"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold text-zinc-100 truncate">
                  {template.name}
                </CardTitle>
                {template.verified && (
                  <div className="flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                by {template.author}
                {template.version && <span className="text-zinc-600"> • v{template.version}</span>}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
            {template.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] h-4 px-1.5 border-zinc-800 text-zinc-500">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-zinc-800 text-zinc-600">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{template.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{template.downloads >= 1000 ? `${(template.downloads / 1000).toFixed(1)}k` : template.downloads}</span>
              </div>
            </div>
            <span className="font-medium text-zinc-300">{template.price}</span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 px-4">
          <Button
            onClick={handleInstall}
            disabled={installing || installed}
            className={`w-full h-8 text-xs ${
              installed
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
            variant="outline"
          >
            {installing ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                Installing…
              </>
            ) : installed ? (
              <>
                <Check className="w-3 h-3 mr-1.5" />
                Installed
              </>
            ) : (
              <>
                <Download className="w-3 h-3 mr-1.5" />
                Install
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════ */
/*                MARKETPLACE                      */
/* ═══════════════════════════════════════════════ */
export default function Marketplace() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "rating" | "downloads">("trending")

  const loadTemplates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      if (activeCategory !== "all") params.set("category", activeCategory)
      params.set("sort", sortBy)

      const response = await fetch(`/api/marketplace/templates?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      } else {
        throw new Error("Failed to load templates")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [searchQuery, activeCategory, sortBy])

  const handleInstall = async (templateId: string) => {
    try {
      await fetch("/api/marketplace/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })
    } catch (error) {
      console.error("Install failed:", error)
    }
  }

  const featuredTemplates = templates.filter((t) => t.featured)
  const regularTemplates = templates.filter((t) => !t.featured)

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100">Marketplace</h1>
                <p className="text-xs text-zinc-500">Discover templates, agents, and components</p>
              </div>
            </div>
            <Button className="gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200" size="sm">
              <ExternalLink className="w-3.5 h-3.5" />
              Publish
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search templates, agents, components..."
                className="pl-10 h-9 bg-zinc-900/60 border-zinc-700/50 text-sm text-zinc-200 placeholder:text-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs text-zinc-300 h-9"
            >
              <option value="trending">🔥 Trending</option>
              <option value="newest">🆕 Newest</option>
              <option value="rating">⭐ Top Rated</option>
              <option value="downloads">📥 Most Downloaded</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 pb-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeCategory === cat.id
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-500">Loading marketplace…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-red-400 text-sm mb-4">Failed to load: {error}</p>
              <Button onClick={loadTemplates} size="sm" className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </Button>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="w-14 h-14 text-zinc-800 mb-4" />
              <h3 className="text-base font-medium text-zinc-400 mb-1">No templates found</h3>
              <p className="text-xs text-zinc-600 mb-4">
                {searchQuery ? "Try different search terms" : "Be the first to publish!"}
              </p>
              <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="w-3.5 h-3.5" />
                Publish Template
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Section */}
              {featuredTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Featured</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} onInstall={handleInstall} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Templates */}
              <div>
                {featuredTemplates.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-zinc-500" />
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                      {activeCategory === "all" ? "All" : CATEGORIES.find((c) => c.id === activeCategory)?.label}
                    </h2>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-zinc-800 text-zinc-600">
                      {regularTemplates.length}
                    </Badge>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(featuredTemplates.length > 0 ? regularTemplates : templates).map((template) => (
                    <TemplateCard key={template.id} template={template} onInstall={handleInstall} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Status Bar ── */}
      <div className="h-7 border-t border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/20 text-[11px] text-zinc-600">
        <span>{templates.length} templates available</span>
        <div className="flex items-center gap-3">
          <span>Category: {CATEGORIES.find((c) => c.id === activeCategory)?.label}</span>
          <span>Sort: {sortBy}</span>
        </div>
      </div>
    </div>
  )
}
