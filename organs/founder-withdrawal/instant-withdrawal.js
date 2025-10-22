/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Instant Founder Withdrawal
 * 
 * This service allows founders to instantly withdraw their share 
 * as they register with the platform.
 * 
 * Features:
 * - Immediate founder registration on the blockchain
 * - Instant withdrawal capability
 * - Constitutional enforcement of 40% personal / 60% reinvestment rule
 * - Progressive blockchain integration
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const crypto = require('crypto');

// Import progressive blockchain
const blockchain = require('../progressive-blockchain/blockchain');

// Express application
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configuration
const PORT = process.env.FOUNDER_WITHDRAWAL_PORT || 5001;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const BANK_TRANSACTIONS_FILE = path.join(DATA_DIR, 'bank_transactions.json');

// Token economics
const TOKEN_VALUE_USD = 10; // $10 per token
const TOTAL_SUPPLY = 1000000; // 1 million total supply
const TOTAL_VALUE_USD = TOKEN_VALUE_USD * TOTAL_SUPPLY; // $10 million

// State variables
let founders = [];
let withdrawals = [];
let bankTransactions = [];
let exchangeRates = {
  USD_ZAR: 18.5,
  lastUpdated: new Date().toISOString()
};

/**
 * Initialize the founder withdrawal service
 */
async function initialize() {
  try {
    // Create data directory
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize blockchain
    await blockchain.initialize();
    
    // Load or create founders data
    try {
      const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
      founders = JSON.parse(data);
      console.log(`Loaded ${founders.length} founders`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        founders = [];
        await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
        console.log('Created empty founders file');
      } else {
        throw err;
      }
    }
    
    // Load or create withdrawals data
    try {
      const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
      withdrawals = JSON.parse(data);
      console.log(`Loaded ${withdrawals.length} withdrawals`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        withdrawals = [];
        await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
        console.log('Created empty withdrawals file');
      } else {
        throw err;
      }
    }
    
    // Load or create bank transactions data
    try {
      const data = await fs.readFile(BANK_TRANSACTIONS_FILE, 'utf8');
      bankTransactions = JSON.parse(data);
      console.log(`Loaded ${bankTransactions.length} bank transactions`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        bankTransactions = [];
        await fs.writeFile(BANK_TRANSACTIONS_FILE, JSON.stringify(bankTransactions, null, 2));
        console.log('Created empty bank transactions file');
      } else {
        throw err;
      }
    }
    
    // Update exchange rates
    await updateExchangeRates();
    
    console.log('Founder withdrawal service initialized');
  } catch (err) {
    console.error('Error initializing founder withdrawal service:', err);
  }
}

/**
 * Save founders data
 */
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

/**
 * Save withdrawals data
 */
