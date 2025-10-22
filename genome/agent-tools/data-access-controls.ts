import { logger } from '../utils/logger';
import { UserStateTracker, UserProfile } from './user-state-tracker';

export interface AccessRule {
  id: string;
  resource: string;
  action: string;
  conditions: {
    userRoles?: string[];
    userIds?: string[];
    timeWindows?: Array<{ start: string; end: string }>;
    ipRanges?: string[];
    requiredPermissions?: string[];
  };
  effect: 'allow' | 'deny';
  priority: number;
}

export interface DataAccessRequest {
  userId: string;
  resource: string;
  action: string;
  context: {
    ip?: string;
    userAgent?: string;
    timestamp: Date;
    sessionId?: string;
    additionalData?: Record<string, any>;
  };
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  ruleId?: string;
  metadata: {
    processingTime: number;
    rulesEvaluated: number;
    userRole: string;
    resourceType: string;
  };
}

export class DataAccessControls {
  private userStateTracker: UserStateTracker;
  private accessRules: AccessRule[] = [];
  private auditLog: Array<{
    timestamp: Date;
    request: DataAccessRequest;
    decision: AccessDecision;
  }> = [];

  constructor(userStateTracker: UserStateTracker) {
    this.userStateTracker = userStateTracker;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Default access rules for Azora Nexus
    this.accessRules = [
      // Admin rules
      {
        id: 'admin-full-access',
        resource: '*',
        action: '*',
        conditions: { userRoles: ['admin'] },
        effect: 'allow',
        priority: 100,
      },

      // Enterprise rules
      {
        id: 'enterprise-service-access',
        resource: 'services.*',
        action: 'read',
        conditions: { userRoles: ['enterprise'] },
        effect: 'allow',
        priority: 90,
      },
      {
        id: 'enterprise-restricted-actions',
        resource: 'system.*',
        action: 'write',
        conditions: { userRoles: ['enterprise'] },
        effect: 'deny',
        priority: 85,
      },

      // Developer rules
      {
        id: 'developer-api-access',
        resource: 'api.*',
        action: '*',
        conditions: { userRoles: ['developer'] },
        effect: 'allow',
        priority: 80,
      },
      {
        id: 'developer-production-deny',
        resource: 'production.*',
        action: '*',
        conditions: { userRoles: ['developer'] },
        effect: 'deny',
        priority: 75,
      },

      // User rules
      {
        id: 'user-basic-access',
        resource: 'knowledge.*',
        action: 'read',
        conditions: { userRoles: ['user'] },
        effect: 'allow',
        priority: 50,
      },
      {
        id: 'user-own-data',
        resource: 'user.{userId}.*',
        action: '*',
        conditions: { userRoles: ['user'] },
        effect: 'allow',
        priority: 60,
      },

      // Security rules
      {
        id: 'security-sensitive-deny',
        resource: 'security.*',
        action: '*',
        conditions: { userRoles: ['user'] },
        effect: 'deny',
        priority: 95,
      },

      // Time-based restrictions
      {
        id: 'maintenance-window',
        resource: 'system.maintenance',
        action: '*',
        conditions: {
          timeWindows: [{ start: '02:00', end: '04:00' }] // 2 AM - 4 AM
        },
        effect: 'allow',
        priority: 70,
      },
    ];

    logger.info('Initialized default access rules', { ruleCount: this.accessRules.length });
  }

  async checkAccess(request: DataAccessRequest): Promise<AccessDecision> {
    const startTime = Date.now();

    try {
      // Get user profile
      const userProfile = await this.userStateTracker.getOrCreateUserProfile(request.userId);

      // Evaluate rules
      const decision = await this.evaluateRules(request, userProfile);

      // Log the decision
      this.auditLog.push({
        timestamp: new Date(),
        request,
        decision,
      });

      // Keep audit log manageable
      if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-5000);
      }

      const processingTime = Date.now() - startTime;
      decision.metadata.processingTime = processingTime;

      logger.debug('Access decision made', {
        userId: request.userId,
        resource: request.resource,
        action: request.action,
        allowed: decision.allowed,
        processingTime,
      });

