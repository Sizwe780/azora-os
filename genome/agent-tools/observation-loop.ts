/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface SystemEvent {
  id: string;
  type: 'health_check' | 'user_action' | 'error' | 'performance' | 'security' | 'transaction' | 'system_change';
  source: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: Record<string, any>;
  timestamp: Date;
  correlationId?: string;
}

export interface EventFilter {
  types?: string[];
  services?: string[];
  severity?: string[];
  sources?: string[];
}

export class ObservationLoop extends EventEmitter {
  private isActive: boolean = false;
  private eventQueue: SystemEvent[] = [];
  private filters: EventFilter = {};
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for internal agent events
    this.on('agent:action', this.handleAgentAction.bind(this));
    this.on('agent:decision', this.handleAgentDecision.bind(this));
    this.on('agent:error', this.handleAgentError.bind(this));
  }

  async start(): Promise<void> {
    if (this.isActive) {
      logger.warn('Observation loop already active');
      return;
    }

    this.isActive = true;
    logger.info('Starting observation loop');

    // Start polling various data sources
    await this.startHealthChecks();
    await this.startEventBusSubscription();
    await this.startPerformanceMonitoring();
    await this.startSecurityMonitoring();

    // Process existing queue
    this.processEventQueue();
  }

  async stop(): Promise<void> {
    this.isActive = false;

    // Clear all polling intervals
    for (const [name, interval] of this.pollingIntervals) {
      clearInterval(interval);
      logger.debug(`Cleared polling interval: ${name}`);
    }
    this.pollingIntervals.clear();

    logger.info('Observation loop stopped');
  }

  private async startHealthChecks(): Promise<void> {
    const services = [
      { name: 'azora-nexus', url: 'http://localhost:3006/health', interval: 30000 },
      { name: 'auth-service', url: 'http://localhost:3001/health', interval: 30000 },
      { name: 'scriptorium-service', url: 'http://localhost:3007/health', interval: 30000 },
      { name: 'mint-service', url: 'http://localhost:3008/health', interval: 30000 },
      { name: 'aegis-service', url: 'http://localhost:3009/health', interval: 30000 },
      { name: 'pulse-service', url: 'http://localhost:3010/health', interval: 30000 },
    ];

    for (const service of services) {
      const interval = setInterval(async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(service.url, { 
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          
          const health = await response.json() as { status: string };

          if (!response.ok || health.status !== 'healthy') {
            this.emitEvent({
              id: `health-${service.name}-${Date.now()}`,
              type: 'health_check',
              source: 'observation-loop',
              service: service.name,
              severity: 'high',
              message: `${service.name} health check failed`,
              data: { health, response: { status: response.status, statusText: response.statusText } },
              timestamp: new Date(),
            });
          }
        } catch (error: any) {
          this.emitEvent({
            id: `health-${service.name}-${Date.now()}`,
            type: 'error',
            source: 'observation-loop',
            service: service.name,
            severity: 'high',
            message: `${service.name} is unreachable`,
            data: { error: error.message, url: service.url },
            timestamp: new Date(),
          });
        }
      }, service.interval);

      this.pollingIntervals.set(`health-${service.name}`, interval);
    }

    logger.info('Health check monitoring started');
  }

  private async startEventBusSubscription(): Promise<void> {
    // TODO: Connect to azora-lattice event bus
    // For now, simulate event bus with polling
    const interval = setInterval(async () => {
      try {
        // Simulate checking for new events
        // In production, this would be a WebSocket or message queue connection
        const events = await this.pollEventBus();

        for (const event of events) {
          this.emitEvent(event);
        }
      } catch (error: any) {
        logger.error('Event bus polling failed', { error: error.message });
      }
    }, 5000); // Poll every 5 seconds

    this.pollingIntervals.set('event-bus', interval);
    logger.info('Event bus subscription started');
  }

  private async startPerformanceMonitoring(): Promise<void> {
    const interval = setInterval(async () => {
      try {
        // Monitor system performance metrics
        const metrics = await this.collectPerformanceMetrics();

        // Check for performance anomalies
        const anomalies = this.detectPerformanceAnomalies(metrics);

        for (const anomaly of anomalies) {
          this.emitEvent({
            id: `perf-${Date.now()}`,
            type: 'performance',
            source: 'observation-loop',
            service: 'system',
            severity: anomaly.severity,
            message: anomaly.message,
            data: { metrics, anomaly },
            timestamp: new Date(),
          });
        }
      } catch (error: any) {
        logger.error('Performance monitoring failed', { error: error.message });
      }
    }, 60000); // Check every minute

    this.pollingIntervals.set('performance', interval);
    logger.info('Performance monitoring started');
  }

  private async startSecurityMonitoring(): Promise<void> {
    const interval = setInterval(async () => {
      try {
        // Monitor for security events
        const securityEvents = await this.checkSecurityStatus();

        for (const event of securityEvents) {
          this.emitEvent({
            id: `security-${Date.now()}`,
            type: 'security',
            source: 'observation-loop',
            service: 'aegis',
            severity: event.severity,
            message: event.message,
            data: event.data,
            timestamp: new Date(),
          });
        }
      } catch (error: any) {
        logger.error('Security monitoring failed', { error: error.message });
      }
    }, 30000); // Check every 30 seconds

    this.pollingIntervals.set('security', interval);
    logger.info('Security monitoring started');
  }

  private async pollEventBus(): Promise<SystemEvent[]> {
    // TODO: Replace with actual event bus integration
    // For now, return mock events occasionally
    const events: SystemEvent[] = [];

    // Simulate random events (remove in production)
    if (Math.random() < 0.1) { // 10% chance every 5 seconds
      events.push({
        id: `mock-${Date.now()}`,
        type: 'user_action',
        source: 'synapse',
        service: 'atlas-ui',
        severity: 'low',
        message: 'User accessed knowledge base',
        data: { userId: 'user-123', action: 'view', resource: 'knowledge' },
        timestamp: new Date(),
      });
    }

    return events;
  }

  private async collectPerformanceMetrics(): Promise<Record<string, any>> {
    // Collect basic system metrics
    const metrics = {
      timestamp: new Date(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
    };

    // TODO: Collect metrics from other services
    return metrics;
  }

  private detectPerformanceAnomalies(metrics: Record<string, any>): Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    data: any;
  }> {
    const anomalies = [];

    // Check memory usage
    const memUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memUsagePercent > 90) {
      anomalies.push({
        severity: 'high',
        message: 'High memory usage detected',
        data: { memUsagePercent, memory: metrics.memory },
      });
    }

    // Check for other anomalies as needed
    return anomalies;
  }

  private async checkSecurityStatus(): Promise<Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    data: any;
  }>> {
    // TODO: Integrate with Aegis service for security monitoring
    return [];
  }

  private emitEvent(event: SystemEvent): void {
    // Apply filters
    if (!this.matchesFilter(event)) {
      return;
    }

    // Add to queue for processing
    this.eventQueue.push(event);

    // Emit to listeners
    this.emit('system-event', event);

    logger.debug('System event emitted', {
      id: event.id,
      type: event.type,
      service: event.service,
      severity: event.severity,
    });
  }

  private matchesFilter(event: SystemEvent): boolean {
    if (this.filters.types && !this.filters.types.includes(event.type)) return false;
    if (this.filters.services && !this.filters.services.includes(event.service)) return false;
    if (this.filters.severity && !this.filters.severity.includes(event.severity)) return false;
    if (this.filters.sources && !this.filters.sources.includes(event.source)) return false;
    return true;
  }

  private processEventQueue(): void {
    setInterval(() => {
      if (!this.isActive || this.eventQueue.length === 0) return;

      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }, 1000); // Process one event per second
  }

  private async processEvent(event: SystemEvent): Promise<void> {
    try {
      // Analyze event and determine if action is needed
      const analysis = await this.analyzeEvent(event);

      if (analysis.requiresAttention) {
        this.emit('event-analysis', {
          event,
          analysis,
          timestamp: new Date(),
        });
      }

      // Store event in memory for context
      this.emit('store-event', event);

    } catch (error: any) {
      logger.error('Event processing failed', {
        eventId: event.id,
        error: error.message,
      });
    }
  }

  private async analyzeEvent(event: SystemEvent): Promise<{
    requiresAttention: boolean;
    priority?: string;
    suggestedActions?: string[];
    context?: Record<string, any>;
  }> {
    // Basic event analysis - can be enhanced with ML
    const analysis = {
      requiresAttention: false,
      priority: 'low',
      suggestedActions: [] as string[],
      context: {} as Record<string, any>,
    };

    switch (event.type) {
      case 'error':
        analysis.requiresAttention = true;
        analysis.priority = event.severity === 'critical' ? 'high' : 'medium';
        analysis.suggestedActions = ['investigate', 'log', 'alert'];
        break;

      case 'security':
        analysis.requiresAttention = true;
        analysis.priority = 'high';
        analysis.suggestedActions = ['alert_security', 'audit', 'block'];
        break;

      case 'performance':
        analysis.requiresAttention = event.severity === 'high';
        analysis.priority = event.severity;
        analysis.suggestedActions = ['monitor', 'optimize'];
        break;

      case 'health_check':
        if (event.severity === 'high') {
          analysis.requiresAttention = true;
          analysis.priority = 'medium';
          analysis.suggestedActions = ['restart_service', 'investigate'];
        }
        break;
    }

    return analysis;
  }

  // Event handlers for agent actions
  private handleAgentAction(data: any): void {
    this.emitEvent({
      id: `agent-action-${Date.now()}`,
      type: 'user_action',
      source: 'agent',
      service: 'azora-nexus',
      severity: 'low',
      message: 'Agent performed action',
      data,
      timestamp: new Date(),
    });
  }

  private handleAgentDecision(data: any): void {
    this.emitEvent({
      id: `agent-decision-${Date.now()}`,
      type: 'system_change',
      source: 'agent',
      service: 'azora-nexus',
      severity: 'low',
      message: 'Agent made decision',
      data,
      timestamp: new Date(),
    });
  }

  private handleAgentError(data: any): void {
    this.emitEvent({
      id: `agent-error-${Date.now()}`,
      type: 'error',
      source: 'agent',
      service: 'azora-nexus',
      severity: 'high',
      message: 'Agent encountered error',
      data,
      timestamp: new Date(),
    });
  }

  // Public interface
  setFilters(filters: EventFilter): void {
    this.filters = filters;
    logger.info('Observation filters updated', filters);
  }

  getActiveFilters(): EventFilter {
    return { ...this.filters };
  }

  getQueueLength(): number {
    return this.eventQueue.length;
  }

  getStats(): {
    isActive: boolean;
    queueLength: number;
    activeIntervals: number;
    filters: EventFilter;
  } {
    return {
      isActive: this.isActive,
      queueLength: this.eventQueue.length,
      activeIntervals: this.pollingIntervals.size,
      filters: this.filters,
    };
  }
}

// Global observation loop instance
export const observationLoop = new ObservationLoop();