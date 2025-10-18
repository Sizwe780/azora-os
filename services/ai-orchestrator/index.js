/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description AZORA AI - The Sixth Founder. This service acts as the cognitive core of the Azora OS, orchestrating the Unified AI Brain to support users and drive the economy.
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const redis = require('redis');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // ADVANCEMENT #2

const app = express();
let server; // For graceful shutdown

// --- UPGRADE #1: Production-Ready Security ---
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(helmet()); // ADVANCEMENT #2
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

// --- ADVANCEMENT #3: Structured, Production-Ready Logging ---
const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', message, ...context })),
    warn: (message, context = {}) => console.warn(JSON.stringify({ level: 'warn', message, ...context })),
};

// --- ADVANCEMENT #1: API Versioning ---
const apiRouter = express.Router();

// --- Rate Limiting for System Stability ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { id: 'error', title: 'Too many requests. Please try again later.', action: { type: 'none' } }
});
apiRouter.use(limiter);


const PORT = process.env.PORT || 4001;
const UNIFIED_AI_URL = process.env.UNIFIED_AI_URL || 'http://unified-ai-service:4002';
const BOUNTY_API_URL = process.env.BOUNTY_API_URL || 'http://bounty-service:4700/api/bounties';
const CONSTITUTION_API_URL = process.env.CONSTITUTION_API_URL || 'http://constitution-service:5000/api/articles';
const BILLING_API_URL = process.env.BILLING_API_URL || 'http://billing-service:4800/api';
const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://voice-service:4900/api';
const MULTI_LANGUAGE_URL = process.env.MULTI_LANGUAGE_URL || 'http://multi-language-service:5200/api';
const WORKFLOW_ENGINE_URL = process.env.WORKFLOW_ENGINE_URL || 'http://workflow-engine-service:5400/api';
const MEMORY_SERVICE_URL = process.env.MEMORY_SERVICE_URL || 'http://memory-service:5500/api';
const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://learning-service:5600/api';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const EVENT_CHANNEL = 'azora:events';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'secret-admin-key'; // For secure endpoints

let CONSTITUTION = {};
let redisClient;
let isUnifiedAIOffline = false;
let lastAICheck = 0;

const loadConstitution = async () => {
    try {
        const res = await axios.get(CONSTITUTION_API_URL);
        CONSTITUTION = res.data.reduce((acc, article) => {
            acc[article.number] = article;
            return acc;
        }, {});
        logger.info("Constitution loaded successfully.", { articles: Object.keys(CONSTITUTION).length });
    } catch (e) {
        logger.error("Failed to load constitution.", { error: e.message });
    }
};

loadConstitution();

const getJustification = (articleNumber) => {
    const article = CONSTITUTION[articleNumber];
    if (article) {
        return `Art. ${article.number}: ${article.title}`;
    }
    logger.warn(`Justification failed: Article not found.`, { articleNumber });
    return `Art. ${articleNumber}`;
};

const userContextMiddleware = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] || 'anonymous';
        if (userId === 'anonymous') {
            req.userContext = { userId, tier: 'free_citizen', history: [] };
            return next();
        }

        const tierRes = await axios.get(`${BILLING_API_URL}/tier/${userId}`);
        const historyKey = `history:${userId}`;
        const thirtyDaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
        const history = await redisClient.zRange(historyKey, thirtyDaysAgo, '+inf', { BY: 'SCORE' });

        req.userContext = {
            userId,
            tier: tierRes.data.tier || 'free_citizen',
            history: history.map(JSON.parse).reverse()
        };
        next();
    } catch (error) {
        logger.error(`User Context Middleware Error`, { userId: req.headers['x-user-id'], error: error.message });
        req.userContext = { userId: 'anonymous', tier: 'free_citizen', history: [] };
        next();
    }
};

const handleBountyNudge = async (userContext) => {
    // ... existing implementation ...
    return []; // Simplified for brevity
};

// --- ADVANCEMENT #9: Contextual Default Actions ---
const getContextualDefaultActions = (userContext) => {
    const defaults = [
        { id: 'kb-1', title: 'What is Azora?', action: { type: 'query', payload: 'What is Azora?' }, justification: getJustification(1) },
        { id: 'kb-2', title: 'How do I earn AZR?', action: { type: 'query', payload: 'How do I earn AZR?' }, justification: getJustification(10) },
    ];
    if (userContext.tier === 'pro_citizen') {
        defaults.push({ id: 'kb-pro', title: 'Review AI Cognitive Costs', action: { type: 'navigate', payload: '/dashboard/ai-audit' }, justification: getJustification(12) });
    } else {
        defaults.push({ id: 'kb-3', title: 'What is the Founder\'s Ledger?', action: { type: 'query', payload: 'What is the Founder\'s Ledger?' }, justification: getJustification(4) });
    }
    return defaults;
};

const handlePlatformEvent = async (channel, message) => {
    // ... existing implementation ...
};

// --- ADVANCEMENT #8: AI Self-Correction via Feedback (Art. 16) ---
apiRouter.post('/feedback', userContextMiddleware, async (req, res) => {
    try {
        const { interactionId, feedbackValue } = req.body;
        const { userId } = req.userContext;
        logger.info(`Feedback received`, { userId, interactionId, feedbackValue });

        const feedbackData = { interactionId, userId, feedback: feedbackValue, timestamp: new Date() };
        await axios.post(`${LEARNING_SERVICE_URL}/feedback`, feedbackData);

        if (feedbackValue === 'negative') {
            logger.info('Negative feedback detected. Triggering self-correction workflow.', { interactionId });
            await axios.post(`${WORKFLOW_ENGINE_URL}/execute`, {
                workflow: {
                    name: 'AI-Self-Correction-Workflow',
                    id: `self-correct-${interactionId}`,
                    steps: [{ service: 'learning', action: 'analyze_negative_feedback', params: feedbackData }]
                }
            });
        }
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        logger.error("Failed to process feedback", { error: error.message });
        res.status(500).json({ status: 'error', message: 'Could not process feedback.' });
    }
});

