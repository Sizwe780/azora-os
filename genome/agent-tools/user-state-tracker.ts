/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { logger } from '../utils/logger';
import { MemorySystem } from './memory-system';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  role: 'user' | 'admin' | 'enterprise' | 'developer';
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'technical';
    responseLength: 'brief' | 'detailed' | 'comprehensive';
    notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  metadata: {
    createdAt: Date;
    lastActive: Date;
    totalInteractions: number;
    averageResponseTime: number;
    satisfactionScore?: number;
    timezone?: string;
    language: string;
  };
}

export interface UserContext {
  userId: string;
  currentSession: {
    id: string;
    startTime: Date;
    lastActivity: Date;
    activeTasks: string[];
    pendingActions: string[];
  };
  recentInteractions: Array<{
    id: string;
    timestamp: Date;
    type: 'query' | 'action' | 'feedback' | 'error';
    content: string;
    outcome?: string;
    satisfaction?: number;
  }>;
  activeWorkflows: Array<{
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'failed';
    progress: number;
    steps: Array<{
      id: string;
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      startedAt?: Date;
      completedAt?: Date;
    }>;
  }>;
  permissions: {
    canAccessServices: string[];
    canPerformActions: string[];
    dataAccessLevel: 'public' | 'private' | 'confidential' | 'restricted';
    enterpriseFeatures: boolean;
  };
  state: {
    mood?: 'neutral' | 'frustrated' | 'satisfied' | 'confused' | 'engaged';
    attentionLevel: 'low' | 'medium' | 'high';
    expertiseDemonstrated: string[];
    learningGoals: string[];
  };
}

export class UserStateTracker {
  private memorySystem: MemorySystem;
  private activeContexts: Map<string, UserContext> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor(memorySystem: MemorySystem) {
    this.memorySystem = memorySystem;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing user state tracker');
    // Load existing user profiles from memory
    await this.loadUserProfiles();
  }

  private async loadUserProfiles(): Promise<void> {
    try {
      // Load user profiles from long-term memory
      const profiles = await this.memorySystem.retrieve('user_profiles', {
        limit: 1000,
        metadata: { type: 'user_profile' }
      });

      for (const profile of profiles) {
        this.userProfiles.set(profile.id, profile);
      }

      logger.info(`Loaded ${profiles.length} user profiles`);
    } catch (error: any) {
      logger.error('Failed to load user profiles', { error: error.message });
    }
  }

  async getOrCreateUserProfile(userId: string, initialData?: Partial<UserProfile>): Promise<UserProfile> {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = {
        id: userId,
        role: 'user',
        preferences: {
          communicationStyle: 'casual',
          responseLength: 'detailed',
          notificationFrequency: 'daily',
          expertiseLevel: 'intermediate',
        },
        metadata: {
          createdAt: new Date(),
          lastActive: new Date(),
          totalInteractions: 0,
          averageResponseTime: 0,
          language: 'en',
        },
        ...initialData,
      };

      this.userProfiles.set(userId, profile);
      await this.saveUserProfile(profile);
      logger.info('Created new user profile', { userId });
    }

    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const profile = await this.getOrCreateUserProfile(userId);

    // Deep merge updates
    Object.assign(profile, updates);

    // Update metadata
    profile.metadata.lastActive = new Date();

