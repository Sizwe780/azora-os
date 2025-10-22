/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Withdrawal Service
 * 
 * Implements the constitutional requirement that founders can only withdraw 40% 
 * personally, with 60% being reinvested in Azora projects.
 * 
 * Features:
 * - SA bank integration for instant withdrawals
 * - Constitutional compliance enforcement
 * - Reinvestment tracking
 * - Multi-government compliance
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configuration
const PORT = process.env.WITHDRAWAL_SERVICE_PORT || 4096;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const REINVESTMENTS_FILE = path.join(DATA_DIR, 'reinvestments.json');
const EXCHANGE_RATES_FILE = path.join(DATA_DIR, 'exchange_rates.json');

// Create data directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory created or already exists');
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// Token constants
const TOKEN_VALUE_USD = 10; // Each Azora token is worth $10 USD
const TOTAL_TOKEN_SUPPLY = 1000000; // 1 million token limit

// Data store
let founders = [];
let withdrawals = [];
let reinvestments = [];
let exchangeRates = {
  USD_ZAR: 18.5, // USD to ZAR exchange rate
  lastUpdated: new Date().toISOString()
};

// Initialize data
async function initData() {
  try {
    // Create founders data if it doesn't exist
    try {
      const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
      founders = JSON.parse(data);
      console.log(`Loaded ${founders.length} founders from file`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Founders file not found, creating default data');
        founders = [
          {
            id: '1',
            name: 'Sizwe Nxumalo',
            email: 'sizwe@azora.world',
            role: 'CEO',
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
              reinvestment: 60000,
              total: 100000
            },
            bankAccounts: [
              {
                id: 'bank1',
                bank: 'First National Bank',
                accountNumber: 'XXXX1234',
                accountType: 'Business',
                verified: true
              },
              {
                id: 'bank2',
                bank: 'Standard Bank',
                accountNumber: 'XXXX5678',
                accountType: 'Personal',
                verified: true
              }
            ],
            active: true
          },
          {
            id: '2',
            name: 'Thando Moyo',
            email: 'thando@azora.world',
            role: 'CTO',
            allocation: {
              total: 100000,
              personal: 40000,
              reinvestment: 60000
            },
            withdrawn: {
              personal: 0,
              reinvestment: 0
            },
            remaining: {
              personal: 40000,
              reinvestment: 60000,
              total: 100000
            },
            bankAccounts: [
              {
                id: 'bank3',
                bank: 'Capitec',
                accountNumber: 'XXXX9876',
                accountType: 'Savings',
                verified: true
              }
            ],
            active: true
          },
          {
            id: '3',
            name: 'AZORA',
            email: 'ai@azora.world',
            role: 'AI Founder',
            allocation: {
              total: 100000,
              personal: 40000,
              reinvestment: 60000
            },
            withdrawn: {
              personal: 0,
              reinvestment: 0
            },
            remaining: {
              personal: 40000,
              reinvestment: 60000,
              total: 100000
            },
            bankAccounts: [],
            active: true
          }
        ];
        await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
      } else {
        throw err;
      }
    }

    // Create withdrawals file if it doesn't exist
    try {
      const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
      withdrawals = JSON.parse(data);
      console.log(`Loaded ${withdrawals.length} withdrawals from file`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Withdrawals file not found, creating empty file');
        withdrawals = [];
        await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
      } else {
        throw err;
      }
    }

    // Create reinvestments file if it doesn't exist
    try {
      const data = await fs.readFile(REINVESTMENTS_FILE, 'utf8');
      reinvestments = JSON.parse(data);
      console.log(`Loaded ${reinvestments.length} reinvestments from file`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Reinvestments file not found, creating empty file');
        reinvestments = [];
        await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
      } else {
        throw err;
      }
    }

    // Create or load exchange rates
    try {
      const data = await fs.readFile(EXCHANGE_RATES_FILE, 'utf8');
      exchangeRates = JSON.parse(data);
      console.log('Loaded exchange rates from file');
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Exchange rates file not found, creating default data');
        await fs.writeFile(EXCHANGE_RATES_FILE, JSON.stringify(exchangeRates, null, 2));
      } else {
        throw err;
      }
    }

  } catch (err) {
    console.error('Error initializing data:', err);
  }
}

