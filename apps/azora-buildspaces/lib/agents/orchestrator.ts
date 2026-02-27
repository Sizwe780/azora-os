/**
 * Workflow Orchestrator Engine
 * Executes agent pipelines defined as node graphs
 * 
 * Constitutional Compliance:
 * - TRANSPARENCY: Workflow graphs are explainable AI
 * - HUMAN OVERSIGHT: Critical actions require approval
 * - TRUTH: Real execution with real agent outputs
 * 
 * This orchestrates multi-agent workflows with data chaining.
 */

import { fileSystem } from '@/lib/workspace/file-system'
import { runCommand } from '@/lib/runtime/command-runner'
import { sendSlackMessage, formatWorkflowStatus } from '@/lib/runtime/slack-integration'
import { deploy } from '@/lib/runtime/deployment'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/audit-logger'
import { syncTraceToFirestore, PersistenceStep } from '@/lib/agents/persistence'

export type NodeType = 'trigger' | 'agent' | 'action'
export type TriggerType = 'on_commit' | 'on_save' | 'on_schedule' | 'manual'
export type AgentType = 'elara' | 'themba' | 'sankofa' | 'kwame' | 'nia'
export type ActionType = 'write_file' | 'send_slack' | 'deploy' | 'run_command'

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: TriggerNodeData | AgentNodeData | ActionNodeData
}

export interface TriggerNodeData {
  triggerType: TriggerType
  config?: {
    schedule?: string // cron expression
    filePattern?: string // glob pattern for file changes
  }
}

export interface AgentNodeData {
  agentType: AgentType
  systemPrompt: string
  temperature?: number // 0-1, creativity vs precision
  memories?: string[] // specific docs/folders this agent can access
  requiresApproval?: boolean
}

export interface ActionNodeData {
  actionType: ActionType
  config: {
    filePath?: string
    content?: string
    slackWebhook?: string
    command?: string
    deployTarget?: string
  }
  requiresApproval?: boolean // default true for critical actions
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export interface ExecutionContext {
  workflowId: string
  triggerData: any
  nodeOutputs: Map<string, any> // nodeId -> output
  approvals: Map<string, boolean> // nodeId -> approved
  executionId?: string // optional Firestore document id for persistence
  stepIndex?: number
}

export interface ExecutionResult {
  success: boolean
  nodeResults: Map<string, any>
  error?: string
  requiresApproval?: string[] // nodeIds that need approval
}

export interface TraceStep {
  id: string
  type: 'thought' | 'action' | 'observation' | 'result'
  text: string
  timestamp: string
  synced?: boolean
}

/**
 * Workflow Orchestrator
 * Manages and executes agent workflows
 */
export class WorkflowOrchestrator {
  private workflows: Map<string, Workflow> = new Map()
  private workflowsPath = '.azora/workflows'
  private stepCallback?: (step: TraceStep) => void

  constructor() {
    this.loadWorkflows()
  }

  /**
   * Register a callback that will be invoked each time the orchestrator
   * emits a reasoning trace step (action/observation/etc).
   */
  onStep(callback: (step: TraceStep) => void) {
    this.stepCallback = callback
  }

  /**
   * Load workflows from VFS
   */
  async loadWorkflows(): Promise<void> {
    try {
      const workflowFiles = await fileSystem.listFiles(`/${this.workflowsPath}`)

      for (const file of workflowFiles) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          try {
            const content = await fileSystem.readFile(file.path)
            const workflow = JSON.parse(content) as Workflow
            this.workflows.set(workflow.id, workflow)
          } catch (error) {
            console.warn(`Failed to load workflow ${file.name}:`, error)
          }
        }
      }