apiRouter.post('/command', userContextMiddleware, async (req, res, next) => {
    try {
        let { query } = req.body;
        const { userContext } = req;

        if (!query) {
            const bountyNudge = await handleBountyNudge(userContext);
            const defaultActions = getContextualDefaultActions(userContext);
            return res.json([...bountyNudge, ...defaultActions]);
        }

        const historyKey = `history:${userContext.userId}`;
        if (userContext.userId !== 'anonymous') {
            const timestamp = new Date().getTime();
            const thirtyDaysAgo = timestamp - (30 * 24 * 60 * 60 * 1000);
            await redisClient.zAdd(historyKey, { score: timestamp, value: JSON.stringify({ query, timestamp: new Date(timestamp) }) });
            await redisClient.zRemRangeByScore(historyKey, '-inf', thirtyDaysAgo);
        }

        if (isUnifiedAIOffline && Date.now() - lastAICheck < 60000) {
            return res.status(503).json({ id: 'error', title: 'AI core is temporarily offline for self-healing.', action: { type: 'none' } });
        }

        // 1. META-COGNITION: Formulate a dynamic cognitive plan.
        const planResponse = await axios.post(`${UNIFIED_AI_URL}/execute`, { model: 'cognitive-router-v1', content: { ...userContext, query } });
        const cognitivePlan = planResponse.data.response.plan;
        console.log(`Cognitive Plan for query "${query}":`, cognitivePlan);

        // --- ADVANCEMENT #8: Enhanced Premium Feature Gate (Art. 13) ---
        const requiresPro = cognitivePlan.some(model => ['quantum-deep-mind', 'llama-2-70b'].includes(model));
        if (requiresPro && userContext.tier !== 'pro_citizen') {
            return res.json([{
                id: 'request-upgrade',
                action: {
                    type: 'request_upgrade',
                    payload: {
                        title: 'Pro Citizen Feature',
                        explanation: `This request requires Pro Citizen cognitive models, as defined by the Azora Constitution.`,
                        justification: getJustification(13)
                    }
                }
            }]);
        }

        // 2. DYNAMIC ORCHESTRATION: Execute the generated plan.
        const aiTasks = cognitivePlan.map(modelName => {
            const startTime = Date.now();
            return axios.post(`${UNIFIED_AI_URL}/execute`, { model: modelName, content: { ...userContext, query } })
                .then(res => {
                    // --- ADVANCEMENT #4: AI Cost & Performance Auditing (Art. 12) ---
                    const duration = Date.now() - startTime;
                    console.log(`AUDIT: Model=${modelName} Duration=${duration}ms Cost=${res.data.cost || 0}`);
                    return res;
                });
        });
        const results = await Promise.all(aiTasks);
        isUnifiedAIOffline = false; // Success, so reset circuit breaker
        
        const getResult = (modelName) => results.find(r => r.data.model === modelName)?.data.response;
        
        const insight = getResult('llama-2-70b');
        // ... other results ...

        // 3. Synthesize and Act
        const response = [];
        // ... existing response synthesis logic (bounty nudge, insights, etc.) ...

        // --- ADVANCEMENT #6: User Feedback Loop (Art. 16) ---
        const interactionId = `interaction-${userContext.userId}-${Date.now()}`;
        response.push({
            id: 'feedback-request',
            title: 'Was this response helpful?',
            action: {
                type: 'feedback',
                payload: {
                    interactionId,
                    endpoint: '/api/feedback', // Provide endpoint for the frontend
                    options: [
                        { label: '👍', value: 'positive' },
                        { label: '👎', value: 'negative' }
                    ]
                }
            },
            justification: getJustification(16)
        });

        if (language !== 'en') {
            // ... existing translation logic ...
        }

        res.json(response);

    } catch (error) {
        // --- ADVANCEMENT #7 (cont.): Trip Circuit Breaker on AI failure ---
        if (error.response?.config.url.includes(UNIFIED_AI_URL)) {
            console.error("CIRCUIT BREAKER: Unified AI service appears to be offline. Tripping breaker.");
            isUnifiedAIOffline = true;
            lastAICheck = Date.now();
        }
        next(error); // Pass to centralized error handler
    }
});

// --- ADVANCEMENT #10: Centralized Error Handling ---
app.use((err, req, res, next) => {
    console.error("AI Orchestration Failed:", err.message);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ id: 'error', title: 'AI core encountered an unexpected error. The system is self-healing.', action: { type: 'none' } });
});


const start = async () => {
    // Connect to the central nervous system
    redisClient = redis.createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.error('AI Orchestrator Redis Error', err));
    await redisClient.connect();
    
    // Subscribe to events and awaken the proactive AI
    await redisClient.subscribe(EVENT_CHANNEL, (message, channel) => handlePlatformEvent(channel, message));
    console.log(`👁️ Proactive AI is now listening to the central nervous system on channel '${EVENT_CHANNEL}'`);

    app.listen(PORT, () => {
        console.log(`🚀 AI Orchestrator is online on port ${PORT}, providing proactive support.`);
    });
};

start();
