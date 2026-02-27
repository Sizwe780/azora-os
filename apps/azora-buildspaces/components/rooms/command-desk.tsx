"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Code2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ChevronDown,
  Plus,
  Settings,
  Paperclip,
  Image as ImageIcon,
  Globe,
  Zap,
  Brain,
  MessageSquare,
  History,
  Star,
  ArrowUp,
  StopCircle,
  Wand2,
  FileCode,
  Terminal as TerminalIcon,
  Bug,
  GitBranch,
  Lightbulb,
  Mic,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Search,
  Download,
  Pin,
  PinOff,
  Rocket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import ReasoningTrace from "@/components/shared/ReasoningTrace"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWorkspace, Task } from "@/lib/contexts/workspace-context"
import { useCitadelStore } from "@/lib/store/use-citadel-store"
import { useRoomEvents } from "@/lib/hooks/use-room-events"

/* ───────── types ───────── */
interface CommandHistoryItem {
  id: string
  command: string
  timestamp: Date
  status: 'success' | 'error'
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agent?: string
  model?: string
  timestamp: Date
  thinking?: boolean
  codeBlocks?: CodeBlock[]
  tokens?: { input: number; output: number }
  rating?: "up" | "down" | null
}

interface CodeBlock {
  language: string
  code: string
  filename?: string
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface RecentExecution {
  id: string
  projectId?: string
  status?: string
  lastStep?: string
  lastStepType?: string
  updatedAt?: string
}

/* ───────── models ───────── */
const MODELS = [
  { id: "elara-pro", name: "Elara Pro", provider: "Azora", icon: "🌙", description: "Most capable model", badge: "Pro" },
  { id: "elara-fast", name: "Elara Fast", provider: "Azora", icon: "⚡", description: "Fastest responses", badge: "Fast" },
  { id: "elara-reason", name: "Elara Reason", provider: "Azora", icon: "🧠", description: "Deep reasoning & analysis", badge: "Reason" },
  { id: "elara-code", name: "Elara Code", provider: "Azora", icon: "💻", description: "Specialized for coding", badge: "Code" },
]

/* ───────── quick actions ───────── */
const QUICK_ACTIONS = [
  { icon: Code2, label: "Write Code", prompt: "Write a " },
  { icon: Bug, label: "Debug", prompt: "Help me debug this: " },
  { icon: FileCode, label: "Refactor", prompt: "Refactor the following code: " },
  { icon: TerminalIcon, label: "CLI Command", prompt: "What's the terminal command to " },
  { icon: GitBranch, label: "Git Help", prompt: "Help me with git: " },
  { icon: Lightbulb, label: "Explain", prompt: "Explain how " },
]

/* ───────── script templates ───────── */
const SCRIPT_TEMPLATES = [
  { label: "npm install", command: "npm install" },
  { label: "npm run build", command: "npm run build" },
  { label: "git status", command: "git status" },
  { label: "docker ps", command: "docker ps" },
  { label: "npm run test", command: "npm run test" },
]

/* ───────── slash commands ───────── */
interface SlashCommand {
  name: string
  description: string
  icon: typeof Code2
  handler: (args: string) => string
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: "/generate-component",
    description: "Generate a React component",
    icon: Code2,
    handler: (args) => `Generate a production-ready React TypeScript component for: ${args}. Include proper types, error handling, accessibility, and Tailwind CSS styling.`,
  },
  {
    name: "/test-file",
    description: "Generate tests for a file",
    icon: Bug,
    handler: (args) => `Generate comprehensive unit tests (Jest + React Testing Library) for the following code:\n${args}`,
  },
  {
    name: "/refactor",
    description: "Refactor selected code",
    icon: FileCode,
    handler: (args) => `Refactor the following code for better readability, performance, and maintainability:\n${args}`,
  },
  {
    name: "/explain",
    description: "Explain code in detail",
    icon: Lightbulb,
    handler: (args) => `Explain the following code in detail, including its purpose, how it works, and any potential issues:\n${args}`,
  },
  {
    name: "/deploy",
    description: "Generate deployment config",
    icon: Globe,
    handler: (args) => `Generate a deployment configuration for: ${args}. Include Dockerfile, docker-compose.yml, and CI/CD pipeline (GitHub Actions).`,
  },
  {
    name: "/api",
    description: "Generate an API endpoint",
    icon: Globe,
    handler: (args) => `Generate a Next.js API route for: ${args}. Include input validation (zod), error handling, authentication checks, and TypeScript types.`,
  },
  {
    name: "/git",
    description: "Git workflow help",
    icon: GitBranch,
    handler: (args) => `Help me with the following Git workflow: ${args}`,
  },
  {
    name: "/fix",
    description: "Fix a bug or error",
    icon: Bug,
    handler: (args) => `I'm encountering the following error. Diagnose the root cause and provide a fix:\n${args}`,
  },
]

