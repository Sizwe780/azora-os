import { SpecializedAgent, AgentTask, TaskResult, AgentInsight, AgentStatusReport } from '../specialized-agents/base-agent';
import { SuperAI } from '../super-ai/super-ai';
import { MemorySystem } from '../../agent-tools/memory-system';
import { logger } from '../../utils/logger';

/**
 * Communication System - Enables seamless interaction between Super AI and specialized agents
 */
export class AgentCommunicationSystem {
  private superAI: SuperAI;
  private agents: Map<string, SpecializedAgent> = new Map();
  private messageQueue: Message[] = [];
  private isProcessing = false;

  constructor(superAI: SuperAI) {
    this.superAI = superAI;
  }

  /**
   * Register a specialized agent with the communication system
   */
  public registerAgent(agentName: string, agent: SpecializedAgent): void {
    this.agents.set(agentName, agent);
    logger.info(`Agent ${agentName} registered with communication system`);
  }

  /**
   * Send a message from one agent to another or to Super AI
   */
  public async sendMessage(message: Message): Promise<MessageResponse> {
    try {
      // Add to queue for processing
      this.messageQueue.push(message);

      // Process queue if not already processing
      if (!this.isProcessing) {
        await this.processMessageQueue();
      }

      return {
        status: 'queued',
        messageId: message.id,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to send message:', error);
      return {
        status: 'failed',
        messageId: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process the message queue
   */
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.processMessage(message);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process individual messages
   */
  private async processMessage(message: Message): Promise<void> {
    try {
      switch (message.type) {
        case 'status_report':
          await this.handleStatusReport(message);
          break;
        case 'insight_report':
          await this.handleInsightReport(message);
          break;
        case 'task_request':
          await this.handleTaskRequest(message);
          break;
        case 'task_completion':
          await this.handleTaskCompletion(message);
          break;
        case 'alert':
          await this.handleAlert(message);
          break;
        case 'query':
          await this.handleQuery(message);
          break;
        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error(`Failed to process message ${message.id}:`, error);
    }
  }

  /**
   * Handle status reports from agents
   */
  private async handleStatusReport(message: Message): Promise<void> {
    const statusReport = message.payload as AgentStatusReport;

    // Store status report in memory system
    await this.storeMessage('status_reports', {
      agentId: message.from,
      report: statusReport,
      timestamp: message.timestamp
    });

    // Forward to Super AI for analysis
    await this.superAI.processStatusReport(message.from, statusReport);

    logger.info(`Status report processed from ${message.from}`);
  }

  /**
   * Handle insight reports from agents
   */
  private async handleInsightReport(message: Message): Promise<void> {
    const insights = message.payload as AgentInsight[];

    // Store insights in memory system
    await this.storeMessage('insight_reports', {
      agentId: message.from,
      insights,
      timestamp: message.timestamp
    });

    // Forward to Super AI for compilation
    await this.superAI.processInsights(message.from, insights);

    logger.info(`${insights.length} insights processed from ${message.from}`);
  }

  /**
   * Handle task requests from Super AI to agents
   */
  private async handleTaskRequest(message: Message): Promise<void> {
    const task = message.payload as AgentTask;
    const targetAgent = this.agents.get(message.to);

    if (!targetAgent) {
      logger.error(`Target agent ${message.to} not found for task ${task.id}`);
      return;
    }

    try {
      // Execute task on target agent
      const result = await targetAgent.executeTask(task);

      // Send completion response back to Super AI
      await this.sendMessage({
        id: `completion-${task.id}`,
        from: message.to,
        to: 'super-ai',
        type: 'task_completion',
        payload: result,
        timestamp: new Date(),
        priority: 'high'
      });

      logger.info(`Task ${task.id} executed by ${message.to}`);
    } catch (error) {
      // Send failure response
      await this.sendMessage({
        id: `failure-${task.id}`,
        from: message.to,
        to: 'super-ai',
        type: 'task_completion',
        payload: {
          taskId: task.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date(),
        priority: 'high'
      });

      logger.error(`Task ${task.id} failed on ${message.to}:`, error);
    }
  }

  /**
   * Handle task completion notifications
   */
  private async handleTaskCompletion(message: Message): Promise<void> {
    const result = message.payload as TaskResult;

    // Store task result
    await this.storeMessage('task_results', {
      agentId: message.from,
      result,
      timestamp: message.timestamp
    });

    // Notify Super AI of task completion
    await this.superAI.processTaskResult(message.from, result);

    logger.info(`Task completion processed from ${message.from}: ${result.success ? 'success' : 'failed'}`);
  }

  /**
   * Handle alerts from agents
   */
  private async handleAlert(message: Message): Promise<void> {
    const alert = message.payload as Alert;

    // Store alert
    await this.storeMessage('alerts', {
      agentId: message.from,
      alert,
      timestamp: message.timestamp
    });

    // Forward critical alerts to Super AI immediately
    if (alert.severity === 'critical') {
      await this.superAI.processCriticalAlert(message.from, alert);
    }

    logger.warn(`Alert processed from ${message.from}: ${alert.title} (${alert.severity})`);
  }

  /**
   * Handle queries between agents or to Super AI
   */
  private async handleQuery(message: Message): Promise<void> {
    const query = message.payload as Query;

    // Route query to appropriate handler
    if (message.to === 'super-ai') {
      const response = await this.superAI.processQuery(message.from, query);

      // Send response back
      await this.sendMessage({
        id: `response-${message.id}`,
        from: 'super-ai',
        to: message.from,
        type: 'query_response',
        payload: response,
        timestamp: new Date(),
        priority: message.priority
      });
    } else {
      // Inter-agent query
      const targetAgent = this.agents.get(message.to);
      if (targetAgent) {
        // For now, just acknowledge - could implement agent-to-agent queries
        await this.sendMessage({
          id: `response-${message.id}`,
          from: message.to,
          to: message.from,
          type: 'query_response',
          payload: { status: 'acknowledged', queryId: query.id },
          timestamp: new Date(),
          priority: message.priority
        });
      }
    }
  }

  /**
   * Store message in memory system for persistence and analysis
   */
  private async storeMessage(collection: string, data: any): Promise<void> {
    try {
      // This would integrate with the actual memory system
      // For now, we'll just log the intent
      logger.debug(`Storing message in ${collection}:`, data);
    } catch (error) {
      logger.error(`Failed to store message in ${collection}:`, error);
    }
  }

  /**
   * Get communication statistics
   */
  public getCommunicationStats(): CommunicationStats {
    return {
      totalMessages: this.messageQueue.length,
      processing: this.isProcessing,
      registeredAgents: this.agents.size,
      uptime: Date.now() // Would track actual uptime
    };
  }

  /**
   * Broadcast message to all agents
   */
  public async broadcastMessage(message: Omit<Message, 'to'>): Promise<void> {
    const promises = Array.from(this.agents.keys()).map(agentName =>
      this.sendMessage({
        ...message,
        to: agentName
      })
    );

    await Promise.all(promises);
    logger.info(`Message broadcasted to ${this.agents.size} agents`);
  }

  /**
   * Get agent communication history
   */
  public async getAgentHistory(agentName: string, limit = 50): Promise<Message[]> {
    // This would query the memory system for historical messages
    // For now, return empty array
    return [];
  }
}

/**
 * Message Protocol definitions
 */
export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  payload: any;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
  correlationId?: string; // For request-response patterns
}

export type MessageType =
  | 'status_report'
  | 'insight_report'
  | 'task_request'
  | 'task_completion'
  | 'alert'
  | 'query'
  | 'query_response'
  | 'broadcast';

export interface MessageResponse {
  status: 'queued' | 'delivered' | 'failed';
  messageId: string;
  timestamp: Date;
  error?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data?: any;
  recommendedActions?: string[];
}

export interface Query {
  id: string;
  type: string;
  parameters: any;
  timeout?: number; // milliseconds
}

export interface CommunicationStats {
  totalMessages: number;
  processing: boolean;
  registeredAgents: number;
  uptime: number;
}

/**
 * Extensions to SuperAI for communication system integration
 */
declare module '../super-ai/super-ai' {
  interface SuperAI {
    processStatusReport(agentId: string, report: AgentStatusReport): Promise<void>;
    processInsights(agentId: string, insights: AgentInsight[]): Promise<void>;
    processTaskResult(agentId: string, result: TaskResult): Promise<void>;
    processCriticalAlert(agentId: string, alert: Alert): Promise<void>;
    processQuery(fromAgent: string, query: Query): Promise<any>;
  }
}

/**
 * Communication helpers for agents
 */
export class AgentMessenger {
  private communicationSystem: AgentCommunicationSystem;
  private agentName: string;

  constructor(communicationSystem: AgentCommunicationSystem, agentName: string) {
    this.communicationSystem = communicationSystem;
    this.agentName = agentName;
  }

  /**
   * Send status report to Super AI
   */
  async reportStatus(status: AgentStatusReport): Promise<void> {
    await this.communicationSystem.sendMessage({
      id: `status-${this.agentName}-${Date.now()}`,
      from: this.agentName,
      to: 'super-ai',
      type: 'status_report',
      payload: status,
      timestamp: new Date(),
      priority: 'normal'
    });
  }

  /**
   * Send insights to Super AI
   */
  async reportInsights(insights: AgentInsight[]): Promise<void> {
    await this.communicationSystem.sendMessage({
      id: `insights-${this.agentName}-${Date.now()}`,
      from: this.agentName,
      to: 'super-ai',
      type: 'insight_report',
      payload: insights,
      timestamp: new Date(),
      priority: 'normal'
    });
  }

  /**
   * Send alert to Super AI
   */
  async sendAlert(alert: Alert): Promise<void> {
    await this.communicationSystem.sendMessage({
      id: `alert-${this.agentName}-${Date.now()}`,
      from: this.agentName,
      to: 'super-ai',
      type: 'alert',
      payload: alert,
      timestamp: new Date(),
      priority: alert.severity === 'critical' ? 'critical' : 'high'
    });
  }

  /**
   * Query Super AI or other agents
   */
  async sendQuery(to: string, query: Query): Promise<any> {
    const response = await this.communicationSystem.sendMessage({
      id: `query-${this.agentName}-${Date.now()}`,
      from: this.agentName,
      to,
      type: 'query',
      payload: query,
      timestamp: new Date(),
      priority: 'normal'
    });

    // In a real implementation, this would wait for and return the response
    return response;
  }

  /**
   * Report task completion
   */
  async reportTaskCompletion(result: TaskResult): Promise<void> {
    await this.communicationSystem.sendMessage({
      id: `task-completion-${this.agentName}-${result.taskId}`,
      from: this.agentName,
      to: 'super-ai',
      type: 'task_completion',
      payload: result,
      timestamp: new Date(),
      priority: 'high'
    });
  }
}