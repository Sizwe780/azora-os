"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Play,
  Pause,
  Square,
  Share2,
  Settings,
  Database,
  Network,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Activity,
  GitBranch,
  BarChart3,
  Code2,
  Eye,
  Save,
  Upload,
  Download,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Layers,
  Terminal,
  FileText,
  Workflow,
  Copy,
  GitCompare,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/* ─── types ─── */
interface AgentNode {
  id: string
  name: string
  type: "llm" | "tool" | "condition" | "input" | "output" | "transform"
  status: "idle" | "running" | "success" | "error"
  config: Record<string, string>
}

interface WorkflowRun {
  id: string
  status: "running" | "completed" | "failed"
  startedAt: string
  duration: number | null
  steps: number
  stepsCompleted: number
}

interface MetricEntry {
  label: string
  value: string
  change?: string
  trend?: "up" | "down" | "flat"
}

/* ─── node type configs ─── */
const NODE_TYPES = [
  { type: "llm", label: "LLM Call", icon: Brain, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { type: "tool", label: "Tool Use", icon: Terminal, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { type: "input", label: "Input", icon: ArrowRight, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { type: "output", label: "Output", icon: FileText, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  { type: "transform", label: "Transform", icon: Layers, color: "text-pink-400 border-pink-500/30 bg-pink-500/10" },
] as const

/* ─── model comparison data ─── */
const MODEL_COMPARISON_DATA: Record<string, { latency: string; cost: string; context: string; strengths: string[] }> = {
  "GPT-4o":      { latency: "620ms", cost: "$0.005", context: "128K", strengths: ["Reasoning", "Code", "Vision"] },
  "Claude 3.5":  { latency: "580ms", cost: "$0.003", context: "200K", strengths: ["Writing", "Analysis", "Safety"] },
  "Gemini Pro":  { latency: "490ms", cost: "$0.002", context: "1M",   strengths: ["Multimodal", "Speed", "Long ctx"] },
  "Llama 3":     { latency: "310ms", cost: "$0.001", context: "128K", strengths: ["Open source", "Fast", "Cost"] },
  "Mistral":     { latency: "280ms", cost: "$0.0007", context: "32K", strengths: ["Speed", "Efficiency", "EU"] },
}
const MODEL_NAMES = Object.keys(MODEL_COMPARISON_DATA)

/* ─── log level helper ─── */
function getLogLevel(text: string): "ERROR" | "WARN" | "INFO" {
  const lower = text.toLowerCase()
  if (lower.includes("error") || lower.includes("failed") || lower.includes("fail")) return "ERROR"
  if (lower.includes("warn") || lower.includes("stopped") || lower.includes("retry")) return "WARN"
  return "INFO"
}

/* ═══════════════════════════════════════════════ */
/*                 AI STUDIO                       */
/* ═══════════════════════════════════════════════ */
export default function AIStudio() {
  const [workflowName, setWorkflowName] = useState("Agent Workflow")
  const [nodes, setNodes] = useState<AgentNode[]>([])
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("workflow")
  const [rightTab, setRightTab] = useState("properties")
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [metrics, setMetrics] = useState<MetricEntry[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [naturalPrompt, setNaturalPrompt] = useState("")
  const [isBuildingFromPrompt, setIsBuildingFromPrompt] = useState(false)
  const [compareModel1, setCompareModel1] = useState("GPT-4o")
  const [compareModel2, setCompareModel2] = useState("Claude 3.5")
  const [liveMetrics, setLiveMetrics] = useState({ successRate: 0, avgLatency: 0, tokensPerMin: 0 })
  const [availableTools, setAvailableTools] = useState<{name:string;description?:string}[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  /* ── load workflow ── */
  useEffect(() => {
    const loadWorkflow = async () => {
      setIsLoading(true)
      try {
        const resp = await fetch("/api/ai-studio/workflows")
        if (resp.ok) {
          const data = await resp.json()
          if (data.workflow) {
            setWorkflowName(data.workflow.name || "Agent Workflow")
            setNodes(data.workflow.nodes || [])
          }
          if (data.runs) setRuns(data.runs)
          if (data.metrics) setMetrics(data.metrics)
        }
      } catch {
        /* silent */
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkflow()
  }, [])

  /* ── fetch tool list for skill discovery ── */
  useEffect(() => {
    fetch('/api/tools')
      .then(res => res.json())
      .then(data => {
        if (data.tools) setAvailableTools(data.tools)
      })
      .catch(() => {})
  }, [])

  /* ── auto-scroll logs ── */
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  /* ── metrics polling every 10s ── */
  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const resp = await fetch("/api/agents/metrics")
        if (resp.ok) {
          const data = await resp.json()
          setLiveMetrics({
            successRate: data.successRate ?? liveMetrics.successRate,
            avgLatency: data.avgLatency ?? liveMetrics.avgLatency,
            tokensPerMin: data.tokensPerMin ?? liveMetrics.tokensPerMin,
          })
        }
      } catch { /* silent */ }
    }
    fetchLiveMetrics()
    const id = setInterval(fetchLiveMetrics, 10_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── keyboard shortcut: Delete key ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
        const active = document.activeElement
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) return
        removeNode(selectedNode.id)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode])

  /* ── run workflow ── */
  const runWorkflow = async () => {
    if (nodes.length === 0) return
    setIsRunning(true)
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Starting workflow: ${workflowName}`])

    try {
      const resp = await fetch("/api/ai-studio/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowName, nodes }),
      })

      if (resp.ok) {
        const data = await resp.json()
        if (data.run) {
          setRuns((prev) => [data.run, ...prev])
        }
        if (data.nodeResults) {
          setNodes((prev) =>
            prev.map((n) => {
              const result = data.nodeResults[n.id]
              return result ? { ...n, status: result.status } : n
            })
          )
        }
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Workflow completed`])
      } else {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Workflow failed: ${resp.status}`])
      }
    } catch (err) {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${err}`])
    } finally {
      setIsRunning(false)
    }
  }

  const stopWorkflow = async () => {
    setIsRunning(false)
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Workflow stopped`])
    try {
      await fetch("/api/ai-studio/stop", { method: "POST" })
    } catch {
      /* silent */
    }
  }

  /* ── node management ── */
  const addNode = (type: AgentNode["type"]) => {
    const nodeType = NODE_TYPES.find((t) => t.type === type)
    const newNode: AgentNode = {
      id: `node-${Date.now()}`,
      name: `${nodeType?.label || "Node"} ${nodes.length + 1}`,
      type,
      status: "idle",
      config: {},
    }
    setNodes((prev) => [...prev, newNode])
    setSelectedNode(newNode)
  }

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    if (selectedNode?.id === id) setSelectedNode(null)
  }

  const duplicateNode = (node: AgentNode) => {
    const copy: AgentNode = {
      ...node,
      id: `node-${Date.now()}`,
      name: `${node.name} (copy)`,
      status: "idle",
      config: { ...node.config, _offsetX: String((parseInt(node.config._offsetX || "0") + 20)), _offsetY: String((parseInt(node.config._offsetY || "0") + 20)) },
    }
    setNodes((prev) => [...prev, copy])
    setSelectedNode(copy)
  }

  const updateNodeConfig = (id: string, key: string, value: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n)))
  }

  /* ── save workflow ── */
  const saveWorkflow = async () => {
    try {
      await fetch("/api/ai-studio/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workflowName, nodes }),
      })
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Workflow saved`])
    } catch {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Save failed`])
    }
  }

  /* ── AI workflow builder from natural language ── */
  const buildFromPrompt = async () => {
    if (!naturalPrompt.trim() || isBuildingFromPrompt) return
    setIsBuildingFromPrompt(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI building workflow from: "${naturalPrompt}"`])
    try {
      const resp = await fetch("/api/ai-studio/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: naturalPrompt }),
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.nodes && data.nodes.length > 0) {
          const builtNodes: AgentNode[] = data.nodes.map((n: any, i: number) => ({
            id: `ai-${Date.now()}-${i}`,
            name: n.name || `Step ${i + 1}`,
            type: n.type || "llm",
            status: "idle" as const,
            config: n.config || {},
          }))
          setNodes(builtNodes)
          if (data.name) setWorkflowName(data.name)
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI built ${builtNodes.length} nodes`])
        }
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI build failed`])
      }
    } catch {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI build error`])
    } finally {
      setIsBuildingFromPrompt(false)
      setNaturalPrompt("")
    }
  }

  const getStatusIcon = (status: AgentNode["status"]) => {
    switch (status) {
      case "running":
        return <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
      case "success":
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      case "error":
        return <XCircle className="w-3 h-3 text-red-400" />
      default:
        return <div className="w-3 h-3 rounded-full border border-zinc-700" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Toolbar ── */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-5 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">AI Studio</span>
          </div>
          <span className="text-zinc-700">/</span>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="h-7 w-48 text-sm bg-transparent border-none px-1 focus-visible:ring-0 text-zinc-300"
          />

          {isRunning && (
            <div className="flex items-center gap-2 ml-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Running…</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={saveWorkflow} className="gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {isRunning ? (
            <Button size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={stopWorkflow}>
              <Square className="w-3.5 h-3.5" />
              Stop
            </Button>
          ) : (
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={runWorkflow}>
              <Play className="w-3.5 h-3.5" />
              Run Workflow
            </Button>
          )}

          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => {
            const data = JSON.stringify({ name: workflowName, nodes, exportedAt: new Date().toISOString() }, null, 2)
            const blob = new Blob([data], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${workflowName.replace(/\s+/g, "-").toLowerCase()}-workflow.json`
            a.click()
            URL.revokeObjectURL(url)
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Workflow exported as JSON`])
          }}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>

          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => importFileRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Import
          </Button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (ev) => {
                try {
                  const parsed = JSON.parse(ev.target?.result as string)
                  if (parsed.nodes) setNodes(parsed.nodes)
                  if (parsed.name) setWorkflowName(parsed.name)
                  setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Workflow imported: ${parsed.name || file.name}`])
                } catch {
                  setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Import failed: invalid JSON`])
                }
              }
              reader.readAsText(file)
              e.target.value = ""
            }}
          />
        </div>
      </div>

      {/* ── AI Workflow Builder ── */}
      <div className="px-5 py-2 border-b border-zinc-800 bg-zinc-900/20 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <Input
          value={naturalPrompt}
          onChange={(e) => setNaturalPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buildFromPrompt()}
          placeholder="Describe your agent pipeline in natural language, e.g. 'Fetch user data, analyze sentiment, route to support or marketing'"
          className="flex-1 h-7 text-xs bg-transparent border-zinc-800 focus-visible:ring-purple-500/30 text-zinc-300 placeholder:text-zinc-600"
          disabled={isBuildingFromPrompt}
        />
        <Button
          size="sm"
          onClick={buildFromPrompt}
          disabled={isBuildingFromPrompt || !naturalPrompt.trim()}
          className="h-7 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {isBuildingFromPrompt ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          Build
        </Button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* ── Left: Node Palette ── */}
          <ResizablePanel defaultSize={16} minSize={12} maxSize={22}>
            <div className="h-full border-r border-zinc-800 flex flex-col bg-zinc-900/20">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Node Palette</span>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {NODE_TYPES.map((nt) => {
                    const Icon = nt.icon
                    return (
                      <button
                        key={nt.type}
                        onClick={() => addNode(nt.type as AgentNode["type"])}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all hover:scale-[1.02] ${nt.color}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{nt.label}</span>
                        <Plus className="w-3 h-3 ml-auto opacity-50" />
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Templates</span>
                  <div className="mt-2 space-y-2">
                    {[
                      { name: "RAG Pipeline", desc: "Retrieval-augmented generation" },
                      { name: "Agent Loop", desc: "Autonomous agent with tools" },
                      { name: "Classifier", desc: "Intent classification chain" },
                    ].map((tpl) => (
                      <button
                        key={tpl.name}
                        className="w-full text-left p-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 transition-all"
                      >
                        <p className="text-xs font-medium text-zinc-300">{tpl.name}</p>
                        <p className="text-[10px] text-zinc-600">{tpl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Center: Workflow Canvas ── */}
          <ResizablePanel defaultSize={52} minSize={35}>
            <div className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 h-10 rounded-none border-b border-zinc-800 bg-zinc-900/30">
                  <TabsTrigger value="workflow" className="gap-1.5 text-xs">
                    <Workflow className="w-3.5 h-3.5" />
                    Workflow
                  </TabsTrigger>
                  <TabsTrigger value="runs" className="gap-1.5 text-xs">
                    <Activity className="w-3.5 h-3.5" />
                    Runs
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="gap-1.5 text-xs">
                    <Terminal className="w-3.5 h-3.5" />
                    Logs
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="gap-1.5 text-xs">
                    <GitCompare className="w-3.5 h-3.5" />
                    Compare
                  </TabsTrigger>
                </TabsList>

                {/* Workflow Canvas */}
                <TabsContent value="workflow" className="flex-1 m-0 relative overflow-auto">
                  <div className="p-6 min-h-full">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-6 h-6 animate-spin text-zinc-600" />
                      </div>
                    ) : nodes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <Workflow className="w-14 h-14 text-zinc-800 mb-4" />
                        <p className="text-sm text-zinc-500 mb-1">No nodes in workflow</p>
                        <p className="text-xs text-zinc-700 mb-4">Drag nodes from the palette to build your AI pipeline</p>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => addNode("input")}>
                          <Plus className="w-3 h-3" />
                          Add Input Node
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {nodes.map((node, idx) => {
                          const nodeConfig = NODE_TYPES.find((t) => t.type === node.type)
                          const Icon = nodeConfig?.icon || Brain
                          return (
                            <motion.div
                              key={node.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {idx > 0 && (
                                <div className="flex justify-center py-1">
                                  <div className="w-px h-6 bg-zinc-800" />
                                </div>
                              )}
                              <button
                                onClick={() => setSelectedNode(node)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                  selectedNode?.id === node.id
                                    ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20"
                                    : `border-zinc-800 hover:border-zinc-700 bg-zinc-900/40`
                                }`}
                              >
                                <div className={`p-2 rounded-lg ${nodeConfig?.color || "text-zinc-400"}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-medium text-zinc-200">{node.name}</p>
                                  <p className="text-[10px] text-zinc-600">{nodeConfig?.label}</p>
                                </div>
                                {getStatusIcon(node.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-zinc-700 hover:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNode(node.id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </button>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Runs */}
                <TabsContent value="runs" className="flex-1 m-0 p-4 overflow-auto">
                  {runs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-600 text-xs">No runs yet</div>
                  ) : (
                    <div className="space-y-3">
                      {runs.map((run) => (
                        <Card key={run.id} className="bg-zinc-900/50 border-zinc-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    run.status === "completed"
                                      ? "border-emerald-500/30 text-emerald-400"
                                      : run.status === "failed"
                                      ? "border-red-500/30 text-red-400"
                                      : "border-blue-500/30 text-blue-400"
                                  }`}
                                >
                                  {run.status}
                                </Badge>
                                <span className="text-xs text-zinc-500 font-mono">{run.id.slice(0, 8)}</span>
                              </div>
                              <span className="text-[10px] text-zinc-600">{run.startedAt}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                              <span>{run.stepsCompleted}/{run.steps} steps</span>
                              {run.duration && <span>{run.duration}ms</span>}
                            </div>
                            {run.status === "running" && (
                              <Progress value={(run.stepsCompleted / run.steps) * 100} className="h-1 mt-2" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Logs */}
                <TabsContent value="logs" className="flex-1 m-0 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                    <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{logs.length} entries</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 text-zinc-600 hover:text-red-400"
                      onClick={() => setLogs([])}
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4 font-mono text-xs space-y-1.5">
                      {logs.length === 0 ? (
                        <p className="text-zinc-700">No logs yet. Run a workflow to see output.</p>
                      ) : (
                        logs.map((log, i) => {
                          const level = getLogLevel(log)
                          return (
                            <div key={i} className="flex items-start gap-2">
                              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                level === "ERROR" ? "bg-red-500/20 text-red-400" :
                                level === "WARN"  ? "bg-amber-500/20 text-amber-400" :
                                "bg-blue-500/20 text-blue-400"
                              }`}>{level}</span>
                              <span className={`${
                                level === "ERROR" ? "text-red-400" :
                                level === "WARN"  ? "text-amber-400" :
                                "text-zinc-400"
                              }`}>{log}</span>
                            </div>
                          )
                        })
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Model Compare */}
                <TabsContent value="compare" className="flex-1 m-0 overflow-auto">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Model A</label>
                        <select
                          className="w-full h-8 text-xs bg-zinc-900 border border-zinc-700/50 rounded-md px-2 mt-1 text-zinc-300"
                          value={compareModel1}
                          onChange={(e) => setCompareModel1(e.target.value)}
                        >
                          {MODEL_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Model B</label>
                        <select
                          className="w-full h-8 text-xs bg-zinc-900 border border-zinc-700/50 rounded-md px-2 mt-1 text-zinc-300"
                          value={compareModel2}
                          onChange={(e) => setCompareModel2(e.target.value)}
                        >
                          {MODEL_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[compareModel1, compareModel2].map((modelName, idx) => {
                        const m = MODEL_COMPARISON_DATA[modelName]
                        return (
                          <Card key={idx} className={`border ${idx === 0 ? "border-blue-500/30 bg-blue-500/5" : "border-purple-500/30 bg-purple-500/5"}`}>
                            <CardHeader className="p-3 pb-1">
                              <CardTitle className="text-xs font-bold text-zinc-200">{modelName}</CardTitle>
                              <Badge variant="outline" className={`text-[9px] w-fit ${idx === 0 ? "border-blue-500/30 text-blue-400" : "border-purple-500/30 text-purple-400"}`}>
                                Model {idx === 0 ? "A" : "B"}
                              </Badge>
                            </CardHeader>
                            <CardContent className="p-3 pt-2 space-y-2">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-zinc-600">Latency</span>
                                <span className="text-zinc-300 font-mono">{m.latency}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-zinc-600">Cost/1K</span>
                                <span className="text-zinc-300 font-mono">{m.cost}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-zinc-600">Context</span>
                                <span className="text-zinc-300 font-mono">{m.context}</span>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] text-zinc-600">Strengths</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.strengths.map((s) => (
                                    <Badge key={s} variant="outline" className="text-[9px] border-zinc-700 text-zinc-500">{s}</Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Right: Properties & Metrics ── */}
          <ResizablePanel defaultSize={32} minSize={22}>
            <div className="h-full flex flex-col border-l border-zinc-800">
              <Tabs value={rightTab} onValueChange={setRightTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 h-10 rounded-none border-b border-zinc-800 bg-zinc-900/30">
                  <TabsTrigger value="properties" className="gap-1 text-xs">
                    <Settings className="w-3 h-3" />
                    Config
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="gap-1 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger value="graph" className="gap-1 text-xs">
                    <Network className="w-3 h-3" />
                    Graph
                  </TabsTrigger>
                </TabsList>

                {/* Node Properties */}
                <TabsContent value="properties" className="flex-1 m-0 overflow-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      {selectedNode ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Node Name</label>
                            <Input
                              value={selectedNode.name}
                              onChange={(e) =>
                                setNodes((prev) =>
                                  prev.map((n) => (n.id === selectedNode.id ? { ...n, name: e.target.value } : n))
                                )
                              }
                              className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50 mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Type</label>
                            <p className="text-xs text-zinc-400 mt-1 capitalize">{selectedNode.type}</p>
                          </div>

                          {selectedNode.type === "llm" && (
                            <>
                              <div>
                                <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Model</label>
                                <select
                                  className="w-full h-8 text-xs bg-zinc-900 border border-zinc-700/50 rounded-md px-2 mt-1 text-zinc-300"
                                  value={selectedNode.config.model || ""}
                                  onChange={(e) => updateNodeConfig(selectedNode.id, "model", e.target.value)}
                                >
                                  <option value="">Select model</option>
                                  <option value="elara-pro">Elara Pro</option>
                                  <option value="elara-fast">Elara Fast</option>
                                  <option value="elara-reason">Elara Reason</option>
                                  <option value="elara-code">Elara Code</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">System Prompt</label>
                                <textarea
                                  className="w-full h-24 text-xs bg-zinc-900/60 border border-zinc-700/50 rounded-md p-2 mt-1 text-zinc-300 resize-none"
                                  placeholder="Enter system prompt…"
                                  value={selectedNode.config.systemPrompt || ""}
                                  onChange={(e) => updateNodeConfig(selectedNode.id, "systemPrompt", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Temperature</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="2"
                                  step="0.1"
                                  className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50 mt-1"
                                  value={selectedNode.config.temperature || "0.7"}
                                  onChange={(e) => updateNodeConfig(selectedNode.id, "temperature", e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          {selectedNode.type === "tool" && (
                            <div>
                              <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Tool Name</label>
                              {availableTools.length > 0 ? (
                                <select
                                  className="w-full h-8 text-xs bg-zinc-900 border border-zinc-700/50 rounded-md px-2 mt-1 text-zinc-300"
                                  value={selectedNode.config.toolName || ""}
                                  onChange={(e) => updateNodeConfig(selectedNode.id, "toolName", e.target.value)}
                                >
                                  <option value="">Select tool</option>
                                  {availableTools.map((t) => (
                                    <option key={t.name} value={t.name} title={t.description || ''}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50 mt-1"
                                  placeholder="e.g. web_search, code_interpreter"
                                  value={selectedNode.config.toolName || ""}
                                  onChange={(e) => updateNodeConfig(selectedNode.id, "toolName", e.target.value)}
                                />
                              )}
                            </div>
                          )}

                          {selectedNode.type === "condition" && (
                            <div>
                              <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Condition Expression</label>
                              <Input
                                className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50 mt-1"
                                placeholder="e.g. output.confidence > 0.8"
                                value={selectedNode.config.expression || ""}
                                onChange={(e) => updateNodeConfig(selectedNode.id, "expression", e.target.value)}
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs text-zinc-400 border-zinc-700 hover:bg-zinc-800"
                              onClick={() => duplicateNode(selectedNode)}
                            >
                              <Copy className="w-3 h-3 mr-1.5" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10"
                              onClick={() => removeNode(selectedNode.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Settings className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                          <p className="text-xs text-zinc-600">Select a node to configure</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Metrics */}
                <TabsContent value="metrics" className="flex-1 m-0 overflow-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {/* Live metrics sparkline bars */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Live Metrics</span>
                          <span className="text-[9px] text-zinc-700">polls every 10s</span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: "Success Rate", value: liveMetrics.successRate, max: 100, unit: "%", color: "bg-emerald-500" },
                            { label: "Avg Latency (ms)", value: Math.min(liveMetrics.avgLatency, 2000), max: 2000, unit: "ms", color: "bg-blue-500" },
                            { label: "Tokens/min", value: Math.min(liveMetrics.tokensPerMin, 10000), max: 10000, unit: "", color: "bg-purple-500" },
                          ].map((stat) => (
                            <div key={stat.label}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-zinc-500">{stat.label}</span>
                                <span className="text-[10px] font-mono text-zinc-300">{stat.label === "Avg Latency (ms)" ? liveMetrics.avgLatency : stat.label === "Tokens/min" ? liveMetrics.tokensPerMin : liveMetrics.successRate}{stat.unit}</span>
                              </div>
                              <Progress value={(stat.value / stat.max) * 100} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Performance</span>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {metrics.length > 0 ? (
                            metrics.map((m, i) => (
                              <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                                <CardContent className="p-3">
                                  <p className="text-[10px] text-zinc-600">{m.label}</p>
                                  <p className="text-lg font-bold text-zinc-200 mt-0.5">{m.value}</p>
                                  {m.change && (
                                    <p className={`text-[10px] mt-0.5 ${m.trend === "up" ? "text-emerald-400" : m.trend === "down" ? "text-red-400" : "text-zinc-500"}`}>
                                      {m.change}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardContent className="p-3">
                                  <p className="text-[10px] text-zinc-600">Total Runs</p>
                                  <p className="text-lg font-bold text-zinc-200 mt-0.5">{runs.length}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardContent className="p-3">
                                  <p className="text-[10px] text-zinc-600">Nodes</p>
                                  <p className="text-lg font-bold text-zinc-200 mt-0.5">{nodes.length}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardContent className="p-3">
                                  <p className="text-[10px] text-zinc-600">Success Rate</p>
                                  <p className="text-lg font-bold text-zinc-200 mt-0.5">
                                    {runs.length > 0 ? `${Math.round((runs.filter((r) => r.status === "completed").length / runs.length) * 100)}%` : "—"}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardContent className="p-3">
                                  <p className="text-[10px] text-zinc-600">Avg Duration</p>
                                  <p className="text-lg font-bold text-zinc-200 mt-0.5">
                                    {runs.length > 0
                                      ? `${Math.round(runs.filter((r) => r.duration).reduce((s, r) => s + (r.duration || 0), 0) / Math.max(runs.filter((r) => r.duration).length, 1))}ms`
                                      : "—"}
                                  </p>
                                </CardContent>
                              </Card>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Node Status</span>
                        <div className="mt-2 space-y-2">
                          {nodes.map((node) => (
                            <div key={node.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
                              {getStatusIcon(node.status)}
                              <span className="text-xs text-zinc-400 flex-1">{node.name}</span>
                              <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-600">
                                {node.status}
                              </Badge>
                            </div>
                          ))}
                          {nodes.length === 0 && <p className="text-xs text-zinc-700">No nodes</p>}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Graph */}
                <TabsContent value="graph" className="flex-1 m-0 p-4">
                  <div className="h-full flex flex-col items-center justify-center">
                    <Network className="w-12 h-12 text-zinc-800 mb-3" />
                    <p className="text-xs text-zinc-600 mb-1">Agent Interaction Graph</p>
                    <p className="text-[10px] text-zinc-700">
                      {nodes.length > 0 ? `${nodes.length} nodes connected` : "Add nodes to visualize"}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* ── Status Bar ── */}
      <div className="h-7 border-t border-zinc-800 flex items-center justify-between px-5 bg-zinc-900/20 text-[11px] text-zinc-600">
        <div className="flex items-center gap-4">
          <span>{nodes.length} nodes</span>
          <span>{runs.length} runs</span>
          {isRunning && <span className="text-blue-400">● Running</span>}
        </div>
        <span>{workflowName}</span>
      </div>
    </div>
  )
}
