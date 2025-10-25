/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Economic Growth & Sovereignty Service
 * @description The strategic core for monitoring, analyzing, and guiding the Azora economy.
 * This service calculates key economic indicators and has the authority to propose fiscal policy changes.
 */

import express from 'express';
import cors from 'cors';
import { createClient as createRedisClient } from 'redis';
import bodyParser from 'body-parser';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4300;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const EVENT_CHANNEL = 'azora:events';

// Proof-of-Knowledge Protocol Configuration
const PROOF_OF_KNOWLEDGE_REWARDS = {
    'module_completion': {
        'basic': 100,      // Basic module completion
        'intermediate': 150, // Module with assessment
        'advanced': 200    // Challenging module
    },
    'assessment_pass': {
        'practical_exam': 300,
        'code_audit': 400,
        'capstone_project': 500
    },
    'certificate_achievement': {
        'ckq_basic': 1000,    // Complete CKQ certification
        'ckq_advanced': 2000  // Advanced CKQ certification
    },
    'milestone_bonus': {
        'first_module': 50,   // First module completed
        'halfway_point': 150, // Halfway through program
        'final_project': 250  // Final capstone project
    }
};

const pool = new Pool({ connectionString: DATABASE_URL });
const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', service: 'economic-growth', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', service: 'economic-growth', message, ...context })),
    warn: (message, context = {}) => console.warn(JSON.stringify({ level: 'warn', service: 'economic-growth', message, ...context })),
};

/**
 * @typedef {object} EconomicMetrics
 * @property {number} gdp - Gross Domestic Product: Total value of transactions.
 * @property {number} velocity - Velocity of AZR: How frequently currency is used.
 * @property {number} transactionCount - Total number of transactions.
 * @property {number} ubiRate - Current Universal Basic Income rate.
 * @property {number} uboFund - Universal Basic Opportunity Fund balance.
 * @property {number} knowledgeRewardsPaid - Total Proof-of-Knowledge rewards distributed.
 * @property {Date} lastUpdated
 */

/** @type {EconomicMetrics} */
let metrics = {
    gdp: 0,
    velocity: 0,
    transactionCount: 0,
    ubiRate: 1.0, // Default starting UBI
    uboFund: 10000000, // 10M aZAR in UBO Fund (1% of total supply)
    knowledgeRewardsPaid: 0,
    lastUpdated: new Date(),
};

/**
 * Recalculates all economic metrics from the database.
 */
async function recalculateMetrics() {
    try {
        const { rows } = await pool.query(`
            SELECT
                COALESCE(SUM(amount), 0) AS gdp,
                COUNT(*) AS transaction_count
            FROM transactions WHERE timestamp > NOW() - INTERVAL '30 days';
        `);

        const thirtyDayStats = rows[0];
        const { rows: ubiRows } = await pool.query('SELECT rate FROM ubi_rates ORDER BY effective_date DESC LIMIT 1');

        metrics.gdp = parseFloat(thirtyDayStats.gdp);
        metrics.transactionCount = parseInt(thirtyDayStats.transaction_count, 10);
        // A simple velocity model. More complex models can be added.
        metrics.velocity = metrics.gdp > 0 ? metrics.transactionCount / metrics.gdp : 0;
        metrics.ubiRate = ubiRows.length > 0 ? parseFloat(ubiRows[0].rate) : metrics.ubiRate;
        metrics.lastUpdated = new Date();

        logger.info('Economic metrics recalculated', { metrics });
        await checkEconomicHealth();
    } catch (err) {
        logger.error('Failed to recalculate metrics', { error: err.message });
    }
}

/**
 * Analyzes metrics and proposes policy changes if targets are not met.
 */
async function checkEconomicHealth() {
    const GDP_GROWTH_TARGET = 0.05; // Target 5% GDP growth period-over-period (placeholder)

    // Example policy: If GDP is growing, consider increasing UBI to stimulate further.
    // This is a highly simplified model. A real-world implementation would be far more complex.
    if (metrics.gdp > 10000 && metrics.velocity > 0.1) { // Arbitrary health thresholds
        const proposedUbiRate = metrics.ubiRate * (1 + GDP_GROWTH_TARGET);
        logger.warn('Proposing UBI Rate Increase', { current: metrics.ubiRate, proposed: proposedUbiRate, reason: "Sustained GDP growth and healthy velocity." });

        // In a real system, this would be a proposal requiring consensus. Here we auto-approve.
        await pool.query('INSERT INTO ubi_rates(rate, effective_date) VALUES($1, NOW())', [proposedUbiRate]);
        metrics.ubiRate = proposedUbiRate;
        logger.info('Fiscal Policy Update: UBI rate increased.', { newRate: proposedUbiRate });
    }
}

