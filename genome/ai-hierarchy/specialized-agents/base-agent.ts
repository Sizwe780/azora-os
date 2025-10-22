/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { logger } from '../../utils/logger';
import { MemorySystem } from '../../agent-tools/memory-system';

/**
 * Base Specialized AI Agent (Angel)
 * Each azora-* backend gets its own specialized agent
 */
export abstract class SpecializedAgent {
  protected memorySystem: MemorySystem;
  protected agentId: string;
  protected backendName: string;
  protected capabilities: string[];
  protected status: 'idle' | 'active' | 'error' = 'idle';
  protected lastActivity: Date = new Date();

  constructor(
    memorySystem: MemorySystem,
    agentId: string,
    backendName: string,
    capabilities: string[]
  ) {
    this.memorySystem = memorySystem;
    this.agentId = agentId;
    this.backendName = backendName;
    this.capabilities = capabilities;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing specialized agent: ${this.agentId} for ${this.backendName}`);
    this.status = 'idle';
  }

  /**
   * Execute a task assigned by the Super AI
   */
  abstract executeTask(task: AgentTask): Promise<TaskResult>;

  /**
   * Report current status and insights to Super AI
   */
  async reportStatus(): Promise<AgentStatusReport> {
    const healthMetrics = await this.getHealthMetrics();
    const insights = await this.generateInsights();

    return {
      agentId: this.agentId,
      backendName: this.backendName,
      status: this.status,
      lastActivity: this.lastActivity,
      capabilities: this.capabilities,
      healthMetrics,
      insights,
      timestamp: new Date()
    };
  }

  /**
   * Get health metrics specific to this backend
   */
  protected abstract getHealthMetrics(): Promise<HealthMetrics>;

  /**
   * Generate insights specific to this backend
   */
  protected abstract generateInsights(): Promise<AgentInsight[]>;

  /**
   * Update agent status
   */
  protected updateStatus(status: 'idle' | 'active' | 'error'): void {
    this.status = status;
    this.lastActivity = new Date();
  }

  /**
   * Get current agent status
   */
  getStatus(): 'idle' | 'active' | 'error' {
    return this.status;
  }

  /**
   * Public method to get insights (calls protected generateInsights)
   */
  async getInsights(): Promise<AgentInsight[]> {
    return this.generateInsights();
  }

  /**
   * Public method to get health metrics (calls protected getHealthMetrics)
   */
  async getHealth(): Promise<HealthMetrics> {
    return this.getHealthMetrics();
  }
}

/**
 * Types for the AI Agent System
 */
export interface AgentTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  parameters: Record<string, any>;
  assignedBy: string;
  deadline?: Date;
  dependencies?: string[];
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  result: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface AgentStatusReport {
  agentId: string;
  backendName: string;
  status: 'idle' | 'active' | 'error';
  lastActivity: Date;
  capabilities: string[];
  healthMetrics: HealthMetrics;
  insights: AgentInsight[];
  timestamp: Date;
}

export interface HealthMetrics {
  responseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  customMetrics?: Record<string, number>;
}

export interface AgentInsight {
  type: 'optimization' | 'warning' | 'opportunity' | 'risk' | 'performance';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  data?: any;
}

export interface AgentInfo {
  agentId: string;
  backendName: string;
  capabilities: string[];
  status: 'idle' | 'active' | 'error';
  lastActivity: Date;
}