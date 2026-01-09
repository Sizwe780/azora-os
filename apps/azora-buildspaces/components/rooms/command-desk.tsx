"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Code2,
  Database,
  Palette,
  Shield,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace, Task } from "@/lib/contexts/workspace-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  timestamp: Date
  thinking?: boolean
}

export function CommandDesk() {
  const { tasks, setTasks } = useWorkspace()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Load real chat history from database on mount
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/chat/sessions', { method: 'POST' })
        const session = await res.json()
        setSessionId(session.id)
        
        const msgRes = await fetch(`/api/chat/sessions/${session.id}/messages`)
        const history = await msgRes.json()
        setMessages(history.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })))
      } catch (error) {
        console.error("Failed to initialize session:", error)
      }
    }
    initSession()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return

    const userMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      // Persist user message and get AI response
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, role: 'user' })
      })
      
      const data = await res.json()
      setMessages(prev => [...prev, {
        ...data.assistantMessage,
        timestamp: new Date(data.assistantMessage.timestamp)
      }])
    } catch (error) {
      console.error("Agent invocation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-md border rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
              }`}>
                <div className="text-sm">{message.content}</div>
                <div className="text-[10px] opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t bg-background/80">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask Elara to build something..."
            className="min-h-[100px] pr-12 resize-none"
          />
          <Button 
            size="icon" 
            className="absolute bottom-2 right-2"
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