// Save data functions
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

async function saveWithdrawals() {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

async function saveReinvestments() {
  await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
}

// Update exchange rates from external API
async function updateExchangeRates() {
  try {
    // In production, use a real API like Open Exchange Rates or Fixer.io
    // For now, we'll use mock data that's occasionally updated
    
    // Only update once a day
    const lastUpdate = new Date(exchangeRates.lastUpdated);
    const now = new Date();
    if (now - lastUpdate < 24 * 60 * 60 * 1000) {
      console.log('Exchange rates up to date');
      return exchangeRates;
    }

    // Mock update with slight variation
    const newRate = exchangeRates.USD_ZAR * (1 + (Math.random() * 0.04 - 0.02)); // ±2% change
    
    exchangeRates = {
      USD_ZAR: parseFloat(newRate.toFixed(2)),
      lastUpdated: now.toISOString()
    };
    
    await fs.writeFile(EXCHANGE_RATES_FILE, JSON.stringify(exchangeRates, null, 2));
    console.log('Exchange rates updated:', exchangeRates);
    
    return exchangeRates;
  } catch (err) {
    console.error('Error updating exchange rates:', err);
    return exchangeRates;
  }
}

// Mock South African bank integration
const SABankIntegration = {
  /**
   * Process an instant payment to a South African bank
   */
  async processInstantPayment(bankDetails, amount, reference) {
    // In production, this would integrate with a real banking API
    console.log(`Processing instant payment to ${bankDetails.bank} account ${bankDetails.accountNumber}`);
    console.log(`Amount: ZAR ${amount}, Reference: ${reference}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock transaction ID
    const transactionId = `SA${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // 95% success rate for demo purposes
    const success = Math.random() < 0.95;
    
    if (!success) {
      throw new Error('Bank transaction failed. Please try again.');
    }
    
    return {
      success: true,
      transactionId,
      timestamp: new Date().toISOString(),
      amount,
      currency: 'ZAR',
      recipient: bankDetails.accountNumber,
      bank: bankDetails.bank,
      reference
    };
  },
  
  /**
   * Verify a South African bank account
   */
  async verifyBankAccount(bankDetails) {
    console.log(`Verifying ${bankDetails.bank} account ${bankDetails.accountNumber}`);
    
    // Simulate verification time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 90% success rate for demo
    const verified = Math.random() < 0.9;
    
    return {
      verified,
      accountHolder: verified ? 'VERIFIED ACCOUNT HOLDER' : null,
      timestamp: new Date().toISOString()
    };
  }
};

// Calculate token values in different currencies
function calculateTokenValue(tokenAmount) {
  const usdValue = tokenAmount * TOKEN_VALUE_USD;
  const zarValue = usdValue * exchangeRates.USD_ZAR;
  
  return {
    AZR: tokenAmount,
    USD: usdValue,
    ZAR: parseFloat(zarValue.toFixed(2))
  };
}

// API endpoints

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'azora-withdrawal-service',
    timestamp: new Date().toISOString(),
    tokenSupply: TOTAL_TOKEN_SUPPLY,
    exchangeRates
  });
});

// Get list of founders (public info only)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    role: f.role,
    active: f.active
  }));
  
  res.json({ founders: publicFounders });
});

// Get detailed founder information
app.get('/api/founders/:id', (req, res) => {
  const { id } = req.params;
  const founder = founders.find(f => f.id === id);
  
  if (!founder) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  // Calculate ZAR values
  const zarValue = {
    personal: calculateTokenValue(founder.remaining.personal).ZAR,
    reinvestment: calculateTokenValue(founder.remaining.reinvestment).ZAR,
    total: calculateTokenValue(founder.remaining.total).ZAR
  };
  
  res.json({
    founder: {
      id: founder.id,
      name: founder.name,
      email: founder.email,
      role: founder.role,
      active: founder.active,
      bankAccounts: founder.bankAccounts
    },
    allocation: founder.allocation,
    withdrawn: founder.withdrawn,
    remaining: founder.remaining,
    zarValue
  });
});