      return decision;

    } catch (error: any) {
      logger.error('Access check failed', {
        userId: request.userId,
        error: error.message,
        resource: request.resource,
        action: request.action,
      });

      return {
        allowed: false,
        reason: 'Access check failed due to system error',
        metadata: {
          processingTime: Date.now() - startTime,
          rulesEvaluated: 0,
          userRole: 'unknown',
          resourceType: 'unknown',
        },
      };
    }
  }

  private async evaluateRules(request: DataAccessRequest, userProfile: UserProfile): Promise<AccessDecision> {
    // Sort rules by priority (highest first)
    const sortedRules = [...this.accessRules].sort((a, b) => b.priority - a.priority);

    let rulesEvaluated = 0;
    let finalDecision: AccessDecision | null = null;

    for (const rule of sortedRules) {
      rulesEvaluated++;

      if (this.ruleMatches(request, userProfile, rule)) {
        const allowed = rule.effect === 'allow';

        finalDecision = {
          allowed,
          reason: allowed ?
            `Access granted by rule: ${rule.id}` :
            `Access denied by rule: ${rule.id}`,
          ruleId: rule.id,
          metadata: {
            processingTime: 0, // Will be set by caller
            rulesEvaluated,
            userRole: userProfile.role,
            resourceType: this.getResourceType(request.resource),
          },
        };

        // If this is a deny rule, stop here (deny takes precedence)
        if (!allowed) {
          break;
        }
      }
    }

    // Default deny if no rules matched
    if (!finalDecision) {
      finalDecision = {
        allowed: false,
        reason: 'No matching access rules found',
        metadata: {
          processingTime: 0,
          rulesEvaluated,
          userRole: userProfile.role,
          resourceType: this.getResourceType(request.resource),
        },
      };
    }

    return finalDecision;
  }

  private ruleMatches(request: DataAccessRequest, userProfile: UserProfile, rule: AccessRule): boolean {
    // Check resource pattern
    if (!this.matchesResourcePattern(request.resource, rule.resource, request.userId)) {
      return false;
    }

    // Check action
    if (rule.action !== '*' && rule.action !== request.action) {
      return false;
    }

    // Check user roles
    if (rule.conditions.userRoles && !rule.conditions.userRoles.includes(userProfile.role)) {
      return false;
    }

    // Check specific user IDs
    if (rule.conditions.userIds && !rule.conditions.userIds.includes(request.userId)) {
      return false;
    }

    // Check time windows
    if (rule.conditions.timeWindows && !this.isInTimeWindow(request.context.timestamp, rule.conditions.timeWindows)) {
      return false;
    }

    // Check IP ranges
    if (rule.conditions.ipRanges && request.context.ip && !this.isInIpRange(request.context.ip, rule.conditions.ipRanges)) {
      return false;
    }

    // Check required permissions
    if (rule.conditions.requiredPermissions) {
      const userContext = await this.userStateTracker.getUserContext(request.userId);
      if (!userContext) return false;

      for (const permission of rule.conditions.requiredPermissions) {
        if (!userContext.permissions.canPerformActions.includes(permission)) {
          return false;
        }
      }
    }

    return true;
  }

  private matchesResourcePattern(resource: string, pattern: string, userId: string): boolean {
    // Replace {userId} placeholder
    const resolvedPattern = pattern.replace('{userId}', userId);

    // Simple wildcard matching
    if (resolvedPattern === '*') return true;
    if (resolvedPattern.endsWith('.*')) {
      const prefix = resolvedPattern.slice(0, -2);
      return resource.startsWith(prefix);
    }

    return resource === resolvedPattern;
  }

  private isInTimeWindow(timestamp: Date, timeWindows: Array<{ start: string; end: string }>): boolean {
    const currentTime = timestamp.toTimeString().slice(0, 5); // HH:MM format

    for (const window of timeWindows) {
      if (currentTime >= window.start && currentTime <= window.end) {
        return true;
      }
    }

    return false;
  }

  private isInIpRange(ip: string, ranges: string[]): boolean {
    // Simple IP range checking (can be enhanced with proper CIDR support)
    for (const range of ranges) {
      if (range.includes('-')) {
        // Range format: 192.168.1.1-192.168.1.10
        const [start, end] = range.split('-');
        if (this.ipToNumber(ip) >= this.ipToNumber(start) && this.ipToNumber(ip) <= this.ipToNumber(end)) {
          return true;
        }
      } else if (range === ip) {
        return true;
      }
    }

    return false;
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }

  private getResourceType(resource: string): string {
    const parts = resource.split('.');
    return parts[0] || 'unknown';
  }

  // Rule management
  addRule(rule: AccessRule): void {
    // Check for duplicate IDs
    if (this.accessRules.some(r => r.id === rule.id)) {
      throw new Error(`Rule with ID ${rule.id} already exists`);
    }

    this.accessRules.push(rule);
    logger.info('Added access rule', { ruleId: rule.id, priority: rule.priority });
  }

  removeRule(ruleId: string): boolean {
    const index = this.accessRules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.accessRules.splice(index, 1);
    logger.info('Removed access rule', { ruleId });
    return true;
  }

  updateRule(ruleId: string, updates: Partial<AccessRule>): boolean {
    const rule = this.accessRules.find(r => r.id === ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    logger.info('Updated access rule', { ruleId });
    return true;
  }

  getRules(): AccessRule[] {
    return [...this.accessRules];
  }

  // Audit and monitoring
  getAuditLog(hours: number = 24): Array<{
    timestamp: Date;
    request: DataAccessRequest;
    decision: AccessDecision;
  }> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.auditLog.filter(entry => entry.timestamp >= cutoff);
  }

  getAccessStats(hours: number = 24): {
    totalRequests: number;
    allowedRequests: number;
    deniedRequests: number;
    averageProcessingTime: number;
    topDeniedResources: Array<{ resource: string; count: number }>;
  } {
    const recentLog = this.getAuditLog(hours);

    const allowed = recentLog.filter(entry => entry.decision.allowed).length;
    const denied = recentLog.length - allowed;

    const totalProcessingTime = recentLog.reduce((sum, entry) => sum + entry.decision.metadata.processingTime, 0);
    const averageProcessingTime = recentLog.length > 0 ? totalProcessingTime / recentLog.length : 0;

    // Count denied resources
    const deniedResources: Record<string, number> = {};
    for (const entry of recentLog) {
      if (!entry.decision.allowed) {
        deniedResources[entry.request.resource] = (deniedResources[entry.request.resource] || 0) + 1;
      }
    }

    const topDeniedResources = Object.entries(deniedResources)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));

    return {
      totalRequests: recentLog.length,
      allowedRequests: allowed,
      deniedRequests: denied,
      averageProcessingTime,
      topDeniedResources,
    };
  }

  // Emergency controls
  enableEmergencyMode(): void {
    // Add emergency deny-all rule with highest priority
    this.accessRules.unshift({
      id: 'emergency-mode',
      resource: '*',
      action: '*',
      conditions: {},
      effect: 'deny',
      priority: 1000,
    });

    logger.warn('Emergency mode enabled - all access denied');
  }

  disableEmergencyMode(): void {
    this.accessRules = this.accessRules.filter(r => r.id !== 'emergency-mode');
    logger.info('Emergency mode disabled');
  }
}