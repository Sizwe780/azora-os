/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { logger } from '../utils/logger';
import { LLMReasoningEngine } from './llm-reasoning';
import { ConstitutionalGovernor } from './constitutional-governor';
import { MemorySystem } from './memory-system';
import { UserStateTracker } from './user-state-tracker';
import { DataAccessControls } from './data-access-controls';
import { ObservationLoop } from './observation-loop';
import { CoreCapabilities } from './core-capabilities';

export interface AgentState {
  id: string;
  status: 'idle' | 'perceiving' | 'planning' | 'acting' | 'reflecting';
  currentTask?: Task;
  memory: {
    shortTerm: Map<string, any>;
    workingContext: Record<string, any>;
  };
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    averageResponseTime: number;
    lastActivity: Date;
  };
}

export interface Task {
  id: string;
  type: 'user_request' | 'system_maintenance' | 'research' | 'evolution';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  parameters: Record<string, any>;
  userId?: string;
  context?: Record<string, any>;
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  steps: TaskStep[];
}

export interface TaskStep {
  id: string;
  description: string;
  tool: string;
  operation: string;
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executedAt?: Date;
}

export interface Perception {
  type: 'user_input' | 'system_event' | 'scheduled_task' | 'error_alert';
  source: string;
  content: any;
  context?: Record<string, any>;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class AutonomousCore {
  private state: AgentState;
  private isRunning: boolean = false;
  private perceptionQueue: Perception[] = [];

  // Integrated components
  private llmEngine: LLMReasoningEngine;
  private governor: ConstitutionalGovernor;
  private memorySystem: MemorySystem;
  private userTracker: UserStateTracker;
  private accessControls: DataAccessControls;
  private observationLoop: ObservationLoop;
  private coreCapabilities: CoreCapabilities;

  constructor(
    llmEngine: LLMReasoningEngine,
    governor: ConstitutionalGovernor,
    memorySystem: MemorySystem,
    userTracker: UserStateTracker,
    accessControls: DataAccessControls,
    observationLoop: ObservationLoop
  ) {
    this.llmEngine = llmEngine;
    this.governor = governor;
    this.memorySystem = memorySystem;
    this.userTracker = userTracker;
    this.accessControls = accessControls;
    this.observationLoop = observationLoop;

    this.state = {
      id: `agent-${Date.now()}`,
      status: 'idle',
      memory: {
        shortTerm: new Map(),
        workingContext: {},
      },
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageResponseTime: 0,
        lastActivity: new Date(),
      },
    };

    // Initialize core capabilities
    this.coreCapabilities = new CoreCapabilities(
      llmEngine,
      governor,
      memorySystem,
      userTracker,
      accessControls,
      observationLoop
    );

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for observation loop events
    this.observationLoop.on('system-event', this.handleSystemEvent.bind(this));
    this.observationLoop.on('event-analysis', this.handleEventAnalysis.bind(this));
    this.observationLoop.on('store-event', this.handleStoreEvent.bind(this));
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Autonomous core already running');
      return;
    }

    this.isRunning = true;
    logger.info('Autonomous core started', { agentId: this.state.id });

    // Initialize all components
    await this.initializeComponents();

    // Start the main autonomous loop
    this.runAutonomousLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.state.status = 'idle';

    // Stop observation loop
    await this.observationLoop.stop();

