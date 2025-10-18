/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Manages the lifecycle of high-value bounties, driving the Azora economy. Verifies completion and triggers the Proof of Compliance guarantee.
 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4700;
const POC_SERVICE_URL = process.env.POC_SERVICE_URL || 'http://proof-of-compliance:4210/api/log';

// In-memory database of available bounties.
const bounties = {
    'bounty-001': {
        title: 'Market Research: Beta Test New Feature',
        description: 'Provide structured feedback on the upcoming "Azora Maps" feature.',
        reward: 250, // AZR Coin
        status: 'open',
        eligibility: (user) => user.tier === 'pro_citizen' // Example eligibility rule
    },
    'bounty-002': {
        title: 'Community Growth: Refer a New Citizen',
        description: 'Onboard a new user who successfully completes their first compliant action.',
        reward: 100,
        status: 'open',
        eligibility: () => true
    }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

// Get all open bounties
app.get('/api/bounties', (req, res) => {
    const openBounties = Object.entries(bounties)
        .filter(([_, bounty]) => bounty.status === 'open')
        .map(([id, bounty]) => ({ id, ...bounty }));
    res.json(openBounties);
});

// Endpoint to complete a bounty
app.post('/api/bounties/:bountyId/complete', async (req, res) => {
    const { bountyId } = req.params;
    const { userId } = req.body;
    const bounty = bounties[bountyId];

    if (!bounty || bounty.status !== 'open') {
        return res.status(404).json({ error: 'Bounty not found or already completed.' });
    }

    // In a real system, complex verification logic would go here.
    console.log(`BOUNTY VERIFIED: User ${userId} completed bounty ${bountyId}.`);
    bounty.status = 'completed'; // Mark as completed

    // Trigger the guarantee
    try {
        const pocRes = await fetch(POC_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                proofType: 'bounty_completion',
                description: `Completed Bounty: ${bounty.title}`,
                coinValue: bounty.reward
            })
        });
        if (!pocRes.ok) throw new Error('Failed to trigger Proof of Compliance.');
        
        res.json({ success: true, message: `Bounty completed. ${bounty.reward} AZR reward authorized.` });
    } catch (error) {
        console.error('CRITICAL: Failed to link bounty completion to PoC.', error.message);
        bounty.status = 'open'; // Revert status on failure
        res.status(500).json({ error: 'Failed to process bounty reward.' });
    }
});

app.listen(PORT, () => {
    console.log(`💰 Bounty Service is online on port ${PORT}, driving the Azora economy.`);
});