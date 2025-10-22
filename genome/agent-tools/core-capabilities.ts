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

export interface AgentCapability {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface AgentAction {
  id: string;
  capability: string;
  parameters: Record<string, any>;
  userId: string;
  sessionId: string;
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export class CoreCapabilities {
  private llmEngine: LLMReasoningEngine;
  private governor: ConstitutionalGovernor;
  private memorySystem: MemorySystem;
  private userTracker: UserStateTracker;
  private accessControls: DataAccessControls;
  private observationLoop: ObservationLoop;

  private capabilities: Map<string, AgentCapability> = new Map();
  private activeActions: Map<string, AgentAction> = new Map();

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

    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    // LISTEN - Process and understand user input
    this.capabilities.set('listen', {
      name: 'Listen',
      description: 'Process and understand user input, extract intent and context',
      inputs: ['userInput', 'userId', 'sessionId', 'context'],
      outputs: ['intent', 'entities', 'confidence', 'clarificationNeeded'],
      execute: this.listen.bind(this),
    });

    // DO - Execute actions and tasks
    this.capabilities.set('do', {
      name: 'Do',
      description: 'Execute specific actions and tasks on behalf of the user',
      inputs: ['action', 'parameters', 'userId', 'sessionId'],
      outputs: ['result', 'status', 'metadata'],
      execute: this.do.bind(this),
    });

    // HELP - Provide assistance and guidance
    this.capabilities.set('help', {
      name: 'Help',
      description: 'Provide contextual help, documentation, and guidance',
      inputs: ['topic', 'userId', 'context', 'expertiseLevel'],
      outputs: ['helpContent', 'relatedTopics', 'nextSteps'],
      execute: this.help.bind(this),
    });

    // HEAL - Monitor and maintain system health
    this.capabilities.set('heal', {
      name: 'Heal',
      description: 'Monitor system health, detect issues, and perform maintenance',
      inputs: ['component', 'issue', 'severity'],
      outputs: ['diagnosis', 'actions', 'status'],
      execute: this.heal.bind(this),
    });

    // DEVELOP - Assist with development and coding tasks
    this.capabilities.set('develop', {
      name: 'Develop',
      description: 'Assist with software development, debugging, and optimization',
      inputs: ['task', 'language', 'framework', 'userId'],
      outputs: ['code', 'explanation', 'tests', 'documentation'],
      execute: this.develop.bind(this),
    });

    // DISCOVER - Explore and learn about the system and data
    this.capabilities.set('discover', {
      name: 'Discover',
      description: 'Explore system capabilities, analyze data, and provide insights',
      inputs: ['query', 'scope', 'userId'],
      outputs: ['insights', 'recommendations', 'data'],
      execute: this.discover.bind(this),
    });

    logger.info('Initialized core agent capabilities', { count: this.capabilities.size });
  }

  async executeCapability(
    capabilityName: string,
    params: Record<string, any>,
    userId: string,
    sessionId: string
  ): Promise<any> {
    const capability = this.capabilities.get(capabilityName);
    if (!capability) {
      throw new Error(`Unknown capability: ${capabilityName}`);
    }

    // Check access permissions
    const accessDecision = await this.accessControls.checkAccess({
      userId,
      resource: `capability.${capabilityName}`,
      action: 'execute',
      context: {
        timestamp: new Date(),
        sessionId,
        additionalData: params,
      },
    });

    if (!accessDecision.allowed) {
      throw new Error(`Access denied: ${accessDecision.reason}`);
    }

    // Check constitutional compliance
    const constitutionalCheck = await this.governor.validateAction({
      type: 'capability_execution',
      capability: capabilityName,
      parameters: params,
      userId,
      sessionId,
    });

    if (!constitutionalCheck.allowed) {
      throw new Error(`Constitutional violation: ${constitutionalCheck.reason}`);
    }

    // Create action record
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const action: AgentAction = {
      id: actionId,
      capability: capabilityName,
      parameters: params,
      userId,
      sessionId,
      timestamp: new Date(),
      status: 'in_progress',
    };

    this.activeActions.set(actionId, action);

    try {
      // Execute the capability
      const result = await capability.execute(params);

      // Update action status
      action.status = 'completed';
      action.result = result;

      // Store in memory
      await this.memorySystem.store('agent_actions', action, {
        type: 'action',
        capability: capabilityName,
        userId,
        sessionId,
        status: 'completed',
      });

      // Update user context
      await this.userTracker.addInteraction(userId, {
        id: actionId,
        timestamp: new Date(),
        type: 'action',
        content: `Executed ${capabilityName} capability`,
        outcome: 'success',
      });

      // Emit observation
      this.observationLoop.emit('agent:action', {
        actionId,
        capability: capabilityName,
        userId,
        result: typeof result === 'object' ? JSON.stringify(result) : result,
      });

      logger.info('Capability executed successfully', {
        capability: capabilityName,
        actionId,
        userId,
      });

      return result;

    } catch (error: any) {
      // Update action status
      action.status = 'failed';
      action.error = error.message;

      // Store failed action
      await this.memorySystem.store('agent_actions', action, {
        type: 'action',
        capability: capabilityName,
        userId,
        sessionId,
        status: 'failed',
      });

      // Emit observation
      this.observationLoop.emit('agent:error', {
        actionId,
        capability: capabilityName,
        userId,
        error: error.message,
      });

      logger.error('Capability execution failed', {
        capability: capabilityName,
        actionId,
        userId,
        error: error.message,
      });

      throw error;
    } finally {
      // Clean up active actions after some time
      setTimeout(() => {
        this.activeActions.delete(actionId);
      }, 300000); // 5 minutes
    }
  }

