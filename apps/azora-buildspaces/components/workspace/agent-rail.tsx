"use client"

/**
 * AgentRail - The Sapiens Interface (Co-Pilot Panel)
 * 
 * Constitutional Compliance:
 * - AGENT AWARENESS: Real-time context of active file
 * - HUMAN CONSENT: All significant actions require approval (Article I, Section 1.3)
 * - ACTIONABLE COMPONENTS: Not just text - interactive action chips
 * - LINE NUMBER REFERENCES: Monaco editor integration
 * - CONSTITUTIONAL STATUS: Live truth score indicator
 * 
 * This is not a generic chatbot - it's a Constitutional Co-Pilot.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { useElara } from '@/lib/hooks/use-agent'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { executeTool, type ToolExecutionRequest, AGENT_TOOLS } from '@/lib/agents/tools'
import {
  Bot,
  Eye,
  FileCode,
  MessageSquare,
  Sparkles,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Terminal,
  FileEdit,
  Trash2,
  Play,
  Clock,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AfricanAgentAvatar } from '@/components/ui/african-agent-avatar'

/**
 * Message types in the chat
 */
type MessageRole = 'user' | 'agent' | 'system'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  /** Reference to specific lines in Monaco */
  codeReference?: {
    file: string
    lineStart: number
    lineEnd: number
  }
  /** Tool execution request (requires approval) */
  toolRequest?: ToolExecutionRequest
  /** Constitutional check result */
  constitutionalCheck?: {
    passed: boolean
    healthScore: number
  }
}

