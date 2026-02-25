"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, Bot, User, Loader2, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  timestamp: Date
  error?: boolean
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm Elara, your XO Architect. I coordinate our AI team to bring your vision to life. Ask me to review code, generate components, explain concepts, or help debug issues.",
  agent: "Elara",
  timestamp: new Date(),
}

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/agents/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-code",
          context: text,
          sessionId: `workspace-${Date.now()}`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.result || data.message || "I've processed your request.",
          agent: data.agent || "Elara",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      } else if (response.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Please sign in to use the AI assistant.",
            agent: "Elara",
            timestamp: new Date(),
            error: true,
          },
        ])
      } else {
        throw new Error("API error")
      }
    } catch {
      // Graceful fallback when API is unavailable
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm unable to reach the AI service right now. Please check your connection or try again shortly.",
          agent: "Elara",
          timestamp: new Date(),
          error: true,
        },
      ])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }, [input, isTyping])

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Elara</h3>
            <p className="text-xs text-primary">XO Architect • Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          title="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

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
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  message.role === "user" ? "bg-muted" : "bg-gradient-to-br from-primary to-accent"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-background" />
                )}
              </div>
              <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                {message.agent && message.role === "assistant" && (
                  <span className="text-xs text-primary font-medium">{message.agent}</span>
                )}
                <div
                  className={`mt-1 p-3 rounded-xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : message.error
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Elara is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Elara anything..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
