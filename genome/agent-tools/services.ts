import { AgentTool, toolRegistry } from './index';

// Auth Service Tools
export class AuthTools {
  static register() {
    const authTool = new AgentTool({
      serviceName: 'auth',
      baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: 5000,
      retries: 2,
      auth: {
        type: 'bearer',
        token: process.env.AGENT_AUTH_TOKEN, // Agent's service token
      },
    });

    toolRegistry.registerTool('auth', authTool);
  }

  static async getUserProfile(userId: string) {
    return await toolRegistry.executeTool('auth', 'get', {
      endpoint: `/api/users/${userId}/profile`,
    });
  }

  static async validateToken(token: string) {
    return await toolRegistry.executeTool('auth', 'post', {
      endpoint: '/api/auth/validate',
      data: { token },
    });
  }

  static async getUserRoles(userId: string) {
    return await toolRegistry.executeTool('auth', 'get', {
      endpoint: `/api/users/${userId}/roles`,
    });
  }

  static async checkPermission(userId: string, permission: string, resource: string) {
    return await toolRegistry.executeTool('auth', 'post', {
      endpoint: '/api/auth/check-permission',
      data: { userId, permission, resource },
    });
  }
}

// Scriptorium (Academy/Learning) Service Tools
export class ScriptoriumTools {
  static register() {
    const scriptoriumTool = new AgentTool({
      serviceName: 'scriptorium',
      baseUrl: process.env.SCRIPTORIUM_SERVICE_URL || 'http://localhost:3007',
      timeout: 10000,
      retries: 2,
      auth: {
        type: 'bearer',
        token: process.env.AGENT_AUTH_TOKEN,
      },
    });

    toolRegistry.registerTool('scriptorium', scriptoriumTool);
  }

  static async enrollUser(userId: string, courseId: string) {
    return await toolRegistry.executeTool('scriptorium', 'post', {
      endpoint: '/api/enrollment',
      data: { userId, courseId },
    });
  }

  static async getUserCourses(userId: string) {
    return await toolRegistry.executeTool('scriptorium', 'get', {
      endpoint: `/api/users/${userId}/courses`,
    });
  }

  static async getCourseDetails(courseId: string) {
    return await toolRegistry.executeTool('scriptorium', 'get', {
      endpoint: `/api/courses/${courseId}`,
    });
  }

  static async updateProgress(userId: string, courseId: string, progress: number) {
    return await toolRegistry.executeTool('scriptorium', 'put', {
      endpoint: `/api/progress/${userId}/${courseId}`,
      data: { progress },
    });
  }

  static async getUserAchievements(userId: string) {
    return await toolRegistry.executeTool('scriptorium', 'get', {
      endpoint: `/api/users/${userId}/achievements`,
    });
  }
}

// Mint (Financial/Token) Service Tools
export class MintTools {
  static register() {
    const mintTool = new AgentTool({
      serviceName: 'mint',
      baseUrl: process.env.MINT_SERVICE_URL || 'http://localhost:3008',
      timeout: 15000,
      retries: 1, // Financial operations need careful retry logic
      auth: {
        type: 'bearer',
        token: process.env.AGENT_AUTH_TOKEN,
      },
    });

    toolRegistry.registerTool('mint', mintTool);
  }

  static async getBalance(userId: string) {
    return await toolRegistry.executeTool('mint', 'get', {
      endpoint: `/api/balance/${userId}`,
    });
  }

  static async getTrustScore(userId: string) {
    return await toolRegistry.executeTool('mint', 'get', {
      endpoint: `/api/trust-score/${userId}`,
    });
  }

  static async transferTokens(fromUserId: string, toUserId: string, amount: number, reason: string) {
    return await toolRegistry.executeTool('mint', 'post', {
      endpoint: '/api/transfer',
      data: { fromUserId, toUserId, amount, reason },
    });
  }

  static async mintReward(userId: string, amount: number, reason: string) {
    return await toolRegistry.executeTool('mint', 'post', {
      endpoint: '/api/mint-reward',
      data: { userId, amount, reason },
    });
  }

  static async getTransactionHistory(userId: string, limit: number = 10) {
    return await toolRegistry.executeTool('mint', 'get', {
      endpoint: `/api/transactions/${userId}`,
      query: { limit },
    });
  }
}

// Aegis (Security/Compliance) Service Tools
export class AegisTools {
  static register() {
    const aegisTool = new AgentTool({
      serviceName: 'aegis',
      baseUrl: process.env.AEGIS_SERVICE_URL || 'http://localhost:3009',
      timeout: 10000,
      retries: 2,
      auth: {
        type: 'bearer',
        token: process.env.AGENT_AUTH_TOKEN,
      },
    });

    toolRegistry.registerTool('aegis', aegisTool);
  }

  static async runComplianceCheck(userId: string, action: string) {
    return await toolRegistry.executeTool('aegis', 'post', {
      endpoint: '/api/compliance/check',
      data: { userId, action },
    });
  }

  static async getSecurityStatus(userId: string) {
    return await toolRegistry.executeTool('aegis', 'get', {
      endpoint: `/api/security/status/${userId}`,
    });
  }

  static async reportIncident(incident: any) {
    return await toolRegistry.executeTool('aegis', 'post', {
      endpoint: '/api/incidents',
      data: incident,
    });
  }

  static async getAuditLogs(userId: string, startDate: Date, endDate: Date) {
    return await toolRegistry.executeTool('aegis', 'get', {
      endpoint: `/api/audit/${userId}`,
      query: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  }
}

// Pulse (Analytics/BI) Service Tools
export class PulseTools {
  static register() {
    const pulseTool = new AgentTool({
      serviceName: 'pulse',
      baseUrl: process.env.PULSE_SERVICE_URL || 'http://localhost:3010',
      timeout: 15000,
      retries: 2,
      auth: {
        type: 'bearer',
        token: process.env.AGENT_AUTH_TOKEN,
      },
    });

    toolRegistry.registerTool('pulse', pulseTool);
  }

  static async getUserAnalytics(userId: string, timeframe: string = '30d') {
    return await toolRegistry.executeTool('pulse', 'get', {
      endpoint: `/api/analytics/user/${userId}`,
      query: { timeframe },
    });
  }

  static async getSystemMetrics(metricType: string, timeframe: string = '1h') {
    return await toolRegistry.executeTool('pulse', 'get', {
      endpoint: `/api/metrics/${metricType}`,
      query: { timeframe },
    });
  }

  static async generateReport(reportType: string, parameters: any) {
    return await toolRegistry.executeTool('pulse', 'post', {
      endpoint: '/api/reports/generate',
      data: { reportType, parameters },
    });
  }

  static async getInsights(userId: string, category: string) {
    return await toolRegistry.executeTool('pulse', 'get', {
      endpoint: `/api/insights/${userId}`,
      query: { category },
    });
  }
}

// Initialize all tools
export function initializeTools() {
  AuthTools.register();
  ScriptoriumTools.register();
  MintTools.register();
  AegisTools.register();
  PulseTools.register();

  console.log('Agent tools initialized successfully');
}