    this.userProfiles.set(userId, profile);
    await this.saveUserProfile(profile);
  }

  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await this.memorySystem.store('user_profiles', profile, {
        type: 'user_profile',
        userId: profile.id,
        role: profile.role,
      });
    } catch (error: any) {
      logger.error('Failed to save user profile', {
        userId: profile.id,
        error: error.message
      });
    }
  }

  async getUserContext(userId: string): Promise<UserContext | null> {
    let context = this.activeContexts.get(userId);

    if (!context) {
      // Try to load from memory
      context = await this.loadUserContext(userId);
      if (context) {
        this.activeContexts.set(userId, context);
      }
    }

    return context;
  }

  async createUserContext(userId: string, sessionId: string): Promise<UserContext> {
    const context: UserContext = {
      userId,
      currentSession: {
        id: sessionId,
        startTime: new Date(),
        lastActivity: new Date(),
        activeTasks: [],
        pendingActions: [],
      },
      recentInteractions: [],
      activeWorkflows: [],
      permissions: {
        canAccessServices: ['nexus', 'scriptorium'],
        canPerformActions: ['query', 'analyze'],
        dataAccessLevel: 'private',
        enterpriseFeatures: false,
      },
      state: {
        attentionLevel: 'medium',
        expertiseDemonstrated: [],
        learningGoals: [],
      },
    };

    this.activeContexts.set(userId, context);
    await this.saveUserContext(context);

    logger.info('Created user context', { userId, sessionId });
    return context;
  }

  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    const context = await this.getUserContext(userId);
    if (!context) {
      throw new Error(`No context found for user ${userId}`);
    }

    // Deep merge updates
    this.mergeUserContext(context, updates);

    // Update session activity
    context.currentSession.lastActivity = new Date();

    this.activeContexts.set(userId, context);
    await this.saveUserContext(context);
  }

  private mergeUserContext(target: UserContext, source: Partial<UserContext>): void {
    if (source.currentSession) {
      Object.assign(target.currentSession, source.currentSession);
    }
    if (source.recentInteractions) {
      target.recentInteractions = [
        ...target.recentInteractions,
        ...source.recentInteractions,
      ].slice(-50); // Keep last 50 interactions
    }
    if (source.activeWorkflows) {
      target.activeWorkflows = source.activeWorkflows;
    }
    if (source.permissions) {
      Object.assign(target.permissions, source.permissions);
    }
    if (source.state) {
      Object.assign(target.state, source.state);
    }
  }

  async addInteraction(userId: string, interaction: {
    id: string;
    timestamp: Date;
    type: 'query' | 'action' | 'feedback' | 'error';
    content: string;
    outcome?: string;
    satisfaction?: number;
  }): Promise<void> {
    const context = await this.getUserContext(userId);
    if (!context) return;

    context.recentInteractions.push(interaction);

    // Keep only recent interactions
    if (context.recentInteractions.length > 50) {
      context.recentInteractions = context.recentInteractions.slice(-50);
    }

    // Update user profile stats
    const profile = await this.getOrCreateUserProfile(userId);
    profile.metadata.totalInteractions++;
    profile.metadata.lastActive = new Date();

    if (interaction.satisfaction) {
      // Update rolling average satisfaction
      const currentScore = profile.metadata.satisfactionScore || 0;
      const totalInteractions = profile.metadata.totalInteractions;
      profile.metadata.satisfactionScore =
        (currentScore * (totalInteractions - 1) + interaction.satisfaction) / totalInteractions;
    }

    await this.saveUserProfile(profile);
    await this.saveUserContext(context);
  }

  async startWorkflow(userId: string, workflow: {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'failed';
    progress: number;
    steps: Array<{
      id: string;
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      startedAt?: Date;
      completedAt?: Date;
    }>;
  }): Promise<void> {
    const context = await this.getUserContext(userId);
    if (!context) return;

    context.activeWorkflows.push(workflow);
    await this.saveUserContext(context);

    logger.info('Started workflow', { userId, workflowId: workflow.id });
  }

  async updateWorkflowProgress(userId: string, workflowId: string, progress: number, stepUpdates?: any): Promise<void> {
    const context = await this.getUserContext(userId);
    if (!context) return;

    const workflow = context.activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    workflow.progress = progress;

    if (stepUpdates) {
      // Update workflow steps
      Object.assign(workflow.steps, stepUpdates);
    }

    await this.saveUserContext(context);
  }

  async completeWorkflow(userId: string, workflowId: string): Promise<void> {
    const context = await this.getUserContext(userId);
    if (!context) return;

    const workflow = context.activeWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    workflow.status = 'completed';
    workflow.progress = 100;

    await this.saveUserContext(context);

    logger.info('Completed workflow', { userId, workflowId });
  }

  async getUserInsights(userId: string): Promise<{
    interactionPatterns: Record<string, number>;
    commonQueries: string[];
    expertiseAreas: string[];
    engagementLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    const context = await this.getUserContext(userId);
    const profile = await this.getOrCreateUserProfile(userId);

    if (!context) {
      return {
        interactionPatterns: {},
        commonQueries: [],
        expertiseAreas: [],
        engagementLevel: 'low',
        recommendations: ['Complete profile setup', 'Start first interaction'],
      };
    }

    // Analyze interaction patterns
    const interactionPatterns: Record<string, number> = {};
    const queryTypes: string[] = [];

    for (const interaction of context.recentInteractions) {
      interactionPatterns[interaction.type] = (interactionPatterns[interaction.type] || 0) + 1;

      if (interaction.type === 'query') {
        queryTypes.push(interaction.content);
      }
    }

    // Determine engagement level
    const totalInteractions = profile.metadata.totalInteractions;
    const engagementLevel: 'low' | 'medium' | 'high' =
      totalInteractions < 5 ? 'low' :
      totalInteractions < 20 ? 'medium' : 'high';

    // Generate recommendations
    const recommendations: string[] = [];

    if (engagementLevel === 'low') {
      recommendations.push('Explore more features', 'Complete onboarding');
    }

    if (context.activeWorkflows.length === 0) {
      recommendations.push('Start a new workflow or project');
    }

    if (profile.preferences.expertiseLevel === 'beginner' && context.state.expertiseDemonstrated.length > 0) {
      recommendations.push('Consider upgrading expertise level in preferences');
    }

    return {
      interactionPatterns,
      commonQueries: queryTypes.slice(-10), // Last 10 queries
      expertiseAreas: context.state.expertiseDemonstrated,
      engagementLevel,
      recommendations,
    };
  }

  private async loadUserContext(userId: string): Promise<UserContext | null> {
    try {
      const contexts = await this.memorySystem.retrieve('user_contexts', {
        limit: 1,
        metadata: { userId, type: 'user_context' }
      });

      return contexts[0] || null;
    } catch (error: any) {
      logger.error('Failed to load user context', { userId, error: error.message });
      return null;
    }
  }

  private async saveUserContext(context: UserContext): Promise<void> {
    try {
      await this.memorySystem.store('user_contexts', context, {
        type: 'user_context',
        userId: context.userId,
        sessionId: context.currentSession.id,
      });
    } catch (error: any) {
      logger.error('Failed to save user context', {
        userId: context.userId,
        error: error.message
      });
    }
  }

  async cleanupInactiveContexts(maxAgeHours: number = 24): Promise<void> {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const toRemove: string[] = [];

    for (const [userId, context] of this.activeContexts) {
      if (context.currentSession.lastActivity < cutoff) {
        toRemove.push(userId);
      }
    }

    for (const userId of toRemove) {
      this.activeContexts.delete(userId);
      logger.debug('Cleaned up inactive user context', { userId });
    }

    if (toRemove.length > 0) {
      logger.info(`Cleaned up ${toRemove.length} inactive user contexts`);
    }
  }

  getActiveUserCount(): number {
    return this.activeContexts.size;
  }

  getStats(): {
    activeUsers: number;
    totalProfiles: number;
    activeWorkflows: number;
  } {
    let activeWorkflows = 0;
    for (const context of this.activeContexts.values()) {
      activeWorkflows += context.activeWorkflows.length;
    }

    return {
      activeUsers: this.activeContexts.size,
      totalProfiles: this.userProfiles.size,
      activeWorkflows,
    };
  }
}