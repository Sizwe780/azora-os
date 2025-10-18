/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description The Founder's Ledger. Registers founders and triggers Genesis Value Creation events upon compliance.
 */
const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5100;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MINT_CHANNEL = 'azora:mint_commands';
const EVENT_CHANNEL = 'azora:events'; // The central nervous system

const redisClient = redis.createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('FounderLedger Redis Error', err));

// In-memory DB for founders. In production, this would be PostgreSQL.
const founders = {};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

// Register a new founder
app.post('/api/register', (req, res) => {
    const { founderId, name, email } = req.body;
    if (!founderId || !name) {
        return res.status(400).json({ error: 'founderId and name are required.' });
    }
    founders[founderId] = { name, email, compliant: false, registeredAt: new Date().toISOString() };
    console.log(`LEDGER: Founder ${name} (${founderId}) has been registered.`);
    res.status(201).json(founders[founderId]);
});

// Mark a founder as compliant and create value
app.post('/api/set-compliant/:founderId', async (req, res) => {
    const { founderId } = req.params;
    const founder = founders[founderId];

    if (!founder) {
        return res.status(404).json({ error: 'Founder not found.' });
    }
    if (founder.compliant) {
        return res.status(400).json({ error: 'Founder is already compliant.' });
    }

    founder.compliant = true;
    founder.compliantAt = new Date().toISOString();

    // GENESIS VALUE CREATION: Command the Sovereign Minter to create value.
    // This is not just minting coins; it's creating a foundational record.
    const genesisAmount = 1000000; // 1 Million AZR Genesis block
    const mintCommand = JSON.stringify({
        userId: founderId,
        amount: genesisAmount,
        reason: `Genesis Value Creation for Compliant Founder: ${founder.name}`,
        proofId: `founder-compliance-${founderId}`,
        isGenesis: true, // This makes the blockchain more "complicated and valuable"
        founderData: founder 
    });
    await redisClient.publish(MINT_CHANNEL, mintCommand);

    // PUBLISH TO NERVOUS SYSTEM: Announce this critical event to the entire platform.
    const platformEvent = JSON.stringify({
        source: 'founder-ledger',
        type: 'FOUNDER_COMPLIANT',
        payload: { founderId, founderData: founder }
    });
    await redisClient.publish(EVENT_CHANNEL, platformEvent);
    
    console.log(`EVENT: Published FOUNDER_COMPLIANT for ${founder.name} to the central nervous system.`);
    res.json({ success: true, message: 'Founder is now compliant. Genesis value created.' });
});

const start = async () => {
    await redisClient.connect();
    app.listen(PORT, () => {
        console.log(`🧾 Founder Ledger Service is online on port ${PORT}.`);
    });
};
start();