/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file South African Compliance Service
 * @description Ensures all operations within Azora OS comply with South African legislation.
 */

const express = require('express');
const cors = require('cors');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4210;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const EVENT_CHANNEL = 'azora:events';

const db = require('./database.js');

const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', service: 'sa-compliance', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', service: 'sa-compliance', message, ...context })),
};

/**
 * @typedef {'POPIA' | 'ECT' | 'CPA' | 'NCA' | 'FICA' | 'LRA' | 'BCEA'} LegislationKey
 */

/** @type {Record<LegislationKey, {name: string, regulations: string[], penalties: string}>} */
const SA_LEGISLATION = {
    POPIA: { name: "Protection of Personal Information Act", regulations: ["Data privacy", "Consent", "Data breach notifications"], penalties: "Fines up to R10 million or 10 years imprisonment." },
    ECT: { name: "Electronic Communications and Transactions Act", regulations: ["Electronic signatures", "Consumer protection online", "Cryptography"], penalties: "Varies by offense." },
    CPA: { name: "Consumer Protection Act", regulations: ["Right to fair value", "Right to privacy", "Right to choose"], penalties: "Fines up to 10% of annual turnover." },
    NCA: { name: "National Credit Act", regulations: ["Credit agreements", "Interest rates", "Debt counseling"], penalties: "Fines and imprisonment." },
    FICA: { name: "Financial Intelligence Centre Act", regulations: ["Know Your Customer (KYC)", "Reporting suspicious transactions"], penalties: "Severe fines and imprisonment." },
    LRA: { name: "Labour Relations Act", regulations: ["Unfair dismissal", "Collective bargaining", "Strikes and lock-outs"], penalties: "Compensation and reinstatement." },
    BCEA: { name: "Basic Conditions of Employment Act", regulations: ["Working hours", "Leave", "Termination"], penalties: "Fines and imprisonment." },
};

/** @type {Record<LegislationKey, {status: string, violations: number, lastAudit: Date}>} */
let complianceStatus = {
    POPIA: { status: "Compliant", violations: 0, lastAudit: new Date() },
    ECT: { status: "Compliant", violations: 0, lastAudit: new Date() },
    CPA: { status: "Compliant", violations: 0, lastAudit: new Date() },
    NCA: { status: "Compliant", violations: 0, lastAudit: new Date() },
    FICA: { status: "Compliant", violations: 0, lastAudit: new Date() },
    LRA: { status: "Compliant", violations: 0, lastAudit: new Date() },
    BCEA: { status: "Compliant", violations: 0, lastAudit: new Date() },
};

/**
 * Listens for system events and checks for compliance.
 * @param {string} channel 
 * @param {string} message 
 */
const handleEvent = async (channel, message) => {
    const event = JSON.parse(message);
    logger.info('Compliance event received', { eventType: event.type });

    switch (event.type) {
        case 'USER_REGISTERED':
            await checkPOPIACompliance(event);
            break;
        case 'NMU_STUDENT_REGISTERED':
            logger.info('Processing new NMU student for POPIA compliance.');
            await checkPOPIACompliance(event);
            break;
        case 'BOUNTY_CREATED':
            await checkCPACompliance(event);
            break;
        case 'TRANSACTION_PROCESSED':
            await checkFICACompliance(event);
            break;
        default:
            break;
    }
};

/** @param {any} event */
const checkPOPIACompliance = async (event) => {
    if (!event.payload.consentGiven) {
        logViolation('POPIA', 'User registered without explicit consent.');
    }
};

/** @param {any} event */
const checkCPACompliance = async (event) => {
    if (!event.payload.reward || event.payload.reward <= 0) {
        logViolation('CPA', `Bounty created with invalid reward: ${event.payload.reward}`);
    }
};

/** @param {any} event */
const checkFICACompliance = async (event) => {
    if (event.payload.amount > 10000 && !event.payload.isVerifiedUser) {
        logViolation('FICA', `High-value transaction (${event.payload.amount} AZR) for unverified user.`);
    }
};

/** @param {any} event */
const checkNCACompliance = async (event) => {
    // Placeholder: Check for credit-related violations
    if (event.payload.amount > 50000) {
        logViolation('NCA', `Large credit amount: ${event.payload.amount}`);
    }
};

/** @param {any} event */
const checkLRACompliance = async (event) => {
    // Placeholder: Check for labor violations
    if (event.payload.hours > 48) {
        logViolation('LRA', `Excessive working hours: ${event.payload.hours}`);
    }
};

/** @param {any} event */
const checkBCEACompliance = async (event) => {
    // Placeholder: Check for employment conditions
    if (event.payload.termination && !event.payload.noticeGiven) {
        logViolation('BCEA', 'Termination without notice.');
    }
};

/**
 * Logs a compliance violation to the database and updates the status.
 * @param {LegislationKey} act 
 * @param {string} description 
 */
const logViolation = async (act, description) => {
    try {
        complianceStatus[act].violations++;
        complianceStatus[act].status = "Violation Detected";
        const queryText = 'INSERT INTO compliance_violations(act, description, timestamp) VALUES($1, $2, NOW())';
        await db.query(queryText, [act, description]);
        logger.warn('Compliance violation logged', { act, description });
    } catch (err) {
        logger.error('Failed to log violation to DB', { error: err.message });
    }
};

// API Endpoints
app.get('/api/health', (req, res) => res.status(200).json({ status: 'online' }));

app.get('/api/status', (req, res) => {
    res.json(complianceStatus);
});

app.get('/api/status/:act', (req, res) => {
    const act = req.params.act.toUpperCase();
    if (SA_LEGISLATION[act]) {
        res.json({
            legislation: SA_LEGISLATION[act],
            status: complianceStatus[act]
        });
    } else {
        res.status(404).json({ error: "Legislation not found" });
    }
});

app.get('/api/violations', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || 100);
        const { rows } = await db.query('SELECT * FROM compliance_violations ORDER BY timestamp DESC LIMIT $1', [limit]);
        res.json(rows);
    } catch (err) {
        logger.error('Failed to fetch violations', { error: err.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/report', (req, res) => {
    const report = Object.keys(SA_LEGISLATION).map(act => {
        const key = act;
        return {
            act: key,
            name: SA_LEGISLATION[key].name,
            status: complianceStatus[key].status,
            violations: complianceStatus[key].violations,
            lastAudit: complianceStatus[key].lastAudit.toISOString(),
        };
    });
    res.json(report);
});

const startServer = async () => {
    try {
        const redisClient = redis.createClient({ url: REDIS_URL });
        redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err }));
        await redisClient.connect();
        await redisClient.subscribe(EVENT_CHANNEL, handleEvent);
        logger.info(`Subscribed to event channel: ${EVENT_CHANNEL}`);

        app.listen(PORT, () => {
            logger.info(`South African Compliance Service running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start compliance service', { error: err.message });
        process.exit(1);
    }
};

startServer();