async function saveWithdrawals() {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

/**
 * Save bank transactions data
 */
async function saveBankTransactions() {
  await fs.writeFile(BANK_TRANSACTIONS_FILE, JSON.stringify(bankTransactions, null, 2));
}

/**
 * Update exchange rates
 */
async function updateExchangeRates() {
  try {
    // In production, use a real API
    // For demo, we'll simulate an exchange rate update
    
    const lastUpdate = new Date(exchangeRates.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) {
      return exchangeRates; // Only update once per hour
    }
    
    // Simulate a slight change in exchange rate
    const newRate = exchangeRates.USD_ZAR * (1 + (Math.random() * 0.04 - 0.02)); // ±2% change
    
    exchangeRates = {
      USD_ZAR: parseFloat(newRate.toFixed(2)),
      lastUpdated: now.toISOString()
    };
    
    console.log('Updated exchange rates:', exchangeRates);
    return exchangeRates;
  } catch (err) {
    console.error('Error updating exchange rates:', err);
    return exchangeRates;
  }
}

/**
 * Calculate token values in different currencies
 */
function calculateTokenValue(tokenAmount) {
  const usdValue = tokenAmount * TOKEN_VALUE_USD;
  const zarValue = usdValue * exchangeRates.USD_ZAR;
  
  return {
    tokens: tokenAmount,
    USD: usdValue,
    ZAR: parseFloat(zarValue.toFixed(2))
  };
}

/**
 * Simulate a bank transfer to South African bank
 */
async function processBankTransfer(bankAccount, amountZAR, reference) {
  // In production, integrate with actual banking API
  // For demo, simulate a bank transfer with 95% success rate
  
  // Simulate processing time
  await new Promise(r => setTimeout(r, 1500));
  
  const success = Math.random() < 0.95;
  if (!success) {
    throw new Error('Bank transfer failed. Please try again.');
  }
  
  const transaction = {
    id: `BTX-${Date.now()}`,
    bankAccount,
    amountZAR,
    reference,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
  
  bankTransactions.push(transaction);
  await saveBankTransactions();
  
  return transaction;
}

/**
 * Register a new founder
 */
async function registerFounder(founderData) {
  try {
    // Check if email already exists
    if (founders.some(f => f.email === founderData.email)) {
      throw new Error('Founder with this email already exists');
    }
    
    // Generate founder ID if not provided
    const founderId = founderData.id || uuidv4();
    
    // Calculate token allocation
    const totalTokens = founderData.allocation || 50000; // Default 50k tokens
    
    // Apply constitutional 40/60 split
    const personalTokens = Math.floor(totalTokens * 0.4); // 40% personal
    const reinvestmentTokens = totalTokens - personalTokens; // 60% reinvestment
    
    const newFounder = {
      id: founderId,
      name: founderData.name,
      email: founderData.email,
      role: founderData.role || 'Founder',
      registeredAt: new Date().toISOString(),
      allocation: {
        total: totalTokens,
        personal: personalTokens,
        reinvestment: reinvestmentTokens
      },
      withdrawn: {
        personal: 0,
        reinvestment: 0,
        total: 0
      },
      remaining: {
        personal: personalTokens,
        reinvestment: reinvestmentTokens,
        total: totalTokens
      },
      bankAccounts: founderData.bankAccounts || [],
      status: 'active'
    };
    
    // Add to founders array
    founders.push(newFounder);
    await saveFounders();
    
    // Record on blockchain
    blockchain.addTransaction({
      type: 'founder-registration',
      data: {
        founderId: newFounder.id,
        name: newFounder.name,
        email: newFounder.email,
        role: newFounder.role,
        allocation: newFounder.allocation
      },
      signature: crypto.createHash('sha256').update(`${newFounder.id}-${newFounder.email}`).digest('hex')
    });
    
    return newFounder;
  } catch (err) {
    console.error('Error registering founder:', err);
    throw err;
  }
}

/**
 * Process an instant withdrawal for a founder
 */
async function processWithdrawal(founderId, withdrawalData) {
  try {
    // Find founder
    const founderIndex = founders.findIndex(f => f.id === founderId);
    if (founderIndex === -1) {
      throw new Error('Founder not found');
    }
    
    const founder = founders[founderIndex];
    
    // Determine withdrawal type
    const { type, amount, bankAccountId, reinvestmentOptions } = withdrawalData;
    
    if (type !== 'personal' && type !== 'reinvestment' && type !== 'both') {
      throw new Error('Invalid withdrawal type');
    }
    
    let personalWithdrawal = null;
    let reinvestmentWithdrawal = null;
    
    // Process personal withdrawal if requested
    if (type === 'personal' || type === 'both') {
      // Check remaining personal tokens
      const personalAmount = amount || founder.remaining.personal;
      if (personalAmount <= 0 || personalAmount > founder.remaining.personal) {
        throw new Error(`Invalid personal withdrawal amount: ${personalAmount}`);
      }
      
      // Need bank account for personal withdrawal
      if (!bankAccountId) {
        throw new Error('Bank account required for personal withdrawal');
      }
      
      const bankAccount = founder.bankAccounts.find(b => b.id === bankAccountId);
      if (!bankAccount) {
        throw new Error('Bank account not found');
      }
      
      // Calculate ZAR value
      const value = calculateTokenValue(personalAmount);
      
      // Process bank transfer
      const bankTransaction = await processBankTransfer(
        bankAccount,
        value.ZAR,
        `AZORA-WITHDRAWAL-${founderId}-${Date.now()}`
      );
      
      // Create withdrawal record
      personalWithdrawal = {
        id: uuidv4(),
        founderId,
        type: 'personal',
        tokens: personalAmount,
        value: {
          USD: value.USD,
          ZAR: value.ZAR
        },
        bankAccount: {
          id: bankAccount.id,
          bank: bankAccount.bank,
          accountNumber: bankAccount.accountNumber
        },
        bankTransaction: bankTransaction.id,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      // Update founder's balances
      founders[founderIndex].withdrawn.personal += personalAmount;
      founders[founderIndex].withdrawn.total += personalAmount;
      founders[founderIndex].remaining.personal -= personalAmount;
      founders[founderIndex].remaining.total -= personalAmount;
      
      // Add to withdrawals
      withdrawals.push(personalWithdrawal);
      
      // Record on blockchain
      blockchain.addTransaction({
        type: 'founder-withdrawal',
        data: {
          founderId,
          withdrawalId: personalWithdrawal.id,
          withdrawalType: 'personal',
          tokens: personalAmount,
          valueUSD: value.USD,
          bankTransactionId: bankTransaction.id
        },
        signature: crypto.createHash('sha256').update(`${founderId}-${personalWithdrawal.id}`).digest('hex')
      });
    }
    
    // Process reinvestment withdrawal if requested
    if (type === 'reinvestment' || type === 'both') {
      // Check remaining reinvestment tokens
      const reinvestmentAmount = amount || founder.remaining.reinvestment;
      if (reinvestmentAmount <= 0 || reinvestmentAmount > founder.remaining.reinvestment) {
        throw new Error(`Invalid reinvestment amount: ${reinvestmentAmount}`);
      }
      
      // Need reinvestment options
      if (!reinvestmentOptions || !reinvestmentOptions.projects || reinvestmentOptions.projects.length === 0) {
        throw new Error('Reinvestment projects must be specified');
      }
      
      // Calculate value
      const value = calculateTokenValue(reinvestmentAmount);
      
      // Create withdrawal record
      reinvestmentWithdrawal = {
        id: uuidv4(),
        founderId,
        type: 'reinvestment',
        tokens: reinvestmentAmount,
        value: {
          USD: value.USD,
          ZAR: value.ZAR
        },
        projects: reinvestmentOptions.projects,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      // Update founder's balances
      founders[founderIndex].withdrawn.reinvestment += reinvestmentAmount;
      founders[founderIndex].withdrawn.total += reinvestmentAmount;
      founders[founderIndex].remaining.reinvestment -= reinvestmentAmount;
      founders[founderIndex].remaining.total -= reinvestmentAmount;
      
      // Add to withdrawals
      withdrawals.push(reinvestmentWithdrawal);
      
      // Record on blockchain
      blockchain.addTransaction({
        type: 'founder-withdrawal',
        data: {
          founderId,
          withdrawalId: reinvestmentWithdrawal.id,
          withdrawalType: 'reinvestment',
          tokens: reinvestmentAmount,
          valueUSD: value.USD,
          projects: reinvestmentOptions.projects
        },
        signature: crypto.createHash('sha256').update(`${founderId}-${reinvestmentWithdrawal.id}`).digest('hex')
      });
    }
    
    // Save updated data
    await saveFounders();
    await saveWithdrawals();
    
    return {
      personal: personalWithdrawal,
      reinvestment: reinvestmentWithdrawal,
      remaining: founders[founderIndex].remaining
    };
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    throw err;
  }
}

/**
 * Add a bank account for a founder
 */
async function addBankAccount(founderId, bankAccountData) {
  try {
    // Find founder
    const founderIndex = founders.findIndex(f => f.id === founderId);
    if (founderIndex === -1) {
      throw new Error('Founder not found');
    }
    
    // Create bank account with ID
    const bankAccount = {
      id: uuidv4(),
      bank: bankAccountData.bank,
      accountNumber: bankAccountData.accountNumber,
      accountType: bankAccountData.accountType || 'Personal',
      verified: false, // Unverified initially
      addedAt: new Date().toISOString()
    };
    
    // Add to founder's bank accounts
    founders[founderIndex].bankAccounts.push(bankAccount);
    await saveFounders();
    
    return bankAccount;
  } catch (err) {
    console.error('Error adding bank account:', err);
    throw err;
  }
}

// Express API routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'founder-withdrawal',
    blockchain: {
      blocks: blockchain.getBlockchain().length,
      complexityLevel: blockchain.getComplexityMetrics().currentComplexityLevel
    },
    founders: founders.length,
    withdrawals: withdrawals.length,
    exchangeRates
  });
});

