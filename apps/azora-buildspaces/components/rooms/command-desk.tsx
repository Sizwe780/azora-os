"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

const makeId = () => Math.random().toString(36).slice(2, 9) // deterministic helper for IDs (avoids Date.now in render)
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Palette,
  Shield,
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronRight,
  Zap,
  Target,
  RotateCcw,
  MessageSquare,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace, Task } from "@/lib/contexts/workspace-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  timestamp: Date
  specs?: AgentSpec[]
  thinking?: boolean
}

interface AgentSpec {
  agentId: string
  agentName: string
  task: string
  status: "pending" | "active" | "complete" | "error"
  progress?: number
}

const agents = [
  {
    id: "elara",
    name: "Elara",
    role: "XO Architect",
    color: "from-primary to-emerald-400",
    icon: Sparkles,
    description: "Orchestrates agents and creates build specs",
  },
  {
    id: "sankofa",
    name: "Sankofa",
    role: "Code Specialist",
    color: "from-accent to-purple-400",
    icon: Code2,
    description: "Generates and refactors code",
  },
  {
    id: "themba",
    name: "Themba",
    role: "Backend Engineer",
    color: "from-amber-500 to-orange-400",
    icon: Database,
    description: "APIs, databases, and server logic",
  },
  {
    id: "jabari",
    name: "Jabari",
    role: "Security Guardian",
    color: "from-blue-500 to-cyan-400",
    icon: Shield,
    description: "Security audits and best practices",
  },
  {
    id: "naledi",
    name: "Naledi",
    role: "Design Lead",
    color: "from-pink-500 to-rose-400",
    icon: Palette,
    description: "UI/UX design and styling",
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome to the Command Desk. I'm Elara, your XO Architect. I coordinate our specialized AI agents to bring your vision to life.\n\nDescribe what you want to build, and I'll create a specification for the team. You can also switch to the Agent Tasks tab to monitor progress or use Direct mode to instruct specific agents.",
    agent: "Elara",
    timestamp: new Date(),
  },
]

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Generate authentication components",
    priority: "high",
    agentId: "sankofa",
    agentName: "Sankofa",
    agentColor: "from-accent to-purple-400",
    icon: Code2,
    task: "Generate authentication components",
    description: "Creating login form, signup form, and auth context with proper TypeScript types",
    status: "complete",
    progress: 100,
    files: ["components/auth/login-form.tsx", "components/auth/signup-form.tsx", "context/auth-context.tsx"],
    estimatedTime: "Completed",
  },
  {
    id: "2",
    title: "Set up API routes",
    priority: "high",
    agentId: "themba",
    agentName: "Themba",
    agentColor: "from-amber-500 to-orange-400",
    icon: Database,
    task: "Set up API routes",
    description: "Creating authentication endpoints with JWT token generation and middleware",
    status: "active",
    progress: 65,
    files: ["app/api/auth/login/route.ts", "app/api/auth/register/route.ts"],
    canModify: true,
    estimatedTime: "~2 min remaining",
  },
  {
    id: "3",
    title: "Security audit",
    priority: "medium",
    agentId: "jabari",
    agentName: "Jabari",
    agentColor: "from-blue-500 to-cyan-400",
    icon: Shield,
    task: "Security audit",
    description: "Reviewing auth implementation for vulnerabilities and OWASP compliance",
    status: "pending",
    progress: 0,
    canModify: true,
    estimatedTime: "Queued",
  },
]

interface CommandDeskProps {
  onSwitchToKnowledge: () => void
}

