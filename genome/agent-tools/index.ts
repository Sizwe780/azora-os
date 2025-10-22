/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

// Import all agent components
import { LLMReasoningEngine } from './llm-reasoning';
import { ConstitutionalGovernor } from './constitutional-governor';
import { MemorySystem } from './memory-system';
import { UserStateTracker } from './user-state-tracker';
import { DataAccessControls } from './data-access-controls';
import { ObservationLoop } from './observation-loop';
import { CoreCapabilities } from './core-capabilities';
import { AutonomousCore } from './autonomous-core';

// Re-export all agent components
export { LLMReasoningEngine } from './llm-reasoning';
export { ConstitutionalGovernor } from './constitutional-governor';
export { MemorySystem } from './memory-system';
export { UserStateTracker } from './user-state-tracker';
export { DataAccessControls } from './data-access-controls';
export { ObservationLoop } from './observation-loop';
export { CoreCapabilities } from './core-capabilities';
export { AutonomousCore } from './autonomous-core';

// Tool interfaces and classes
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    service: string;
    operation: string;
    timestamp: Date;
    duration: number;
  };
}

export interface ToolConfig {
  serviceName: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  auth?: {
    type: 'bearer' | 'api-key' | 'basic';
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
}

export class AgentTool {
  private client: AxiosInstance;
  private config: ToolConfig;

