/**
 * Agent Node Component
 * Represents an AI agent in the workflow
 */

'use client'

import { Handle, Position } from '@reactflow/core'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Brain, Shield, Sparkles, Hammer } from 'lucide-react'
import { AgentType } from '@/lib/agents/orchestrator'

export function AgentNode({ data }: { data: any }) {
  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'elara':
        return <Brain className="w-4 h-4" />
      case 'themba':
        return <Shield className="w-4 h-4" />
      case 'sankofa':
        return <Sparkles className="w-4 h-4" />
      case 'kwame':
        return <Hammer className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const getAgentName = (type: AgentType) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case 'elara':
        return 'blue'
      case 'themba':
        return 'green'
      case 'sankofa':
        return 'amber'
      case 'kwame':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const color = getAgentColor(data.agentType)

  return (
    <Card className={`min-w-[220px] border-2 border-${color}-500 bg-${color}-500/5`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 !bg-${color}-500`}
      />
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded bg-${color}-500/20 text-${color}-600`}>
              {getAgentIcon(data.agentType)}
            </div>
            <Badge variant="secondary" className="text-xs">
              Agent
            </Badge>
          </div>
          {data.requiresApproval && (
            <Badge variant="outline" className="text-xs">
              Approval
            </Badge>
          )}
        </div>
        <div className="font-semibold text-sm mb-1">
          {getAgentName(data.agentType)}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {data.systemPrompt || 'No system prompt'}
        </div>
        {data.temperature !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Temp:</div>
            <div className="text-xs font-medium">{data.temperature.toFixed(1)}</div>
          </div>
        )}
        {data.memories && data.memories.length > 0 && (
          <div className="mt-1">
            <Badge variant="outline" className="text-[10px]">
              {data.memories.length} memory
            </Badge>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !bg-${color}-500`}
      />
    </Card>
  )
}
