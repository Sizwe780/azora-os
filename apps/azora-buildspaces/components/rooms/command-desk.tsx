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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWorkspace, Task } from "@/lib/contexts/workspace-context"
import { useRoomEvents } from "@/lib/hooks/use-room-events"

/* ───────── types ───────── */
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
            <div className="text-[14px] leading-[1.7] text-zinc-300 whitespace-pre-wrap">
              {text}
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
  const { tasks, setTasks } = useWorkspace()
  const { emit, ROOM_EVENTS } = useRoomEvents('command-desk')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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
      } catch (error) {
        console.error("Failed to initialize session:", error)
        // Generate a local session ID fallback
        setSessionId(`local-${Date.now()}`)
      }
    }
    initSession()
  }, [])

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

      const res = await fetch("/api/command-desk/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...recentHistory, { role: "user", content: currentInput }],
          model: selectedModel.id,
        }),
      })

      if (!res.ok || !res.body) throw new Error("Streaming failed")

      // Stream the response token by token
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // Parse SSE data stream format: lines starting with "0:" contain text tokens
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2))
              fullContent += text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              )
            } catch { /* skip non-JSON lines */ }
          }
        }
      }

      // Ensure final content is set
      if (fullContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
        )
      }
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
      {/* ── History Sidebar ── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800">
              <Button onClick={handleNewChat} className="w-full gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200" size="sm">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>
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
              </div>
            </ScrollArea>
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
                    {SLASH_COMMANDS.filter((cmd) =>
                      cmd.name.startsWith(input.trim())
                    ).map((cmd) => (
                      <button
                        key={cmd.name}
                        onClick={() => setInput(cmd.name + " ")}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-zinc-800/50 text-zinc-400"
                      >
                        <cmd.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-200">{cmd.name}</div>
                          <div className="text-[11px] text-zinc-500">{cmd.description}</div>
                        </div>
                      </button>
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
