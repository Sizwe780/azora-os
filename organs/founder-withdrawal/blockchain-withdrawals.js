/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Blockchain-Integrated Founder Withdrawal System
 * 
 * Allows founders to withdraw their tokens with:
 * - Blockchain transaction recording
 * - Constitutional compliance (40% personal / 60% reinvestment)
 * - Immediate liquidity via South African banks
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Constants
const PORT = process.env.FOUNDER_WITHDRAWAL_PORT || 5100;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL || 'http://localhost:5050';
const TOKEN_EXCHANGE_URL = process.env.TOKEN_EXCHANGE_URL || 'http://localhost:5000';

// Create data directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// Data stores
let founders = [];
let withdrawals = [];

// Load founders data
async function loadFounders() {
  try {
    const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
    founders = JSON.parse(data);
    console.log(`Loaded ${founders.length} founders`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create default founders data
      founders = [
        {
          id: 'founder1',
          name: 'Sizwe Nxumalo',
          email: 'sizwe@azora.world',
          role: 'CEO',
          allocation: {
            total: 150000,
            personal: 60000, // 40% personal
            reinvestment: 90000 // 60% reinvestment
          },
          withdrawn: {
            personal: 0,
            reinvestment: 0
          },
          remaining: {
            personal: 60000,
            reinvestment: 90000
          },
          bankAccounts: [
            {
              id: 'bank1',
              bank: 'First National Bank',
              accountNumber: 'XXXX1234',
              branch: '250655',
              accountType: 'Business',
              swiftCode: 'FIRNZAJJ'
            }
          ]
        },
        {
          id: 'founder2',
          name: 'Thandi Zulu',
          email: 'thandi@azora.world',
          role: 'CTO',
          allocation: {
            total: 150000,
            personal: 60000, // 40% personal
            reinvestment: 90000 // 60% reinvestment
          },
          withdrawn: {
            personal: 0,
            reinvestment: 0
          },
          remaining: {
            personal: 60000,
            reinvestment: 90000
          },
          bankAccounts: [
            {
              id: 'bank2',
              bank: 'Standard Bank',
              accountNumber: 'XXXX5678',
              branch: '051001',
              accountType: 'Personal',
              swiftCode: 'SBZAZAJJ'
            }
          ]
        },
        {
          id: 'founder3',
          name: 'AZORA AI',
          email: 'ai@azora.world',
          role: 'AI Founder',
          allocation: {
            total: 100000,
            personal: 40000, // 40% personal
            reinvestment: 60000 // 60% reinvestment
          },
          withdrawn: {
            personal: 0,
            reinvestment: 0
          },
          remaining: {
            personal: 40000,
            reinvestment: 60000
          },
          bankAccounts: []
        }
      ];
      
      await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
      console.log('Created default founders data');
    } else {
      throw err;
    }
  }
}

// Load withdrawals data
async function loadWithdrawals() {
  try {
    const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    withdrawals = JSON.parse(data);
    console.log(`Loaded ${withdrawals.length} withdrawals`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals));
      console.log('Created empty withdrawals data');
    } else {
      throw err;
    }
  }
}

// Save data functions
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

async function saveWithdrawals() {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

// Helper functions
async function getCurrentTokenPrice() {
  try {
    const response = await axios.get(`${TOKEN_EXCHANGE_URL}/api/market-data`);
    return response.data.lastPrice;
  } catch (err) {
    console.error('Error getting token price:', err);
    return 10.0; // Default $10 if exchange is unreachable
  }
}

async function getExchangeRates() {
  try {
    // In production, use a real exchange rate API
    return {
      USD_ZAR: 18.72, // Example exchange rate
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error getting exchange rates:', err);
    return {
      USD_ZAR: 18.72, // Default exchange rate
      lastUpdated: new Date().toISOString()
    };
  }
}

// SA Bank integration (mock for demo)
const SABankIntegration = {
  async processPayment(bankAccount, amountZAR, reference) {
    // In a real system, this would integrate with a bank API
    console.log(`Processing payment of R${amountZAR} to ${bankAccount.bank} account ${bankAccount.accountNumber}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate transaction ID
    const transactionId = `BANK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    return {
      success: true,
      transactionId,
      amount: amountZAR,
      currency: 'ZAR',
      reference,
      timestamp: new Date().toISOString()
    };
  }
};

// Blockchain integration
const BlockchainIntegration = {
  async recordWithdrawal(founderId, amount, withdrawalType, metadata) {
    try {
      const response = await axios.post(`${BLOCKCHAIN_URL}/api/founder-withdrawal`, {
        founderId,
        amount,
        metadata: {
          withdrawalType,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
      
      return response.data;
    } catch (err) {
      console.error('Error recording withdrawal on blockchain:', err);
      throw new Error('Failed to record withdrawal on blockchain');
    }
  },
  
  async getFounderTransactions(founderId) {
    try {
      const response = await axios.get(`${BLOCKCHAIN_URL}/api/address/${founderId}`);
      return response.data;
    } catch (err) {
      console.error('Error getting founder transactions:', err);
      return { transactions: [] };
    }
  }
};

// API endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'founder-withdrawal',
    founders: founders.length,
    withdrawals: withdrawals.length,
    timestamp: new Date().toISOString()
  });
});

// Get all founders (public data only)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    role: f.role
  }));
  
  res.json(publicFounders);
});

// Get founder details
app.get('/api/founders/:id', async (req, res) => {
  const { id } = req.params;
  const founder = founders.find(f => f.id === id);
  
  if (!founder) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  // Get current token price and exchange rates
  const tokenPrice = await getCurrentTokenPrice();
  const exchangeRates = await getExchangeRates();
  
  // Calculate USD and ZAR values
  const personalUSD = founder.remaining.personal * tokenPrice;
  const reinvestmentUSD = founder.remaining.reinvestment * tokenPrice;
  const personalZAR = personalUSD * exchangeRates.USD_ZAR;
  const reinvestmentZAR = reinvestmentUSD * exchangeRates.USD_ZAR;
  
  res.json({
    id: founder.id,
    name: founder.name,
    email: founder.email,
    role: founder.role,
    allocation: founder.allocation,
    withdrawn: founder.withdrawn,
    remaining: founder.remaining,
    bankAccounts: founder.bankAccounts,
    values: {
      tokenPrice,
      personalUSD,
      reinvestmentUSD,
      personalZAR,
      reinvestmentZAR,
      exchangeRate: exchangeRates.USD_ZAR
    }
  });
});