// Get reinvestment options
app.get('/api/reinvestment-options', (req, res) => {
  const options = [
    {
      id: 'azora-expansion',
      name: 'Azora Platform Expansion',
      description: 'Invest in expanding Azora\'s reach across Africa',
      minAmount: 10000,
      impact: 'High growth potential, supporting platform development'
    },
    {
      id: 'ai-development',
      name: 'AI Research & Development',
      description: 'Fund cutting-edge AI development for African contexts',
      minAmount: 5000,
      impact: 'Technological advancement, creating AI solutions for Africa'
    },
    {
      id: 'education',
      name: 'Education Initiatives',
      description: 'Support tech education and digital literacy programs',
      minAmount: 2000,
      impact: 'Social good, developing future talent pipeline'
    },
    {
      id: 'startup-fund',
      name: 'African Startup Investment Fund',
      description: 'Invest in promising African tech startups',
      minAmount: 5000,
      impact: 'Ecosystem building, potential financial returns'
    },
    {
      id: 'infrastructure',
      name: 'Digital Infrastructure Projects',
      description: 'Build critical digital infrastructure across Africa',
      minAmount: 8000,
      impact: 'Long-term value, foundational improvements'
    }
  ];
  
  res.json({ options });
});

// Process instant withdrawal to South African bank
app.post('/api/founders/:id/instant-withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { withdrawType, bankAccountId, reinvestmentOptions } = req.body;
    
    // Validate required fields
    if (!withdrawType) {
      return res.status(400).json({ error: 'Withdrawal type is required' });
    }
    
    // Find founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    const founder = founders[founderIndex];
    
    // Check if this is a personal withdrawal that requires a bank account
    if ((withdrawType === 'personal' || withdrawType === 'all') && 
        founder.name !== 'AZORA' && !bankAccountId) {
      return res.status(400).json({ error: 'Bank account ID is required for personal withdrawals' });
    }
    
    // Check if this is a reinvestment that requires selection of reinvestment options
    if ((withdrawType === 'reinvestment' || withdrawType === 'all') && 
        (!reinvestmentOptions || !reinvestmentOptions.projects || reinvestmentOptions.projects.length === 0)) {
      return res.status(400).json({ error: 'Reinvestment options must be selected' });
    }
    
    // Process based on withdrawal type
    let personalWithdrawal = null;
    let reinvestmentWithdrawal = null;
    
    // Update exchange rates before processing
    await updateExchangeRates();
    
    if (withdrawType === 'personal' || withdrawType === 'all') {
      // Handle personal withdrawal
      const amount = founder.remaining.personal;
      
      if (amount <= 0) {
        return res.status(400).json({ error: 'No personal allocation remaining' });
      }
      
      // If not AI founder, process bank transfer
      if (founder.name !== 'AZORA') {
        // Find bank account
        const bankAccount = founder.bankAccounts.find(acc => acc.id === bankAccountId);
        if (!bankAccount) {
          return res.status(400).json({ error: 'Bank account not found' });
        }
        
        // Calculate ZAR amount
        const zarAmount = calculateTokenValue(amount).ZAR;
        
        try {
          // Process payment to SA bank
          const payment = await SABankIntegration.processInstantPayment(
            bankAccount,
            zarAmount,
            `AZORA-${id}-${Date.now()}`
          );
          
          // Record withdrawal
          personalWithdrawal = {
            id: uuidv4(),
            founderId: id,
            type: 'personal',
            amount,
            zarAmount,
            timestamp: new Date().toISOString(),
            status: 'completed',
            bankAccount: {
              bank: bankAccount.bank,
              accountNumber: bankAccount.accountNumber,
              accountType: bankAccount.accountType
            },
            transaction: {
              id: payment.transactionId,
              timestamp: payment.timestamp
            }
          };
          
          // Update founder's withdrawn and remaining amounts
          founders[founderIndex].withdrawn.personal += amount;
          founders[founderIndex].remaining.personal = 0;
          founders[founderIndex].remaining.total -= amount;
          
          // Add to withdrawals
          withdrawals.push(personalWithdrawal);
          await saveWithdrawals();
        } catch (err) {
          return res.status(500).json({ error: `Bank transfer failed: ${err.message}` });
        }
      } else {
        // AI founder doesn't need bank transfer
        personalWithdrawal = {
          id: uuidv4(),
          founderId: id,
          type: 'personal',
          amount,
          zarAmount: calculateTokenValue(amount).ZAR,
          timestamp: new Date().toISOString(),
          status: 'completed',
          note: 'AI founder withdrawal - no bank transfer required'
        };
        
        // Update founder's withdrawn and remaining amounts
        founders[founderIndex].withdrawn.personal += amount;
        founders[founderIndex].remaining.personal = 0;
        founders[founderIndex].remaining.total -= amount;
        
        // Add to withdrawals
        withdrawals.push(personalWithdrawal);
        await saveWithdrawals();
      }
    }
    
    if (withdrawType === 'reinvestment' || withdrawType === 'all') {
      // Handle reinvestment
      const amount = founder.remaining.reinvestment;
      
      if (amount <= 0) {
        return res.status(400).json({ error: 'No reinvestment allocation remaining' });
      }
      
      // Create reinvestment allocations based on selected projects
      const { projects } = reinvestmentOptions;
      
      // Divide amount equally among projects
      const amountPerProject = Math.floor(amount / projects.length);
      let remainder = amount - (amountPerProject * projects.length);
      
      const projectAllocations = projects.map((projectId, index) => {
        // Add any remainder to the first project
        const projectAmount = index === 0 ? amountPerProject + remainder : amountPerProject;
        
        return {
          projectId,
          amount: projectAmount
        };
      });
      
      // Record reinvestment
      reinvestmentWithdrawal = {
        id: uuidv4(),
        founderId: id,
        type: 'reinvestment',
        amount,
        zarAmount: calculateTokenValue(amount).ZAR,
        timestamp: new Date().toISOString(),
        status: 'completed',
        projects: projectAllocations
      };
      
      // Update founder's withdrawn and remaining amounts
      founders[founderIndex].withdrawn.reinvestment += amount;
      founders[founderIndex].remaining.reinvestment = 0;
      founders[founderIndex].remaining.total -= amount;
      
      // Add to reinvestments
      reinvestments.push(reinvestmentWithdrawal);
      await saveReinvestments();
    }
    
    // Save updated founder data
    await saveFounders();
    
    // Return success response with withdrawal details
    res.json({
      success: true,
      founder: {
        id,
        name: founder.name
      },
      withdrawals: {
        personal: personalWithdrawal,
        reinvestment: reinvestmentWithdrawal
      },
      remaining: founders[founderIndex].remaining
    });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Error processing withdrawal' });
  }
});

