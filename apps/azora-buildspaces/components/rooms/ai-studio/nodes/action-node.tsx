/**
 * Action Node Component
 * Represents an executable action in the workflow
 */

'use client'

import { Handle, Position } from '@reactflow/core'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, MessageSquare, Rocket, Terminal } from 'lucide-react'
import { ActionType } from '@/lib/agents/orchestrator'

export function ActionNode({ data }: { data: any }) {
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'write_file':
        return <FileText className="w-4 h-4" />
      case 'send_slack':
        return <MessageSquare className="w-4 h-4" />
      case 'deploy':
        return <Rocket className="w-4 h-4" />
      case 'run_command':
        return <Terminal className="w-4 h-4" />
      default:
        return <Terminal className="w-4 h-4" />
    }
  }

  const getActionLabel = (type: ActionType) => {
    switch (type) {
      case 'write_file':
        return 'Write File'
      case 'send_slack':
        return 'Send Slack'
      case 'deploy':
        return 'Deploy'
      case 'run_command':
        return 'Run Command'
      default:
        return 'Action'
    }
  }

  return (
    <Card className="min-w-[200px] border-2 border-green-500 bg-green-500/5">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500"
      />
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-green-500/20 text-green-600">
              {getActionIcon(data.actionType)}
            </div>
            <Badge variant="secondary" className="text-xs">
              Action
            </Badge>
          </div>
          {data.requiresApproval && (
            <Badge variant="destructive" className="text-xs">
              Approval Required
            </Badge>
          )}
        </div>
        <div className="font-semibold text-sm mb-1">
          {getActionLabel(data.actionType)}
        </div>
        {data.config?.filePath && (
          <div className="text-xs text-muted-foreground truncate">
            {data.config.filePath}
          </div>
        )}
        {data.config?.command && (
          <div className="text-xs text-muted-foreground truncate font-mono">
            {data.config.command}
          </div>
        )}
        {data.config?.deployTarget && (
          <div className="text-xs text-muted-foreground">
            → {data.config.deployTarget}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500"
      />
    </Card>
  )
}
