"use client"

/**
 * AgentRail - AI Companion Panel (Elara's View)
 * 
 * Constitutional Compliance:
 * - AGENT AWARENESS: Shows the AI what file/content is active
 * - SINGLE SOURCE OF TRUTH: Subscribes to workspace context
 * - REAL INTERACTION: Connected to actual editor state
 * 
 * This panel displays what Elara and the AI agents can see,
 * demonstrating the "nervous system" connection.
 */

import React, { useState } from 'react'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { Bot, Eye, FileCode, MessageSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AfricanAgentAvatar } from '@/components/ui/african-agent-avatar'

export function AgentRail() {
  const { activeFilePath, activeFileContent, projectName } = useWorkspace()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm Elara, your AI architect. I can see what you're working on in real-time. Try editing a file and I'll be aware of the changes!",
    },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = { role: 'user' as const, text: inputValue }
    setMessages(prev => [...prev, userMessage])

    // Simulate agent response (in real implementation, this would call the AI API)
    setTimeout(() => {
      const agentMessage = {
        role: 'assistant' as const,
        text: `I can see you're working on ${activeFilePath || 'a new file'}. ${
          activeFileContent
            ? `The file has ${activeFileContent.split('\n').length} lines of code.`
            : 'The file is empty.'
        } How can I help you with this?`,
      }
      setMessages(prev => [...prev, agentMessage])
    }, 1000)

    setInputValue('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3e3e42]">
        <div className="flex items-center gap-3">
          <AfricanAgentAvatar agent="elara" size="sm" />
          <div>
            <h3 className="text-sm font-semibold text-white">Elara</h3>
            <p className="text-xs text-emerald-400">XO Architect</p>
          </div>
        </div>
      </div>

      {/* Agent Awareness Panel */}
      <div className="px-4 py-3 border-b border-[#3e3e42] bg-emerald-500/5">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Agent Awareness
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <FileCode className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Active File:</span>
            <span className="text-white truncate flex-1">
              {activeFilePath ? activeFilePath.split('/').pop() : 'None'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Project:</span>
            <span className="text-white">{projectName || 'None'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Lines:</span>
            <span className="text-white">
              {activeFileContent ? activeFileContent.split('\n').length : 0}
            </span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-black/20 rounded border border-emerald-500/20">
          <p className="text-xs text-gray-400 mb-1">Current Context:</p>
          <p className="text-xs text-emerald-300 font-mono truncate">
            {activeFileContent
              ? activeFileContent.split('\n').slice(0, 3).join(' ').substring(0, 80) + '...'
              : 'No content'}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                  : 'bg-[#2d2d2d] text-gray-300'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#3e3e42]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Elara anything..."
            className="flex-1 bg-[#3c3c3c] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
          <Button
            onClick={handleSend}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