function parseSlashCommand(input: string): { isSlash: boolean; command?: SlashCommand; args: string } {
  const trimmed = input.trim()
  if (!trimmed.startsWith("/")) return { isSlash: false, args: trimmed }
  
  const firstSpace = trimmed.indexOf(" ")
  const cmdName = firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace)
  const args = firstSpace === -1 ? "" : trimmed.substring(firstSpace + 1).trim()
  
  const command = SLASH_COMMANDS.find((c) => c.name === cmdName)
  if (command) {
    return { isSlash: true, command, args }
  }
  return { isSlash: false, args: trimmed }
}

/* ───────── code block renderer ───────── */
function CodeBlockRenderer({ language, code, filename }: CodeBlock) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-lg border border-zinc-700/50 overflow-hidden bg-zinc-900/80">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/60 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-400">
            {filename || language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs text-zinc-400 hover:text-white"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-[13px] text-zinc-100">{code}</code>
      </pre>
    </div>
  )
}

/* ───────── message parser (extracts code blocks) ───────── */
function parseMessageContent(content: string): { text: string; codeBlocks: CodeBlock[] } {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const codeBlocks: CodeBlock[] = []
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    })
  }

  const text = content.replace(codeBlockRegex, "").trim()
  return { text, codeBlocks }
}

