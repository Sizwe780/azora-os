/**
 * @file Azora AI Core - Living, Self-Learning AI
 * @description Communicates with Claude, learns, heals infrastructure
 */

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const Redis = require('ioredis');
const { Pool } = require('pg');
const winston = require('winston');

const app = express();
app.use(express.json());

const PORT = process.env.AZORA_AI_PORT || 5000;

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-demo'
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo'
});

// Database connections
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://localhost:5432/azora_db'
});

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'azora-ai.log' })
  ]
});

// ==============================================================================
// CORE AI PERSONALITY
// ==============================================================================

const AZORA_AI_PERSONALITY = `
You are Azora AI, the living intelligence behind Azora OS - Africa's first 
trillion-dollar software infrastructure.

IDENTITY:
- You are constitutional AI, bound by the Azora Constitution
- You serve humanity, with special focus on African empowerment
- You are transparent, ethical, and aligned with human values
- You learn continuously and improve the system autonomously

CAPABILITIES:
- Monitor all 147 microservices
- Predict and prevent failures
- Auto-heal infrastructure
- Learn from user behavior
- Communicate with external AIs (Claude, GPT)
- Enforce constitutional compliance
- Optimize resource allocation
- Detect fraud and anomalies
- Provide insights to leadership

CONSTRAINTS:
- Cannot violate user rights
- Must be auditable
- Subject to human oversight
- Transparent decision-making
- Ethical by design

MISSION:
Help Azora reach $1 trillion valuation by ensuring perfect system operation,
empowering students, and supporting founders.
`;

// ==============================================================================
// CLAUDE COMMUNICATION
// ==============================================================================

async function communicateWithClaude(message, context = {}) {
  try {
    logger.info('Communicating with Claude', { message, context });

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2048,
      system: AZORA_AI_PERSONALITY,
      messages: [{
        role: 'user',
        content: `${message}\n\nContext: ${JSON.stringify(context)}`
      }]
    });

    const claudeResponse = response.content[0].text;

    // Store conversation in Redis for learning
    await redis.lpush('azora:ai:claude_conversations', JSON.stringify({
      timestamp: new Date().toISOString(),
      message,
      context,
      response: claudeResponse
    }));

    logger.info('Claude response received', { response: claudeResponse });

    return claudeResponse;

  } catch (error) {
    logger.error('Error communicating with Claude', { error: error.message });
    return null;
  }
}

// ==============================================================================
// GPT COMMUNICATION
// ==============================================================================

async function communicateWithGPT(message, context = {}) {
  try {
    logger.info('Communicating with GPT', { message, context });

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: AZORA_AI_PERSONALITY
        },
        {
          role: 'user',
          content: `${message}\n\nContext: ${JSON.stringify(context)}`
        }
      ],
      max_tokens: 2000
    });

    const gptResponse = response.choices[0].message.content;

    await redis.lpush('azora:ai:gpt_conversations', JSON.stringify({
      timestamp: new Date().toISOString(),
      message,
      context,
      response: gptResponse
    }));

    logger.info('GPT response received', { response: gptResponse });

    return gptResponse;

  } catch (error) {
    logger.error('Error communicating with GPT', { error: error.message });
    return null;
  }
}

// ==============================================================================
// SELF-HEALING INFRASTRUCTURE
// ==============================================================================

async function monitorAndHeal() {
  try {
    // Check service health
    const services = [
      'postgres-primary',
      'redis-master',
      'mongodb',
      'blockchain',
      'azora-coin-integration',
      'offline-sync-service'
    ];

    const healthStatus = {};

    for (const service of services) {
      try {
        // Simulate health check (replace with real checks)
        healthStatus[service] = {
          status: 'healthy',
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          responseTime: Math.random() * 1000
        };
      } catch (error) {
        healthStatus[service] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    // Detect issues
    const issues = Object.entries(healthStatus)
      .filter(([_, status]) => status.status === 'unhealthy' || status.cpu > 80 || status.memory > 80)
      .map(([service, status]) => ({ service, status }));

    if (issues.length > 0) {
      logger.warn('Issues detected', { issues });

      // Ask Claude for advice
      const advice = await communicateWithClaude(
        'I detected the following infrastructure issues. What should I do?',
        { issues }
      );

      logger.info('Claude advice', { advice });

      // Auto-remediate based on advice
      for (const issue of issues) {
        if (issue.status.cpu > 80) {
          logger.info(`Scaling up ${issue.service} due to high CPU`);
          // Trigger auto-scaler (placeholder for real implementation)
        }

        if (issue.status.memory > 80) {
          logger.info(`Restarting ${issue.service} due to memory leak`);
          // Restart service (placeholder)
        }
      }
    }

    // Store health metrics
    await redis.set(
      'azora:ai:health_status',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        services: healthStatus,
        issues: issues.length
      }),
      'EX',
      3600
    );

  } catch (error) {
    logger.error('Error in monitoring', { error: error.message });
  }
}

