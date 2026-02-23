'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  agent?: string
  timestamp: Date
}

const agents = [
  { name: 'Sankofa', role: 'Code Architect', color: 'blue', emoji: '👨‍💻' },
  { name: 'Themba', role: 'Testing Specialist', color: 'purple', emoji: '🧪' },
  { name: 'Jabari', role: 'Security Expert', color: 'red', emoji: '🔒' },
  { name: 'Nia', role: 'Performance', color: 'yellow', emoji: '⚡' },
  { name: 'Imani', role: 'Knowledge Manager', color: 'cyan', emoji: '📚' },
]

export function AIStudio() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m Elara, your AI orchestrator. How can I help you today?',
      role: 'assistant',
      agent: 'Elara',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: '2',
      content: 'I\'d like to review some code for best practices.',
      role: 'user',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    },
    {
      id: '3',
      content: 'I\'ll route this to Sankofa, our Code Architect, for a comprehensive code review.',
      role: 'assistant',
      agent: 'Elara',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'll analyze that for you. Let me consult with the relevant agents.",
        "Great question! Let me get the best agent for this task.",
        "I understand. Let me route this to our specialist team.",
        "Perfect! I'll coordinate with our AI agents to provide the best solution.",
        "Thanks for the details. Let me process this through our agent network.",
      ]

      const agents = ['Sankofa', 'Themba', 'Jabari', 'Nia', 'Imani', 'Elara']
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        agent: randomAgent,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000) // Random delay between 1.5-2.5 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-[#161b22] border border-white/10 rounded-lg h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Studio</h3>
            <p className="text-xs text-gray-400">Multi-agent orchestration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-200'
              }`}
            >
              {message.agent && message.role === 'assistant' && (
                <div className="text-xs text-emerald-400 mb-1 font-medium">
                  {message.agent}
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI team anything... (e.g., 'Review this code', 'Run tests', 'Check security')"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:outline-none resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-400">
            Try: "@Sankofa review this code" or "@Jabari security audit"
          </span>
        </div>
      </div>
    </div>
  )
}