export function CommandDesk({ onSwitchToKnowledge }: CommandDeskProps) {
  const { tasks, addTask, updateTask, setTasks } = useWorkspace()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [directInput, setDirectInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Slash command definitions
  const slashCommands = {
    '/generate': {
      description: 'Generate code/components',
      handler: async (args: string) => {
        const [type, ...rest] = args.split(' ')
        const target = rest.join(' ')

        const specs: AgentSpec[] = [
          { agentId: "sankofa", agentName: "Sankofa", task: `Generate ${type}: ${target}`, status: "active" }
        ]

        return {
          content: `**Generating ${type}:** ${target}\n\nI'll create the ${type} with proper structure and styling.`,
          specs
        }
      }
    },
    '/test': {
      description: 'Run tests on files',
      handler: async (args: string) => {
        const specs: AgentSpec[] = [
          { agentId: "sankofa", agentName: "Sankofa", task: `Test: ${args}`, status: "active" }
        ]

        return {
          content: `**Running tests for:** ${args}\n\nExecuting test suite and checking for issues.`,
          specs
        }
      }
    },
    '/deploy': {
      description: 'Deploy application',
      handler: async (args: string) => {
        const specs: AgentSpec[] = [
          { agentId: "themba", agentName: "Themba", task: `Deploy: ${args}`, status: "active" },
          { agentId: "naledi", agentName: "Naledi", task: "Environment setup", status: "pending" }
        ]

        return {
          content: `**Deploying application:** ${args}\n\nPreparing deployment pipeline and environment configuration.`,
          specs
        }
      }
    },
    '/explain': {
      description: 'Explain code/concepts',
      handler: async (args: string) => {
        return {
          content: `**Explanation:** ${args}\n\nLet me break this down for you in detail...`,
          specs: []
        }
      }
    },
    '/security': {
      description: 'Security audit',
      handler: async (args: string) => {
        const specs: AgentSpec[] = [
          { agentId: "sankofa", agentName: "Sankofa", task: "Security audit", status: "active" }
        ]

        return {
          content: `**Running security audit...**\n\nScanning for vulnerabilities and compliance issues.`,
          specs
        }
      }
    },
    '/help': {
      description: 'Show available commands',
      handler: async (): Promise<{ content: string; specs: AgentSpec[] }> => {
        const commandsList = Object.entries(slashCommands)
          .map(([cmd, info]) => `• **${cmd}** - ${info.description}`)
          .join('\n')

        return {
          content: `**Available Slash Commands:**\n\n${commandsList}\n\nType any command followed by arguments to execute.`,
          specs: []
        }
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    // Add thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 0.5).toString(),
      role: "assistant",
      content: "",
      agent: "Elara",
      timestamp: new Date(),
      thinking: true,
    }
    setMessages((prev) => [...prev, thinkingMessage])

    try {
      // Check for slash commands
      if (currentInput.startsWith('/')) {
        const [cmd, ...args] = currentInput.split(' ')
        const command = slashCommands[cmd as keyof typeof slashCommands]
        
        if (command) {
          const result = await command.handler(args.join(' '))
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: result.content,
            agent: "Elara",
            timestamp: new Date(),
            specs: result.specs
          }
          setMessages((prev) => prev.filter((m) => !m.thinking).concat(aiResponse))
          
          // If there are specs, add them as tasks
          if (result.specs && result.specs.length > 0) {
            const newTasks: Task[] = result.specs.map(spec => ({
              id: makeId(),
              title: spec.task,
              priority: "medium",
              agentId: spec.agentId,
              agentName: spec.agentName,
              agentColor: agents.find(a => a.id === spec.agentId)?.color || "from-gray-500 to-gray-400",
              icon: agents.find(a => a.id === spec.agentId)?.icon || Bot,
              task: spec.task,
              description: `Executing ${spec.task} as part of ${cmd} command`,
              status: spec.status,
              progress: spec.progress || 0,
              estimatedTime: "~2 min"
            }))
            setTasks(prev => [...newTasks, ...prev])
          }
          setIsTyping(false)
          return
        }
      }

      // Call Internal Agent API
      const response = await fetch('/api/agents/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-code', // Default action
          context: currentInput,
        })
      });

      if (!response.ok) throw new Error("Failed to fetch from Agent API");

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result,
        agent: data.agent,
        timestamp: new Date(),
        specs: [] 
      }

      setMessages((prev) => prev.filter((m) => !m.thinking).concat(aiResponse))
    } catch (error) {
      console.error("Agent API Error:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the Elara Orchestrator. Please ensure the service is running.",
        agent: "System",
        timestamp: new Date(),
        specs: []
      }
      setMessages((prev) => prev.filter((m) => !m.thinking).concat(errorResponse))
    } finally {
      setIsTyping(false)
    }
  }

  const handleDirectAgent = (agentId: string, instruction: string) => {
    if (!instruction.trim()) return

    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return

    const newTask: Task = {
      id: `direct-${makeId()}`,
      title: instruction,
      priority: "high",
      agentId: agent.id,
      agentName: agent.name,
      agentColor: agent.color,
      icon: agent.icon,
      task: instruction,
      description: "Direct instruction from user - bypassing Elara coordination",
      status: "active",
      progress: 5,
      canModify: true,
      estimatedTime: "~3 min remaining",
    }
    setTasks((prev) => [newTask, ...prev])
    setSelectedAgent(null)
    setDirectInput("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Tabs */}
      <div className="border-b border-border">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Command Desk</h3>
              <p className="text-xs text-primary">
                Elara coordinating {tasks.filter((t) => t.status === "active").length} active tasks
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSwitchToKnowledge}>
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-t border-border bg-transparent h-10 p-0">
            <TabsTrigger
              value="chat"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Elara Chat
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              <Workflow className="w-3.5 h-3.5 mr-1.5" />
              Tasks
              {tasks.filter((t) => t.status === "active").length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                  {tasks.filter((t) => t.status === "active").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="direct"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Direct
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-muted" : "bg-gradient-to-br from-primary to-accent"
                        }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 text-background" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                      {message.agent && <span className="text-xs text-primary font-medium">{message.agent}</span>}

                      {message.thinking ? (
                        <div className="mt-1 p-3 rounded-xl bg-muted text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                              <span
                                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <span
                                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">Analyzing and planning...</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`mt-1 p-3 rounded-xl text-sm ${message.role === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted text-foreground"
                            }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>

                          {/* Agent Specs */}
                          {message.specs && message.specs.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                              <span className="text-xs font-medium text-muted-foreground">Delegated to agents:</span>
                              {message.specs.map((spec, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                                  <div
                                    className={`w-6 h-6 rounded bg-gradient-to-br ${agents.find((a) => a.id === spec.agentId)?.color
                                      } flex items-center justify-center`}
                                  >
                                    <span className="text-[10px] font-bold text-background">{spec.agentName[0]}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium">{spec.agentName}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{spec.task}</span>
                                  </div>
                                  {spec.status === "active" && (
                                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                  )}
                                  {spec.status === "complete" && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                  {spec.status === "pending" && <Clock className="w-3 h-3 text-muted-foreground" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background/50">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type /help for commands or describe your vision to Elara..."
                  className="min-h-[44px] max-h-32 resize-none bg-muted border-border"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="h-11 w-11 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!input.trim() || isTyping}
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="h-full overflow-auto p-3 space-y-4">
            {/* Active Tasks */}
            {tasks.filter((t) => t.status === "active").length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Active Tasks
                </h4>
                {tasks
                  .filter((t) => t.status === "active")
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onModify={setTasks} />
                  ))}
              </div>
            )}

            {/* Pending Tasks */}
            {tasks.filter((t) => t.status === "pending").length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Queue</h4>
                {tasks
                  .filter((t) => t.status === "pending")
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onModify={setTasks} />
                  ))}
              </div>
            )}

            {/* Completed Tasks */}
            {tasks.filter((t) => t.status === "complete").length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</h4>
                {tasks
                  .filter((t) => t.status === "complete")
                  .slice(0, 5)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onModify={setTasks} compact />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "direct" && (
          <div className="h-full overflow-auto p-3">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-200">
                  <strong>Direct Mode:</strong> Bypass Elara and send instructions directly to specialized agents. Use
                  when you need specific agent expertise without coordination.
                </p>
              </div>

              <div className="space-y-2">
                {agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    layout
                    className={`rounded-xl border transition-all ${selectedAgent === agent.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card/50 hover:border-primary/50"
                      }`}
                  >
                    <button
                      onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                      className="w-full p-3 flex items-center gap-3 text-left"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center shrink-0`}
                      >
                        <agent.icon className="w-5 h-5 text-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{agent.name}</span>
                          <span className="text-xs text-muted-foreground">{agent.role}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform ${selectedAgent === agent.id ? "rotate-90" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {selectedAgent === agent.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-0 space-y-2">
                            <Textarea
                              value={directInput}
                              onChange={(e) => setDirectInput(e.target.value)}
                              placeholder={`Give ${agent.name} a direct instruction...`}
                              className="min-h-[80px] bg-muted border-border text-sm"
                            />
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleDirectAgent(agent.id, directInput)}
                              disabled={!directInput.trim()}
                            >
                              <Zap className="w-3.5 h-3.5 mr-1.5" />
                              Send to {agent.name}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
  onModify: React.Dispatch<React.SetStateAction<Task[]>>
  compact?: boolean
}

function TaskCard({ task, onModify, compact }: TaskCardProps) {
  return (
    <motion.div
      layout
      className={`rounded-xl border border-border bg-card/50 overflow-hidden ${task.status === "active" ? "ring-1 ring-primary/30" : ""
        }`}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${task.agentColor} flex items-center justify-center shrink-0`}
          >
            <task.icon className="w-4 h-4 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{task.agentName}</span>
                {task.status === "active" && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary">Active</span>
                )}
                {task.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                {task.status === "pending" && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              {task.canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="w-3 h-3 mr-2" />
                      Edit task
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {task.status === "active" ? (
                        <>
                          <Pause className="w-3 h-3 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Start
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RotateCcw className="w-3 h-3 mr-2" />
                      Restart
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-3 h-3 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm text-foreground mt-0.5">{task.task}</p>
            {!compact && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}

            {/* Progress bar for active tasks */}
            {task.status === "active" && (
              <div className="mt-2 space-y-1">
                <Progress value={task.progress} className="h-1" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{Math.round(task.progress || 0)}%</span>
                  <span>{task.estimatedTime}</span>
                </div>
              </div>
            )}

            {/* Files */}
            {!compact && task.files && task.files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.files.map((file, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                    {file.split("/").pop()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