// Get all founders (limited info)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    role: f.role,
    status: f.status,
    allocation: f.allocation.total,
    remaining: f.remaining.total
  }));
  
  res.json({ founders: publicFounders });
});

// Get founder by ID
app.get('/api/founders/:id', (req, res) => {
  const founder = founders.find(f => f.id === req.params.id);
  
  if (!founder) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  res.json({ founder });
});

// Register new founder
app.post('/api/founders', async (req, res) => {
  try {
    const newFounder = await registerFounder(req.body);
    res.status(201).json({ founder: newFounder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Process withdrawal
app.post('/api/founders/:id/withdraw', async (req, res) => {
  try {
    const withdrawal = await processWithdrawal(req.params.id, req.body);
    res.status(200).json({ withdrawal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add bank account
app.post('/api/founders/:id/bank-accounts', async (req, res) => {
  try {
    const bankAccount = await addBankAccount(req.params.id, req.body);
    res.status(201).json({ bankAccount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get founder withdrawals
app.get('/api/founders/:id/withdrawals', (req, res) => {
  const founderWithdrawals = withdrawals.filter(w => w.founderId === req.params.id);
  res.json({ withdrawals: founderWithdrawals });
});

// Get blockchain transactions for a founder
app.get('/api/founders/:id/blockchain', (req, res) => {
  const transactions = blockchain.findFounderTransactions(req.params.id);
  res.json({ transactions });
});

// Get exchange rates
app.get('/api/exchange-rates', async (req, res) => {
  const rates = await updateExchangeRates();
  res.json({ exchangeRates: rates });
});

// Get reinvestment projects
app.get('/api/reinvestment-projects', (req, res) => {
  const projects = [
    {
      id: 'platform-expansion',
      name: 'Platform Expansion',
      description: 'Expand the Azora platform to new African countries',
      minInvestment: 1000,
      maxInvestment: 100000,
      expectedReturn: '15% per annum',
      risk: 'Medium'
    },
    {
      id: 'ai-development',
      name: 'AI Development',
      description: 'Further develop the AI capabilities of the Azora platform',
      minInvestment: 5000,
      maxInvestment: 200000,
      expectedReturn: '20% per annum',
      risk: 'High'
    },
    {
      id: 'infrastructure',
      name: 'Blockchain Infrastructure',
      description: 'Improve the progressive blockchain infrastructure',
      minInvestment: 10000,
      maxInvestment: 500000,
      expectedReturn: '18% per annum',
      risk: 'Medium-High'
    },
    {
      id: 'education',
      name: 'Education Initiatives',
      description: 'Fund educational programs about blockchain and financial literacy',
      minInvestment: 1000,
      maxInvestment: 50000,
      expectedReturn: '8% per annum',
      risk: 'Low'
    },
    {
      id: 'startup-fund',
      name: 'African Startup Fund',
      description: 'Invest in promising African startups',
      minInvestment: 5000,
      maxInvestment: 100000,
      expectedReturn: '25% per annum',
      risk: 'Very High'
    }
  ];
  
  res.json({ projects });
});

// Get valuation statistics
app.get('/api/valuation', (req, res) => {
  // Calculate how many tokens are allocated and remaining
  const allocated = founders.reduce((sum, f) => sum + f.allocation.total, 0);
  const withdrawn = founders.reduce((sum, f) => sum + f.withdrawn.total, 0);
  const remaining = founders.reduce((sum, f) => sum + f.remaining.total, 0);
  const unallocated = TOTAL_SUPPLY - allocated;
  
  // Calculate values
  const allocatedValue = calculateTokenValue(allocated);
  const withdrawnValue = calculateTokenValue(withdrawn);
  const remainingValue = calculateTokenValue(remaining);
  const unallocatedValue = calculateTokenValue(unallocated);
  const totalValue = calculateTokenValue(TOTAL_SUPPLY);
  
  res.json({
    tokenValue: TOKEN_VALUE_USD,
    totalSupply: TOTAL_SUPPLY,
    totalValueUSD: totalValue.USD,
    totalValueZAR: totalValue.ZAR,
    tokens: {
      allocated,
      withdrawn,
      remaining,
      unallocated
    },
    values: {
      allocated: allocatedValue,
      withdrawn: withdrawnValue,
      remaining: remainingValue,
      unallocated: unallocatedValue
    },
    exchangeRates
  });
});

// Get blockchain metrics
app.get('/api/blockchain', (req, res) => {
  const blockchainData = blockchain.getBlockchain();
  const metrics = blockchain.getComplexityMetrics();
  const visualization = blockchain.getComplexityVisualization();
  
  res.json({
    blocks: blockchainData.length,
    metrics,
    visualization,
    latestBlock: blockchain.getLatestBlock(),
    verification: blockchain.verifyBlockchain()
  });
});

// Export the app and functions
module.exports = {
  app,
  initialize,
  registerFounder,
  processWithdrawal,
  blockchain
};

// Start the server if this file is run directly
if (require.main === module) {
  (async () => {
    try {
      await initialize();
      app.listen(PORT, () => {
        console.log(`Founder withdrawal service running on port ${PORT}`);
      });
    } catch (err) {
      console.error('Failed to start service:', err);
    }
  })();
}