/**
 * Get next milestone suggestions based on current achievement
 */
function getNextMilestones(rewardType, rewardCategory, programId) {
    const suggestions = [];

    switch (rewardType) {
        case 'module_completion':
            if (rewardCategory === 'basic') {
                suggestions.push({
                    type: 'module_completion',
                    category: 'intermediate',
                    description: 'Complete next module with assessment',
                    potentialReward: PROOF_OF_KNOWLEDGE_REWARDS.module_completion.intermediate
                });
            }
            break;

        case 'assessment_pass':
            suggestions.push({
                type: 'certificate_achievement',
                category: 'ckq_basic',
                description: 'Complete full CKQ certification',
                potentialReward: PROOF_OF_KNOWLEDGE_REWARDS.certificate_achievement.ckq_basic
            });
            break;

        case 'certificate_achievement':
            if (rewardCategory === 'ckq_basic') {
                suggestions.push({
                    type: 'certificate_achievement',
                    category: 'ckq_advanced',
                    description: 'Pursue CKQ-Advanced program',
                    potentialReward: PROOF_OF_KNOWLEDGE_REWARDS.certificate_achievement.ckq_advanced
                });
            }
            break;
    }

    return suggestions;
}

/**
 * @param {string} channel
 * @param {string} message
 */
const handleEvent = async (channel, message) => {
    try {
        const event = JSON.parse(message);
        if (event.type === 'TRANSACTION_PROCESSED') {
            // Incrementally update metrics for real-time feel
            metrics.gdp += event.payload.amount;
            metrics.transactionCount++;
            logger.info('Incremental metric update', { amount: event.payload.amount });
        } else if (event.type === 'KNOWLEDGE_REWARD_PAID') {
            // Track knowledge reward payments
            metrics.knowledgeRewardsPaid += event.payload.amount;
            metrics.uboFund -= event.payload.amount;
            logger.info('Knowledge reward payment recorded', {
                userId: event.payload.userId,
                amount: event.payload.amount,
                achievement: event.payload.achievement
            });
        }
    } catch (err) {
        logger.error('Error handling event', { error: err.message });
    }
};

// API Endpoints
app.get('/api/health', (req, res) => res.status(200).json({ status: 'online', service: 'economic-growth-service' }));
app.get('/api/metrics', (req, res) => res.json(metrics));
app.post('/api/recalculate', async (req, res) => {
    await recalculateMetrics();
    res.status(202).json({ message: 'Recalculation initiated.' });
});

// Proof-of-Knowledge Protocol Endpoints
app.get('/api/ubo/status', (req, res) => {
    res.json({
        uboFund: {
            balance: metrics.uboFund,
            totalRewardsPaid: metrics.knowledgeRewardsPaid,
            remainingFunds: metrics.uboFund,
            allocationRate: 0.01 // 1% of total supply
        },
        proofOfKnowledge: {
            rewardsDistributed: metrics.knowledgeRewardsPaid,
            activeRewards: PROOF_OF_KNOWLEDGE_REWARDS,
            lastPayment: new Date().toISOString()
        }
    });
});

