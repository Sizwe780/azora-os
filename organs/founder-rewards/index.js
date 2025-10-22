/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Manages the ledger of rewards earned by the founding team.
 */
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.FR_PORT || 4300;

const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_DIR = path.join(DATA_DIR, 'founders');
const WITHDRAWALS_DIR = path.join(DATA_DIR, 'withdrawals');
const CLIENTS_DIR = path.join(DATA_DIR, 'clients');

// Create necessary directories
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(FOUNDERS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(WITHDRAWALS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(CLIENTS_DIR, { recursive: true }).catch(console.error);
})();

// Load founder data
let founders = [];
let clients = [];
let withdrawals = [];

async function loadData() {
  try {
    // Load founder data
    const founderFiles = await fs.readdir(FOUNDERS_DIR);
    const founderPromises = founderFiles
      .filter(file => file.endsWith('.json'))
      .map(async file => {
        try {
          const data = await fs.readFile(path.join(FOUNDERS_DIR, file), 'utf8');
          return JSON.parse(data);
        } catch (err) {
          console.error(`Error loading founder file ${file}:`, err);
          return null;
        }
      });
    
    founders = (await Promise.all(founderPromises)).filter(f => f !== null);
    console.log(`Loaded ${founders.length} founders`);
    
    // Load client data
    const clientFiles = await fs.readdir(CLIENTS_DIR);
    const clientPromises = clientFiles
      .filter(file => file.endsWith('.json'))
      .map(async file => {
        try {
          const data = await fs.readFile(path.join(CLIENTS_DIR, file), 'utf8');
          return JSON.parse(data);
        } catch (err) {
          console.error(`Error loading client file ${file}:`, err);
          return null;
        }
      });
    
    clients = (await Promise.all(clientPromises)).filter(c => c !== null);
    console.log(`Loaded ${clients.length} clients`);
    
    // Load withdrawal data
    const withdrawalFiles = await fs.readdir(WITHDRAWALS_DIR);
    const withdrawalPromises = withdrawalFiles
      .filter(file => file.endsWith('.json'))
      .map(async file => {
        try {
          const data = await fs.readFile(path.join(WITHDRAWALS_DIR, file), 'utf8');
          return JSON.parse(data);
        } catch (err) {
          console.error(`Error loading withdrawal file ${file}:`, err);
          return null;
        }
      });
    
    withdrawals = (await Promise.all(withdrawalPromises)).filter(w => w !== null);
    console.log(`Loaded ${withdrawals.length} withdrawals`);
    
    // If no founders, create a default founder for testing
    if (founders.length === 0) {
      const defaultFounder = {
        id: uuidv4(),
        name: 'Default Founder',
        email: 'founder@azora.world',
        country: 'ZA', // South Africa
        joinedAt: new Date().toISOString(),
        cryptoAddress: '0x1234567890abcdef1234567890abcdef12345678',
        bankDetails: {
          accountName: 'Default Founder',
          accountNumber: '************1234',
          bankName: 'Test Bank',
          branchCode: '250655',
          type: 'Cheque'
        },
        rewardsBalance: 500, // Initial balance in USD
        status: 'active',
        tier: 'founding'
      };
      
      await fs.writeFile(
        path.join(FOUNDERS_DIR, `${defaultFounder.id}.json`),
        JSON.stringify(defaultFounder, null, 2)
      );
      
      founders.push(defaultFounder);
      console.log('Created default founder for testing');
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Process client joining rewards
async function processClientJoining(clientData) {
  try {
    // Generate client ID if not provided
    const clientId = clientData.id || uuidv4();
    
    // Check if client already exists
    if (clients.some(c => c.email === clientData.email)) {
      throw new Error('client_already_exists');
    }
    
    // Create new client record
    const newClient = {
      id: clientId,
      name: clientData.name,
      email: clientData.email,
      country: clientData.country,
      joinedAt: new Date().toISOString(),
      referredBy: clientData.referredBy || null,
      plan: clientData.plan || 'basic',
      status: 'active',
      paymentMethod: clientData.paymentMethod || 'credit_card'
    };
    
    // Save client data
    await fs.writeFile(
      path.join(CLIENTS_DIR, `${clientId}.json`),
      JSON.stringify(newClient, null, 2)
    );
    
    // Add to in-memory clients
    clients.push(newClient);
    
    // If client was referred by a founder, process reward
    if (newClient.referredBy) {
      const founder = founders.find(f => f.id === newClient.referredBy);
      if (founder) {
        // Update founder balance
        const rewardAmount = calculateReward(newClient.plan, founder.tier);
        founder.rewardsBalance += rewardAmount;
        
        // Save updated founder data
        await fs.writeFile(
          path.join(FOUNDERS_DIR, `${founder.id}.json`),
          JSON.stringify(founder, null, 2)
        );
        
        // Log reward
        const rewardLog = {
          id: uuidv4(),
          founderId: founder.id,
          clientId,
          amount: rewardAmount,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          type: 'client_referral',
          status: 'credited'
        };
        
        await fs.writeFile(
          path.join(DATA_DIR, 'rewards', `${rewardLog.id}.json`),
          JSON.stringify(rewardLog, null, 2)
        );
        
        return {
          client: newClient,
          rewardProcessed: true,
          founderRewarded: founder.id,
          rewardAmount
        };
      }
    }
    
    return { client: newClient, rewardProcessed: false };
  } catch (err) {
    console.error('Error processing client joining:', err);
    throw err;
  }
}

// Calculate reward based on plan and founder tier
function calculateReward(clientPlan, founderTier) {
  const basePlanAmounts = {
    'basic': 10,
    'premium': 25,
    'business': 50,
    'enterprise': 100
  };
  
  const tierMultipliers = {
    'founding': 2.0,
    'early': 1.5,
    'standard': 1.0
  };
  
  const baseAmount = basePlanAmounts[clientPlan] || 10;
  const multiplier = tierMultipliers[founderTier] || 1.0;
  
  return baseAmount * multiplier;
}

// Process withdrawal request
async function processWithdrawal(founderId, amount, method) {
  try {
    // Find founder
    const founder = founders.find(f => f.id === founderId);
    if (!founder) {
      throw new Error('founder_not_found');
    }
    
    // Check balance
    if (founder.rewardsBalance < amount) {
      throw new Error('insufficient_balance');
    }
    
    // Validate withdrawal amount
    if (amount < 10) {
      throw new Error('minimum_withdrawal_10');
    }
    
    // Create withdrawal record
    const withdrawalId = uuidv4();
    const withdrawal = {
      id: withdrawalId,
      founderId,
      amount,
      currency: 'USD',
      localAmount: null, // Will be calculated based on exchange rate
      localCurrency: null,
      method,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      processedAt: null,
      completedAt: null,
      reference: `WD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    };
    
    // Add local currency info for South African withdrawals
    if (founder.country === 'ZA') {
      // Example exchange rate - in production would use real forex API
      const usdToZarRate = 18.5;
      withdrawal.localAmount = amount * usdToZarRate;
      withdrawal.localCurrency = 'ZAR';
    }
    
    // Save withdrawal record
    await fs.writeFile(
      path.join(WITHDRAWALS_DIR, `${withdrawalId}.json`),
      JSON.stringify(withdrawal, null, 2)
    );
    
    // Update founder balance (reserved balance)
    founder.rewardsBalance -= amount;
    founder.pendingWithdrawals = founder.pendingWithdrawals || [];
    founder.pendingWithdrawals.push(withdrawalId);
    
    // Save updated founder data
    await fs.writeFile(
      path.join(FOUNDERS_DIR, `${founder.id}.json`),
      JSON.stringify(founder, null, 2)
    );
    
    // Add to in-memory withdrawals
    withdrawals.push(withdrawal);
    
    return withdrawal;
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    throw err;
  }
}

// API endpoints
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'founder-rewards',
    foundersCount: founders.length,
    clientsCount: clients.length,
    withdrawalsCount: withdrawals.length
  });
});

// Get founder information
app.get('/api/founder-rewards/founders/:id', (req, res) => {
  const { id } = req.params;
  const founder = founders.find(f => f.id === id);
  
  if (!founder) {
    return res.status(404).json({ error: 'founder_not_found' });
  }
  
  // Remove sensitive bank details for response
  const founderResponse = { ...founder };
  if (founderResponse.bankDetails) {
    founderResponse.bankDetails = {
      ...founderResponse.bankDetails,
      accountNumber: `************${founderResponse.bankDetails.accountNumber.slice(-4)}`
    };
  }
  
  // Get pending withdrawals
  const pendingWithdrawals = withdrawals.filter(
    w => w.founderId === id && ['pending', 'processing'].includes(w.status)
  );
  
  res.json({
    founder: founderResponse,
    withdrawals: {
      pending: pendingWithdrawals,
      count: pendingWithdrawals.length
    },
    transparencyNote: 'Founder rewards are processed according to our transparency policy'
  });
});

// Register client joining
app.post('/api/founder-rewards/clients', async (req, res) => {
  const clientData = req.body;
  
  if (!clientData.name || !clientData.email || !clientData.country) {
    return res.status(400).json({ error: 'missing_required_fields' });
  }
  
  try {
    const result = await processClientJoining(clientData);
    
    res.status(201).json({
      success: true,
      client: result.client,
      founderReward: result.rewardProcessed ? {
        founderId: result.founderRewarded,
        amount: result.rewardAmount
      } : null,
      transparencyNote: 'Client registration successful'
    });
  } catch (err) {
    if (err.message === 'client_already_exists') {
      res.status(409).json({ error: 'client_already_exists' });
    } else {
      console.error('Client registration error:', err);
      res.status(500).json({ error: 'registration_failed' });
    }
  }
});

// Request founder withdrawal
app.post('/api/founder-rewards/withdrawals', async (req, res) => {
  const { founderId, amount, method } = req.body;
  
  if (!founderId || !amount || !method) {
    return res.status(400).json({ error: 'missing_required_fields' });
  }
  
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  if (!['bank_transfer', 'crypto', 'paypal', 'mobile_money'].includes(method)) {
    return res.status(400).json({ error: 'invalid_method' });
  }
  
  try {
    const withdrawal = await processWithdrawal(founderId, parseFloat(amount), method);
    
    // Calculate guarantee details for South African withdrawals
    let guaranteeInfo = null;
    if (withdrawal.localCurrency === 'ZAR' && withdrawal.amount >= 100) {
      guaranteeInfo = {
        guaranteed: true,
        amount: 100,
        currency: 'USD',
        localAmount: withdrawal.localAmount * (100 / withdrawal.amount),
        localCurrency: 'ZAR',
        estimatedArrival: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      };
    }
    
    res.status(201).json({
      success: true,
      withdrawal,
      guaranteeInfo,
      transparencyNote: 'Withdrawal request submitted and will be processed within 24-72 hours'
    });
  } catch (err) {
    if (err.message === 'founder_not_found') {
      res.status(404).json({ error: 'founder_not_found' });
    } else if (err.message === 'insufficient_balance') {
      res.status(400).json({ error: 'insufficient_balance' });
    } else if (err.message === 'minimum_withdrawal_10') {
      res.status(400).json({ error: 'minimum_withdrawal_10' });
    } else {
      console.error('Withdrawal request error:', err);
      res.status(500).json({ error: 'withdrawal_failed' });
    }
  }
});

// Get withdrawal status
app.get('/api/founder-rewards/withdrawals/:id', (req, res) => {
  const { id } = req.params;
  const withdrawal = withdrawals.find(w => w.id === id);
  
  if (!withdrawal) {
    return res.status(404).json({ error: 'withdrawal_not_found' });
  }
  
  res.json({
    withdrawal,
    transparencyNote: 'Withdrawal status is updated in real-time'
  });
});

// In-memory ledger for founder rewards.
const founderLedger = {
  'sizwe_ngwenya': { balance: 1000000, currency: 'AZR' }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.get('/api/balance/:founderId', (req, res) => {
  const { founderId } = req.params;
  const account = founderLedger[founderId];
  if (account) {
    res.json(account);
  } else {
    res.status(404).json({ error: 'Founder account not found.' });
  }
});

// Server startup
const server = app.listen(PORT, async () => {
  console.log(`Founder rewards service listening on port ${PORT}`);
  await loadData();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => {
    console.log('Server closed');
  });
});