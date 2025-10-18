/**
 * @file index.js
 * @description The Reflective Mind of Azora. Analyzes the AI's memory to generate learned rules for self-improvement.
 */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
app.use(cors());

const PORT = 5600;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const pool = new Pool({ connectionString: DATABASE_URL });

// In-memory cache for learned rules.
let learnedRules = [];

// The core learning function.
const reflectOnExperience = async () => {
    console.log('🤔 LEARNING: Reflecting on past actions...');
    try {
        const { rows } = await pool.query(`
            SELECT workflow_name, status, COUNT(*) as count
            FROM ai_actions
            GROUP BY workflow_name, status;
        `);

        const stats = {};
        rows.forEach(row => {
            if (!stats[row.workflow_name]) {
                stats[row.workflow_name] = { completed: 0, failed: 0 };
            }
            stats[row.workflow_name][row.status] = parseInt(row.count, 10);
        });

        const newRules = [];
        for (const workflowName in stats) {
            const { completed, failed } = stats[workflowName];
            const total = completed + failed;
            const failureRate = total > 0 ? failed / total : 0;

            if (failureRate > 0.5 && total > 10) { // High failure rate threshold
                newRules.push({
                    type: 'alert',
                    subject: workflowName,
                    metric: 'failure_rate',
                    value: failureRate,
                    recommendation: `Workflow ${workflowName} has a critical failure rate. Intervene immediately.`
                });
            }
        }
        learnedRules = newRules;
        console.log('🤔 LEARNING: Reflection complete. New rules generated:', learnedRules);
    } catch (error) {
        console.error('🤔 LEARNING: Failed during reflection:', error.message);
    }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));
app.get('/api/rules', (req, res) => res.json(learnedRules));

const start = () => {
    // Begin the cycle of reflection, as mandated by the constitution.
    setInterval(reflectOnExperience, 60000); // Reflect every 60 seconds.
    app.listen(PORT, () => console.log(`🤔 Learning Service is online on port ${PORT}.`));
};
start();