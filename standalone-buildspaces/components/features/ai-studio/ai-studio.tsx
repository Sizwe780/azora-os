'use client'

import { useState, useCallback, useEffect } from 'react'
import { Send, Loader2, Sparkles, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'agent'
  agent?: string
  content: string
  timestamp: Date
}

export function AIStudio() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const now = Date.now()
      setMessages([
        {
          id: '1',
          role: 'agent',
          agent: 'Elara',
          content: '👋 Welcome to AI Studio! I\'m Elara, your AI orchestrator. I can route your requests to specialized agents:\n\n• Sankofa - Code review & generation\n• Themba - Testing & test generation\n• Jabari - Security analysis\n• Nia - Performance optimization\n• Imani - Documentation\n\nWhat would you like help with?',
          timestamp: new Date(now - 5000),
        },
      ])
    })

    return () => cancelAnimationFrame(id)
  }, [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>('auto')

  const agents = [
    { id: 'auto', name: 'Auto-route', icon: '🤖', color: 'emerald' },
    { id: 'sankofa', name: 'Sankofa', icon: '👨‍💻', color: 'blue' },
    { id: 'themba', name: 'Themba', icon: '🧪', color: 'purple' },
    { id: 'jabari', name: 'Jabari', icon: '🔒', color: 'red' },
    { id: 'nia', name: 'Nia', icon: '⚡', color: 'yellow' },
    { id: 'imani', name: 'Imani', icon: '📚', color: 'cyan' },
  ]

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        agent: selectedAgent === 'auto' ? 'Sankofa' : selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1),
        content: `🎯 Processing your request...\n\nYou asked: "${userMessage.content}"\n\nI'm analyzing your code and applying best practices. Here's what I found:\n\n✅ Code quality: Good\n⚠️ Performance: Could optimize in 3 places\n🔒 Security: Passed security audit\n📊 Test coverage: 87%\n\nWould you like me to generate refactoring suggestions?`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentResponse])
      setLoading(false)
    }, 1500)
  }, [input, selectedAgent])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] rounded-lg border border-white/10 overflow-hidden">
      {/* Agent Selector */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <h3 className="text-sm font-semibold text-white">Select Agent</h3>
        <div className="flex gap-2 flex-wrap">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                selectedAgent === agent.id
                  ? `bg-${agent.color}-600/30 border border-${agent.color}-500/50 text-${agent.color}-300`
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <span>{agent.icon}</span>
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md space-y-1 ${
                msg.role === 'user'
                  ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100'
                  : 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
              } rounded-lg p-3`}
            >
              {msg.agent && msg.role === 'agent' && (
                <p className="text-xs font-semibold text-blue-300 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {msg.agent}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Agent processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage()
            }}
            placeholder="Ask an agent for help..."
            className="flex-1 bg-black/50 border border-white/20 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded font-medium text-white flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Powered by multi-agent routing system
        </p>
      </div>
    </div>
  )
}