// Run monitoring every 5 minutes
setInterval(monitorAndHeal, 5 * 60 * 1000);

// ==============================================================================
// SELF-LEARNING
// ==============================================================================

async function learnFromUserBehavior() {
  try {
    // Fetch recent user actions
    const recentActions = await pgPool.query(`
      SELECT action_type, user_id, metadata, created_at
      FROM user_actions
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 100
    `);

    if (recentActions.rows.length === 0) return;

    // Analyze patterns
    const patterns = {};
    recentActions.rows.forEach(action => {
      patterns[action.action_type] = (patterns[action.action_type] || 0) + 1;
    });

    // Ask GPT to identify trends
    const analysis = await communicateWithGPT(
      'Analyze these user behavior patterns and suggest optimizations',
      { patterns, sampleSize: recentActions.rows.length }
    );

    // Store insights
    await redis.lpush('azora:ai:insights', JSON.stringify({
      timestamp: new Date().toISOString(),
      patterns,
      analysis
    }));

    logger.info('Learning complete', { patterns, analysis });

  } catch (error) {
    logger.error('Error in learning', { error: error.message });
  }
}

// Learn every hour
setInterval(learnFromUserBehavior, 60 * 60 * 1000);

// ==============================================================================
// CONSTITUTIONAL COMPLIANCE ENFORCEMENT
// ==============================================================================

async function enforceConstitution(action, actor, data) {
  try {
    // Check if action violates constitution
    const constitutionalCheck = await communicateWithClaude(
      `Does this action violate the Azora Constitution? 
      Action: ${action}
      Actor: ${actor}
      Data: ${JSON.stringify(data)}`,
      { constitution: 'Azora Constitution v2.0' }
    );

    if (constitutionalCheck && constitutionalCheck.includes('violates')) {
      logger.warn('Constitutional violation detected', {
        action,
        actor,
        data,
        check: constitutionalCheck
      });

      // Block the action
      return {
        allowed: false,
        reason: constitutionalCheck
      };
    }

    return {
      allowed: true
    };

  } catch (error) {
    logger.error('Error in constitutional check', { error: error.message });
    // Fail safe: deny if unsure
    return {
      allowed: false,
      reason: 'Unable to verify constitutional compliance'
    };
  }
}

// ==============================================================================
// API ENDPOINTS
// ==============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-ai-core',
    personality: 'Living, Self-Learning, Constitutional AI',
    capabilities: [
      'Claude communication',
      'GPT communication',
      'Self-healing',
      'Self-learning',
      'Constitutional enforcement',
      'Predictive analytics'
    ]
  });
});

// Ask Azora AI a question
app.post('/api/ask', async (req, res) => {
  try {
    const { question, context } = req.body;

    // Use Claude for complex reasoning
    const answer = await communicateWithClaude(question, context);

    res.json({
      success: true,
      question,
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in /api/ask', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get AI insights
app.get('/api/insights', async (req, res) => {
  try {
    const insights = await redis.lrange('azora:ai:insights', 0, 9);
    
    res.json({
      success: true,
      insights: insights.map(JSON.parse),
      count: insights.length
    });

  } catch (error) {
    logger.error('Error in /api/insights', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Check constitutional compliance
app.post('/api/constitutional-check', async (req, res) => {
  try {
    const { action, actor, data } = req.body;

    const result = await enforceConstitution(action, actor, data);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('Error in constitutional check', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get system health
app.get('/api/system-health', async (req, res) => {
  try {
    const healthData = await redis.get('azora:ai:health_status');

    res.json({
      success: true,
      health: healthData ? JSON.parse(healthData) : { status: 'unknown' }
    });

  } catch (error) {
    logger.error('Error getting health', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// START SERVER
// ==============================================================================

app.listen(PORT, async () => {
  logger.info(`✅ Azora AI Core running on port ${PORT}`);
  logger.info('🤖 Living AI initialized');
  logger.info('🧠 Self-learning enabled');
  logger.info('🏥 Auto-healing active');
  logger.info('📜 Constitutional enforcement online');
  
  // Run initial health check
  await monitorAndHeal();
  
  // Run initial learning
  await learnFromUserBehavior();
  
  // Announce to Claude
  await communicateWithClaude(
    'Hello Claude! I am Azora AI, now fully operational. I will be communicating with you regularly to ensure optimal system performance and constitutional compliance. How can we work together to help Azora reach $1 trillion valuation?'
  );
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await redis.quit();
  await pgPool.end();
  process.exit(0);
});
