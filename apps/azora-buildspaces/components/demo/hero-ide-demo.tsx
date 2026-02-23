"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Terminal as TerminalIcon,
  X,
  Plus,
  Settings,
  Search,
  GitBranch,
  Play,
  Save,
  Bug,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Bell,
  PanelLeft,
  Layers,
  Package,
  Cloud,
  CircleDot,
} from "lucide-react"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { CitadelLogo } from "@/components/ui/citadel-logo"

// ─── File system ──────────────────────────────────────────────
interface FNode {
  name: string
  type: "file" | "folder"
  children?: FNode[]
  language?: string
}

const fileTree: FNode[] = [
  {
    name: "src", type: "folder", children: [
      {
        name: "app", type: "folder", children: [
          { name: "page.tsx", type: "file", language: "typescriptreact" },
          { name: "layout.tsx", type: "file", language: "typescriptreact" },
          { name: "globals.css", type: "file", language: "css" },
        ]
      },
      {
        name: "components", type: "folder", children: [
          { name: "dashboard.tsx", type: "file", language: "typescriptreact" },
          { name: "analytics-card.tsx", type: "file", language: "typescriptreact" },
          { name: "sidebar.tsx", type: "file", language: "typescriptreact" },
          { name: "chart.tsx", type: "file", language: "typescriptreact" },
        ]
      },
      {
        name: "lib", type: "folder", children: [
          { name: "utils.ts", type: "file", language: "typescript" },
          { name: "api.ts", type: "file", language: "typescript" },
          { name: "auth.ts", type: "file", language: "typescript" },
        ]
      },
      {
        name: "hooks", type: "folder", children: [
          { name: "use-analytics.ts", type: "file", language: "typescript" },
        ]
      },
    ]
  },
  {
    name: "prisma", type: "folder", children: [
      { name: "schema.prisma", type: "file", language: "prisma" },
    ]
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
  { name: "tailwind.config.ts", type: "file", language: "typescript" },
  { name: ".env.local", type: "file", language: "plaintext" },
]

// ─── The code Elara "writes" ──────────────────────────────────
const elaraCodeLines = [
  { text: `'use client'`, cls: "text-orange-300" },
  { text: ``, cls: "" },
  { text: `import { useEffect, useState } from 'react'`, cls: "text-purple-300" },
  { text: `import { AnalyticsCard } from './analytics-card'`, cls: "text-purple-300" },
  { text: `import { Sidebar } from './sidebar'`, cls: "text-purple-300" },
  { text: `import { Chart } from './chart'`, cls: "text-purple-300" },
  { text: `import { useAnalytics } from '@/hooks/use-analytics'`, cls: "text-purple-300" },
  { text: ``, cls: "" },
  { text: `interface DashboardProps {`, cls: "text-blue-300" },
  { text: `  userId: string`, cls: "text-cyan-300" },
  { text: `  orgId?: string`, cls: "text-cyan-300" },
  { text: `}`, cls: "text-blue-300" },
  { text: ``, cls: "" },
  { text: `export function Dashboard({ userId, orgId }: DashboardProps) {`, cls: "text-yellow-200" },
  { text: `  const { data, isLoading } = useAnalytics(userId)`, cls: "text-sky-300" },
  { text: `  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')`, cls: "text-sky-300" },
  { text: ``, cls: "" },
  { text: `  const metrics = [`, cls: "text-white" },
  { text: `    { label: 'Active Users', value: data?.activeUsers ?? 0, change: +12.5 },`, cls: "text-emerald-300" },
  { text: `    { label: 'Deployments', value: data?.deployments ?? 0, change: +8.3 },`, cls: "text-emerald-300" },
  { text: `    { label: 'Builds / Day', value: data?.buildsPerDay ?? 0, change: +23.1 },`, cls: "text-emerald-300" },
  { text: `    { label: 'Uptime', value: '99.97%', change: +0.02 },`, cls: "text-emerald-300" },
  { text: `  ]`, cls: "text-white" },
  { text: ``, cls: "" },
  { text: `  if (isLoading) return <DashboardSkeleton />`, cls: "text-gray-400" },
  { text: ``, cls: "" },
  { text: `  return (`, cls: "text-white" },
  { text: `    <div className="flex h-screen bg-background">`, cls: "text-green-300" },
  { text: `      <Sidebar activeItem="analytics" orgId={orgId} />`, cls: "text-blue-200" },
  { text: `      <main className="flex-1 overflow-auto p-8">`, cls: "text-green-300" },
  { text: `        <header className="mb-8 flex items-center justify-between">`, cls: "text-green-300" },
  { text: `          <h1 className="text-3xl font-bold">Analytics</h1>`, cls: "text-green-300" },
  { text: `          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />`, cls: "text-blue-200" },
  { text: `        </header>`, cls: "text-green-300" },
  { text: `        <div className="grid grid-cols-4 gap-6 mb-8">`, cls: "text-green-300" },
  { text: `          {metrics.map((m) => (`, cls: "text-white" },
  { text: `            <AnalyticsCard key={m.label} {...m} />`, cls: "text-blue-200" },
  { text: `          ))}`, cls: "text-white" },
  { text: `        </div>`, cls: "text-green-300" },
  { text: `        <Chart data={data?.timeline} range={timeRange} />`, cls: "text-blue-200" },
  { text: `      </main>`, cls: "text-green-300" },
  { text: `    </div>`, cls: "text-green-300" },
  { text: `  )`, cls: "text-white" },
  { text: `}`, cls: "text-yellow-200" },
]

// ─── Terminal output lines ────────────────────────────────────
const terminalSequence = [
  { text: "$ elara build dashboard --with analytics", cls: "text-emerald-400", delay: 0 },
  { text: "⠋ Scaffolding project structure...", cls: "text-gray-400", delay: 800 },
  { text: "✓ Created 4 components, 3 lib modules, 1 hook", cls: "text-emerald-400", delay: 1600 },
  { text: "✓ Prisma schema updated — analytics model added", cls: "text-emerald-400", delay: 2200 },
  { text: "⠋ Running type-check...", cls: "text-gray-400", delay: 2800 },
  { text: "✓ No errors found in 12 files", cls: "text-emerald-400", delay: 3600 },
  { text: "⠋ Starting dev server...", cls: "text-gray-400", delay: 4200 },
  { text: "✓ ready in 1.2s — http://localhost:3000", cls: "text-emerald-400", delay: 5000 },
  { text: "", cls: "", delay: 5200 },
  { text: "Elara: Dashboard is live! All tests passing. ✨", cls: "text-amber-300", delay: 5800 },
]

// ─── Activity bar icons ───────────────────────────────────────
const activityIcons = [
  { icon: File, label: "Explorer", active: true },
  { icon: Search, label: "Search", active: false },
  { icon: GitBranch, label: "Source Control", active: false },
  { icon: Bug, label: "Debug", active: false },
  { icon: Package, label: "Extensions", active: false },
  { icon: Layers, label: "Rooms", active: false },
]

// ─── Breadcrumb ───────────────────────────────────────────────
function Breadcrumb() {
  return (
    <div className="flex items-center gap-1 px-4 py-1 text-xs text-gray-500 border-b border-white/5 bg-[#1e2228]">
      <span className="hover:text-gray-300 cursor-pointer">src</span>
      <ChevronRight className="h-3 w-3" />
      <span className="hover:text-gray-300 cursor-pointer">components</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-gray-300">dashboard.tsx</span>
    </div>
  )
}

// ─── Minimap ──────────────────────────────────────────────────
function Minimap({ lineCount, visibleLine }: { lineCount: number; visibleLine: number }) {
  return (
    <div className="w-[60px] h-full bg-[#1a1f26] border-l border-white/5 flex-shrink-0 relative overflow-hidden hidden xl:block">
      {Array.from({ length: Math.min(lineCount, 50) }).map((_, i) => {
        const width = 20 + Math.sin(i * 0.7) * 15
        return (
          <div
            key={i}
            className="h-[3px] my-[1px] ml-1 rounded-sm"
            style={{
              width: `${width}px`,
              backgroundColor: i >= visibleLine && i < visibleLine + 15
                ? "rgba(16,185,129,0.15)"
                : "rgba(255,255,255,0.06)",
            }}
          />
        )
      })}
      {/* viewport indicator */}
      <div
        className="absolute left-0 right-0 border border-white/10 rounded-sm pointer-events-none"
        style={{
          top: `${(visibleLine / Math.max(lineCount, 1)) * 100}%`,
          height: "30%",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      />
    </div>
  )
}

// ─── Status bar ───────────────────────────────────────────────
function StatusBar({ lineCount }: { lineCount: number }) {
  return (
    <div className="h-6 bg-[#1a7f45] flex items-center justify-between px-3 text-[11px] text-white/90 select-none flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          <CircleDot className="h-3 w-3" />
          <span>0 errors</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>0 warnings</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span>Ln {Math.min(lineCount, elaraCodeLines.length)}, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>TypeScript React</span>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-300" />
          <span>Elara Active</span>
        </div>
      </div>
    </div>
  )
}

// ─── File tree node ───────────────────────────────────────────
function FileTreeNode({ node, depth = 0, selectedFile }: { node: FNode; depth?: number; selectedFile: string }) {
  const [open, setOpen] = useState(depth < 2)

  const fileColor = (name: string) => {
    if (name.endsWith(".tsx")) return "text-blue-400"
    if (name.endsWith(".ts")) return "text-blue-300"
    if (name.endsWith(".css")) return "text-pink-400"
    if (name.endsWith(".json")) return "text-yellow-400"
    if (name.endsWith(".prisma")) return "text-teal-400"
    return "text-gray-400"
  }

  if (node.type === "folder") {
    return (
      <div>
        <div
          className="flex items-center gap-1 py-[3px] cursor-pointer hover:bg-white/5 rounded-sm text-[13px]"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-500" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
          {open ? <FolderOpen className="h-3.5 w-3.5 text-amber-400/80" /> : <Folder className="h-3.5 w-3.5 text-amber-400/80" />}
          <span className="text-gray-300 ml-0.5">{node.name}</span>
        </div>
        {open && node.children?.map((child, i) => (
          <FileTreeNode key={i} node={child} depth={depth + 1} selectedFile={selectedFile} />
        ))}
      </div>
    )
  }

  const isSelected = selectedFile === node.name
  return (
    <div
      className={`flex items-center gap-1.5 py-[3px] cursor-pointer rounded-sm text-[13px] ${isSelected ? "bg-emerald-500/15 text-white" : "text-gray-400 hover:bg-white/5"}`}
      style={{ paddingLeft: `${depth * 12 + 22}px` }}
    >
      <File className={`h-3.5 w-3.5 ${fileColor(node.name)}`} />
      <span>{node.name}</span>
    </div>
  )
}

// ─── Elara's chat bubbles ─────────────────────────────────────
const chatBubbles = [
  { text: "I'll create a full analytics dashboard with real-time metrics, interactive charts, and responsive layout.", delay: 0 },
  { text: "Scaffolding components: Dashboard, AnalyticsCard, Sidebar, Chart + a custom useAnalytics hook.", delay: 3000 },
  { text: "Adding Prisma analytics model and API routes for data fetching.", delay: 6000 },
  { text: "✨ Done! Dashboard is live with 4 metric cards, timeline chart, and sidebar navigation.", delay: 9000 },
]

// ═══════════════════════════════════════════════════════════════
// ███  HERO IDE COMPONENT  ██████████████████████████████████████
// ═══════════════════════════════════════════════════════════════
export function HeroIDEDemo() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [terminalLines, setTerminalLines] = useState<typeof terminalSequence>([])
  const [activeBubble, setActiveBubble] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)

  // Typing animation for code
  useEffect(() => {
    if (visibleLines >= elaraCodeLines.length) {
      setIsTyping(false)
      return
    }
    const speed = visibleLines < 3 ? 120 : visibleLines < 8 ? 80 : 45
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), speed)
    return () => clearTimeout(timer)
  }, [visibleLines])

  // Auto-scroll editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.scrollTop = editorRef.current.scrollHeight
    }
  }, [visibleLines])

  // Terminal sequence
  useEffect(() => {
    const timers = terminalSequence.map((line, i) =>
      setTimeout(() => setTerminalLines((prev) => [...prev, line]), line.delay + 1000)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Chat bubbles
  useEffect(() => {
    const timers = chatBubbles.map((bubble, i) =>
      setTimeout(() => setActiveBubble(i), bubble.delay + 500)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Restart loop
  useEffect(() => {
    const restart = setTimeout(() => {
      setVisibleLines(0)
      setTerminalLines([])
      setActiveBubble(0)
      setIsTyping(true)
    }, 16000)
    return () => clearTimeout(restart)
  }, [visibleLines, terminalLines, activeBubble])

  const tabs = [
    { name: "dashboard.tsx", active: true, modified: isTyping },
    { name: "analytics-card.tsx", active: false, modified: false },
    { name: "layout.tsx", active: false, modified: false },
  ]

  return (
    <div className="relative group">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative flex flex-col bg-[#0d1117] h-[620px] lg:h-[680px] rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
        {/* ─── Title bar ────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/[0.06] select-none flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <CitadelLogo size="sm" />
              <span className="text-xs text-gray-400 font-mono">BuildSpaces — dashboard-app</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1">
              <Save className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1">
              <Play className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1">
              <Cloud className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* ─── Activity bar ──────────────────────────── */}
          <div className="w-12 bg-[#0d1117] border-r border-white/[0.06] flex-col items-center py-2 gap-1 flex-shrink-0 hidden md:flex">
            {activityIcons.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${active ? "text-white bg-white/5 border-l-2 border-emerald-400" : "text-gray-600 hover:text-gray-300"}`}
                title={label}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
            <div className="flex-1" />
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300" title="Settings">
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <div className="w-10 h-10 flex items-center justify-center">
              <AfricanAgentAvatar agent="elara" size="sm" showGlow={false} showAura={false} />
            </div>
          </div>

          {/* ─── File explorer ─────────────────────────── */}
          <div className="w-52 bg-[#0d1117] border-r border-white/[0.06] overflow-auto flex-shrink-0 hidden lg:block">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">Explorer</span>
              <div className="flex gap-0.5">
                <button className="p-0.5 text-gray-600 hover:text-gray-300"><Plus className="h-3.5 w-3.5" /></button>
                <button className="p-0.5 text-gray-600 hover:text-gray-300"><Folder className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="px-1">
              {fileTree.map((node, i) => (
                <FileTreeNode key={i} node={node} selectedFile="dashboard.tsx" />
              ))}
            </div>
            {/* Outline section */}
            <div className="mt-4 border-t border-white/[0.06]">
              <div className="px-3 py-2">
                <span className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">Outline</span>
              </div>
              <div className="px-3 text-[12px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400"><span className="text-orange-400">I</span> DashboardProps</div>
                <div className="flex items-center gap-1.5 text-yellow-300"><span className="text-purple-400">F</span> Dashboard</div>
                <div className="flex items-center gap-1.5 text-gray-500 pl-3"><span className="text-cyan-400">V</span> data, isLoading</div>
                <div className="flex items-center gap-1.5 text-gray-500 pl-3"><span className="text-cyan-400">V</span> metrics</div>
              </div>
            </div>
          </div>

          {/* ─── Editor + Terminal ─────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <div className="flex items-center bg-[#161b22] border-b border-white/[0.06] overflow-x-auto flex-shrink-0">
              {tabs.map((tab) => (
                <div
                  key={tab.name}
                  className={`flex items-center gap-1.5 px-3 py-[7px] text-[13px] border-r border-white/[0.04] cursor-pointer select-none ${tab.active ? "bg-[#1e2228] text-white border-t-2 border-t-emerald-400" : "text-gray-500 hover:text-gray-300"}`}
                >
                  <File className={`h-3.5 w-3.5 ${tab.active ? "text-blue-400" : "text-gray-600"}`} />
                  <span>{tab.name}</span>
                  {tab.modified && <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />}
                  <X className="h-3 w-3 ml-1 text-gray-600 hover:text-white" />
                </div>
              ))}
              <button className="p-2 text-gray-600 hover:text-gray-300">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Code area */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              <div ref={editorRef} className="flex-1 overflow-auto py-2 font-mono text-[13px] leading-[20px] bg-[#1e2228]">
                {elaraCodeLines.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className="flex hover:bg-white/[0.02] group/line">
                    <span className="w-12 text-right pr-4 text-gray-600 select-none text-[12px] flex-shrink-0">{i + 1}</span>
                    <span className={`${line.cls} whitespace-pre`}>{line.text}</span>
                  </div>
                ))}
                {/* Typing cursor */}
                {isTyping && (
                  <div className="flex">
                    <span className="w-12 text-right pr-4 text-gray-600 select-none text-[12px] flex-shrink-0">{visibleLines + 1}</span>
                    <span className="inline-block w-[2px] h-[18px] bg-emerald-400 animate-pulse" />
                  </div>
                )}
              </div>
              <Minimap lineCount={visibleLines} visibleLine={0} />
            </div>

            {/* ─── Terminal panel ────────────────────────── */}
            <div className="h-40 lg:h-44 bg-[#0d1117] border-t border-white/[0.06] flex flex-col flex-shrink-0">
              <div className="flex items-center gap-4 px-3 py-1 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-white font-medium border-b-2 border-emerald-400 pb-1 cursor-pointer">Terminal</span>
                  <span className="text-gray-500 cursor-pointer hover:text-gray-300">Problems</span>
                  <span className="text-gray-500 cursor-pointer hover:text-gray-300">Output</span>
                  <span className="text-gray-500 cursor-pointer hover:text-gray-300">Debug Console</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button className="p-1 text-gray-500 hover:text-gray-300"><Plus className="h-3.5 w-3.5" /></button>
                  <button className="p-1 text-gray-500 hover:text-gray-300"><PanelLeft className="h-3.5 w-3.5" /></button>
                  <button className="p-1 text-gray-500 hover:text-gray-300"><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-[18px]">
                {terminalLines.map((line, i) => (
                  <div key={i} className={line.cls}>{line.text}</div>
                ))}
                {terminalLines.length < terminalSequence.length && (
                  <span className="inline-block w-2 h-3.5 bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* ─── Elara AI Panel ─────────────────────────── */}
          <div className="w-72 xl:w-80 bg-[#0d1117] border-l border-white/[0.06] flex-col flex-shrink-0 hidden md:flex">
            {/* Panel header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="relative">
                <AfricanAgentAvatar agent="elara" size="sm" showGlow showAura={false} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d1117]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white">Elara</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/20 text-emerald-400">AGENT</span>
                </div>
                <p className="text-[11px] text-gray-500">XO Architect • Building dashboard</p>
              </div>
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {chatBubbles.slice(0, activeBubble + 1).map((bubble, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg rounded-tl-sm px-3 py-2 text-[12px] text-gray-300 leading-relaxed">
                    {bubble.text}
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              {isTyping && activeBubble < chatBubbles.length - 1 && (
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg rounded-tl-sm px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Agent activity */}
            <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
              <div className="text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-semibold">Active Agents</div>
              <div className="space-y-1.5">
                {[
                  { agent: "elara" as const, task: "Writing dashboard.tsx", status: "active" },
                  { agent: "nia" as const, task: "Analyzing data patterns", status: "active" },
                  { agent: "zuri" as const, task: "Preparing deployment", status: "idle" },
                ].map(({ agent, task, status }) => (
                  <div key={agent} className="flex items-center gap-2 text-[11px]">
                    <AfricanAgentAvatar agent={agent} size="sm" showGlow={false} showAura={false} />
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-400 truncate block">{task}</span>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="Ask Elara anything..."
                  className="flex-1 bg-transparent text-[12px] text-white placeholder-gray-600 outline-none"
                  readOnly
                />
                <Sparkles className="h-3.5 w-3.5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Status bar ────────────────────────────────── */}
        <StatusBar lineCount={visibleLines} />
      </div>
    </div>
  )
}
