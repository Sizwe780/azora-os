"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CopilotAgentAvatar } from "@/components/ui/copilot-agent-avatar"
import { AgentActivityBadge } from "@/components/ui/agent-activity-badge"
import { agentStyles } from "@/components/ui/african-agent-avatar"
import {
    Send,
    Paperclip,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    Check,
    Terminal,
    FileCode,
    X,
} from "lucide-react"

type MessageType = "user" | "agent" | "system"
type AgentKey = keyof typeof agentStyles

interface FileReference {
    name: string
    path: string
}

interface ChatMessage {
    id: string
    type: MessageType
    agent?: AgentKey
    content: string
    timestamp: Date
    files?: FileReference[]
    command?: {
        text: string
        status: "pending" | "running" | "success" | "error"
    }
    actions?: {
        filesChanged?: number
        canKeep?: boolean
        canUndo?: boolean
    }
}

interface CopilotChatPanelProps {
    agent?: AgentKey
    className?: string
}

export function CopilotChatPanel({
    agent = "elara",
    className = "",
}: CopilotChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            type: "agent",
            agent: "elara",
            content: "Hello! I'm ready to assist. What are we building today?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [typingAgent, setTypingAgent] = useState<AgentKey | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const style = agentStyles[agent]

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = () => {
        if (!input.trim()) return

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "user",
            content: input,
            timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        // Simulate agent typing
        setIsTyping(true)
        setTypingAgent(agent)

        // Simulate response after delay
        setTimeout(() => {
            setIsTyping(false)
            setTypingAgent(null)

            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: "agent",
                agent,
                content: "I'll help you with that. Let me analyze your request and coordinate with the team...",
                timestamp: new Date(),
                files: [
                    { name: "runner-service.ts", path: "/src/services/runner-service.ts" },
                ],
                command: {
                    text: "Ran command in terminal",
                    status: "success",
                },
                actions: {
                    filesChanged: 3,
                    canKeep: true,
                    canUndo: true,
                },
            }
            setMessages((prev) => [...prev, agentMessage])
        }, 2000)
    }

    return (
        <div
            className={`flex flex-col h-full bg-[#0d1117] ${className}`}
            style={{
                borderLeft: `1px solid ${style.auraColors[0]}20`,
            }}
        >
            {/* Header */}
            <div
                className="p-4 border-b flex items-center gap-3"
                style={{
                    borderColor: `${style.auraColors[0]}20`,
                    background: `linear-gradient(180deg, ${style.auraColors[0]}08 0%, transparent 100%)`,
                }}
            >
                <CopilotAgentAvatar agent={agent} size="sm" showActivity={false} />
                <div className="flex-1">
                    <h3 className="font-semibold text-white">{style.name}</h3>
                    <p className="text-xs text-gray-400">{style.description}</p>
                </div>
                <AgentActivityBadge
                    agent={agent}
                    status={isTyping ? "working" : "idle"}
                    size="sm"
                />
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className="animate-fade-in">
                            {message.type === "user" ? (
                                // User message
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] bg-white/10 rounded-2xl rounded-tr-sm px-4 py-3">
                                        <p className="text-sm text-white">{message.content}</p>
                                    </div>
                                </div>
                            ) : (
                                // Agent message
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <CopilotAgentAvatar
                                            agent={message.agent || agent}
                                            size="sm"
                                            showActivity={false}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {/* Message content */}
                                        <div
                                            className="rounded-2xl rounded-tl-sm px-4 py-3"
                                            style={{
                                                background: `linear-gradient(135deg, ${agentStyles[message.agent || agent].auraColors[0]}15, ${agentStyles[message.agent || agent].auraColors[1]}08)`,
                                                border: `1px solid ${agentStyles[message.agent || agent].auraColors[0]}20`,
                                            }}
                                        >
                                            <p className="text-sm text-white">{message.content}</p>
                                        </div>

                                        {/* File references */}
                                        {message.files && message.files.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {message.files.map((file, i) => (
                                                    <div
                                                        key={i}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs cursor-pointer hover:bg-blue-500/20 transition-colors"
                                                    >
                                                        <FileCode className="w-3 h-3" />
                                                        {file.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Command status */}
                                        {message.command && (
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                {message.command.status === "success" ? (
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                ) : (
                                                    <Terminal className="w-3 h-3" />
                                                )}
                                                {message.command.text}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {message.actions && (
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                    >
                                                        <ThumbsUp className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                    >
                                                        <ThumbsDown className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                {message.actions.filesChanged && (
                                                    <>
                                                        <span className="text-xs text-gray-500">
                                                            {message.actions.filesChanged} files changed
                                                        </span>
                                                        <div className="flex items-center gap-2 ml-auto">
                                                            {message.actions.canKeep && (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-6 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                                                >
                                                                    Keep
                                                                </Button>
                                                            )}
                                                            {message.actions.canUndo && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-6 px-3 border-gray-600 text-gray-300 text-xs hover:bg-gray-800"
                                                                >
                                                                    Undo
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && typingAgent && (
                        <div className="flex gap-3 animate-fade-in">
                            <div className="flex-shrink-0 mt-1">
                                <CopilotAgentAvatar
                                    agent={typingAgent}
                                    size="sm"
                                    showActivity={false}
                                    isWorking
                                />
                            </div>
                            <div
                                className="rounded-2xl rounded-tl-sm px-4 py-3"
                                style={{
                                    background: `linear-gradient(135deg, ${agentStyles[typingAgent].auraColors[0]}15, ${agentStyles[typingAgent].auraColors[1]}08)`,
                                    border: `1px solid ${agentStyles[typingAgent].auraColors[0]}20`,
                                }}
                            >
                                <div className="flex items-center gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                background: agentStyles[typingAgent].auraColors[i % 3],
                                                animation: `typing-bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input area */}
            <div
                className="p-4 border-t"
                style={{
                    borderColor: `${style.auraColors[0]}20`,
                    background: `linear-gradient(0deg, ${style.auraColors[0]}08 0%, transparent 100%)`,
                }}
            >
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    or type # to attach context
                </p>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={`Ask ${style.name} anything...`}
                            className="bg-white/5 border-white/10 focus:border-emerald-500/50 pr-10"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-white"
                            onClick={handleSend}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </div>
    )
}