app.post('/api/knowledge-reward', async (req, res) => {
    const { userId, rewardType, rewardCategory, achievement, programId, moduleName } = req.body;

    if (!userId || !rewardType || !rewardCategory) {
        return res.status(400).json({
            error: 'Missing required fields: userId, rewardType, rewardCategory'
        });
    }

    // Validate reward exists
    if (!PROOF_OF_KNOWLEDGE_REWARDS[rewardType] ||
        !PROOF_OF_KNOWLEDGE_REWARDS[rewardType][rewardCategory]) {
        return res.status(400).json({
            error: 'Invalid reward type or category'
        });
    }

    const rewardAmount = PROOF_OF_KNOWLEDGE_REWARDS[rewardType][rewardCategory];

    // Check UBO fund balance
    if (metrics.uboFund < rewardAmount) {
        return res.status(402).json({
            error: 'Insufficient UBO funds for reward payment'
        });
    }

    try {
        // Record the reward payment
        const rewardRecord = {
            id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            rewardType,
            rewardCategory,
            amount: rewardAmount,
            achievement: achievement || `${rewardCategory} ${rewardType}`,
            programId: programId || null,
            moduleName: moduleName || null,
            timestamp: new Date().toISOString(),
            currency: 'aZAR',
            source: 'UBO_FUND'
        };

        // Update metrics
        metrics.uboFund -= rewardAmount;
        metrics.knowledgeRewardsPaid += rewardAmount;

        // In production, this would update the user's wallet balance
        // For now, we'll simulate the payment
        console.log(`💰 Proof-of-Knowledge: Paid ${rewardAmount} aZAR to ${userId} for ${achievement}`);

        // Log to database (simplified)
        await pool.query(`
            INSERT INTO knowledge_rewards(user_id, reward_type, reward_category, amount, achievement, program_id, module_name, timestamp)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            userId, rewardType, rewardCategory, rewardAmount,
            rewardRecord.achievement, programId, moduleName, rewardRecord.timestamp
        ]);

        res.json({
            success: true,
            reward: rewardRecord,
            message: `Congratulations! You have been rewarded ${rewardAmount} aZAR for ${achievement}`,
            uboFundRemaining: metrics.uboFund,
            nextMilestones: getNextMilestones(rewardType, rewardCategory, programId)
        });

    } catch (error) {
        logger.error('Failed to process knowledge reward', { error: error.message });
        res.status(500).json({ error: 'Failed to process reward payment' });
    }
});

app.get('/api/knowledge-rewards/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const { rows } = await pool.query(`
            SELECT * FROM knowledge_rewards
            WHERE user_id = $1
            ORDER BY timestamp DESC
            LIMIT 50
        `, [userId]);

        const totalEarned = rows.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);

        res.json({
            userId,
            rewards: rows,
            totalEarned,
            rewardCount: rows.length,
            averageReward: rows.length > 0 ? totalEarned / rows.length : 0
        });

    } catch (error) {
        logger.error('Failed to fetch knowledge rewards', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch reward history' });
    }
});

app.get('/api/knowledge-rewards/stats', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                COUNT(*) as total_rewards,
                SUM(amount) as total_amount,
                AVG(amount) as average_reward,
                reward_type,
                reward_category
            FROM knowledge_rewards
            GROUP BY reward_type, reward_category
            ORDER BY total_amount DESC
        `);

        res.json({
            globalStats: {
                totalRewardsPaid: metrics.knowledgeRewardsPaid,
                totalStudentsRewarded: rows.length,
                averageRewardPerStudent: rows.length > 0 ? metrics.knowledgeRewardsPaid / rows.length : 0
            },
            rewardBreakdown: rows,
            uboFundStatus: {
                remaining: metrics.uboFund,
                utilizationRate: metrics.uboFund > 0 ? (metrics.knowledgeRewardsPaid / (metrics.uboFund + metrics.knowledgeRewardsPaid)) * 100 : 0
            }
        });

    } catch (error) {
        logger.error('Failed to fetch reward stats', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch reward statistics' });
    }
});

const startServer = async () => {
    try {
        // Connect to Redis for event stream (optional for testing)
        let redisClient;
        try {
            redisClient = createRedisClient({ url: REDIS_URL });
            await redisClient.connect();
            await redisClient.subscribe(EVENT_CHANNEL, handleEvent);
            logger.info(`Subscribed to event channel: ${EVENT_CHANNEL}`);
        } catch (redisError) {
            logger.warn('Redis not available, running without event streaming', { error: redisError.message });
        }

        // Schedule periodic full recalculation (e.g., every hour)
        setInterval(recalculateMetrics, 1000 * 60 * 60);
        await recalculateMetrics(); // Initial calculation

        app.listen(PORT, () => {
            logger.info(`Economic Growth & Sovereignty Service running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start service', { error: err.message });
        process.exit(1);
    }
};

startServer();