      console.log(`[Orchestrator] Loaded ${this.workflows.size} workflows`)
    } catch (error) {
      console.log('[Orchestrator] No workflows directory yet, creating...')
      await fileSystem.mkdir(`/${this.workflowsPath}`)
    }
  }

  /**
   * Save a workflow to VFS
   * Constitutional: Workflows are transparent and persistent
   */
  async saveWorkflow(workflow: Workflow): Promise<void> {
    workflow.updatedAt = Date.now()

    try {
      await fileSystem.mkdir(`/${this.workflowsPath}`)
    } catch (error) {
      // Directory might already exist
    }

    const filePath = `/${this.workflowsPath}/${workflow.id}.json`
    await fileSystem.writeFile(filePath, JSON.stringify(workflow, null, 2))

    this.workflows.set(workflow.id, workflow)
    console.log(`[Orchestrator] Saved workflow: ${workflow.name}`)
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const filePath = `/${this.workflowsPath}/${id}.json`
    await fileSystem.deleteFile(filePath)
    this.workflows.delete(id)
    console.log(`[Orchestrator] Deleted workflow: ${id}`)
  }

  /**
   * Execute a workflow
   * Constitutional: Real execution with explainable steps
   */
  async executeWorkflow(
    workflowId: string,
    triggerData?: any,
    approvals?: Map<string, boolean>,
    executionId?: string
  ): Promise<ExecutionResult> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      return {
        success: false,
        nodeResults: new Map(),
        error: 'Workflow not found',
      }
    }

    if (!workflow.enabled) {
      return {
        success: false,
        nodeResults: new Map(),
        error: 'Workflow is disabled',
      }
    }

    console.log(`[Orchestrator] 🚀 Executing workflow: ${workflow.name}`)

    const context: ExecutionContext = {
      workflowId,
      triggerData: triggerData || {},
      nodeOutputs: new Map(),
      approvals: approvals || new Map(),
      executionId,
      stepIndex: 0,
    }

    try {
      // Find trigger node (starting point)
      const triggerNode = workflow.nodes.find((n) => n.type === 'trigger')
      if (!triggerNode) {
        throw new Error('No trigger node found')
      }

      // Execute the workflow graph
      const result = await this.executeNode(triggerNode, workflow, context)

      console.log(`[Orchestrator] ✅ Workflow completed`)

      return {
        success: true,
        nodeResults: context.nodeOutputs,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Orchestrator] ❌ Execution failed:`, errorMsg)

      return {
        success: false,
        nodeResults: context.nodeOutputs,
        error: errorMsg,
      }
    }
  }

  /**
   * Backwards-compatible alias used by tests and older callers
   */
  async execute(
    workflowId: string,
    triggerData?: any,
    approvals?: Map<string, boolean>
  ): Promise<ExecutionResult> {
    return this.executeWorkflow(workflowId, triggerData, approvals)
  }

  /**
   * Execute a single node and its connected nodes
   */
  private async executeNode(
    node: WorkflowNode,
    workflow: Workflow,
    context: ExecutionContext
  ): Promise<any> {
    console.log(`[Orchestrator] Executing node: ${node.id} (${node.type})`)

    const emit = (type: TraceStep['type'], text: string) => {
      const step: TraceStep = { id: node.id, type, text, timestamp: new Date().toISOString(), synced: !!context.executionId }
      if (this.stepCallback) {
        this.stepCallback(step)
      }
      maybePersist(step)
    }

    // helper to persist trace step if executionId present
    const maybePersist = async (step: TraceStep) => {
      if (context.executionId) {
        const pstep: PersistenceStep = {
          timestamp: step.timestamp,
          type: step.type,
          content: step.text,
          metadata: { tokensUsed: 0, model: '' },
        }
        await syncTraceToFirestore(context.executionId, pstep, undefined, context.stepIndex ?? 0)
        context.stepIndex = (context.stepIndex ?? 0) + 1
      }
    }

    // when we begin processing an agent or action node we emit an "action"
    // step. the UI uses this to display a ghost loader until the next
    // observation/result step arrives.
    const startAction = (desc: string) => emit('action', `Starting ${desc}`)

    // Check if node requires approval
    if (node.type === 'agent' || node.type === 'action') {
      const data = node.data as AgentNodeData | ActionNodeData
      if (data.requiresApproval && !context.approvals.get(node.id)) {
        throw new Error(`Node ${node.id} requires approval but none provided`)
      }
    }

    let output: any

    // NOTE: persistence handled by maybePersist above

    switch (node.type) {
      case 'trigger':
        emit('thought', `Trigger node ${node.id}`)
        output = await this.executeTriggerNode(node, context)
        emit('observation', `Trigger output: ${JSON.stringify(output)}`)
        break
      case 'agent':
        emit('thought', `Agent node ${node.id} (${(node.data as AgentNodeData).agentType})`)
        // persist thought
        await maybePersist('thought', `Agent node ${node.id}`)
        startAction(`agent ${(node.data as AgentNodeData).agentType}`)
        output = await this.executeAgentNode(node, context)
        emit('observation', `Agent output: ${JSON.stringify(output)}`)
        await maybePersist('observation', JSON.stringify(output))
        break
      case 'action':
        emit('thought', `Action node ${node.id} (${(node.data as ActionNodeData).actionType})`)
        await maybePersist('thought', `Action node ${node.id}`)
        startAction(`action ${(node.data as ActionNodeData).actionType}`)
        output = await this.executeActionNode(node, context)
        emit('observation', `Action result: ${JSON.stringify(output)}`)
        await maybePersist('observation', JSON.stringify(output))
        break
      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }

    // Store output
    context.nodeOutputs.set(node.id, output)

    // Find and execute connected nodes
    const connectedEdges = workflow.edges.filter((e) => e.source === node.id)

    for (const edge of connectedEdges) {
      const nextNode = workflow.nodes.find((n) => n.id === edge.target)
      if (nextNode) {
        await this.executeNode(nextNode, workflow, context)
      }
    }

    return output
  }

  /**
   * Execute a trigger node
   */
  private async executeTriggerNode(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<any> {
    const data = node.data as TriggerNodeData
    console.log(`[Orchestrator] Trigger: ${data.triggerType}`)

    // Trigger nodes just pass through the trigger data
    return context.triggerData
  }

  /**
   * Execute an agent node
   * Constitutional: Real agent execution with system prompts
   */
  private async executeAgentNode(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<any> {
    const data = node.data as AgentNodeData

    console.log(`[Orchestrator] Agent: ${data.agentType}`)
    console.log(`[Orchestrator] System Prompt: ${data.systemPrompt}`)

    // Get input from previous nodes
    const input = this.getNodeInput(node, context)
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input)

    try {
      // Import specific agents
      const { nia } = await import('@/lib/agents/nia-validator')
      const { themba } = await import('@/lib/agents/themba-analyzer')
      const { AIFamilyServiceClient } = await import('@/lib/services/ai-family-client')
      
      let output: any

      // Use if-else instead of switch to avoid potential parsing/syntax issues in tests
      if (data.agentType === 'nia') {
        output = await nia.validateSpec(inputStr)
      } else if (data.agentType === 'themba') {
        output = await themba.analyzeCode(inputStr)
      } else {
        // Default case for 'sankofa', 'kwame', 'elara', and others
        // Use AI Family service
        const aiClient = AIFamilyServiceClient.getInstance()
        const response = await aiClient.chat({
          agent: data.agentType as any,
          message: `${data.systemPrompt}\n\nInput Data:\n${inputStr}`,
          context: {
            roomType: 'orchestrator',
            history: [],
          },
        })
        
        output = {
          agent: data.agentType,
          input,
          output: response.response,
          systemPrompt: data.systemPrompt,
          suggestions: response.suggestions,
        }
      }

      console.log(`[Orchestrator] Agent output:`, output)

      // Audit log success
      await auditLogger.info(
        AuditEventType.AGENT_COMPLETED,
        {
          agent: data.agentType,
          success: true,
        },
        { action: `Execute ${data.agentType} agent` }
      )

      return output
    } catch (error) {
      console.error(`[Orchestrator] Agent execution failed:`, error)
      
      // Audit log failure
      await auditLogger.error(
        AuditEventType.AGENT_FAILED,
        error instanceof Error ? error : new Error(String(error)),
        { details: { agent: data.agentType } }
      )

      return {
        agent: data.agentType,
        input,
        output: `[Error] Failed to execute agent ${data.agentType}: ${error instanceof Error ? error.message : String(error)}`,
        error: true,
      }
    }
  }

  /**
   * Execute an action node
   * Constitutional: Real actions with approval gates
   */
  private async executeActionNode(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<any> {
    const data = node.data as ActionNodeData

    console.log(`[Orchestrator] Action: ${data.actionType}`)

    // Get input from previous nodes
    const input = this.getNodeInput(node, context)

    let result: any

    try {
      // report the action being executed
      if (this.stepCallback) {
        this.stepCallback({
          id: node.id,
          type: 'action',
          text: `Performing action ${data.actionType}`,
          timestamp: new Date().toISOString(),
        })
      }
      // delegate to the tool registry for any actions that have been
      // registered as tools.  this keeps async side effects in one place
      // and allows the LLM to list available capabilities (skill
      // discovery) across both AI Studio and workflow orchestrator.
      const { executeTool, getTool } = await import('@/lib/agents/tools')
      const maybeTool = getTool(data.actionType)
      if (maybeTool) {
        const toolResult = await executeTool(data.actionType, input || '', data.config as any)
        if (typeof toolResult === 'string') {
          result = { success: true, output: toolResult }
        } else {
          result = { success: toolResult.status === 'success', ...toolResult }
        }
        // log side effect
        console.log(`[Orchestrator] 🔧 Action (${data.actionType}) via tool registry`, result)
        // audit
        await auditLogger.info(
          AuditEventType.CODE_EXECUTED,
          { action: data.actionType, success: result.success }
        )
        return result
      }

      // fallback to manual handling of non-tool actions
      switch (data.actionType) {
        case 'write_file':
          if (data.config.filePath && data.config.content) {
            await fileSystem.writeFile(data.config.filePath, data.config.content)
            result = { success: true, filePath: data.config.filePath }
            console.log(`[Orchestrator] ✅ Wrote file: ${data.config.filePath}`)
            
            // Audit log
            await auditLogger.info(
              AuditEventType.CODE_EXECUTED,
              { action: 'write_file', filePath: data.config.filePath }
            )
          }
          break

        case 'run_command':
          if (data.config.command) {
            // Execute real command
            const cmdResult = await runCommand({
              type: 'bash',
              command: data.config.command,
              timeout: 30000,
            })
            
            result = {
              success: cmdResult.success,
              command: data.config.command,
              output: cmdResult.output,
              error: cmdResult.error,
              duration: cmdResult.duration,
            }
            
            console.log(`[Orchestrator] ✅ Ran command: ${data.config.command}`)
            
            // Audit log
            await auditLogger.info(
              AuditEventType.CODE_EXECUTED,
              {
                action: 'run_command',
                command: data.config.command,
                success: cmdResult.success,
              }
            )
          }
          break

        case 'send_slack':
          if (data.config.slackWebhook) {
            // Send real Slack message
            const slackMsg = formatWorkflowStatus(
              context.workflowId,
              'completed',
              { input }
            )
            
            const slackResult = await sendSlackMessage(
              data.config.slackWebhook,
              slackMsg
            )
            
            result = {
              success: slackResult.success,
              message: slackResult.messageId,
              error: slackResult.error,
            }
            
            console.log(`[Orchestrator] ✅ Sent Slack notification`)
            
            // Audit log
            await auditLogger.info(
              AuditEventType.AGENT_COMPLETED,
              { action: 'send_slack', success: slackResult.success }
            )
          }
          break

        case 'deploy':
          if (data.config.deployTarget) {
            // Execute real deployment
            const deployResult = await deploy({
              target: (data.config.deployTarget as 'kubernetes' | 'vercel' | 'docker'),
              service: data.config.filePath,
              image: data.config.content,
            })
            
            result = {
              success: deployResult.success,
              deploymentId: deployResult.deploymentId,
              url: deployResult.url,
              error: deployResult.error,
              duration: deployResult.duration,
            }
            
            console.log(`[Orchestrator] ✅ Deployed to: ${data.config.deployTarget}`)
            
            // Audit log
            await auditLogger.info(
              AuditEventType.AGENT_COMPLETED,
              {
                action: 'deploy',
                target: data.config.deployTarget,
                success: deployResult.success,
              }
            )
          }
          break

        default:
          throw new Error(`Unknown action type: ${data.actionType}`)
      }
    } catch (error) {
        if (this.stepCallback) {
          this.stepCallback({
            id: node.id,
            type: 'observation',
            text: `Action ${data.actionType} failed: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date().toISOString(),
          })
        }
      result = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
      
      // Audit log failure
      await auditLogger.error(
        AuditEventType.AGENT_FAILED,
        error instanceof Error ? error : new Error(String(error)),
        { action: data.actionType }
      )
    }

    return result
  }

  /**
   * Get input for a node from previous nodes
   */
  private getNodeInput(node: WorkflowNode, context: ExecutionContext): any {
    // For now, return the most recent output
    const outputs = Array.from(context.nodeOutputs.values())
    return outputs.length > 0 ? outputs[outputs.length - 1] : null
  }

  /**
   * Validate a workflow
   * Constitutional: Ensure workflows are safe and valid
   */
  validateWorkflow(workflow: Workflow): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Must have at least one trigger node
    const triggerNodes = workflow.nodes.filter((n) => n.type === 'trigger')
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node')
    }
    if (triggerNodes.length > 1) {
      warnings.push('Multiple trigger nodes found - only the first will execute')
    }

    // Check for orphaned nodes (not connected)
    const connectedNodeIds = new Set<string>()
    workflow.edges.forEach((edge) => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })

    workflow.nodes.forEach((node) => {
      if (!connectedNodeIds.has(node.id) && node.type !== 'trigger') {
        warnings.push(`Node ${node.id} is not connected to the workflow`)
      }
    })

    // Check for cycles (would cause infinite loops)
    if (this.hasCycles(workflow)) {
      errors.push('Workflow contains cycles (infinite loops)')
    }

    // Constitutional: Critical actions should require approval
    workflow.nodes.forEach((node) => {
      if (node.type === 'action') {
        const data = node.data as ActionNodeData
        if (data.actionType === 'deploy' && !data.requiresApproval) {
          warnings.push(`Deploy action in node ${node.id} should require approval`)
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Check if workflow has cycles
   */
  private hasCycles(workflow: Workflow): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const outgoingEdges = workflow.edges.filter((e) => e.source === nodeId)

      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) return true
        } else if (recursionStack.has(edge.target)) {
          return true // Cycle detected
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true
      }
    }

    return false
  }
}

/**
 * Singleton instance
 */
let orchestratorInstance: WorkflowOrchestrator | null = null

export function getOrchestrator(): WorkflowOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new WorkflowOrchestrator()
  }
  return orchestratorInstance
}