export function AgentRail() {
  const { activeFilePath, activeFileContent, projectName } = useWorkspace()
  const { constitutionalHealth, currentRoom, activeAgents } = useWorkspaceStore()
  const { askAgent, isLoading, response } = useElara()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to BuildSpaces. Elara is now active.',
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'agent',
      content:
        "Hello! I'm Elara, your Constitutional AI architect. I can see your code in real-time and help you build better software. Try asking me to review your code or explain a concept!",
      timestamp: Date.now(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [pendingApprovals, setPendingApprovals] = useState<Map<string, ToolExecutionRequest>>(
    new Map()
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle response from useElara hook
  useEffect(() => {
    if (response && response.data) {
      addAgentMessage(response.data.result, response.constitutionalCheck)
    }
  }, [response])

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, message])
  }

  const addAgentMessage = (
    content: string,
    constitutionalCheck?: { passed: boolean; healthScore: number; violations: any[] }
  ) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'agent',
      content,
      timestamp: Date.now(),
      constitutionalCheck: constitutionalCheck
        ? {
            passed: constitutionalCheck.passed,
            healthScore: constitutionalCheck.healthScore,
          }
        : undefined,
    }
    setMessages(prev => [...prev, message])
  }

  const addSystemMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'system',
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, message])
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userInput = inputValue.trim()
    addUserMessage(userInput)
    setInputValue('')

    // Use the askAgent hook which handles constitutional validation
    await askAgent('REVIEW_CODE', userInput)
  }

  const handleToolApproval = async (requestId: string, approved: boolean) => {
    const request = pendingApprovals.get(requestId)
    if (!request) return

    try {
      if (approved) {
        addSystemMessage(`⏳ Executing: ${request.tool}...`)
        const result = await executeTool(request.tool, request.params, true)
        addSystemMessage(`✅ Success: ${result.message || 'Operation completed'}`)
      } else {
        addSystemMessage(`❌ Rejected: ${request.tool} was not executed`)
      }
    } catch (error) {
      addSystemMessage(`⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Remove from pending
    setPendingApprovals(prev => {
      const next = new Map(prev)
      next.delete(requestId)
      return next
    })
  }

  const getHealthStatusColor = () => {
    if (constitutionalHealth >= 90) return 'text-green-400'
    if (constitutionalHealth >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHealthStatusIcon = () => {
    if (constitutionalHealth >= 90) return <Shield className="w-4 h-4" />
    if (constitutionalHealth >= 70) return <AlertTriangle className="w-4 h-4" />
    return <XCircle className="w-4 h-4" />
  }

  return (
    <div className="flex flex-col h-full bg-[#252526]">
      {/* Header with Constitutional Status */}
      <div className="px-4 py-3 border-b border-[#3e3e42]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <AfricanAgentAvatar agent="elara" size="sm" />
            <div>
              <h3 className="text-sm font-semibold text-white">Elara</h3>
              <p className="text-xs text-emerald-400">XO Architect • Active</p>
            </div>
          </div>

          {/* Constitutional Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              constitutionalHealth >= 90
                ? 'border-green-500/30 bg-green-500/10'
                : constitutionalHealth >= 70
                  ? 'border-yellow-500/30 bg-yellow-500/10'
                  : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            {getHealthStatusIcon()}
            <span className={`text-sm font-medium ${getHealthStatusColor()}`}>
              {constitutionalHealth}
            </span>
          </div>
        </div>

        {/* Context Awareness Panel */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Context
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">File:</span>
              <span className="text-white truncate ml-2 flex-1 text-right">
                {activeFilePath ? activeFilePath.split('/').pop() : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Lines:</span>
              <span className="text-white">
                {activeFileContent ? activeFileContent.split('\n').length : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Room:</span>
              <span className="text-white">{currentRoom}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} onToolApproval={handleToolApproval} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Elara is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-[#3e3e42]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask Elara anything..."
            disabled={isLoading}
            className="flex-1 bg-[#3c3c3c] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isLoading ? (
              <Clock className="w-4 h-4" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Elara can see your active file and suggest improvements
        </p>
      </div>
    </div>
  )
}

/**
 * Message Bubble Component
 */
interface MessageBubbleProps {
  message: ChatMessage
  onToolApproval: (requestId: string, approved: boolean) => void
}

function MessageBubble({ message, onToolApproval }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isAgent = message.role === 'agent'

  // System messages
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-[#3c3c3c] border border-[#3e3e42] rounded px-3 py-1 text-xs text-gray-400">
          {message.content}
        </div>
      </div>
    )
  }

  // User messages (right-aligned, emerald)
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg px-3 py-2 bg-emerald-500/20 text-emerald-100 border border-emerald-500/30">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-emerald-400/60 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    )
  }

  // Agent messages (left-aligned, with avatar)
  if (isAgent) {
    return (
      <div className="flex justify-start gap-2">
        <AfricanAgentAvatar agent="elara" size="sm" showGlow={false} showAura={false} />
        <div className="max-w-[85%] space-y-2">
          <div className="rounded-lg px-3 py-2 bg-[#2d2d2d] text-gray-300 border border-[#3e3e42]">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

            {/* Constitutional Check Badge */}
            {message.constitutionalCheck && (
              <div
                className={`mt-2 flex items-center gap-2 text-xs px-2 py-1 rounded ${
                  message.constitutionalCheck.passed
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {message.constitutionalCheck.passed ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                <span>
                  Constitutional: {message.constitutionalCheck.passed ? 'PASSED' : 'FAILED'} (
                  {message.constitutionalCheck.healthScore})
                </span>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>

          {/* Tool Request (Actionable Component) */}
          {message.toolRequest && (
            <ToolApprovalCard request={message.toolRequest} onApproval={onToolApproval} />
          )}
        </div>
      </div>
    )
  }

  return null
}

/**
 * Tool Approval Card (Actionable Component)
 * Constitutional Compliance: Requires explicit user consent
 */
interface ToolApprovalCardProps {
  request: ToolExecutionRequest
  onApproval: (requestId: string, approved: boolean) => void
}

function ToolApprovalCard({ request, onApproval }: ToolApprovalCardProps) {
  const tool = AGENT_TOOLS[request.tool]
  const [approved, setApproved] = useState<boolean | null>(null)

  if (approved !== null) {
    return (
      <div
        className={`p-3 rounded-lg border ${
          approved
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <p className={`text-sm ${approved ? 'text-green-400' : 'text-red-400'}`}>
          {approved ? '✅ Approved' : '❌ Rejected'}: {request.tool}
        </p>
      </div>
    )
  }

  const getToolIcon = () => {
    switch (request.tool) {
      case 'writeFile':
      case 'createFile':
        return <FileEdit className="w-4 h-4" />
      case 'deleteFile':
        return <Trash2 className="w-4 h-4" />
      case 'runTerminal':
        return <Terminal className="w-4 h-4" />
      case 'applyDiff':
        return <Code className="w-4 h-4" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  return (
    <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
      <div className="flex items-start gap-2 mb-2">
        {getToolIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-400">Action Requires Approval</p>
          <p className="text-xs text-gray-400 mt-1">{tool?.description}</p>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-black/20 rounded p-2 mb-3 text-xs font-mono">
        {Object.entries(request.params).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="text-gray-500">{key}:</span>
            <span className="text-gray-300 truncate">{String(value)}</span>
          </div>
        ))}
      </div>

      {/* Approval Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setApproved(true)
            onApproval(request.id, true)
          }}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Approve
        </Button>
        <Button
          onClick={() => {
            setApproved(false)
            onApproval(request.id, false)
          }}
          size="sm"
          variant="outline"
          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Reject
        </Button>
      </div>

      {/* Danger Warning */}
      {tool?.dangerLevel === 'dangerous' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
          <AlertTriangle className="w-3 h-3" />
          <span>This action is potentially destructive</span>
        </div>
      )}
    </div>
  )
}