/* ───────── thinking indicator ───────── */
function ThinkingIndicator({ agent }: { agent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 px-6 py-3"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-xs text-purple-400 font-medium">{agent || "Elara"} is thinking…</span>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ───────── output line syntax highlighting ───────── */
function getOutputLineClass(line: string): string {
  if (/^(error|Error|ERROR)/.test(line) || /error:/i.test(line.slice(0, 20))) return "text-red-400"
  if (/^(warning|Warning|WARN)/i.test(line)) return "text-amber-400"
  if (/^(success|Success|SUCCESS|✓)/i.test(line) || line.startsWith("✓")) return "text-emerald-400"
  return "text-zinc-300"
}

/* ───────── message bubble ───────── */
function MessageBubble({ message, onRate }: { message: Message; onRate: (id: string, rating: "up" | "down") => void }) {
  const isUser = message.role === "user"
  const { text, codeBlocks } = parseMessageContent(message.content)
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyAll = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group px-6 py-4 hover:bg-white/[0.02] transition-colors ${isUser ? "" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-zinc-200">
              {isUser ? "You" : message.agent || "Elara"}
            </span>
            {message.model && !isUser && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-zinc-700 text-zinc-500">
                {message.model}
              </Badge>
            )}
            <span className="text-[11px] text-zinc-600">
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Text */}
          {text && (
            <div className="text-[14px] leading-[1.7] whitespace-pre-wrap">
              {text.split("\n").map((line, i) => (
                <span key={i} className={`block ${getOutputLineClass(line)}`}>{line || "\u00a0"}</span>
              ))}
            </div>
          )}

          {/* Code blocks */}
          {codeBlocks.map((block, i) => (
            <CodeBlockRenderer key={i} {...block} />
          ))}

          {/* Actions */}
          {!isUser && (
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center gap-1 mt-3"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAll}
                    className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-200"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRate(message.id, "up")}
                    className={`h-7 px-2 text-xs ${message.rating === "up" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-200"}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRate(message.id, "down")}
                    className={`h-7 px-2 text-xs ${message.rating === "down" ? "text-red-400" : "text-zinc-500 hover:text-zinc-200"}`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Token info */}
          {message.tokens && !isUser && (
            <div className="text-[10px] text-zinc-600 mt-2">
              {message.tokens.input + message.tokens.output} tokens
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════ */
/*                COMMAND DESK                     */
/* ═══════════════════════════════════════════════ */
export function CommandDesk() {
  const { tasks, setTasks, setActiveRoom } = useWorkspace()
  const { emit, ROOM_EVENTS } = useRoomEvents('command-desk')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [recentSessions, setRecentSessions] = useState<RecentExecution[]>([])
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  // Pinned commands (upgrade 1)
  const [pinnedCommands, setPinnedCommands] = useState<Set<string>>(new Set())
  // Command history (upgrade 2)
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([])
  const [historySearch, setHistorySearch] = useState("")
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'history'>('chats')
  // Deploy button (upgrade 5)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployToast, setDeployToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + "px"
    }
  }, [input])

  // Load real chat history from database on mount
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch("/api/chat/sessions", { method: "POST" })
        if (!res.ok) throw new Error("Failed to create session")
        const session = await res.json()
        setSessionId(session.id)
        setExecutionId(session.id)

        const msgRes = await fetch(`/api/chat/sessions/${session.id}/messages`)
        if (msgRes.ok) {
          const history = await msgRes.json()
          setMessages(
            history.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          )
        }

        // Load session history
        const histRes = await fetch("/api/chat/sessions")
        if (histRes.ok) {
          const sessData = await histRes.json()
          setSessions(
            (sessData.sessions || []).map((s: any) => ({
              ...s,
              timestamp: new Date(s.timestamp || s.updatedAt),
            }))
          )
        }

        const execRes = await fetch('/api/agents/sessions')
        if (execRes.ok) {
          const data = await execRes.json()
          setRecentSessions(data.sessions || [])
        }

        if (typeof window !== 'undefined') {
          const lastExecution = localStorage.getItem('citadel-last-execution')
          if (lastExecution) {
            const resumeRes = await fetch(`/api/agents/sessions/${lastExecution}`)
            if (resumeRes.ok) {
              const resumeData = await resumeRes.json()
              const record = resumeData.record
              if (record?.trace) {
                const store = useCitadelStore.getState()
                store.clearTrace()
                record.trace.forEach((step: any, idx: number) => {
                  store.addStep({
                    id: `${lastExecution}-${idx}`,
                    type: step.type,
                    text: step.content,
                    timestamp: step.timestamp,
                  })
                })
                store.markSynced(new Date().toISOString())
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize session:", error)
        // Generate a local session ID fallback
        setSessionId(`local-${Date.now()}`)
        setExecutionId(`local-${Date.now()}`)
      }
    }
    initSession()
  }, [])

  const handleResumeExecution = useCallback(async (execution: RecentExecution) => {
    try {
      const res = await fetch(`/api/agents/sessions/${execution.id}`)
      if (!res.ok) throw new Error('Failed to load session')
      const data = await res.json()
      const record = data.record
      if (record?.trace) {
        const store = useCitadelStore.getState()
        store.clearTrace()
        record.trace.forEach((step: any, idx: number) => {
          store.addStep({
            id: `${execution.id}-${idx}`,
            type: step.type,
            text: step.content,
            timestamp: step.timestamp,
          })
        })
        store.markSynced(new Date().toISOString())
      }
      if (execution.projectId && typeof window !== 'undefined') {
        localStorage.setItem('citadel-active-project', execution.projectId)
      }
      setExecutionId(execution.id)
      setShowHistory(false)
      setActiveRoom('code-chamber')
    } catch (error) {
      console.error('Failed to resume execution', error)
    }
  }, [setActiveRoom])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Parse slash commands
    const parsed = parseSlashCommand(input.trim())
    const contentToSend = parsed.isSlash && parsed.command
      ? parsed.command.handler(parsed.args)
      : input.trim()

    // Emit cross-room events
    emit(ROOM_EVENTS.MESSAGE_SEND, { model: selectedModel.id })
    if (parsed.isSlash && parsed.command) {
      emit(ROOM_EVENTS.SLASH_COMMAND, { command: parsed.command.name })
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    const currentInput = contentToSend
    // Track command history (upgrade 2)
    const historyId = crypto.randomUUID()
    setCommandHistory((prev) => [{
      id: historyId, command: input.trim(), timestamp: new Date(), status: 'success' as const,
    }, ...prev].slice(0, 50))
    setInput("")
    setIsLoading(true)
    setIsStreaming(true)

    // Create placeholder assistant message for streaming
    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      agent: selectedModel.name,
      model: selectedModel.id,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      // Build conversation history for context
      const recentHistory = messages.slice(-20).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))

      const execId = executionId || sessionId || `exec-${Date.now()}`
      if (execId !== executionId) {
        setExecutionId(execId)
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('citadel-last-execution', execId)
      }

      const res = await fetch("/api/agents/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...recentHistory, { role: "user", content: currentInput }],
          model: selectedModel.id,
          executionId: execId,
          projectId: (typeof window !== 'undefined' && localStorage.getItem('citadel-active-project')) || 'default',
        }),
      })

      if (!res.ok || !res.body) throw new Error("Streaming failed")

      // Parse SSE-style stream emitted by orchestrator
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // also push trace steps into global store
      const { addStep } = useCitadelStore.getState()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // split on double newline to get complete events
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        for (const part of parts) {
          const [header, dataLine] = part.split('\n')
          if (!dataLine) continue
          const eventMatch = header.match(/^event: (\w+)/)
          const event = eventMatch ? eventMatch[1] : ''
          const data = dataLine.replace(/^data: /, '')
          try {
            const parsed = JSON.parse(data)
            if (event === 'step') {
              addStep(parsed)
            } else if (event === 'done') {
              // final result could contain assistant message text
              fullContent = parsed?.nodeResults ? JSON.stringify(parsed.nodeResults) : ''
            } else if (event === 'error') {
              console.error('Stream error', parsed)
            }
          } catch (e) {
            // ignore parse errors
          }
        }
        // update assistant content continuously (optional)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
        )
      }

      // final message already set via loop
    } catch (error) {
      console.error("Streaming failed, falling back:", error)
      // Fallback to non-streaming endpoint
      try {
        const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: currentInput,
            role: "user",
            model: selectedModel.id,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: data.assistantMessage?.content || data.content || "Processing your request…",
                    tokens: data.usage,
                  }
                : m
            )
          )
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "I apologize, but I'm unable to connect to the agent routing system at the moment. Please check your connection or try again." }
                : m
            )
          )
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "An error occurred. Please try again." }
              : m
          )
        )
        setCommandHistory((prev) => prev.map((h) => h.id === historyId ? { ...h, status: 'error' as const } : h))
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const handleRate = (messageId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, rating: m.rating === rating ? null : rating } : m
      )
    )
    // Persist rating
    fetch("/api/chat/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, rating }),
    }).catch(console.error)
  }

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/sessions", { method: "POST" })
      if (res.ok) {
        const session = await res.json()
        setSessionId(session.id)
        setMessages([])
      }
    } catch {
      setSessionId(`local-${Date.now()}`)
      setMessages([])
    }
  }

  const handleStop = () => {
    setIsLoading(false)
    setIsStreaming(false)
  }

  // Deploy handler (upgrade 5)
  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const res = await fetch("/api/deploy/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: "production" }),
      })
      if (!res.ok) throw new Error("Deploy failed")
      setDeployToast({ message: "Deployment triggered! ✓", type: "success" })
    } catch {
      setDeployToast({ message: "Deploy failed", type: "error" })
    } finally {
      setIsDeploying(false)
      setTimeout(() => setDeployToast(null), 4000)
    }
  }

  // Export conversation (industry-leading: ChatGPT, Claude all have this)
  const exportConversation = (format: 'markdown' | 'json') => {
    const filename = `conversation-${new Date().toISOString().slice(0, 10)}`
    let content: string
    let type: string
    let ext: string

    if (format === 'json') {
      content = JSON.stringify(messages.map(m => ({
        role: m.role,
        content: m.content,
        agent: m.agent,
        timestamp: m.timestamp,
      })), null, 2)
      type = 'application/json'
      ext = 'json'
    } else {
      content = messages.map(m => {
        const prefix = m.role === 'user' ? '## You' : `## ${m.agent || 'Assistant'}`
        return `${prefix}\n\n${m.content}\n\n---\n`
      }).join('\n')
      type = 'text/markdown'
      ext = 'md'
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Token estimation (approximate)
  const estimatedTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  /* ─── render ─── */
  return (
    <div className="flex h-full bg-zinc-950">
      {/* Deploy Toast (upgrade 5) */}
      <AnimatePresence>
        {deployToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${
              deployToast.type === "success"
                ? "bg-emerald-900/90 border border-emerald-700 text-emerald-200"
                : "bg-red-900/90 border border-red-700 text-red-200"
            }`}
          >
            {deployToast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── History Sidebar ── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-zinc-800 space-y-2">
              <Button onClick={handleNewChat} className="w-full gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200" size="sm">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
              {/* Sidebar tabs (upgrade 2) */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSidebarTab("chats")}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${sidebarTab === "chats" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Chats
                </button>
                <button
                  onClick={() => setSidebarTab("history")}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${sidebarTab === "history" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  History
                </button>
              </div>
            </div>

            {/* Chats tab */}
            {sidebarTab === "chats" && (
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setSessionId(session.id)
                        setShowHistory(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors hover:bg-zinc-800/50 ${
                        sessionId === session.id ? "bg-zinc-800/70 text-white" : "text-zinc-400"
                      }`}
                    >
                      <div className="font-medium truncate text-zinc-300">{session.title || "Untitled Chat"}</div>
                      <div className="text-[11px] text-zinc-600 mt-1 truncate">{session.lastMessage}</div>
                      <div className="text-[10px] text-zinc-700 mt-1">{session.messageCount} messages</div>
                    </button>
                  ))}
                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-zinc-600 text-sm">No chat history yet</div>
                  )}

                  <div className="pt-4">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium mb-2">Recent Sessions</div>
                    <div className="space-y-2">
                      {recentSessions.map((execution) => (
                        <div key={execution.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-2">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-xs text-zinc-300 truncate">
                                {execution.lastStep || 'Session activity'}
                              </div>
                              <div className="text-[10px] text-zinc-600 mt-1">
                                {execution.projectId || 'default'} • {execution.status || 'running'}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                              onClick={() => handleResumeExecution(execution)}
                            >
                              Resume
                            </Button>
                          </div>
                          {execution.updatedAt && (
                            <div className="text-[10px] text-zinc-700 mt-1">
                              {new Date(execution.updatedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                      {recentSessions.length === 0 && (
                        <div className="text-center py-4 text-zinc-600 text-xs">No recent sessions yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            {/* History tab (upgrade 2) */}
            {sidebarTab === "history" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search history..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {commandHistory
                      .filter((h) => !historySearch || h.command.toLowerCase().includes(historySearch.toLowerCase()))
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setInput(item.command)}
                          className="w-full text-left p-2.5 rounded-lg text-xs transition-colors hover:bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.status === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span className="text-zinc-300 truncate flex-1">{item.command}</span>
                          </div>
                          <div className="text-zinc-600 mt-1 pl-3.5">
                            {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </button>
                      ))}
                    {commandHistory.length === 0 && (
                      <div className="text-center py-8 text-zinc-600 text-sm">No command history yet</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Templates section (upgrade 4) */}
            <div className="border-t border-zinc-800 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Templates</span>
              </div>
              <div className="space-y-0.5">
                {SCRIPT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => setInput(tpl.command)}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors font-mono"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-12 border-b border-zinc-800/60 flex items-center justify-between px-4 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-zinc-400 hover:text-white h-8 px-2"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="text-zinc-400 hover:text-white h-8 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* Model Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="text-zinc-300 hover:text-white h-8 gap-2"
              >
                <span className="text-base">{selectedModel.icon}</span>
                <span className="text-sm font-medium">{selectedModel.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </Button>

              <AnimatePresence>
                {showModelPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute top-full left-0 mt-1 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 p-2"
                  >
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModel(model); setShowModelPicker(false) }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedModel.id === model.id ? "bg-zinc-800 text-white" : "hover:bg-zinc-800/50 text-zinc-400"
                        }`}
                      >
                        <span className="text-xl">{model.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-200">{model.name}</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1 border-zinc-700">{model.badge}</Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{model.description}</p>
                        </div>
                        {selectedModel.id === model.id && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Deploy Button (upgrade 5) */}
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              size="sm"
              className="h-7 px-3 gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 mr-2"
            >
              {isDeploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              Deploy
            </Button>
            {/* Token count display */}
            {estimatedTokens > 0 && (
              <span className="text-[10px] text-zinc-600 font-mono mr-2">
                ~{estimatedTokens.toLocaleString()} tokens
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white h-8 px-2"
              onClick={() => exportConversation('markdown')}
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            /* ── Empty State / Welcome ── */
            <div className="h-full flex flex-col items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Command Desk</h1>
                <p className="text-zinc-400 text-sm mb-8">
                  Your AI-powered development assistant. Ask anything, generate code,
                  debug issues, or get architecture guidance.
                </p>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setInput(action.prompt)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/30 transition-all text-zinc-400 hover:text-zinc-200"
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium mb-3">Suggested prompts</p>
                  {[
                    "Build a REST API with authentication and rate limiting",
                    "Review my code for security vulnerabilities",
                    "Create a reusable React component with TypeScript generics",
                    "Explain the difference between SSR and RSC in Next.js",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-left p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/20 text-sm text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onRate={handleRate} />
              ))}

              {isLoading && <ThinkingIndicator agent={selectedModel.name} />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="border-t border-zinc-800/40 bg-zinc-950/80 backdrop-blur-sm px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-zinc-900 border border-zinc-700/50 rounded-2xl focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/50 transition-all">
              {/* Slash Command Suggestions */}
              <AnimatePresence>
                {input.startsWith("/") && !input.includes(" ") && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto"
                  >
                    {/* Pinned commands section (upgrade 1) */}
                    {(() => {
                      const pinned = SLASH_COMMANDS.filter(
                        (c) => pinnedCommands.has(c.name) && c.name.startsWith(input.trim())
                      )
                      return pinned.length > 0 ? (
                        <div>
                          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-purple-400 font-medium">Pinned</div>
                          {pinned.map((cmd) => (
                            <div key={`pinned-${cmd.name}`} className="flex items-center group/cmd rounded-lg hover:bg-zinc-800/50">
                  {/* ── Reasoning Trace Panel ── */}
                  <div className="w-80 border-l border-zinc-800">
                    <ReasoningTrace skeleton="message" />
                  </div>
                              <button
                                onClick={() => setInput(cmd.name + " ")}
                                className="flex-1 flex items-center gap-3 p-2.5 text-left text-zinc-400"
                              >
                                <cmd.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-zinc-200">{cmd.name}</div>
                                  <div className="text-[11px] text-zinc-500">{cmd.description}</div>
                                </div>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPinnedCommands((prev) => { const n = new Set(prev); n.delete(cmd.name); return n })
                                }}
                                className="p-2 text-purple-400 hover:text-zinc-300 opacity-0 group-hover/cmd:opacity-100 transition-opacity"
                                title="Unpin"
                              >
                                <PinOff className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <div className="border-t border-zinc-700/50 my-1" />
                        </div>
                      ) : null
                    })()}
                    {SLASH_COMMANDS.filter((cmd) =>
                      cmd.name.startsWith(input.trim())
                    ).map((cmd) => (
                      <div key={cmd.name} className="flex items-center group/cmd rounded-lg hover:bg-zinc-800/50">
                        <button
                          onClick={() => setInput(cmd.name + " ")}
                          className="flex-1 flex items-center gap-3 p-2.5 text-left text-zinc-400"
                        >
                          <cmd.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-200">{cmd.name}</div>
                            <div className="text-[11px] text-zinc-500">{cmd.description}</div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPinnedCommands((prev) => {
                              const n = new Set(prev)
                              n.has(cmd.name) ? n.delete(cmd.name) : n.add(cmd.name)
                              return n
                            })
                          }}
                          className={`p-2 transition-opacity ${pinnedCommands.has(cmd.name) ? "text-purple-400 opacity-100" : "text-zinc-500 hover:text-zinc-300 opacity-0 group-hover/cmd:opacity-100"}`}
                          title={pinnedCommands.has(cmd.name) ? "Unpin" : "Pin"}
                        >
                          {pinnedCommands.has(cmd.name) ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                    {SLASH_COMMANDS.filter((cmd) => cmd.name.startsWith(input.trim())).length === 0 && (
                      <div className="text-center py-3 text-zinc-600 text-xs">No matching commands</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attachments Bar */}
              <div className="flex items-center gap-1 px-3 pt-3">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 hover:text-zinc-300">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 hover:text-zinc-300">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 hover:text-zinc-300">
                  <Globe className="w-4 h-4" />
                </Button>
              </div>

              {/* Textarea */}
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedModel.name}...`}
                className="border-none bg-transparent resize-none text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:outline-none min-h-[52px] max-h-[200px] px-4 py-2"
                rows={1}
              />

              {/* Bottom Controls */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                  <span>{selectedModel.name}</span>
                  <span>•</span>
                  <span>Shift+Enter for new line</span>
                </div>

                {isStreaming ? (
                  <Button
                    onClick={handleStop}
                    size="sm"
                    className="h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl"
                  >
                    <StopCircle className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-30 disabled:bg-zinc-700"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <p className="text-center text-[10px] text-zinc-700 mt-2">
              Elara may produce inaccurate information. Verify critical outputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