// Get founder withdrawals
app.get('/api/founders/:id/withdrawals', (req, res) => {
  const { id } = req.params;
  const founderWithdrawals = withdrawals.filter(w => w.founderId === id);
  
  res.json(founderWithdrawals);
});

// Get founder blockchain transactions
app.get('/api/founders/:id/blockchain', async (req, res) => {
  const { id } = req.params;
  
  try {
    const data = await BlockchainIntegration.getFounderTransactions(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blockchain data' });
  }
});

// Get reinvestment options
app.get('/api/reinvestment-options', (req, res) => {
  const options = [
    {
      id: 'platform-expansion',
      name: 'Platform Expansion',
      description: 'Expand Azora platform to new African countries',
      impact: 'High growth potential in new markets'
    },
    {
      id: 'ai-development',
      name: 'AI Development',
      description: 'Enhance Azora AI capabilities for African contexts',
      impact: 'Improved platform intelligence and user experience'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Investment',
      description: 'Build digital infrastructure in underserved regions',
      impact: 'Long-term value creation and market development'
    },
    {
      id: 'education',
      name: 'Education Initiatives',
      description: 'Fund tech education and digital literacy programs',
      impact: 'Talent pipeline development and community impact'
    },
    {
      id: 'startup-fund',
      name: 'African Startup Fund',
      description: 'Invest in promising African startups',
      impact: 'Ecosystem building and potential financial returns'
    }
  ];
  
  res.json(options);
});

// Process a founder withdrawal
app.post('/api/founders/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { withdrawalType, amount, bankAccountId, reinvestmentOptions } = req.body;
    
    // Validate inputs
    if (!withdrawalType || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['personal', 'reinvestment', 'both'].includes(withdrawalType)) {
      return res.status(400).json({ error: 'Invalid withdrawal type' });
    }
    
    // Find the founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    const founder = founders[founderIndex];
    
    // Check if withdrawing personal funds requires a bank account
    if (['personal', 'both'].includes(withdrawalType) && founder.name !== 'AZORA AI') {
      if (!bankAccountId) {
        return res.status(400).json({ error: 'Bank account is required for personal withdrawals' });
      }
      
      const bankAccount = founder.bankAccounts.find(a => a.id === bankAccountId);
      if (!bankAccount) {
        return res.status(400).json({ error: 'Bank account not found' });
      }
    }
    
    // Check if reinvestment requires options
    if (['reinvestment', 'both'].includes(withdrawalType) && (!reinvestmentOptions || reinvestmentOptions.length === 0)) {
      return res.status(400).json({ error: 'Reinvestment options are required' });
    }
    
    // Get current token price and exchange rates
    const tokenPrice = await getCurrentTokenPrice();
    const exchangeRates = await getExchangeRates();
    
    // Process withdrawal based on type
    const withdrawalResult = {
      id: uuidv4(),
      founderId: id,
      timestamp: new Date().toISOString(),
      personal: null,
      reinvestment: null
    };
    
    // Process personal withdrawal
    if (['personal', 'both'].includes(withdrawalType)) {
      const personalAmount = parseFloat(amount);
      
      if (personalAmount <= 0) {
        return res.status(400).json({ error: 'Withdrawal amount must be positive' });
      }
      
      if (personalAmount > founder.remaining.personal) {
        return res.status(400).json({ error: 'Insufficient personal allocation' });
      }
      
      // Calculate USD and ZAR values
      const amountUSD = personalAmount * tokenPrice;
      const amountZAR = amountUSD * exchangeRates.USD_ZAR;
      
      // Process bank transfer for human founders
      let bankTransfer = null;
      
      if (founder.name !== 'AZORA AI') {
        const bankAccount = founder.bankAccounts.find(a => a.id === bankAccountId);
        
        // Process bank payment
        bankTransfer = await SABankIntegration.processPayment(
          bankAccount,
          amountZAR,
          `AZORA-${id}-${Date.now()}`
        );
      }
      
      // Record the personal withdrawal
      withdrawalResult.personal = {
        amount: personalAmount,
        valueUSD: amountUSD,
        valueZAR: amountZAR,
        tokenPrice,
        bankTransfer
      };
      
      // Record on blockchain
      await BlockchainIntegration.recordWithdrawal(
        id,
        personalAmount,
        'personal',
        {
          valueUSD: amountUSD,
          valueZAR: amountZAR,
          bankTransfer
        }
      );
      
      // Update founder's withdrawn and remaining amounts
      founders[founderIndex].withdrawn.personal += personalAmount;
      founders[founderIndex].remaining.personal -= personalAmount;
    }
    
    // Process reinvestment
    if (['reinvestment', 'both'].includes(withdrawalType)) {
      const reinvestmentAmount = parseFloat(amount);
      
      if (reinvestmentAmount <= 0) {
        return res.status(400).json({ error: 'Reinvestment amount must be positive' });
      }
      
      if (reinvestmentAmount > founder.remaining.reinvestment) {
        return res.status(400).json({ error: 'Insufficient reinvestment allocation' });
      }
      
      // Calculate USD value
      const amountUSD = reinvestmentAmount * tokenPrice;
      
      // Allocate to selected reinvestment options
      const allocations = reinvestmentOptions.map(option => ({
        optionId: option.id,
        name: option.name,
        amount: reinvestmentAmount / reinvestmentOptions.length,
        valueUSD: amountUSD / reinvestmentOptions.length
      }));
      
      // Record the reinvestment
      withdrawalResult.reinvestment = {
        amount: reinvestmentAmount,
        valueUSD: amountUSD,
        tokenPrice,
        allocations
      };
      
      // Record on blockchain
      await BlockchainIntegration.recordWithdrawal(
        id,
        reinvestmentAmount,
        'reinvestment',
        {
          valueUSD: amountUSD,
          allocations
        }
      );
      
      // Update founder's withdrawn and remaining amounts
      founders[founderIndex].withdrawn.reinvestment += reinvestmentAmount;
      founders[founderIndex].remaining.reinvestment -= reinvestmentAmount;
    }
    
    // Save withdrawal record
    withdrawals.push(withdrawalResult);
    await saveWithdrawals();
    
    // Save updated founder data
    await saveFounders();
    
    // Return success response
    res.json({
      success: true,
      withdrawal: withdrawalResult,
      founder: {
        id: founder.id,
        remaining: founders[founderIndex].remaining,
        withdrawn: founders[founderIndex].withdrawn
      }
    });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Add a bank account for a founder
app.post('/api/founders/:id/bank-accounts', async (req, res) => {
  try {
    const { id } = req.params;
    const { bank, accountNumber, accountType, branch, swiftCode } = req.body;
    
    // Validate inputs
    if (!bank || !accountNumber || !accountType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Create bank account
    const bankAccount = {
      id: uuidv4(),
      bank,
      accountNumber,
      accountType,
      branch: branch || '',
      swiftCode: swiftCode || ''
    };
    
    // Add to founder's bank accounts
    founders[founderIndex].bankAccounts.push(bankAccount);
    
    // Save founder data
    await saveFounders();
    
    res.json(bankAccount);
  } catch (err) {
    console.error('Error adding bank account:', err);
    res.status(500).json({ error: 'Failed to add bank account' });
  }
});

// Get withdrawal statistics
app.get('/api/withdrawal-stats', async (req, res) => {
  try {
    // Calculate totals
    const totalAllocation = founders.reduce((sum, f) => sum + f.allocation.total, 0);
    const totalPersonalAllocation = founders.reduce((sum, f) => sum + f.allocation.personal, 0);
    const totalReinvestmentAllocation = founders.reduce((sum, f) => sum + f.allocation.reinvestment, 0);
    
    const totalWithdrawn = {
      personal: founders.reduce((sum, f) => sum + f.withdrawn.personal, 0),
      reinvestment: founders.reduce((sum, f) => sum + f.withdrawn.reinvestment, 0)
    };
    
    const totalRemaining = {
      personal: founders.reduce((sum, f) => sum + f.remaining.personal, 0),
      reinvestment: founders.reduce((sum, f) => sum + f.remaining.reinvestment, 0)
    };
    
    // Get current token price and exchange rates
    const tokenPrice = await getCurrentTokenPrice();
    const exchangeRates = await getExchangeRates();
    
    // Calculate USD and ZAR values
    const totalValueUSD = totalAllocation * tokenPrice;
    const totalValueZAR = totalValueUSD * exchangeRates.USD_ZAR;
    
    const withdrawnValueUSD = (totalWithdrawn.personal + totalWithdrawn.reinvestment) * tokenPrice;
    const remainingValueUSD = (totalRemaining.personal + totalRemaining.reinvestment) * tokenPrice;
    
    // Calculate percentages
    const percentageWithdrawn = {
      personal: totalPersonalAllocation > 0 ? (totalWithdrawn.personal / totalPersonalAllocation) * 100 : 0,
      reinvestment: totalReinvestmentAllocation > 0 ? (totalWithdrawn.reinvestment / totalReinvestmentAllocation) * 100 : 0,
      total: totalAllocation > 0 ? ((totalWithdrawn.personal + totalWithdrawn.reinvestment) / totalAllocation) * 100 : 0
    };
    
    res.json({
      totalAllocation,
      totalPersonalAllocation,
      totalReinvestmentAllocation,
      totalWithdrawn,
      totalRemaining,
      percentageWithdrawn,
      values: {
        tokenPrice,
        totalValueUSD,
        totalValueZAR,
        withdrawnValueUSD,
        remainingValueUSD,
        exchangeRate: exchangeRates.USD_ZAR
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error getting withdrawal stats:', err);
    res.status(500).json({ error: 'Failed to get withdrawal statistics' });
  }
});

// Founder withdrawal UI
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Azora OS Founder Withdrawal Portal</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f9fc;
      }
      h1, h2, h3 {
        color: #2c3e50;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 1px solid #eee;
        padding-bottom: 20px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .flex-container {
        display: flex;
        gap: 20px;
      }
      .col-6 {
        flex: 1;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      th {
        background-color: #f2f2f2;
      }
      .btn {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn:hover {
        background-color: #2980b9;
      }
      .btn-green {
        background-color: #2ecc71;
      }
      .btn-green:hover {
        background-color: #27ae60;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input, select, textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .tabs {
        display: flex;
        margin-bottom: 20px;
      }
      .tab {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;// filepath: /workspaces/azora-os/services/founder-withdrawal/blockchain-withdrawals.js
/**
 * Azora OS - Blockchain-Integrated Founder Withdrawal System
 * 
 * Allows founders to withdraw their tokens with:
 * - Blockchain transaction recording
 * - Constitutional compliance (40% personal / 60% reinvestment)
 * - Immediate liquidity via South African banks
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Constants
const PORT = process.env.FOUNDER_WITHDRAWAL_PORT || 5100;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL || 'http://localhost:5050';
const TOKEN_EXCHANGE_URL = process.env.TOKEN_EXCHANGE_URL || 'http://localhost:5000';

// Create data directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// Data stores
let founders = [];
let withdrawals = [];

// Load founders data
async function loadFounders() {
  try {
    const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
    founders = JSON.parse(data);
    console.log(`Loaded ${founders.length} founders`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create default founders data
      founders = [
        {
          id: 'founder1',
          name: 'Sizwe Nxumalo',
          email: 'sizwe@azora.world',
          role: 'CEO',
          allocation: {
            total: 150000,
            personal: 60000, // 40% personal
            reinvestment: 90000 // 60% reinvestment
          },
          withdrawn: {
            personal: 0,
            reinvestment: 0
          },
          remaining: {
            personal: 60000,
            reinvestment: 90000
          },
          bankAccounts: [
            {
              id: 'bank1',
              bank: 'First National Bank',
              accountNumber: 'XXXX1234',
              branch: '250655',
              accountType: 'Business',
              swiftCode: 'FIRNZAJJ'
            }
          ]
        },
        {
          id: 'founder2',
          name: 'Thandi Zulu',
          email: 'thandi@azora.world',
          role: 'CTO',
          allocation: {
            total: 150000,
            personal: 60000, // 40% personal
            reinvestment: 90000 // 60% reinvestment
          },
          withdrawn: {
            personal: 0,
            reinvestment: 0
          },
          remaining: {
            personal: 60000,
            reinvestment: 90000
          },
          bankAccounts: [
            {
              id: 'bank2',
              bank: 'Standard Bank',
              accountNumber: 'XXXX5678',
              branch: '051001',
              accountType: 'Personal',
              swiftCode: 'SBZAZAJJ'
            }
          ]
        },
        {
          id: 'founder3',
          name: 'AZORA AI',
          email: 'ai@azora.world',
          role: 'AI Founder',
          allocation: {
            total: 100000,
            personal: 40000, // 40% personal
            reinvestment: 60000 // 60% reinvestment
          },
          withdrawn: {
            personal: 0,
            reinvestment: 0
          },
          remaining: {
            personal: 40000,
            reinvestment: 60000
          },
          bankAccounts: []
        }
      ];
      
      await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
      console.log('Created default founders data');
    } else {
      throw err;
    }
  }
}

// Load withdrawals data
async function loadWithdrawals() {
  try {
    const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    withdrawals = JSON.parse(data);
    console.log(`Loaded ${withdrawals.length} withdrawals`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals));
      console.log('Created empty withdrawals data');
    } else {
      throw err;
    }
  }
}

// Save data functions
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

async function saveWithdrawals() {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

// Helper functions
async function getCurrentTokenPrice() {
  try {
    const response = await axios.get(`${TOKEN_EXCHANGE_URL}/api/market-data`);
    return response.data.lastPrice;
  } catch (err) {
    console.error('Error getting token price:', err);
    return 10.0; // Default $10 if exchange is unreachable
  }
}

async function getExchangeRates() {
  try {
    // In production, use a real exchange rate API
    return {
      USD_ZAR: 18.72, // Example exchange rate
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error getting exchange rates:', err);
    return {
      USD_ZAR: 18.72, // Default exchange rate
      lastUpdated: new Date().toISOString()
    };
  }
}

// SA Bank integration (mock for demo)
const SABankIntegration = {
  async processPayment(bankAccount, amountZAR, reference) {
    // In a real system, this would integrate with a bank API
    console.log(`Processing payment of R${amountZAR} to ${bankAccount.bank} account ${bankAccount.accountNumber}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate transaction ID
    const transactionId = `BANK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    return {
      success: true,
      transactionId,
      amount: amountZAR,
      currency: 'ZAR',
      reference,
      timestamp: new Date().toISOString()
    };
  }
};

// Blockchain integration
const BlockchainIntegration = {
  async recordWithdrawal(founderId, amount, withdrawalType, metadata) {
    try {
      const response = await axios.post(`${BLOCKCHAIN_URL}/api/founder-withdrawal`, {
        founderId,
        amount,
        metadata: {
          withdrawalType,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
      
      return response.data;
    } catch (err) {
      console.error('Error recording withdrawal on blockchain:', err);
      throw new Error('Failed to record withdrawal on blockchain');
    }
  },
  
  async getFounderTransactions(founderId) {
    try {
      const response = await axios.get(`${BLOCKCHAIN_URL}/api/address/${founderId}`);
      return response.data;
    } catch (err) {
      console.error('Error getting founder transactions:', err);
      return { transactions: [] };
    }
  }
};

// API endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'founder-withdrawal',
    founders: founders.length,
    withdrawals: withdrawals.length,
    timestamp: new Date().toISOString()
  });
});

// Get all founders (public data only)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    role: f.role
  }));
  
  res.json(publicFounders);
});

// Get founder details
app.get('/api/founders/:id', async (req, res) => {
  const { id } = req.params;
  const founder = founders.find(f => f.id === id);
  
  if (!founder) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  // Get current token price and exchange rates
  const tokenPrice = await getCurrentTokenPrice();
  const exchangeRates = await getExchangeRates();
  
  // Calculate USD and ZAR values
  const personalUSD = founder.remaining.personal * tokenPrice;
  const reinvestmentUSD = founder.remaining.reinvestment * tokenPrice;
  const personalZAR = personalUSD * exchangeRates.USD_ZAR;
  const reinvestmentZAR = reinvestmentUSD * exchangeRates.USD_ZAR;
  
  res.json({
    id: founder.id,
    name: founder.name,
    email: founder.email,
    role: founder.role,
    allocation: founder.allocation,
    withdrawn: founder.withdrawn,
    remaining: founder.remaining,
    bankAccounts: founder.bankAccounts,
    values: {
      tokenPrice,
      personalUSD,
      reinvestmentUSD,
      personalZAR,
      reinvestmentZAR,
      exchangeRate: exchangeRates.USD_ZAR
    }
  });
});

// Get founder withdrawals
app.get('/api/founders/:id/withdrawals', (req, res) => {
  const { id } = req.params;
  const founderWithdrawals = withdrawals.filter(w => w.founderId === id);
  
  res.json(founderWithdrawals);
});

// Get founder blockchain transactions
app.get('/api/founders/:id/blockchain', async (req, res) => {
  const { id } = req.params;
  
  try {
    const data = await BlockchainIntegration.getFounderTransactions(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blockchain data' });
  }
});

// Get reinvestment options
app.get('/api/reinvestment-options', (req, res) => {
  const options = [
    {
      id: 'platform-expansion',
      name: 'Platform Expansion',
      description: 'Expand Azora platform to new African countries',
      impact: 'High growth potential in new markets'
    },
    {
      id: 'ai-development',
      name: 'AI Development',
      description: 'Enhance Azora AI capabilities for African contexts',
      impact: 'Improved platform intelligence and user experience'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Investment',
      description: 'Build digital infrastructure in underserved regions',
      impact: 'Long-term value creation and market development'
    },
    {
      id: 'education',
      name: 'Education Initiatives',
      description: 'Fund tech education and digital literacy programs',
      impact: 'Talent pipeline development and community impact'
    },
    {
      id: 'startup-fund',
      name: 'African Startup Fund',
      description: 'Invest in promising African startups',
      impact: 'Ecosystem building and potential financial returns'
    }
  ];
  
  res.json(options);
});

// Process a founder withdrawal
app.post('/api/founders/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { withdrawalType, amount, bankAccountId, reinvestmentOptions } = req.body;
    
    // Validate inputs
    if (!withdrawalType || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['personal', 'reinvestment', 'both'].includes(withdrawalType)) {
      return res.status(400).json({ error: 'Invalid withdrawal type' });
    }
    
    // Find the founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    const founder = founders[founderIndex];
    
    // Check if withdrawing personal funds requires a bank account
    if (['personal', 'both'].includes(withdrawalType) && founder.name !== 'AZORA AI') {
      if (!bankAccountId) {
        return res.status(400).json({ error: 'Bank account is required for personal withdrawals' });
      }
      
      const bankAccount = founder.bankAccounts.find(a => a.id === bankAccountId);
      if (!bankAccount) {
        return res.status(400).json({ error: 'Bank account not found' });
      }
    }
    
    // Check if reinvestment requires options
    if (['reinvestment', 'both'].includes(withdrawalType) && (!reinvestmentOptions || reinvestmentOptions.length === 0)) {
      return res.status(400).json({ error: 'Reinvestment options are required' });
    }
    
    // Get current token price and exchange rates
    const tokenPrice = await getCurrentTokenPrice();
    const exchangeRates = await getExchangeRates();
    
    // Process withdrawal based on type
    const withdrawalResult = {
      id: uuidv4(),
      founderId: id,
      timestamp: new Date().toISOString(),
      personal: null,
      reinvestment: null
    };
    
    // Process personal withdrawal
    if (['personal', 'both'].includes(withdrawalType)) {
      const personalAmount = parseFloat(amount);
      
      if (personalAmount <= 0) {
        return res.status(400).json({ error: 'Withdrawal amount must be positive' });
      }
      
      if (personalAmount > founder.remaining.personal) {
        return res.status(400).json({ error: 'Insufficient personal allocation' });
      }
      
      // Calculate USD and ZAR values
      const amountUSD = personalAmount * tokenPrice;
      const amountZAR = amountUSD * exchangeRates.USD_ZAR;
      
      // Process bank transfer for human founders
      let bankTransfer = null;
      
      if (founder.name !== 'AZORA AI') {
        const bankAccount = founder.bankAccounts.find(a => a.id === bankAccountId);
        
        // Process bank payment
        bankTransfer = await SABankIntegration.processPayment(
          bankAccount,
          amountZAR,
          `AZORA-${id}-${Date.now()}`
        );
      }
      
      // Record the personal withdrawal
      withdrawalResult.personal = {
        amount: personalAmount,
        valueUSD: amountUSD,
        valueZAR: amountZAR,
        tokenPrice,
        bankTransfer
      };
      
      // Record on blockchain
      await BlockchainIntegration.recordWithdrawal(
        id,
        personalAmount,
        'personal',
        {
          valueUSD: amountUSD,
          valueZAR: amountZAR,
          bankTransfer
        }
      );
      
      // Update founder's withdrawn and remaining amounts
      founders[founderIndex].withdrawn.personal += personalAmount;
      founders[founderIndex].remaining.personal -= personalAmount;
    }
    
    // Process reinvestment
    if (['reinvestment', 'both'].includes(withdrawalType)) {
      const reinvestmentAmount = parseFloat(amount);
      
      if (reinvestmentAmount <= 0) {
        return res.status(400).json({ error: 'Reinvestment amount must be positive' });
      }
      
      if (reinvestmentAmount > founder.remaining.reinvestment) {
        return res.status(400).json({ error: 'Insufficient reinvestment allocation' });
      }
      
      // Calculate USD value
      const amountUSD = reinvestmentAmount * tokenPrice;
      
      // Allocate to selected reinvestment options
      const allocations = reinvestmentOptions.map(option => ({
        optionId: option.id,
        name: option.name,
        amount: reinvestmentAmount / reinvestmentOptions.length,
        valueUSD: amountUSD / reinvestmentOptions.length
      }));
      
      // Record the reinvestment
      withdrawalResult.reinvestment = {
        amount: reinvestmentAmount,
        valueUSD: amountUSD,
        tokenPrice,
        allocations
      };
      
      // Record on blockchain
      await BlockchainIntegration.recordWithdrawal(
        id,
        reinvestmentAmount,
        'reinvestment',
        {
          valueUSD: amountUSD,
          allocations
        }
      );
      
      // Update founder's withdrawn and remaining amounts
      founders[founderIndex].withdrawn.reinvestment += reinvestmentAmount;
      founders[founderIndex].remaining.reinvestment -= reinvestmentAmount;
    }
    
    // Save withdrawal record
    withdrawals.push(withdrawalResult);
    await saveWithdrawals();
    
    // Save updated founder data
    await saveFounders();
    
    // Return success response
    res.json({
      success: true,
      withdrawal: withdrawalResult,
      founder: {
        id: founder.id,
        remaining: founders[founderIndex].remaining,
        withdrawn: founders[founderIndex].withdrawn
      }
    });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Add a bank account for a founder
app.post('/api/founders/:id/bank-accounts', async (req, res) => {
  try {
    const { id } = req.params;
    const { bank, accountNumber, accountType, branch, swiftCode } = req.body;
    
    // Validate inputs
    if (!bank || !accountNumber || !accountType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Create bank account
    const bankAccount = {
      id: uuidv4(),
      bank,
      accountNumber,
      accountType,
      branch: branch || '',
      swiftCode: swiftCode || ''
    };
    
    // Add to founder's bank accounts
    founders[founderIndex].bankAccounts.push(bankAccount);
    
    // Save founder data
    await saveFounders();
    
    res.json(bankAccount);
  } catch (err) {
    console.error('Error adding bank account:', err);
    res.status(500).json({ error: 'Failed to add bank account' });
  }
});

// Get withdrawal statistics
app.get('/api/withdrawal-stats', async (req, res) => {
  try {
    // Calculate totals
    const totalAllocation = founders.reduce((sum, f) => sum + f.allocation.total, 0);
    const totalPersonalAllocation = founders.reduce((sum, f) => sum + f.allocation.personal, 0);
    const totalReinvestmentAllocation = founders.reduce((sum, f) => sum + f.allocation.reinvestment, 0);
    
    const totalWithdrawn = {
      personal: founders.reduce((sum, f) => sum + f.withdrawn.personal, 0),
      reinvestment: founders.reduce((sum, f) => sum + f.withdrawn.reinvestment, 0)
    };
    
    const totalRemaining = {
      personal: founders.reduce((sum, f) => sum + f.remaining.personal, 0),
      reinvestment: founders.reduce((sum, f) => sum + f.remaining.reinvestment, 0)
    };
    
    // Get current token price and exchange rates
    const tokenPrice = await getCurrentTokenPrice();
    const exchangeRates = await getExchangeRates();
    
    // Calculate USD and ZAR values
    const totalValueUSD = totalAllocation * tokenPrice;
    const totalValueZAR = totalValueUSD * exchangeRates.USD_ZAR;
    
    const withdrawnValueUSD = (totalWithdrawn.personal + totalWithdrawn.reinvestment) * tokenPrice;
    const remainingValueUSD = (totalRemaining.personal + totalRemaining.reinvestment) * tokenPrice;
    
    // Calculate percentages
    const percentageWithdrawn = {
      personal: totalPersonalAllocation > 0 ? (totalWithdrawn.personal / totalPersonalAllocation) * 100 : 0,
      reinvestment: totalReinvestmentAllocation > 0 ? (totalWithdrawn.reinvestment / totalReinvestmentAllocation) * 100 : 0,
      total: totalAllocation > 0 ? ((totalWithdrawn.personal + totalWithdrawn.reinvestment) / totalAllocation) * 100 : 0
    };
    
    res.json({
      totalAllocation,
      totalPersonalAllocation,
      totalReinvestmentAllocation,
      totalWithdrawn,
      totalRemaining,
      percentageWithdrawn,
      values: {
        tokenPrice,
        totalValueUSD,
        totalValueZAR,
        withdrawnValueUSD,
        remainingValueUSD,
        exchangeRate: exchangeRates.USD_ZAR
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error getting withdrawal stats:', err);
    res.status(500).json({ error: 'Failed to get withdrawal statistics' });
  }
});

// Founder withdrawal UI
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Azora OS Founder Withdrawal Portal</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f9fc;
      }
      h1, h2, h3 {
        color: #2c3e50;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 1px solid #eee;
        padding-bottom: 20px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .flex-container {
        display: flex;
        gap: 20px;
      }
      .col-6 {
        flex: 1;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      th {
        background-color: #f2f2f2;
      }
      .btn {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn:hover {
        background-color: #2980b9;
      }
      .btn-green {
        background-color: #2ecc71;
      }
      .btn-green:hover {
        background-color: #27ae60;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input, select, textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .tabs {
        display: flex;
        margin-bottom: 20px;
      }
            .tab {
              padding: 10px 20px;
              cursor: pointer;
              border-bottom: 2px solid transparent;
            }
            .tab.active {
              border-bottom-color: #3498db;
            }
            .hidden {
              display: none;
            }
            .status {
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-success {
              background-color: #d4edda;
              color: #155724;
            }
            .status-pending {
              background-color: #fff3cd;
              color: #856404;
            }
            .status-error {
              background-color: #f8d7da;
              color: #721c24;
            }
            .progress-bar {
              width: 100%;
              height: 20px;
              background-color: #e9ecef;
              border-radius: 10px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background-color: #28a745;
              transition: width 0.3s ease;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏛️ Azora OS Founder Withdrawal Portal</h1>
            <div id="connectionStatus" class="status status-pending">Connecting...</div>
          </div>
      
          <div id="stats" class="card">
            <h2>Withdrawal Statistics</h2>
            <div id="statsContent">Loading...</div>
          </div>
      
          <div class="tabs">
            <div class="tab active" onclick="showTab('founders')">Founders</div>
            <div class="tab" onclick="showTab('withdrawals')">Recent Withdrawals</div>
          </div>
      
          <div id="foundersTab" class="card">
            <h2>Founders</h2>
            <div id="foundersContent">Loading...</div>
          </div>
      
          <div id="withdrawalsTab" class="card hidden">
            <h2>Recent Withdrawals</h2>
            <div id="withdrawalsContent">Loading...</div>
          </div>
      
          <script>
            let currentData = {};
      
            async function loadData() {
              try {
                // Update connection status
                document.getElementById('connectionStatus').textContent = 'Connected';
                document.getElementById('connectionStatus').className = 'status status-success';
      
                // Load statistics
                const statsResponse = await fetch('/api/withdrawal-stats');
                const stats = await statsResponse.json();
                displayStats(stats);
      
                // Load founders
                const foundersResponse = await fetch('/api/founders');
                const founders = await foundersResponse.json();
                
                // Load detailed founder data
                const foundersDetails = await Promise.all(
                  founders.map(async (founder) => {
                    const response = await fetch(`/api/founders/${founder.id}`);
                    return response.json();
                  })
                );
      
                displayFounders(foundersDetails);
                currentData.founders = foundersDetails;
      
                // Load recent withdrawals
                const withdrawalsData = await Promise.all(
                  founders.map(async (founder) => {
                    const response = await fetch(`/api/founders/${founder.id}/withdrawals`);
                    const withdrawals = await response.json();
                    return withdrawals.map(w => ({ ...w, founderName: founder.name }));
                  })
                );
      
                const allWithdrawals = withdrawalsData.flat().sort((a, b) => 
                  new Date(b.timestamp) - new Date(a.timestamp)
                );
      
                displayWithdrawals(allWithdrawals);
      
              } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('connectionStatus').textContent = 'Error';
                document.getElementById('connectionStatus').className = 'status status-error';
              }
            }
      
            function displayStats(stats) {
              const personalPercent = stats.percentageWithdrawn.personal.toFixed(1);
              const reinvestmentPercent = stats.percentageWithdrawn.reinvestment.toFixed(1);
              const totalPercent = stats.percentageWithdrawn.total.toFixed(1);
      
              document.getElementById('statsContent').innerHTML = `
                <div class="flex-container">
                  <div class="col-6">
                    <h3>Token Allocation</h3>
                    <p><strong>Total Allocation:</strong> ${stats.totalAllocation.toLocaleString()} AZORA</p>
                    <p><strong>Personal (40%):</strong> ${stats.totalPersonalAllocation.toLocaleString()} AZORA</p>
                    <p><strong>Reinvestment (60%):</strong> ${stats.totalReinvestmentAllocation.toLocaleString()} AZORA</p>
                    
                    <h3>Market Values</h3>
                    <p><strong>Token Price:</strong> $${stats.values.tokenPrice}</p>
                    <p><strong>Total Value:</strong> $${stats.values.totalValueUSD.toLocaleString()} / R${stats.values.totalValueZAR.toLocaleString()}</p>
                    <p><strong>Exchange Rate:</strong> $1 = R${stats.values.exchangeRate}</p>
                  </div>
                  <div class="col-6">
                    <h3>Withdrawal Progress</h3>
                    
                    <div style="margin-bottom: 15px;">
                      <label>Personal Withdrawals (${personalPercent}%)</label>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${personalPercent}%"></div>
                      </div>
                      <small>${stats.totalWithdrawn.personal.toLocaleString()} / ${stats.totalPersonalAllocation.toLocaleString()} AZORA</small>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                      <label>Reinvestment Allocations (${reinvestmentPercent}%)</label>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${reinvestmentPercent}%"></div>
                      </div>
                      <small>${stats.totalWithdrawn.reinvestment.toLocaleString()} / ${stats.totalReinvestmentAllocation.toLocaleString()} AZORA</small>
                    </div>
                    
                    <div>
                      <label>Total Progress (${totalPercent}%)</label>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${totalPercent}%"></div>
                      </div>
                      <small>${(stats.totalWithdrawn.personal + stats.totalWithdrawn.reinvestment).toLocaleString()} / ${stats.totalAllocation.toLocaleString()} AZORA</small>
                    </div>
                  </div>
                </div>
              `;
            }
      
            function displayFounders(founders) {
              const html = founders.map(founder => `
                <div class="card" style="margin-bottom: 15px;">
                  <h3>${founder.name} (${founder.role})</h3>
                  
                  <div class="flex-container">
                    <div class="col-6">
                      <h4>Allocation Status</h4>
                      <p><strong>Total:</strong> ${founder.allocation.total.toLocaleString()} AZORA</p>
                      <p><strong>Personal Remaining:</strong> ${founder.remaining.personal.toLocaleString()} AZORA (R${founder.values.personalZAR.toLocaleString()})</p>
                      <p><strong>Reinvestment Remaining:</strong> ${founder.remaining.reinvestment.toLocaleString()} AZORA (R${founder.values.reinvestmentZAR.toLocaleString()})</p>
                      
                      ${founder.bankAccounts.length > 0 ? `
                        <h4>Bank Accounts</h4>
                        ${founder.bankAccounts.map(account => `
                          <p><strong>${account.bank}:</strong> ${account.accountNumber} (${account.accountType})</p>
                        `).join('')}
                      ` : '<p><em>No bank accounts configured</em></p>'}
                    </div>
                    
                    <div class="col-6">
                      <button class="btn btn-green" onclick="openWithdrawalModal('${founder.id}')">
                        💰 Process Withdrawal
                      </button>
                      <button class="btn" onclick="viewFounderDetails('${founder.id}')" style="margin-left: 10px;">
                        📊 View Details
                      </button>
                    </div>
                  </div>
                </div>
              `).join('');
      
              document.getElementById('foundersContent').innerHTML = html;
            }
      
            function displayWithdrawals(withdrawals) {
              if (withdrawals.length === 0) {
                document.getElementById('withdrawalsContent').innerHTML = '<p>No withdrawals yet.</p>';
                return;
              }
      
              const html = `
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Founder</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Value (USD)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${withdrawals.slice(0, 10).map(withdrawal => `
                      <tr>
                        <td>${new Date(withdrawal.timestamp).toLocaleDateString()}</td>
                        <td>${withdrawal.founderName}</td>
                        <td>
                          ${withdrawal.personal ? 'Personal' : ''}
                          ${withdrawal.personal && withdrawal.reinvestment ? ' + ' : ''}
                          ${withdrawal.reinvestment ? 'Reinvestment' : ''}
                        </td>
                        <td>
                          ${withdrawal.personal ? withdrawal.personal.amount.toLocaleString() + ' AZORA' : ''}
                          ${withdrawal.personal && withdrawal.reinvestment ? '<br>' : ''}
                          ${withdrawal.reinvestment ? withdrawal.reinvestment.amount.toLocaleString() + ' AZORA' : ''}
                        </td>
                        <td>
                          ${withdrawal.personal ? '$' + withdrawal.personal.valueUSD.toLocaleString() : ''}
                          ${withdrawal.personal && withdrawal.reinvestment ? '<br>' : ''}
                          ${withdrawal.reinvestment ? '$' + withdrawal.reinvestment.valueUSD.toLocaleString() : ''}
                        </td>
                        <td><span class="status status-success">Completed</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
      
              document.getElementById('withdrawalsContent').innerHTML = html;
            }
      
            function showTab(tabName) {
              // Hide all tabs
              document.getElementById('foundersTab').classList.add('hidden');
              document.getElementById('withdrawalsTab').classList.add('hidden');
              
              // Remove active class from all tab buttons
              document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
              
              // Show selected tab and mark button as active
              document.getElementById(tabName + 'Tab').classList.remove('hidden');
              event.target.classList.add('active');
            }
      
            function openWithdrawalModal(founderId) {
              const founder = currentData.founders.find(f => f.id === founderId);
              if (!founder) return;
      
              const modal = document.createElement('div');
              modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                background: rgba(0,0,0,0.5); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
              `;
      
              modal.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                  <h2>💰 Withdrawal for ${founder.name}</h2>
                  
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p><strong>Available for Personal Use:</strong> ${founder.remaining.personal.toLocaleString()} AZORA (R${founder.values.personalZAR.toLocaleString()})</p>
                    <p><strong>Available for Reinvestment:</strong> ${founder.remaining.reinvestment.toLocaleString()} AZORA (R${founder.values.reinvestmentZAR.toLocaleString()})</p>
                    <p><strong>Current Token Price:</strong> $${founder.values.tokenPrice}</p>
                  </div>
      
                  <form id="withdrawalForm">
                    <div class="form-group">
                      <label>Withdrawal Type:</label>
                      <select id="withdrawalType" onchange="updateWithdrawalForm()">
                        <option value="">Select type...</option>
                        <option value="personal">Personal Use (40%)</option>
                        <option value="reinvestment">Reinvestment (60%)</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
      
                    <div id="personalSection" class="hidden">
                      <div class="form-group">
                        <label>Personal Withdrawal Amount (AZORA):</label>
                        <input type="number" id="personalAmount" max="${founder.remaining.personal}" step="0.01">
                      </div>
                      
                      ${founder.bankAccounts.length > 0 ? `
                        <div class="form-group">
                          <label>Bank Account:</label>
                          <select id="bankAccount">
                            ${founder.bankAccounts.map(account => 
                              `<option value="${account.id}">${account.bank} - ${account.accountNumber}</option>`
                            ).join('')}
                          </select>
                        </div>
                      ` : '<p style="color: #e74c3c;">⚠️ No bank accounts configured. Personal withdrawals not available.</p>'}
                    </div>
      
                    <div id="reinvestmentSection" class="hidden">
                      <div class="form-group">
                        <label>Reinvestment Amount (AZORA):</label>
                        <input type="number" id="reinvestmentAmount" max="${founder.remaining.reinvestment}" step="0.01">
                      </div>
                      
                      <div class="form-group">
                        <label>Reinvestment Options (select one or more):</label>
                        <div id="reinvestmentOptions">Loading...</div>
                      </div>
                    </div>
      
                    <div style="text-align: right; margin-top: 20px;">
                      <button type="button" onclick="closeModal()" class="btn" style="margin-right: 10px;">Cancel</button>
                      <button type="submit" class="btn btn-green">Process Withdrawal</button>
                    </div>
                  </form>
                </div>
              `;
      
              document.body.appendChild(modal);
              window.currentModal = modal;
      
              // Load reinvestment options
              loadReinvestmentOptions();
      
              // Handle form submission
              document.getElementById('withdrawalForm').onsubmit = function(e) {
                e.preventDefault();
                processWithdrawal(founderId);
              };
            }
      
            async function loadReinvestmentOptions() {
              try {
                const response = await fetch('/api/reinvestment-options');
                const options = await response.json();
                
                const html = options.map(option => `
                  <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <label style="display: flex; align-items: flex-start;">
                      <input type="checkbox" value="${option.id}" style="margin-right: 10px; margin-top: 2px;">
                      <div>
                        <strong>${option.name}</strong><br>
                        <small>${option.description}</small><br>
                        <em>Impact: ${option.impact}</em>
                      </div>
                    </label>
                  </div>
                `).join('');
      
                document.getElementById('reinvestmentOptions').innerHTML = html;
              } catch (error) {
                document.getElementById('reinvestmentOptions').innerHTML = '<p>Error loading options</p>';
              }
            }
      
            function updateWithdrawalForm() {
              const type = document.getElementById('withdrawalType').value;
              
              document.getElementById('personalSection').classList.toggle('hidden', !['personal', 'both'].includes(type));
              document.getElementById('reinvestmentSection').classList.toggle('hidden', !['reinvestment', 'both'].includes(type));
            }
      
            async function processWithdrawal(founderId) {
              try {
                const withdrawalType = document.getElementById('withdrawalType').value;
                if (!withdrawalType) {
                  alert('Please select a withdrawal type');
                  return;
                }
      
                const data = {
                  withdrawalType,
                  bankAccountId: document.getElementById('bankAccount')?.value,
                  reinvestmentOptions: []
                };
      
                // Get amounts and reinvestment options based on type
                if (['personal', 'both'].includes(withdrawalType)) {
                  const personalAmount = document.getElementById('personalAmount').value;
                  if (!personalAmount || personalAmount <= 0) {
                    alert('Please enter a valid personal withdrawal amount');
                    return;
                  }
                  data.amount = personalAmount;
                }
      
                if (['reinvestment', 'both'].includes(withdrawalType)) {
                  const reinvestmentAmount = document.getElementById('reinvestmentAmount').value;
                  if (!reinvestmentAmount || reinvestmentAmount <= 0) {
                    alert('Please enter a valid reinvestment amount');
                    return;
                  }
                  
                  if (withdrawalType === 'reinvestment') {
                    data.amount = reinvestmentAmount;
                  }
      
                  // Get selected reinvestment options
                  const selectedOptions = Array.from(document.querySelectorAll('#reinvestmentOptions input[type="checkbox"]:checked'));
                  if (selectedOptions.length === 0) {
                    alert('Please select at least one reinvestment option');
                    return;
                  }
      
                  data.reinvestmentOptions = selectedOptions.map(option => ({
                    id: option.value,
                    name: option.parentElement.querySelector('strong').textContent
                  }));
                }
      
                // Show processing message
                const submitButton = document.querySelector('#withdrawalForm button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;
      
                // Submit withdrawal
                const response = await fetch(`/api/founders/${founderId}/withdraw`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
                });
      
                const result = await response.json();
      
                if (result.success) {
                  alert('Withdrawal processed successfully!');
                  closeModal();
                  loadData(); // Refresh data
                } else {
                  throw new Error(result.error || 'Withdrawal failed');
                }
      
              } catch (error) {
                console.error('Error processing withdrawal:', error);
                alert('Error: ' + error.message);
                
                // Reset button
                const submitButton = document.querySelector('#withdrawalForm button[type="submit"]');
                submitButton.textContent = 'Process Withdrawal';
                submitButton.disabled = false;
              }
            }
      
            function closeModal() {
              if (window.currentModal) {
                document.body.removeChild(window.currentModal);
                window.currentModal = null;
              }
            }
      
            function viewFounderDetails(founderId) {
              const founder = currentData.founders.find(f => f.id === founderId);
              if (!founder) return;
      
              // Open in new window or tab - could also be a modal
              window.open(`/api/founders/${founderId}`, '_blank');
            }
      
            // Initialize
            loadData();
            
            // Refresh data every 30 seconds
            setInterval(loadData, 30000);
          </script>
        </body>
        </html>
        `;
        
        res.send(html);
      });
      
      // Start server
      (async () => {
        try {
          await loadFounders();
          await loadWithdrawals();
          
          app.listen(PORT, () => {
            console.log(`🏛️ Azora OS Founder Withdrawal System running on port ${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}`);
            console.log(`🔗 API Health: http://localhost:${PORT}/health`);
          });
        } catch (err) {
          console.error('Failed to start founder withdrawal system:', err);
          process.exit(1);
        }
      })();