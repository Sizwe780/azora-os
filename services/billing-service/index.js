/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description The commercial heart of Azora. Manages subscription tiers and citizen status.
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4800;

// In-memory DB for user subscription status.
const citizenTiers = {
    'sizwe_ngwenya': { tier: 'free_citizen' } // Default to free
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

// Get a user's subscription status
app.get('/api/tier/:userId', (req, res) => {
    const { userId } = req.params;
    const status = citizenTiers[userId] || { tier: 'free_citizen' };
    res.json(status);
});

app.listen(PORT, () => {
    console.log(`💵 Billing Service is online on port ${PORT}, managing citizen tiers.`);
});
