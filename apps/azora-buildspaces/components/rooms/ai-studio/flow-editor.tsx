/**
 * Flow Editor Component
 * Visual node-based interface for creating agent workflows
 * 
 * Constitutional Compliance:
 * - TRANSPARENCY: Visual graph makes AI logic explainable
 * - HUMAN OVERSIGHT: Approval toggles for critical nodes
 * - TRUTH: Real workflow execution, not simulation
 * 
 * Built with ReactFlow for industry-standard node graph UI
 */

'use client'

import { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Save,
  Plus,
  Zap,
  Bot,
  Terminal,
  CheckCircle2,
} from 'lucide-react'
import { Workflow, WorkflowNode, getOrchestrator } from '@/lib/agents/orchestrator'

// Custom Node Components
import { TriggerNode } from './nodes/trigger-node'
import { AgentNode } from './nodes/agent-node'
import { ActionNode } from './nodes/action-node'

const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  action: ActionNode,
}

interface FlowEditorProps {
  workflowId?: string
  onSave?: (workflow: Workflow) => void
}

export function FlowEditor({ workflowId, onSave }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [workflowName, setWorkflowName] = useState('New Workflow')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)

  const orchestrator = getOrchestrator()

  // Load existing workflow if provided
  useState(() => {
    if (workflowId) {
      const workflow = orchestrator.getWorkflow(workflowId)
      if (workflow) {
        setWorkflowName(workflow.name)
        setNodes(workflow.nodes as Node[])
        setEdges(workflow.edges as Edge[])
      }
    }
  })

  /**
   * Handle new connections between nodes
   */
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  /**
   * Add a new node to the canvas
   */
  const addNode = (type: 'trigger' | 'agent' | 'action') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: getDefaultNodeData(type),
    }
    setNodes((nds: Node[]) => [...nds, newNode])
  }

  /**
   * Get default data for a node type
   */
  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'trigger':
        return {
          triggerType: 'manual',
          label: 'Manual Trigger',
        }
      case 'agent':
        return {
          agentType: 'elara',
          systemPrompt: 'You are a helpful AI assistant.',
          temperature: 0.7,
          label: 'Elara Agent',
        }
      case 'action':
        return {
          actionType: 'write_file',
          config: {},
          requiresApproval: true,
          label: 'Write File',
        }
      default:
        return {}
    }
  }

  /**
   * Save the workflow
   * Constitutional: Transparent workflow storage
   */
  const handleSave = async () => {
    const workflow: Workflow = {
      id: workflowId || `workflow-${Date.now()}`,
      name: workflowName,
      description: `Agent workflow with ${nodes.length} nodes`,
      nodes: nodes as WorkflowNode[],
      edges,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Validate workflow
    const validation = orchestrator.validateWorkflow(workflow)
    
    if (!validation.valid) {
      alert(`Workflow validation failed:\n${validation.errors.join('\n')}`)
      return
    }

    if (validation.warnings.length > 0) {
      console.warn('Workflow warnings:', validation.warnings)
    }

    await orchestrator.saveWorkflow(workflow)
    onSave?.(workflow)
    
    alert('Workflow saved successfully!')
  }

  /**
   * Execute the workflow
   * Constitutional: Real execution with results
   */
  const handleExecute = async () => {
    if (!workflowId) {
      alert('Please save the workflow before executing')
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      const result = await orchestrator.executeWorkflow(workflowId)
      setExecutionResult(result)
      
      if (result.success) {
        alert('Workflow executed successfully!')
      } else {
        alert(`Workflow failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Execution error: ${error}`)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2"
              placeholder="Workflow Name"
            />
            <Badge variant="outline">
              {nodes.length} node{nodes.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              variant="outline"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Workflow
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !workflowId}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Workflow
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Add Node Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Add Node:</span>
          <Button
            onClick={() => addNode('trigger')}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Zap className="w-3 h-3" />
            Trigger
          </Button>
          <Button
            onClick={() => addNode('agent')}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Bot className="w-3 h-3" />
            Agent
          </Button>
          <Button
            onClick={() => addNode('action')}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Terminal className="w-3 h-3" />
            Action
          </Button>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />

          {/* Instructions Panel */}
          {nodes.length === 0 && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
              <Card className="p-6 max-w-md">
                <div className="text-center space-y-3">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="text-lg font-semibold">Build Your Agent Pipeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Add nodes from the toolbar above and connect them to create automated workflows.
                    Drag from the circles on each node to connect them.
                  </p>
                  <div className="pt-4 space-y-2 text-left text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span><strong>Trigger:</strong> Start the workflow (On Commit, On Save, etc.)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <span><strong>Agent:</strong> AI agent (Elara, Themba, Sankofa, Kwame)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-green-500" />
                      <span><strong>Action:</strong> Execute tasks (Write File, Deploy, etc.)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Execution Result Panel */}
          {executionResult && (
            <div className="absolute bottom-4 right-4 z-10">
              <Card className="p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={`w-5 h-5 flex-shrink-0 ${
                      executionResult.success ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">
                      {executionResult.success ? 'Execution Complete' : 'Execution Failed'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {executionResult.error || `${executionResult.nodeResults.size} nodes executed`}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExecutionResult(null)}
                      className="mt-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  )
}