  constructor(config: ToolConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: this.buildHeaders(),
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`AgentTool: ${config.serviceName} - ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
        });
        return response;
      },
      (error) => {
        logger.error(`AgentTool: ${config.serviceName} - ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          error: error.message,
          status: error.response?.status,
        });
        return Promise.reject(error);
      }
    );
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Azora-Nexus-Agent/1.0',
    };

    if (this.config.auth) {
      switch (this.config.auth.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.auth.token}`;
          break;
        case 'api-key':
          headers['X-API-Key'] = this.config.auth.apiKey!;
          break;
        case 'basic':
          const credentials = Buffer.from(`${this.config.auth.username}:${this.config.auth.password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
          break;
      }
    }

    return headers;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    operationName: string
  ): Promise<ToolResult> {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.config.retries + 1; attempt++) {
      try {
        const response = await operation();
        return {
          success: true,
          data: response.data,
          metadata: {
            service: this.config.serviceName,
            operation: operationName,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          },
        };
      } catch (error: any) {
        const isLastAttempt = attempt === this.config.retries + 1;

        if (isLastAttempt) {
          return {
            success: false,
            error: error.message || 'Unknown error',
            metadata: {
              service: this.config.serviceName,
              operation: operationName,
              timestamp: new Date(),
              duration: Date.now() - startTime,
            },
          };
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        logger.warn(`AgentTool: Retrying ${this.config.serviceName}.${operationName} (attempt ${attempt}/${this.config.retries + 1})`);
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      metadata: {
        service: this.config.serviceName,
        operation: operationName,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      },
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ToolResult> {
    return this.executeWithRetry(
      () => this.client.get<T>(endpoint, {
        params,
        metadata: { startTime: Date.now() }
      } as any),
      `GET ${endpoint}`
    );
  }

  async post<T>(endpoint: string, data?: any): Promise<ToolResult> {
    return this.executeWithRetry(
      () => this.client.post<T>(endpoint, data, {
        metadata: { startTime: Date.now() }
      } as any),
      `POST ${endpoint}`
    );
  }

  async put<T>(endpoint: string, data?: any): Promise<ToolResult> {
    return this.executeWithRetry(
      () => this.client.put<T>(endpoint, data, {
        metadata: { startTime: Date.now() }
      } as any),
      `PUT ${endpoint}`
    );
  }

  async delete<T>(endpoint: string): Promise<ToolResult> {
    return this.executeWithRetry(
      () => this.client.delete<T>(endpoint, {
        metadata: { startTime: Date.now() }
      } as any),
      `DELETE ${endpoint}`
    );
  }
}

// Tool Registry for managing all available tools
export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  registerTool(name: string, tool: AgentTool): void {
    this.tools.set(name, tool);
    logger.info(`AgentTool: Registered tool '${name}' for service '${tool['config'].serviceName}'`);
  }

  getTool(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  async executeTool(toolName: string, operation: string, params: any = {}): Promise<ToolResult> {
    const tool = this.getTool(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
      };
    }

    try {
      switch (operation.toLowerCase()) {
        case 'get':
          return await tool.get(params.endpoint || '/', params.query);
        case 'post':
          return await tool.post(params.endpoint || '/', params.data);
        case 'put':
          return await tool.put(params.endpoint || '/', params.data);
        case 'delete':
          return await tool.delete(params.endpoint || '/');
        default:
          return {
            success: false,
            error: `Unsupported operation '${operation}'`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry();

// Integrated Azora Nexus Agent
export class AzoraNexusAgent {
  private llmEngine: LLMReasoningEngine;
  private governor: ConstitutionalGovernor;
  private memorySystem: MemorySystem;
  private userTracker: UserStateTracker;
  private accessControls: DataAccessControls;
  private observationLoop: ObservationLoop;
  private autonomousCore: AutonomousCore;

  constructor() {
    // Initialize all components
    this.llmEngine = new LLMReasoningEngine();
    this.governor = new ConstitutionalGovernor();
    this.memorySystem = new MemorySystem();
    this.userTracker = new UserStateTracker(this.memorySystem);
    this.accessControls = new DataAccessControls(this.userTracker);
    this.observationLoop = new ObservationLoop();

    // Initialize autonomous core with all components
    this.autonomousCore = new AutonomousCore(
      this.llmEngine,
      this.governor,
      this.memorySystem,
      this.userTracker,
      this.accessControls,
      this.observationLoop
    );
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Azora Nexus Agent');

    try {
      // Components are initialized in their constructors
      // LLM knowledge base is initialized on first use
      // Constitution is loaded in ConstitutionalGovernor constructor
      // Memory system connections are established in constructor

      logger.info('Azora Nexus Agent initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize Azora Nexus Agent', { error: error.message });
      throw error;
    }
  }

  async start(): Promise<void> {
    logger.info('Starting Azora Nexus Agent');
    await this.autonomousCore.start();
  }

  async stop(): Promise<void> {
    logger.info('Stopping Azora Nexus Agent');
    await this.autonomousCore.stop();
  }

  // Public API for interacting with the agent
  async processUserInput(
    userInput: string,
    userId: string = 'anonymous',
    sessionId?: string,
    context?: Record<string, any>
  ): Promise<any> {
    // Add user input as a perception
    this.autonomousCore.addPerception({
      type: 'user_input',
      source: 'user',
      content: userInput,
      context: {
        userId,
        sessionId: sessionId || `session-${Date.now()}`,
        ...context,
      },
      timestamp: new Date(),
      priority: 'medium',
    });

    // Wait a bit for processing (in production, this would be async)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return current agent state for immediate response
    return {
      status: 'processing',
      agentState: this.autonomousCore.getState(),
      message: 'Your request is being processed by the Azora Nexus Agent',
    };
  }

  // Direct capability execution
  async executeCapability(
    capabilityName: string,
    params: Record<string, any>,
    userId: string,
    sessionId: string
  ): Promise<any> {
    const coreCapabilities = this.autonomousCore.getCoreCapabilities();
    return await coreCapabilities.executeCapability(capabilityName, params, userId, sessionId);
  }

  // Get agent status and metrics
  getStatus(): {
    agentState: any;
    metrics: any;
    capabilities: any;
    activeUsers: number;
    totalProfiles: number;
  } {
    const agentState = this.autonomousCore.getState();
    const metrics = this.autonomousCore.getMetrics();
    const capabilities = this.autonomousCore.getCoreCapabilities().getAvailableCapabilities();
    const userStats = this.userTracker.getStats();

    return {
      agentState,
      metrics,
      capabilities,
      activeUsers: userStats.activeUsers,
      totalProfiles: userStats.totalProfiles,
    };
  }

  // Administrative methods
  async createUserProfile(userId: string, profile: any): Promise<void> {
    await this.userTracker.updateUserProfile(userId, profile);
  }

  getUserInsights(userId: string): Promise<any> {
    return this.userTracker.getUserInsights(userId);
  }

  // Emergency controls
  enableEmergencyMode(): void {
    this.accessControls.enableEmergencyMode();
    logger.warn('Emergency mode enabled');
  }

  disableEmergencyMode(): void {
    this.accessControls.disableEmergencyMode();
    logger.info('Emergency mode disabled');
  }
}

// Global agent instance
export const azoraNexusAgent = new AzoraNexusAgent();