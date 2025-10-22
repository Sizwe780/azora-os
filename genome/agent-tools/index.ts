import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

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
          duration: response.config.metadata?.startTime
            ? Date.now() - response.config.metadata.startTime
            : 0
        });
        return response;
      },
      (error) => {
        logger.error(`AgentTool: ${config.serviceName} - ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          error: error.message,
          status: error.response?.status,
          duration: error.config?.metadata?.startTime
            ? Date.now() - error.config.metadata.startTime
            : 0
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