    logger.info('Autonomous core stopped', { agentId: this.state.id });
  }

  private async initializeComponents(): Promise<void> {
    try {
      // Initialize user state tracker
      await this.userTracker.initialize();

      // Start observation loop
      await this.observationLoop.start();

      logger.info('All components initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize components', { error: error.message });
      throw error;
    }
  }

  private async runAutonomousLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        // 1. PERCEIVE: Gather information from environment
        await this.perceive();

        // 2. PLAN: Analyze perceptions and create/update tasks
        await this.plan();

        // 3. ACT: Execute planned actions
        await this.act();

        // 4. REFLECT: Learn from actions and update state
        await this.reflect();

        // Brief pause to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        logger.error('Error in autonomous loop', { error: error.message });
        this.state.status = 'idle';
        await new Promise(resolve => setTimeout(resolve, 5000)); // Longer pause on error
      }
    }
  }

  private async perceive(): Promise<void> {
    this.state.status = 'perceiving';

    // Process perception queue
    while (this.perceptionQueue.length > 0) {
      const perception = this.perceptionQueue.shift()!;
      await this.processPerception(perception);
    }

    // Check for proactive opportunities
    await this.checkProactiveOpportunities();
  }

  private async processPerception(perception: Perception): Promise<void> {
    logger.debug('Processing perception', {
      type: perception.type,
      source: perception.source,
      priority: perception.priority
    });

    // Store in short-term memory
    this.state.memory.shortTerm.set(`perception-${Date.now()}`, perception);

    // Handle different perception types
    switch (perception.type) {
      case 'user_input':
        await this.handleUserInput(perception);
        break;
      case 'system_event':
        await this.handleSystemEvent(perception);
        break;
      case 'error_alert':
        await this.handleErrorAlert(perception);
        break;
      case 'scheduled_task':
        await this.handleScheduledTask(perception);
        break;
    }
  }

  private async handleUserInput(perception: Perception): Promise<void> {
    const { content, context = {} } = perception;

    // Use LISTEN capability to understand user intent
    const intentAnalysis = await this.coreCapabilities.executeCapability('listen', {
      userInput: content,
      userId: context.userId || 'anonymous',
      sessionId: context.sessionId || `session-${Date.now()}`,
      context,
    }, context.userId || 'anonymous', context.sessionId || `session-${Date.now()}`);

    // Create task based on intent
    const task: Task = {
      id: `task-${Date.now()}`,
      type: 'user_request',
      priority: perception.priority,
      description: intentAnalysis.intent,
      parameters: {
        ...intentAnalysis.entities,
        originalInput: content,
        clarificationNeeded: intentAnalysis.clarificationNeeded,
        suggestedActions: intentAnalysis.suggestedActions,
      },
      userId: context.userId,
      context,
      createdAt: new Date(),
      status: 'pending',
      progress: 0,
      steps: [],
    };

    // Add to task queue
    await this.queueTask(task);
  }

  private handleSystemEvent(event: any): void {
    // Convert system event to perception
    const perception: Perception = {
      type: 'system_event',
      source: event.source,
      content: event,
      context: event.data,
      timestamp: new Date(event.timestamp),
      priority: this.mapSeverityToPriority(event.severity),
    };

    this.addPerception(perception);
  }

  private handleEventAnalysis(data: any): void {
    const { event, analysis } = data;

    if (analysis.requiresAttention) {
      // Create system maintenance task
      const task: Task = {
        id: `system-${Date.now()}`,
        type: 'system_maintenance',
        priority: analysis.priority === 'high' ? 'high' : 'medium',
        description: `Address system event: ${event.message}`,
        parameters: {
          event,
          analysis,
          suggestedActions: analysis.suggestedActions,
        },
        context: event.data,
        createdAt: new Date(),
        status: 'pending',
        progress: 0,
        steps: [],
      };

      this.queueTask(task);
    }
  }

  private handleStoreEvent(event: any): void {
    // Store event in memory system
    this.memorySystem.store('system_events', event, {
      type: 'system_event',
      source: event.source,
      severity: event.severity,
    }).catch(error => {
      logger.error('Failed to store system event', { error: error.message });
    });
  }

  private async handleErrorAlert(perception: Perception): Promise<void> {
    // Use HEAL capability for error handling
    await this.coreCapabilities.executeCapability('heal', {
      component: perception.source,
      issue: perception.content.message,
      severity: perception.priority,
    }, 'system', 'system-session');
  }

  private async handleScheduledTask(perception: Perception): Promise<void> {
    // Execute scheduled maintenance/research tasks
    const task: Task = {
      id: `scheduled-${Date.now()}`,
      type: perception.content.taskType,
      priority: perception.priority,
      description: perception.content.description,
      parameters: perception.content.parameters,
      context: perception.context,
      createdAt: new Date(),
      status: 'pending',
      progress: 0,
      steps: [],
    };

    await this.queueTask(task);
  }

  private async checkProactiveOpportunities(): Promise<void> {
    // Check for opportunities to use DISCOVER capability
    const insights = await this.coreCapabilities.executeCapability('discover', {
      query: 'system optimization opportunities',
      scope: 'internal',
      userId: 'system',
    }, 'system', 'system-session');

    if (insights.insights.length > 0) {
      // Create research task
      const task: Task = {
        id: `research-${Date.now()}`,
        type: 'research',
        priority: 'low',
        description: 'Explore system optimization opportunities',
        parameters: { insights },
        context: {},
        createdAt: new Date(),
        status: 'pending',
        progress: 0,
        steps: [],
      };

      await this.queueTask(task);
    }
  }

  private async plan(): Promise<void> {
    this.state.status = 'planning';

    // Get highest priority pending task
    const task = await this.getNextTask();
    if (!task) return;

    this.state.currentTask = task;
    task.status = 'in_progress';

    // Use LLM to create execution plan
    const plan = await this.createExecutionPlan(task);

    // Validate plan against constitution
    const validation = await this.governor.validateAction({
      id: `plan-${task.id}`,
      type: 'execute_plan',
      description: `Execute task: ${task.description}`,
      parameters: plan,
      timestamp: new Date(),
    });

    if (!validation.allowed) {
      task.status = 'failed';
      logger.warn('Task blocked by constitutional governor', {
        taskId: task.id,
        reasoning: validation.reasoning
      });
      return;
    }

    // Convert plan to executable steps
    task.steps = plan.steps.map(step => ({
      id: `step-${Date.now()}-${Math.random()}`,
      description: step.description,
      tool: step.tool,
      operation: step.operation,
      parameters: step.parameters,
      status: 'pending',
    }));

    logger.info('Task planned successfully', {
      taskId: task.id,
      steps: task.steps.length,
      warnings: validation.warnings,
    });
  }

  private async act(): Promise<void> {
    this.state.status = 'acting';

    const task = this.state.currentTask;
    if (!task || task.steps.length === 0) return;

    // Execute steps sequentially
    for (const step of task.steps) {
      if (step.status !== 'pending') continue;

      step.status = 'in_progress';
      step.executedAt = new Date();

      try {
        // Execute using core capabilities or direct tool calls
        let result;
        if (step.tool === 'capability') {
          result = await this.coreCapabilities.executeCapability(
            step.operation,
            step.parameters,
            task.userId || 'system',
            task.context?.sessionId || 'system-session'
          );
        } else {
          // Direct tool execution (would need tool registry)
          result = { success: true, data: 'Tool execution placeholder' };
        }

        step.status = 'completed';
        step.result = result;
        task.progress = (task.steps.filter(s => s.status === 'completed').length / task.steps.length) * 100;

      } catch (error: any) {
        step.status = 'failed';
        step.error = error.message;
        task.status = 'failed';
        this.state.metrics.tasksFailed++;

        logger.error('Step execution failed', {
          taskId: task.id,
          stepId: step.id,
          error: error.message,
        });

        break; // Stop executing further steps on failure
      }
    }

    // Mark task as completed if all steps succeeded
    if (task.steps.every(step => step.status === 'completed')) {
      task.status = 'completed';
      this.state.metrics.tasksCompleted++;
    }
  }

  private async reflect(): Promise<void> {
    this.state.status = 'reflecting';

    const task = this.state.currentTask;
    if (!task) return;

    // Analyze task execution for learning
    await this.analyzeTaskExecution(task);

    // Update metrics
    this.state.metrics.lastActivity = new Date();

    // Update user state if applicable
    if (task.userId) {
      await this.userTracker.addInteraction(task.userId, {
        id: task.id,
        timestamp: new Date(),
        type: 'action',
        content: task.description,
        outcome: task.status === 'completed' ? 'success' : 'failure',
      });
    }

    // Clean up completed tasks
    if (task.status === 'completed' || task.status === 'failed') {
      // Store in long-term memory for future reference
      await this.memorySystem.store('completed_tasks', task, {
        type: 'task',
        status: task.status,
        userId: task.userId,
      });

      // Clear current task
      this.state.currentTask = undefined;
    }

    this.state.status = 'idle';
  }

  // Planning methods
  private async createExecutionPlan(task: Task): Promise<{
    steps: Array<{
      description: string;
      tool: string;
      operation: string;
      parameters: Record<string, any>;
    }>;
  }> {
    // Use LLM to create detailed execution plan
    const planPrompt = `Create a detailed execution plan for this task: ${task.description}
Parameters: ${JSON.stringify(task.parameters)}
Context: ${JSON.stringify(task.context)}

Provide a step-by-step plan with specific tools and operations needed.`;

    const planResponse = await this.llmEngine.generateResponse(planPrompt, {
      userId: task.userId || 'system',
      sessionId: task.context?.sessionId || 'system-session',
    });

    // Parse the plan response into structured steps
    // This is a simplified parsing - in practice, you'd want more robust parsing
    const steps = this.parsePlanResponse(planResponse);

    return { steps };
  }

  private parsePlanResponse(planText: string): Array<{
    description: string;
    tool: string;
    operation: string;
    parameters: Record<string, any>;
  }> {
    // Simple parsing logic - split by numbered steps
    const lines = planText.split('\n').filter(line => line.trim());
    const steps = [];

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        // Extract step description
        const description = line.replace(/^\d+\.\s*/, '');

        // Determine tool and operation based on keywords
        let tool = 'capability';
        let operation = 'do'; // default

        if (description.toLowerCase().includes('help')) {
          operation = 'help';
        } else if (description.toLowerCase().includes('heal') || description.toLowerCase().includes('fix')) {
          operation = 'heal';
        } else if (description.toLowerCase().includes('discover') || description.toLowerCase().includes('explore')) {
          operation = 'discover';
        } else if (description.toLowerCase().includes('develop') || description.toLowerCase().includes('code')) {
          operation = 'develop';
        }

        steps.push({
          description,
          tool,
          operation,
          parameters: {},
        });
      }
    }

    return steps.length > 0 ? steps : [{
      description: 'Execute the requested task',
      tool: 'capability',
      operation: 'do',
      parameters: {},
    }];
  }

  // Task management
  private taskQueue: Task[] = [];

  private async queueTask(task: Task): Promise<void> {
    this.taskQueue.push(task);

    // Sort by priority
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    logger.info('Task queued', { taskId: task.id, priority: task.priority, queueLength: this.taskQueue.length });
  }

  private async getNextTask(): Promise<Task | null> {
    return this.taskQueue.shift() || null;
  }

  // Learning and memory methods
  private async analyzeTaskExecution(task: Task): Promise<void> {
    if (task.status === 'completed') {
      // Learn from successful execution
      await this.memorySystem.store('successful_patterns', {
        taskType: task.type,
        description: task.description,
        steps: task.steps.length,
        executionTime: Date.now() - task.createdAt.getTime(),
      }, {
        type: 'learning',
        category: 'successful_execution',
      });
    } else if (task.status === 'failed') {
      // Learn from failures
      await this.memorySystem.store('failure_patterns', {
        taskType: task.type,
        description: task.description,
        failureReason: task.steps.find(s => s.error)?.error,
      }, {
        type: 'learning',
        category: 'failure_analysis',
      });
    }
  }

  // Public interface methods
  addPerception(perception: Perception): void {
    this.perceptionQueue.push(perception);
    logger.debug('Perception added to queue', {
      type: perception.type,
      priority: perception.priority
    });
  }

  getState(): AgentState {
    return { ...this.state };
  }

  getMetrics(): AgentState['metrics'] {
    return { ...this.state.metrics };
  }

  getCoreCapabilities(): CoreCapabilities {
    return this.coreCapabilities;
  }

  async forceExecuteTask(task: Task): Promise<void> {
    this.state.currentTask = task;
    await this.plan();
    await this.act();
    await this.reflect();
  }

  // Utility methods
  private mapSeverityToPriority(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }
}