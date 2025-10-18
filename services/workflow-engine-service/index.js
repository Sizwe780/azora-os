/**
 * @file index.js
 * @description The Hands of Azora. Executes complex, multi-step workflows defined by the AI.
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const redis = require('redis');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5400;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const EVENT_CHANNEL = 'azora:events';

const redisClient = redis.createClient({ url: REDIS_URL });

const SERVICE_MAP = {
    notification: 'http://notification-service:5300/api',
    // Add other services here as the engine becomes more powerful
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.post('/api/execute', async (req, res) => {
    const { workflow } = req.body;
    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
        return res.status(400).json({ error: 'Invalid workflow definition.' });
    }
    console.log(`⚙️ WORKFLOW ENGINE: Starting workflow "${workflow.name}" (${workflow.id})...`);
    let finalStatus = 'completed';
    let errorMessage = null;

    for (const step of workflow.steps) {
        try {
            const serviceUrl = SERVICE_MAP[step.service];
            if (!serviceUrl) throw new Error(`Unknown service in workflow: ${step.service}`);
            
            const url = `${serviceUrl}/${step.action}`;
            console.log(`⚙️ Executing step: POST ${url}`);
            await axios.post(url, step.params);
        } catch (error) {
            console.error(`⚙️ WORKFLOW FAILED at step "${step.action}":`, error.message);
            finalStatus = 'failed';
            errorMessage = error.message;
            break; // Stop workflow on failure
        }
    }

    // PUBLISH OUTCOME TO THE CENTRAL NERVOUS SYSTEM
    const outcomeEvent = JSON.stringify({
        source: 'workflow-engine',
        type: `WORKFLOW_${finalStatus.toUpperCase()}`,
        payload: { workflowId: workflow.id, workflowName: workflow.name, error: errorMessage }
    });
    await redisClient.publish(EVENT_CHANNEL, outcomeEvent);
    console.log(`⚙️ WORKFLOW ENGINE: Published outcome for ${workflow.id}: ${finalStatus}`);

    if (finalStatus === 'failed') {
        return res.status(500).json({ success: false, error: `Workflow failed` });
    }
    
    console.log(`⚙️ WORKFLOW ENGINE: Workflow "${workflow.name}" completed successfully.`);
    res.status(200).json({ success: true, message: 'Workflow completed.' });
});

const start = async () => {
    await redisClient.connect();
    app.listen(PORT, () => console.log(`⚙️ Workflow Engine is online on port ${PORT}.`));
};
start();