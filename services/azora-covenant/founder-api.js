/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora ES Founder API
 *
 * Enables instant founder registration and withdrawal
 * with blockchain verification to maintain $10M valuation
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const blockchain = require('./blockchain');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Configure server
const PORT = process.env.FOUNDER_API_PORT || 6789;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');

// Initialize data
let founders = [];

// Create data directory
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Error creating data directory:', err);
    }
  }
  
  // Load founders data if exists
  try {
    const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
    founders = JSON.parse(data);
    console.log(`Loaded ${founders.length} founders`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create initial founders file
      await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
      console.log('Created empty founders file');
    } else {
      console.error('Error loading founders:', err);
    }
  }
  
  // Initialize the blockchain
  await blockchain.initialize();
})();

// Save founders data
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'founder-api',
    blockchain: blockchain.initialized ? 'ready' : 'initializing',
    complexity: {
      tier: blockchain.currentComplexityTier,
      type: blockchain.initialized ? 
        COMPLEXITY_TIERS[blockchain.currentComplexityTier].consensusType : 'initializing'
    },
    foundersCount: founders.length,
    timestamp: new Date().toISOString()
  });
});

// Get all founders (public info)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    registered: f.registered,
    walletAddress: f.walletAddress
  }));
  
  res.json({ founders: publicFounders });
});

// Register a new founder with instant withdrawal capability
app.post('/api/founders/register', async (req, res) => {
  try {
    const { name, email, role, allocation } = req.body;
    
    // Validate required fields
    if (!name || !email || !role || !allocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate founder ID
    const id = `f-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Create founder record
    const founder = {
      id,
      name,
      email,
      role,
      registered: new Date().toISOString(),
      allocation: {
        total: allocation,
        personal: allocation * 0.4, // 40% as per constitution
        reinvestment: allocation * 0.6 // 60% as per constitution
      },
      withdrawals: [],
      reinvestments: []
    };
    
    // Register on blockchain to enable instant withdrawals
    const registrationResult = await blockchain.createFounderRegistration(
      id,
      name,
      allocation
    );
    
    // Update founder with wallet address
    founder.walletAddress = registrationResult.wallet.address;
    
    // Add to founders list
    founders.push(founder);
    await saveFounders();
    
    res.status(201).json({
      message: 'Founder registered successfully with instant withdrawal capability',
      founder: {
        id: founder.id,
        name: founder.name,
        walletAddress: founder.walletAddress,
        allocation: founder.allocation
      },
      wallet: {
        address: registrationResult.wallet.address,
        balance: registrationResult.wallet.balance
      },
      transaction: registrationResult.transaction.hash
    });
  } catch (err) {
    console.error('Error registering founder:', err);
    res.status(500).json({ error: 'Failed to register founder' });
  }
});

// Process an instant withdrawal for a founder
app.post('/api/founders/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, withdrawalType } = req.body;
    
    // Validate withdrawal type
    if (!['personal', 'reinvestment'].includes(withdrawalType)) {
      return res.status(400).json({ error: 'Invalid withdrawal type' });
    }
    
    // Find founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    const founder = founders[founderIndex];
    
    // Validate amount based on withdrawal type
    const maxAmount = withdrawalType === 'personal' ? 
      founder.allocation.personal : founder.allocation.reinvestment;
    
    const withdrawnAmount = withdrawalType === 'personal' ?
      founder.withdrawals.reduce((sum, w) => sum + w.amount, 0) :
      founder.reinvestments.reduce((sum, r) => sum + r.amount, 0);
    
    const availableAmount = maxAmount - withdrawnAmount;
    
    if (amount > availableAmount) {
      return res.status(400).json({ 
        error: 'Insufficient funds',
        available: availableAmount,
        requested: amount
      });
    }
    
    // Process withdrawal on blockchain
    const withdrawalResult = await blockchain.processWithdrawal(
      founder.walletAddress,
      amount,
      withdrawalType
    );
    
    // Record withdrawal
    const withdrawal = {
      id: `w-${Date.now()}`,
      amount,
      timestamp: new Date().toISOString(),
      type: withdrawalType,
      transactionHash: withdrawalResult.transaction.hash
    };
    
    // Update founder record
    if (withdrawalType === 'personal') {
      founders[founderIndex].withdrawals.push(withdrawal);
    } else {
      founders[founderIndex].reinvestments.push(withdrawal);
    }
    
    await saveFounders();
    
    res.json({
      message: 'Withdrawal processed successfully',
      withdrawal,
      wallet: withdrawalResult.wallet,
      remaining: {
        personal: founder.allocation.personal - 
          [...founder.withdrawals, withdrawalType === 'personal' ? withdrawal : null]
            .filter(Boolean)
            .reduce((sum, w) => sum + w.amount, 0),
        reinvestment: founder.allocation.reinvestment -
          [...founder.reinvestments, withdrawalType === 'reinvestment' ? withdrawal : null]
            .filter(Boolean)
            .reduce((sum, r) => sum + r.amount, 0)
      }
    });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get blockchain valuation proof
app.get('/api/valuation-proof', async (req, res) => {
  try {
    const proof = await blockchain.generateValuationProof();
    res.json(proof);
  } catch (err) {
    console.error('Error generating valuation proof:', err);
    res.status(500).json({ error: 'Failed to generate valuation proof' });
  }
});

// Get founder withdrawals
app.get('/api/founders/:id/withdrawals', (req, res) => {
  const { id } = req.params;
  
  // Find founder
  const founder = founders.find(f => f.id === id);
  if (!founder) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  res.json({
    founderId: id,
    founderName: founder.name,
    personal: founder.withdrawals,
    reinvestment: founder.reinvestments,
    total: [
      ...founder.withdrawals.map(w => ({ ...w, category: 'personal' })),
      ...founder.reinvestments.map(r => ({ ...r, category: 'reinvestment' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  });
});

// Get blockchain explorer data
app.get('/api/blockchain/explorer', async (req, res) => {
  try {
    const latestBlocks = blockchain.getLatestBlocks(10);
    const verificationStatus = await blockchain.verifyChain();
    const valuationProof = await blockchain.generateValuationProof();
    
    res.json({
      chainStatus: {
        length: blockchain.chain.length,
        isValid: verificationStatus.valid,
        complexity: {
          tier: blockchain.currentComplexityTier,
          consensusType: COMPLEXITY_TIERS[blockchain.currentComplexityTier].consensusType,
          hashDifficulty: COMPLEXITY_TIERS[blockchain.currentComplexityTier].hashDifficulty
        }
      },
      valuation: {
        totalTokens: valuationProof.totalTokens,
        tokenValue: valuationProof.tokenValue,
        currentValuation: valuationProof.currentValuation,
        targetValuation: valuationProof.targetValuation,
        valuationPercentage: valuationProof.valuationPercentage
      },
      latestBlocks
    });
  } catch (err) {
    console.error('Error getting blockchain explorer data:', err);
    res.status(500).json({ error: 'Failed to get blockchain explorer data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Founder API running on port ${PORT}`);
});

module.exports = app;