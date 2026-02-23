/**
 * Trigger Node Component
 * Starting point for workflows
 */

'use client'

import { Handle, Position } from '@reactflow/core'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Clock, GitCommit, Save } from 'lucide-react'
import { TriggerType } from '@/lib/agents/orchestrator'

export function TriggerNode({ data }: { data: any }) {
  const getTriggerIcon = (type: TriggerType) => {
    switch (type) {
      case 'on_commit':
        return <GitCommit className="w-4 h-4" />
      case 'on_save':
        return <Save className="w-4 h-4" />
      case 'on_schedule':
        return <Clock className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getTriggerLabel = (type: TriggerType) => {
    switch (type) {
      case 'on_commit':
        return 'On Commit'
      case 'on_save':
        return 'On Save'
      case 'on_schedule':
        return 'On Schedule'
      default:
        return 'Manual'
    }
  }

  return (
    <Card className="min-w-[200px] border-2 border-purple-500 bg-purple-500/5">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded bg-purple-500/20 text-purple-600">
            {getTriggerIcon(data.triggerType)}
          </div>
          <Badge variant="secondary" className="text-xs">
            Trigger
          </Badge>
        </div>
        <div className="font-semibold text-sm">
          {getTriggerLabel(data.triggerType)}
        </div>
        {data.config?.schedule && (
          <div className="text-xs text-muted-foreground mt-1">
            {data.config.schedule}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-500"
      />
    </Card>
  )
}