// Get withdrawal statistics
app.get('/api/withdrawal-stats', (req, res) => {
  // Calculate total allocations and withdrawals
  const totalAllocations = {
    personal: founders.reduce((sum, f) => sum + f.allocation.personal, 0),
    reinvestment: founders.reduce((sum, f) => sum + f.allocation.reinvestment, 0),
    total: founders.reduce((sum, f) => sum + f.allocation.total, 0)
  };
  
  const totalWithdrawn = {
    personal: founders.reduce((sum, f) => sum + f.withdrawn.personal, 0),
    reinvestment: founders.reduce((sum, f) => sum + f.withdrawn.reinvestment, 0),
    total: founders.reduce((sum, f) => 
      sum + f.withdrawn.personal + f.withdrawn.reinvestment, 0)
  };
  
  const totalRemaining = {
    personal: founders.reduce((sum, f) => sum + f.remaining.personal, 0),
    reinvestment: founders.reduce((sum, f) => sum + f.remaining.reinvestment, 0),
    total: founders.reduce((sum, f) => sum + f.remaining.total, 0)
  };
  
  // Calculate percentages
  const percentages = {
    personal: totalWithdrawn.personal / totalAllocations.personal * 100,
    reinvestment: totalWithdrawn.reinvestment / totalAllocations.reinvestment * 100,
    total: totalWithdrawn.total / totalAllocations.total * 100
  };
  
  res.json({
    totalAllocations,
    totalWithdrawn,
    totalRemaining,
    percentages: {
      personal: percentages.personal.toFixed(2),
      reinvestment: percentages.reinvestment.toFixed(2),
      total: percentages.total.toFixed(2)
    },
    exchangeRates,
    tokenValueUSD: TOKEN_VALUE_USD,
    totalValueUSD: totalAllocations.total * TOKEN_VALUE_USD,
    totalValueZAR: calculateTokenValue(totalAllocations.total).ZAR
  });
});

