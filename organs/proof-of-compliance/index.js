/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Guarantees user benefits by recording "proofs" of compliant actions and triggering the minting of Azora Coin rewards via the crypto ledger.
 */
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4210;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/azora_db';
const MINT_CHANNEL = 'azora:mint_commands';

// --- Premium Trimming: Database Connection Pool ---
const pool = new Pool({ connectionString: DATABASE_URL });

// --- Premium Trimming: Structured Logger ---
const logger = {
    info: (message, context) => console.log(JSON.stringify({ level: 'info', message, ...context })),
    error: (message, context) => console.error(JSON.stringify({ level: 'error', message, ...context })),
};

const redisClient = redis.createClient({ url: REDIS_URL });
redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));

// The core endpoint to log a new proof and guarantee the reward
app.post('/api/log', async (req, res) => {
    const { userId, proofType, description, coinValue } = req.body;
    if (!userId || !proofType || !coinValue) {
        return res.status(400).json({ error: 'userId, proofType, and coinValue are required.' });
    }

    const proofId = `poc-${Date.now()}`;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // GUARANTEE 1: Persist the proof to the database
        const queryText = 'INSERT INTO proofs(proof_id, user_id, proof_type, description, coin_value) VALUES($1, $2, $3, $4, $5) RETURNING *';
        const queryValues = [proofId, userId, proofType, description, coinValue];
        await client.query(queryText, queryValues);
        logger.info('Proof persisted to database', { proofId, userId });

        // GUARANTEE 2: Publish an authorized minting command to the secure channel
        const command = JSON.stringify({ userId, amount: coinValue, reason: description, proofId });
        await redisClient.publish(MINT_CHANNEL, command);
        logger.info('Mint command published', { proofId, channel: MINT_CHANNEL });
        
        await client.query('COMMIT');
        res.status(201).json({ proofId, message: 'Proof logged and reward authorized.' });

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Failed to process proof', { proofId, error: error.message });
        res.status(500).json({ error: 'Failed to log proof or authorize reward.' });
    } finally {
        client.release();
    }
});

app.get('/api/proofs/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM proofs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        logger.error('Failed to retrieve proofs', { userId, error: error.message });
        res.status(500).json({ error: 'Failed to retrieve proofs.' });
    }
});

// --- Initialize Database and Start Server ---
async function initialize() {
    try {
        await redisClient.connect();
        logger.info('Connected to Redis');

        const client = await pool.connect();
        logger.info('Connected to PostgreSQL');
        
        // Idempotent table creation
        await client.query(`
            CREATE TABLE IF NOT EXISTS proofs (
                id SERIAL PRIMARY KEY,
                proof_id VARCHAR(255) UNIQUE NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                proof_type VARCHAR(100) NOT NULL,
                description TEXT,
                coin_value NUMERIC(18, 8) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        logger.info('Database table "proofs" is ready');
        client.release();

        app.listen(PORT, () => {
            logger.info(`🧾 Proof of Compliance Service is online on port ${PORT}, guaranteeing user benefits with persistent storage.`);
        });

    } catch (e) {
        logger.error('FATAL: Service initialization failed.', { error: e.message });
        process.exit(1);
    }
}

initialize();