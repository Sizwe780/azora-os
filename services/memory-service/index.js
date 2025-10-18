/**
 * @file index.js
 * @description The Memory of Azora. Provides a permanent, auditable log for all AI-initiated actions.
 */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5500;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';

const pool = new Pool({ connectionString: DATABASE_URL });

// Initialize the database schema
const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_actions (
                id SERIAL PRIMARY KEY,
                workflow_id VARCHAR(255) NOT NULL,
                workflow_name VARCHAR(255),
                status VARCHAR(50) DEFAULT 'initiated',
                initiated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMPTZ,
                details JSONB
            );
        `);
        console.log('🧠 Memory service database schema is ready.');
    } finally {
        client.release();
    }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

// Endpoint to log the initiation of a workflow
app.post('/api/log', async (req, res) => {
    const { workflowId, workflowName, details } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO ai_actions(workflow_id, workflow_name, details) VALUES($1, $2, $3) RETURNING id',
            [workflowId, workflowName, details]
        );
        console.log(`🧠 MEMORY: Logged initiation of workflow ${workflowId}.`);
        res.status(201).json({ success: true, logId: result.rows[0].id });
    } catch (error) {
        console.error('🧠 MEMORY: Failed to log action:', error.message);
        res.status(500).json({ success: false, error: 'Failed to write to memory.' });
    }
});

// Endpoint to update the status of a logged action
app.patch('/api/log/:workflowId', async (req, res) => {
    const { workflowId } = req.params;
    const { status } = req.body;
    try {
        await pool.query(
            'UPDATE ai_actions SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE workflow_id = $2',
            [status, workflowId]
        );
        console.log(`🧠 MEMORY: Updated status of workflow ${workflowId} to ${status}.`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(`🧠 MEMORY: Failed to update status for ${workflowId}:`, error.message);
        res.status(500).json({ success: false, error: 'Failed to update memory.' });
    }
});

initDb().then(() => {
    app.listen(PORT, () => console.log(`🧠 Memory Service is online on port ${PORT}.`));
});