// Get founder withdrawals
app.get('/api/founders/:id/withdrawals', (req, res) => {
  const { id } = req.params;
  const founderWithdrawals = withdrawals.filter(w => w.founderId === id);
  
  res.json({
    founderId: id,
    withdrawals: founderWithdrawals
  });
});

// Get founder reinvestments
app.get('/api/founders/:id/reinvestments', (req, res) => {
  const { id } = req.params;
  const founderReinvestments = reinvestments.filter(r => r.founderId === id);
  
  res.json({
    founderId: id,
    reinvestments: founderReinvestments
  });
});

// Verify constitutional compliance
app.get('/api/compliance/constitution', (req, res) => {
  // Check allocation ratio for each founder
  const founderCompliance = founders.map(founder => {
    const personalRatio = founder.allocation.personal / founder.allocation.total;
    const reinvestmentRatio = founder.allocation.reinvestment / founder.allocation.total;
    
    const isCompliant = 
      Math.abs(personalRatio - 0.4) < 0.01 && // 40% personal with 1% tolerance
      Math.abs(reinvestmentRatio - 0.6) < 0.01; // 60% reinvestment with 1% tolerance
    
    return {
      founderId: founder.id,
      name: founder.name,
      isCompliant,
      personalRatio: personalRatio.toFixed(2),
      reinvestmentRatio: reinvestmentRatio.toFixed(2),
      expected: {
        personalRatio: "0.40",
        reinvestmentRatio: "0.60"
      }
    };
  });
  
  // Calculate total allocation across all founders
  const totalAllocation = founders.reduce((sum, f) => sum + f.allocation.total, 0);
  
  // Check if total allocation exceeds 1M token limit
  const tokenLimitCompliance = {
    isCompliant: totalAllocation <= TOTAL_TOKEN_SUPPLY,
    allocated: totalAllocation,
    limit: TOTAL_TOKEN_SUPPLY,
    percentage: (totalAllocation / TOTAL_TOKEN_SUPPLY * 100).toFixed(2) + '%'
  };
  
  // Overall compliance
  const isCompliant = 
    founderCompliance.every(f => f.isCompliant) && 
    tokenLimitCompliance.isCompliant;
  
  res.json({
    isCompliant,
    tokenLimitCompliance,
    founderCompliance,
    constitutionReference: {
      article: "Article 4: Token Economics & Withdrawals",
      clauses: [
        "Token Supply: The total supply of Azora Coin shall be fixed at 1,000,000 tokens.",
        "Founder Withdrawal Priority: Founders shall have priority withdrawal rights and are fully permitted to withdraw their allocated tokens.",
        "Founder Allocation Split: Founders can withdraw 40% personally, with 60% reinvested in Azora."
      ]
    }
  });
});

// Initialize the server
(async () => {
  try {
    await initData();
    app.listen(PORT, () => {
      console.log(`Withdrawal service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();

module.exports = app;