  // LISTEN Capability
  private async listen(params: {
    userInput: string;
    userId: string;
    sessionId: string;
    context?: Record<string, any>;
  }): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    clarificationNeeded: boolean;
    suggestedActions?: string[];
  }> {
    const { userInput, userId, sessionId, context = {} } = params;

    // Use LLM to analyze intent
    const intentAnalysis = await this.llmEngine.analyzeIntent(userInput, {
      userId,
      sessionId,
      context,
    });

    // Get user context for better understanding
    const userContext = await this.userTracker.getUserContext(userId);

    // Enhance analysis with user history
    if (userContext && userContext.recentInteractions.length > 0) {
      const recentIntents = userContext.recentInteractions
        .filter(i => i.type === 'query')
        .slice(-5)
        .map(i => i.content);

      intentAnalysis.context = {
        ...intentAnalysis.context,
        recentQueries: recentIntents,
        userExpertise: userContext.state.expertiseDemonstrated,
      };
    }

    // Determine if clarification is needed
    const clarificationNeeded = intentAnalysis.confidence < 0.7 ||
      intentAnalysis.intent === 'unknown' ||
      intentAnalysis.entities.length === 0;

    return {
      intent: intentAnalysis.intent,
      entities: intentAnalysis.entities,
      confidence: intentAnalysis.confidence,
      clarificationNeeded,
      suggestedActions: intentAnalysis.suggestedActions,
    };
  }

