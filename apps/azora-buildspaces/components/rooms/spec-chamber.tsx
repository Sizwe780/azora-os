"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SpecValidator, SpecType } from "@/lib/spec-kit"
import Editor from "@monaco-editor/react"
import {
  FileJson,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Wand2,
  LayoutTemplate,
  Code2,
  FileText,
  Settings,
  Download,
  Upload,
  Lightbulb,
  Users,
  GitBranch,
  Search,
  Filter,
  BarChart3,
  Zap,
  Target,
  Clock,
  Star,
  Share2,
  Eye,
  MessageSquare,
  Copy,
  Check,
  Plus,
  ChevronRight,
  Layers,
  Database,
  Globe,
  Sparkles,
  Brain,
  X,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

import { VisualBuilder } from "./visual-builder"

/* ─── types ─── */
interface SpecDocument {
  id: string
  title: string
  type: SpecType
  content: string
  status: "draft" | "review" | "approved" | "archived"
  version: string
  lastModified: Date
  author: string
}

/* ─── template configs ─── */
const SPEC_TEMPLATES = [
  {
    type: "component" as SpecType,
    name: "React Component",
    description: "UI component with props, state & accessibility",
    icon: LayoutTemplate,
    complexity: "Medium",
    color: "text-blue-400",
  },
  {
    type: "api" as SpecType,
    name: "REST API Endpoint",
    description: "HTTP API with schemas, auth & rate limiting",
    icon: Globe,
    complexity: "High",
    color: "text-green-400",
  },
  {
    type: "database" as SpecType,
    name: "Database Schema",
    description: "Data model with relationships & migrations",
    icon: Database,
    complexity: "High",
    color: "text-orange-400",
  },
  {
    type: "workflow" as SpecType,
    name: "Business Workflow",
    description: "Process flow with decision points & triggers",
    icon: Zap,
    complexity: "High",
    color: "text-yellow-400",
  },
  {
    type: "feature" as SpecType,
    name: "Feature Specification",
    description: "Complete feature with acceptance criteria",
    icon: Target,
    complexity: "Expert",
    color: "text-purple-400",
  },
]

/* ─── code block renderer ─── */
function CodeOutput({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        className="absolute top-3 right-3 z-10 h-7 px-2 text-xs text-zinc-500 hover:text-white bg-zinc-800/80"
      >
        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          readOnly: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: "'JetBrains Mono', monospace",
          padding: { top: 12 },
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
/*               SPEC CHAMBER                      */
/* ═══════════════════════════════════════════════ */
export function SpecChamber() {
  const [content, setContent] = useState(SpecValidator.generateTemplate("component"))
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors?: any[]; spec?: any } | null>(null)
  const [activeType, setActiveType] = useState<SpecType>("component")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const [specs, setSpecs] = useState<SpecDocument[]>([])
  const [showAI, setShowAI] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [isSaved, setIsSaved] = useState(true)
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null)

  // Upgrade 1: AI Complete loading state
  const [isAiCompleting, setIsAiCompleting] = useState(false)

  // Upgrade 2: Acceptance Criteria
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<
    { id: string; text: string; checked: boolean }[]
  >([])
  const [newCriteriaText, setNewCriteriaText] = useState("")

  // Upgrade 3: Stakeholder Sign-Off
  const [stakeholders, setStakeholders] = useState<
    { id: string; name: string; status: "pending" | "approved" | "rejected" }[]
  >([
    { id: "sl-1", name: "Tech Lead", status: "pending" },
    { id: "sl-2", name: "Product Manager", status: "pending" },
    { id: "sl-3", name: "QA Lead", status: "pending" },
  ])

  // Upgrade 4: Version History (pre-populated)
  const [versionHistory] = useState([
    {
      version: "v1.2",
      author: "Alice Chen",
      timestamp: "2024-01-14T09:15:00Z",
      description: "Updated security considerations",
      content:
        "name: MyComponent\nversion: 1.2\ndescription: Updated component with security fixes\nrequirements:\n  - Secure data handling\n  - Input sanitization\n  - CSRF protection\n",
    },
    {
      version: "v1.1",
      author: "Bob Smith",
      timestamp: "2024-01-12T14:30:00Z",
      description: "Added error handling requirements",
      content:
        "name: MyComponent\nversion: 1.1\ndescription: Component with error handling\nrequirements:\n  - Error boundary support\n  - Fallback UI\n  - Retry mechanism\n",
    },
    {
      version: "v1.0",
      author: "Alice Chen",
      timestamp: "2024-01-10T10:00:00Z",
      description: "Initial spec draft",
      content:
        "name: MyComponent\nversion: 1.0\ndescription: Initial component specification\nrequirements:\n  - Basic rendering\n  - Props validation\n",
    },
  ])

  // Load specs on mount
  useEffect(() => {
    loadSpecs()
  }, [])

  const loadSpecs = async () => {
    try {
      const resp = await fetch("/api/specs")
      if (resp.ok) {
        const data = await resp.json()
        setSpecs(
          (data.specs || []).map((s: any) => ({
            ...s,
            lastModified: new Date(s.lastModified || s.updatedAt || Date.now()),
          }))
        )
      }
    } catch (error) {
      console.error("Failed to load specs:", error)
    }
  }

  const handleTemplateChange = useCallback((type: SpecType) => {
    setActiveType(type)
    setContent(SpecValidator.generateTemplate(type))
    setValidationResult(null)
    setGeneratedCode("")
    setIsSaved(false)
  }, [])

  const handleValidate = useCallback(async () => {
    setIsValidating(true)
    try {
      const result = await SpecValidator.validate(content, activeType)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [{ message: error instanceof Error ? error.message : String(error) }],
      })
    } finally {
      setIsValidating(false)
    }
  }, [content, activeType])

  const handleGenerateCode = useCallback(async () => {
    setIsGenerating(true)
    try {
      // Try API-based generation first
      const resp = await fetch("/api/specs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type: activeType }),
      })

      if (resp.ok) {
        const data = await resp.json()
        setGeneratedCode(data.result || data.code || "// Generation completed but no output returned")
        setActiveTab("generated")
      } else {
        // Fallback to local generation
        const generated = generateFromSpec(content, activeType)
        setGeneratedCode(generated)
        setActiveTab("generated")
      }
    } catch {
      // Local fallback
      const generated = generateFromSpec(content, activeType)
      setGeneratedCode(generated)
      setActiveTab("generated")
    } finally {
      setIsGenerating(false)
    }
  }, [content, activeType])

  const handleSave = useCallback(async () => {
    try {
      const specData = {
        type: activeType,
        content,
        title: `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Specification`,
        status: "draft",
      }

      const resp = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specData),
      })

      if (resp.ok) {
        setIsSaved(true)
        loadSpecs()
      }
    } catch (error) {
      console.error("Failed to save spec:", error)
    }
  }, [content, activeType])

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `spec-${activeType}-${Date.now()}.yaml`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAiGenerate = useCallback(async () => {
    if (!aiQuery.trim() || isAiGenerating) return
    setIsAiGenerating(true)
    setAiResponse("")
    try {
      const resp = await fetch("/api/specs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: aiQuery,
          type: activeType,
          action: "ai-write",
          existingSpec: content,
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.spec) {
          setContent(data.spec)
          setAiResponse("Specification generated and loaded into editor ✓")
          setIsSaved(false)
        } else if (data.suggestion) {
          setAiResponse(data.suggestion)
        } else {
          setAiResponse(data.result || "Spec generated successfully")
        }
      } else {
        setAiResponse("AI generation temporarily unavailable. Try the quick suggestions!")
      }
    } catch {
      setAiResponse("Could not reach AI service. Try again later.")
    } finally {
      setIsAiGenerating(false)
    }
  }, [aiQuery, isAiGenerating, activeType, content])

  // Upgrade 1: AI-Powered Spec Completion
  const handleAiComplete = useCallback(async () => {
    setIsAiCompleting(true)
    try {
      const resp = await fetch("/api/agents/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-code", context: "Complete this spec section: " + content }),
      })
      if (resp.ok) {
        const data = await resp.json()
        const completion = data.result || data.output || data.response || ""
        if (completion) {
          setContent((prev) => prev + "\n" + completion)
          setIsSaved(false)
        }
      }
    } catch (error) {
      console.error("AI completion failed:", error)
    } finally {
      setIsAiCompleting(false)
    }
  }, [content])

  // Upgrade 5: Export as Markdown
  const handleExportMarkdown = useCallback(() => {
    const title = `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Specification`
    const criteriaSection =
      acceptanceCriteria.length > 0
        ? `\n## Acceptance Criteria\n\n${acceptanceCriteria.map((c) => `- [${c.checked ? "x" : " "}] ${c.text}`).join("\n")}\n`
        : ""
    const signOffSection = `\n## Sign-Off\n\n| Stakeholder | Status |\n|---|---|\n${stakeholders
      .map((s) => `| ${s.name} | ${s.status.charAt(0).toUpperCase() + s.status.slice(1)} |`)
      .join("\n")}\n`
    const md = `# ${title}\n\n${content}\n${criteriaSection}${signOffSection}`
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `spec-${title.toLowerCase().replace(/\s+/g, "-")}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeType, content, acceptanceCriteria, stakeholders])

  // Upgrade 2: Acceptance Criteria helpers
  const addCriteria = useCallback(() => {
    if (!newCriteriaText.trim()) return
    setAcceptanceCriteria((prev) => [
      ...prev,
      { id: `ac-${Date.now()}`, text: newCriteriaText.trim(), checked: false },
    ])
    setNewCriteriaText("")
  }, [newCriteriaText])

  const toggleCriteria = useCallback((id: string) => {
    setAcceptanceCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)))
  }, [])

  const removeCriteria = useCallback((id: string) => {
    setAcceptanceCriteria((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Upgrade 3: Stakeholder sign-off helper
  const updateStakeholder = useCallback((id: string, status: "pending" | "approved" | "rejected") => {
    setStakeholders((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }, [])

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Header ── */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <LayoutTemplate className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-semibold text-base">Spec Chamber</h1>
          </div>
          <div className="h-5 w-px bg-zinc-800 ml-2" />
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isSaved ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"}`} />
            <span className="text-[11px] text-zinc-500">{isSaved ? "Saved" : "Unsaved"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating}
            className="gap-2 border-zinc-700 hover:bg-zinc-800 text-zinc-300 h-8"
          >
            {isValidating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            Validate
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white h-8"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            {isGenerating ? "Generating…" : "Generate Code"}
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-2 bg-zinc-800 hover:bg-zinc-700 h-8">
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportMarkdown} className="h-8 px-2 text-zinc-400" title="Export as Markdown">
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAI(!showAI)}
            className={`h-8 px-2 ${showAI ? "text-purple-400 bg-purple-500/10" : "text-zinc-400"}`}
          >
            <Brain className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar: Templates ── */}
        <div className="w-60 border-r border-zinc-800 bg-zinc-900/20 flex flex-col">
          <div className="p-4">
            <h3 className="text-[10px] font-semibold text-zinc-500 mb-3 uppercase tracking-wider">
              Spec Type
            </h3>
            <div className="space-y-1">
              {SPEC_TEMPLATES.map((template) => {
                const Icon = template.icon
                return (
                  <button
                    key={template.type}
                    onClick={() => handleTemplateChange(template.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      activeType === template.type
                        ? "bg-purple-500/10 border border-purple-500/20 text-zinc-200"
                        : "hover:bg-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${template.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{template.name}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5 truncate">{template.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className="px-4 pb-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  validationResult.valid
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {validationResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs font-medium text-zinc-200">
                    {validationResult.valid ? "Valid Specification" : "Validation Errors"}
                  </span>
                </div>
                {!validationResult.valid && validationResult.errors && (
                  <div className="space-y-1 mt-2">
                    {validationResult.errors.slice(0, 5).map((error: any, i: number) => (
                      <div key={i} className="text-[11px] text-red-300 flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error.message || String(error)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {validationResult.valid && validationResult.spec?.requirements && (
                  <div className="space-y-1 mt-2">
                    {validationResult.spec.requirements.map((req: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-zinc-300">{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Recent Specs */}
          <div className="flex-1 border-t border-zinc-800 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="text-[10px] font-semibold text-zinc-500 mb-3 uppercase tracking-wider">
                  Recent Specs
                </h3>
                {specs.length > 0 ? (
                  <div className="space-y-1">
                    {specs.slice(0, 10).map((spec) => (
                      <button
                        key={spec.id}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="text-xs text-zinc-300 truncate">{spec.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] h-4 border-zinc-700">
                            {spec.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[9px] h-4 ${
                              spec.status === "approved"
                                ? "border-emerald-600 text-emerald-400"
                                : spec.status === "review"
                                ? "border-yellow-600 text-yellow-400"
                                : "border-zinc-700 text-zinc-500"
                            }`}
                          >
                            {spec.status}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-600 text-center py-4">No saved specs yet</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* ── Editor Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-zinc-800 px-4 py-1.5 flex items-center justify-between">
              <TabsList className="bg-zinc-800/50 h-8">
                <TabsTrigger value="editor" className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700">
                  <FileJson className="w-3.5 h-3.5" />
                  Spec Editor
                </TabsTrigger>
                <TabsTrigger
                  value="generated"
                  className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700"
                  disabled={!generatedCode}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Generated Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700">
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="visual" className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700">
                  <Layers className="w-3.5 h-3.5" />
                  Visual Builder
                </TabsTrigger>
                <TabsTrigger value="criteria" className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Criteria
                </TabsTrigger>
                <TabsTrigger value="signoff" className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700">
                  <Users className="w-3.5 h-3.5" />
                  Sign-Off
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5 text-xs h-7 data-[state=active]:bg-zinc-700">
                  <GitBranch className="w-3.5 h-3.5" />
                  History
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {activeTab === "editor" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAiComplete}
                    disabled={isAiCompleting}
                    className="gap-1.5 text-xs h-7 border-zinc-700 text-zinc-400 hover:text-purple-400 hover:border-purple-700"
                  >
                    {isAiCompleting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    AI Complete
                  </Button>
                )}
                <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                  <span>YAML</span>
                  <span>•</span>
                  <span>{content.split("\n").length} lines</span>
                </div>
              </div>
            </div>

            <TabsContent value="editor" className="flex-1 m-0">
              <Editor
                height="100%"
                language="yaml"
                value={content}
                onChange={(value) => {
                  setContent(value || "")
                  setIsSaved(false)
                }}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 12 },
                  wordWrap: "on",
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  renderWhitespace: "boundary",
                }}
              />
            </TabsContent>

            <TabsContent value="generated" className="flex-1 m-0">
              {isGenerating ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="text-sm text-zinc-400">Generating code from spec…</div>
                    <Progress value={66} className="w-48 mx-auto" />
                  </div>
                </div>
              ) : (
                <CodeOutput code={generatedCode} language="typescript" />
              )}
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-4 text-zinc-200">Specification Preview</h2>
                <div className="prose prose-invert prose-sm">
                  <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                    {content}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="flex-1 m-0">
              <VisualBuilder />
            </TabsContent>

            {/* Upgrade 2: Acceptance Criteria Checklist */}
            <TabsContent value="criteria" className="flex-1 m-0 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-200">Acceptance Criteria</h2>
                  {acceptanceCriteria.length > 0 && (
                    <Badge variant="outline" className="text-xs border-zinc-700">
                      {acceptanceCriteria.filter((c) => c.checked).length}/{acceptanceCriteria.length} complete
                    </Badge>
                  )}
                </div>
                {acceptanceCriteria.length > 0 && (
                  <Progress
                    value={(acceptanceCriteria.filter((c) => c.checked).length / acceptanceCriteria.length) * 100}
                    className="h-1.5"
                  />
                )}
                <div className="flex gap-2">
                  <Input
                    value={newCriteriaText}
                    onChange={(e) => setNewCriteriaText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCriteria()}
                    placeholder="Add acceptance criterion…"
                    className="bg-zinc-800 border-zinc-700 text-sm text-zinc-300"
                  />
                  <Button size="sm" onClick={addCriteria} className="bg-zinc-700 hover:bg-zinc-600 gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {acceptanceCriteria.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCriteria(item.id)}
                        className="w-4 h-4 accent-purple-500 cursor-pointer flex-shrink-0"
                      />
                      <span
                        className={`flex-1 text-sm ${item.checked ? "line-through text-zinc-500" : "text-zinc-300"}`}
                      >
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(item.id)}
                        className="h-6 w-6 p-0 text-zinc-600 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  {acceptanceCriteria.length === 0 && (
                    <p className="text-[11px] text-zinc-600 text-center py-6">
                      No acceptance criteria added yet. Add your first criterion above.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Upgrade 3: Stakeholder Sign-Off */}
            <TabsContent value="signoff" className="flex-1 m-0 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-lg font-semibold text-zinc-200">Stakeholder Sign-Off</h2>
                <div className="space-y-3">
                  {stakeholders.map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-200">{stakeholder.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            stakeholder.status === "approved"
                              ? "border-emerald-600 text-emerald-400"
                              : stakeholder.status === "rejected"
                              ? "border-red-600 text-red-400"
                              : "border-zinc-700 text-zinc-500"
                          }`}
                        >
                          {stakeholder.status.charAt(0).toUpperCase() + stakeholder.status.slice(1)}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => updateStakeholder(stakeholder.id, "approved")}
                          disabled={stakeholder.status === "approved"}
                          className="h-7 px-2 text-xs bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStakeholder(stakeholder.id, "rejected")}
                          disabled={stakeholder.status === "rejected"}
                          variant="outline"
                          className="h-7 px-2 text-xs border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-700"
                        >
                          Request Changes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Upgrade 4: Version History */}
            <TabsContent value="history" className="flex-1 m-0 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-lg font-semibold text-zinc-200">Version History</h2>
                <div className="space-y-3">
                  {versionHistory.map((entry) => (
                    <div
                      key={entry.version}
                      className="flex items-start justify-between px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800"
                    >
                      <div className="flex items-start gap-3">
                        <GitBranch className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-200">{entry.version}</span>
                            <Badge variant="outline" className="text-[10px] h-4 border-zinc-700 text-zinc-500">
                              {entry.author}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{entry.description}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setContent(entry.content)
                          setIsSaved(false)
                          setActiveTab("editor")
                        }}
                        className="h-7 px-2 text-xs border-zinc-700 text-zinc-400 hover:text-zinc-200 flex-shrink-0"
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── AI Assistant Panel ── */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-zinc-200">AI Assistant</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAI(false)} className="h-6 w-6 p-0 text-zinc-500">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Ask the AI to help you write, improve, or validate your specifications.
                  </p>

                  {/* Quick suggestions */}
                  {[
                    "Add error handling requirements",
                    "Suggest performance benchmarks",
                    "Add security considerations",
                    "Generate test scenarios",
                    "Improve accessibility requirements",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAiQuery(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30 text-xs text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                      <Sparkles className="w-3 h-3 inline mr-2 text-purple-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-zinc-800">
                {aiResponse && (
                  <div className="mb-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-zinc-300">
                    {aiResponse}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                    placeholder="Describe your spec in natural language…"
                    className="bg-zinc-800 border-zinc-700 text-sm text-zinc-300"
                    disabled={isAiGenerating}
                  />
                  <Button
                    size="sm"
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !aiQuery.trim()}
                    className="bg-purple-600 hover:bg-purple-700 px-3"
                  >
                    {isAiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── local code generation fallback ─── */
function generateFromSpec(content: string, type: SpecType): string {
  // Parse YAML-like content
  const lines = content.split("\n")
  const nameMatch = lines.find((l) => l.startsWith("name:"))
  const name = nameMatch?.split(":")[1]?.trim() || "Generated"
  const requirements = lines
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.trim().replace("- ", ""))

  switch (type) {
    case "component":
      return `import React, { useState, useEffect } from 'react'

interface ${name}Props {
  /** Component title */
  title?: string
  /** Whether the component is active */
  isActive?: boolean
  /** Callback when component state changes */
  onChange?: (value: any) => void
}

/**
 * ${name} Component
 * 
 * Requirements:
${requirements.map((r) => ` * - ${r}`).join("\n")}
 */
export function ${name}({ title, isActive = false, onChange }: ${name}Props) {
  const [state, setState] = useState<Record<string, any>>({})

  useEffect(() => {
    // Component initialization
    console.log('${name} mounted')
    return () => console.log('${name} unmounted')
  }, [])

  return (
    <div 
      className="${name.toLowerCase()}-container"
      role="region"
      aria-label={title || '${name}'}
      data-active={isActive}
    >
      <h2 className="text-lg font-semibold">{title || '${name}'}</h2>
      {/* Implementation based on spec requirements */}
    </div>
  )
}

export default ${name}`

    case "api":
      return `import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * ${name} API Endpoint
 * 
 * Requirements:
${requirements.map((r) => ` * - ${r}`).join("\n")}
 */

// Request validation schema
const ${name}Schema = z.object({
  // Define your request body schema here
})

// GET handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Implementation here
    
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ${name}Schema.parse(body)
    
    // Implementation here
    
    return NextResponse.json({
      success: true,
      data: validated,
      message: '${name} created successfully',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}`

    case "database":
      return `import { pgTable, uuid, varchar, timestamp, boolean, text, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * ${name} Database Schema
 * 
 * Requirements:
${requirements.map((r) => ` * - ${r}`).join("\n")}
 */

export const ${name.toLowerCase()}Table = pgTable('${name.toLowerCase()}', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
  
  // Add your columns here based on spec
})

// Relations
export const ${name.toLowerCase()}Relations = relations(${name.toLowerCase()}Table, ({ one, many }) => ({
  // Define relationships here
}))`

    case "workflow":
      return `/**
 * ${name} Workflow
 * 
 * Requirements:
${requirements.map((r) => ` * - ${r}`).join("\n")}
 */

interface WorkflowStep {
  id: string
  name: string
  action: (input: any) => Promise<any>
  onError?: (error: Error) => Promise<void>
}

export class ${name}Workflow {
  private steps: WorkflowStep[] = []
  
  constructor() {
    this.steps = [
${requirements
  .map(
    (r, i) =>
      `      { id: 'step-${i + 1}', name: '${r}', action: this.step${i + 1}.bind(this) },`
  )
  .join("\n")}
    ]
  }

  async execute(input: any) {
    let data = input
    for (const step of this.steps) {
      try {
        console.log(\`Executing: \${step.name}\`)
        data = await step.action(data)
      } catch (error) {
        console.error(\`Failed at step: \${step.name}\`, error)
        if (step.onError) await step.onError(error as Error)
        throw error
      }
    }
    return data
  }

${requirements
  .map(
    (r, i) => `  private async step${i + 1}(data: any) {
    // TODO: Implement — ${r}
    return data
  }`
  )
  .join("\n\n")}
}`

    default:
      return `// Feature specification: ${name}\n// Type: ${type}\n// Requirements:\n${requirements.map((r) => `// - ${r}`).join("\n")}\n\n// Implementation goes here`
  }
}
