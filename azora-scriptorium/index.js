/**
 * @file Open Source Advancement Service
 * @description Facilitates and rewards open source code contributions in line with the Open Source Code Advancement Act.
 */

const express = require('express');
const cors = require('cors');
const redis = require('redis');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4500;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const EVENT_CHANNEL = 'azora:events';
const MINTER_URL = process.env.MINTER_URL || 'http://sovereign-minter:4000';

const pool = new Pool({ connectionString: DATABASE_URL });
const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', service: 'open-source-advancement', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', service: 'open-source-advancement', message, ...context })),
};

let redisPublisher;

/**
 * Submits a contribution and rewards if approved.
 */
app.post('/api/contribute', async (req, res) => {
    const { contributorId, repoUrl, description } = req.body;
    if (!contributorId || !repoUrl || !description) {
        return res.status(400).json({ error: 'Missing fields.' });
    }

    try {
        // Simplified audit: Check if repo is public (placeholder)
        const auditPassed = true; // In reality, integrate with GitHub API or similar

        if (auditPassed) {
            // Reward with AZR minting
            await axios.post(`${MINTER_URL}/mint`, {
                to: contributorId,
                amount: 10, // Reward 10 AZR for contribution
                reason: 'Open source contribution reward'
            });

            // Log to DB
            await pool.query(
                'INSERT INTO open_source_contributions(contributor_id, repo_url, description, rewarded_at) VALUES($1, $2, $3, NOW())',
                [contributorId, repoUrl, description]
            );

            logger.info('Contribution rewarded', { contributorId, repoUrl });
            res.status(200).json({ message: 'Contribution accepted and rewarded.' });
        } else {
            res.status(400).json({ error: 'Contribution failed audit.' });
        }
    } catch (err) {
        logger.error('Contribution processing failed', { error: err.message });
        res.status(500).json({ error: 'Internal error.' });
    }
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'online' }));

const startServer = async () => {
    try {
        redisPublisher = redis.createClient({ url: REDIS_URL });
        redisPublisher.on('error', (err) => logger.error('Redis Publisher Error', { error: err }));
        await redisPublisher.connect();

        await pool.query(`
            CREATE TABLE IF NOT EXISTS open_source_contributions (
                id SERIAL PRIMARY KEY,
                contributor_id TEXT NOT NULL,
                repo_url TEXT NOT NULL,
                description TEXT,
                rewarded_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        app.listen(PORT, () => {
            logger.info(`Open Source Advancement Service running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start service', { error: err.message });
        process.exit(1);
    }
};

startServer();