  // DO Capability
  private async do(params: {
    action: string;
    parameters: Record<string, any>;
    userId: string;
    sessionId: string;
  }): Promise<{
    result: any;
    status: string;
    metadata: Record<string, any>;
  }> {
    const { action, parameters, userId, sessionId } = params;

    // Route to appropriate action handler
    switch (action) {
      case 'create_workflow':
        return await this.doCreateWorkflow(parameters, userId, sessionId);
      case 'execute_command':
        return await this.doExecuteCommand(parameters, userId, sessionId);
      case 'analyze_data':
        return await this.doAnalyzeData(parameters, userId, sessionId);
      case 'generate_report':
        return await this.doGenerateReport(parameters, userId, sessionId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async doCreateWorkflow(params: any, userId: string, sessionId: string): Promise<any> {
    // Implementation for creating workflows
    const workflow = {
      id: `workflow-${Date.now()}`,
      name: params.name,
      steps: params.steps || [],
      status: 'created',
    };

    await this.userTracker.startWorkflow(userId, {
      id: workflow.id,
      name: workflow.name,
      status: 'active',
      progress: 0,
      steps: workflow.steps.map((step: any) => ({
        id: step.id,
        name: step.name,
        status: 'pending',
      })),
    });

    return {
      result: workflow,
      status: 'success',
      metadata: { workflowId: workflow.id },
    };
  }

  private async doExecuteCommand(params: any, userId: string, sessionId: string): Promise<any> {
    // Implementation for executing commands (with safety checks)
    const { command, args = [] } = params;

    // Safety check - only allow specific safe commands
    const allowedCommands = ['ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep'];

    if (!allowedCommands.includes(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    // Execute command (in a real implementation, this would be done securely)
    // For now, return mock result
    return {
      result: `Executed: ${command} ${args.join(' ')}`,
      status: 'success',
      metadata: { command, args, executionTime: Date.now() },
    };
  }

  private async doAnalyzeData(params: any, userId: string, sessionId: string): Promise<any> {
    // Implementation for data analysis
    const { dataSource, analysisType } = params;

    // Use LLM for analysis assistance
    const analysis = await this.llmEngine.generateResponse(
      `Analyze the following data: ${JSON.stringify(params)}`,
      { userId, sessionId }
    );

    return {
      result: analysis,
      status: 'success',
      metadata: { dataSource, analysisType, analyzedAt: new Date() },
    };
  }

  private async doGenerateReport(params: any, userId: string, sessionId: string): Promise<any> {
    // Implementation for report generation
    const { reportType, data } = params;

    const report = {
      type: reportType,
      generatedAt: new Date(),
      data: data,
      summary: `Report generated for ${reportType}`,
    };

    return {
      result: report,
      status: 'success',
      metadata: { reportId: `report-${Date.now()}`, reportType },
    };
  }

  // HELP Capability
  private async help(params: {
    topic: string;
    userId: string;
    context?: Record<string, any>;
    expertiseLevel?: string;
  }): Promise<{
    helpContent: string;
    relatedTopics: string[];
    nextSteps: string[];
  }> {
    const { topic, userId, context = {} } = params;

    // Generate help content using LLM
    const helpQuery = `Provide help for: ${topic}. Context: ${JSON.stringify(context)}`;
    const helpContent = await this.llmEngine.generateResponse(helpQuery, { userId });

    // Find related topics from knowledge base
    const relatedTopics = await this.llmEngine.searchKnowledge(`related to ${topic}`, 5);

    // Suggest next steps
    const nextSteps = [
      'Explore related documentation',
      'Try the suggested commands',
      'Contact support if needed',
    ];

    return {
      helpContent,
      relatedTopics: relatedTopics.map(r => r.title),
      nextSteps,
    };
  }

  // HEAL Capability
  private async heal(params: {
    component: string;
    issue?: string;
    severity?: string;
  }): Promise<{
    diagnosis: string;
    actions: string[];
    status: string;
  }> {
    const { component, issue, severity = 'medium' } = params;

    // Diagnose the issue
    const diagnosis = `Diagnosed issue in ${component}: ${issue || 'unknown issue'}`;

    // Determine healing actions
    const actions = [];

    switch (component) {
      case 'memory':
        actions.push('Clear cache', 'Optimize storage', 'Run memory diagnostics');
        break;
      case 'network':
        actions.push('Check connectivity', 'Restart services', 'Update configurations');
        break;
      case 'performance':
        actions.push('Scale resources', 'Optimize queries', 'Monitor metrics');
        break;
      default:
        actions.push('Run diagnostics', 'Check logs', 'Restart component');
    }

    // Execute healing actions (mock implementation)
    const status = severity === 'critical' ? 'immediate_action_required' : 'monitoring';

    return {
      diagnosis,
      actions,
      status,
    };
  }

  // DEVELOP Capability
  private async develop(params: {
    task: string;
    language?: string;
    framework?: string;
    userId: string;
  }): Promise<{
    code: string;
    explanation: string;
    tests: string;
    documentation: string;
  }> {
    const { task, language = 'typescript', framework, userId } = params;

    // Generate code using LLM
    const codePrompt = `Generate ${language} code for: ${task}. ${framework ? `Using ${framework} framework.` : ''}`;
    const code = await this.llmEngine.generateResponse(codePrompt, { userId });

    // Generate explanation
    const explanation = await this.llmEngine.generateResponse(
      `Explain the following code: ${code}`,
      { userId }
    );

    // Generate tests
    const tests = await this.llmEngine.generateResponse(
      `Write unit tests for this ${language} code: ${code}`,
      { userId }
    );

    // Generate documentation
    const documentation = await this.llmEngine.generateResponse(
      `Write documentation for this code: ${code}`,
      { userId }
    );

    return {
      code,
      explanation,
      tests,
      documentation,
    };
  }

  // DISCOVER Capability
  private async discover(params: {
    query: string;
    scope?: string;
    userId: string;
  }): Promise<{
    insights: string[];
    recommendations: string[];
    data: Record<string, any>;
  }> {
    const { query, scope = 'system', userId } = params;

    // Search knowledge base
    const knowledgeResults = await this.llmEngine.searchKnowledge(query, 10);

    // Generate insights
    const insightsPrompt = `Based on the query "${query}" and these results: ${JSON.stringify(knowledgeResults)}, provide key insights.`;
    const insightsText = await this.llmEngine.generateResponse(insightsPrompt, { userId });
    const insights = insightsText.split('\n').filter(line => line.trim());

    // Generate recommendations
    const recommendations = [
      'Explore the suggested resources',
      'Try the recommended actions',
      'Consider related topics for deeper understanding',
    ];

    return {
      insights,
      recommendations,
      data: {
        knowledgeResults,
        query,
        scope,
        discoveredAt: new Date(),
      },
    };
  }

  // Utility methods
  getAvailableCapabilities(): Array<{ name: string; description: string }> {
    return Array.from(this.capabilities.values()).map(cap => ({
      name: cap.name,
      description: cap.description,
    }));
  }

  getActiveActions(): AgentAction[] {
    return Array.from(this.activeActions.values());
  }

  getCapabilityDetails(capabilityName: string): AgentCapability | null {
    return this.capabilities.get(capabilityName) || null;
  }
}