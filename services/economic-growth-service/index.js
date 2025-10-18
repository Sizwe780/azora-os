/**
 * @file Economic Growth & Sovereignty Service
 * @description The strategic core for monitoring, analyzing, and guiding the Azora economy.
 * This service calculates key economic indicators and has the authority to propose fiscal policy changes.
 */

const express = require('express');
const cors = require('cors');
const redis = require('redis');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4300;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const EVENT_CHANNEL = 'azora:events';

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
 * @property {Date} lastUpdated
 */

/** @type {EconomicMetrics} */
let metrics = {
    gdp: 0,
    velocity: 0,
    transactionCount: 0,
    ubiRate: 1.0, // Default starting UBI
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

const startServer = async () => {
    try {
        // Connect to Redis for event stream
        const redisClient = redis.createClient({ url: REDIS_URL });
        redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err }));
        await redisClient.connect();
        await redisClient.subscribe(EVENT_CHANNEL, handleEvent);
        logger.info(`Subscribed to event channel: ${EVENT_CHANNEL}`);

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