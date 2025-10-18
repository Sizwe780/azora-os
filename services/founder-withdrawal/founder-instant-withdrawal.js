/**
 * Azora OS Founder Instant Withdrawal System
 * 
 * Enables founders to instantly withdraw 100% of their coin value
 * to South African banks while ensuring Constitutional compliance.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.FOUNDER_INSTANT_WITHDRAWAL_PORT || 4096;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const REINVESTMENTS_FILE = path.join(DATA_DIR, 'reinvestments.json');
const LEDGER_FILE = path.join(DATA_DIR, 'token-ledger.json');

// Ensure data directory exists
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// South African bank API configuration
const bankApis = {
  'standard-bank': {
    baseUrl: 'https://api.standardbank.co.za/sandbox',
    apiKey: process.env.STANDARD_BANK_API_KEY || 'sb_test_key_2025',
    endpoints: {
      balance: '/accounts/balance',
      transfer: '/payments/instant'
    }
  },
  'fnb': {
    baseUrl: 'https://api.fnb.co.za/sandbox',
    apiKey: process.env.FNB_API_KEY || 'fnb_test_key_2025',
    endpoints: {
      balance: '/accounts/balance',
      transfer: '/payments/instant'
    }
  }
};

// Mock exchange rate (in a real system, this would be fetched from an API)
const exchangeRate = {
  'AZR/ZAR': 150.00 // 1 AZR = 150 ZAR
};

// Load data from files
async function loadFounders() {
  try {
    const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create sample founders if file doesn't exist
      const defaultFounders = [
        { 
          id: '1', 
          name: 'Sizwe Ngwenya', 
          email: 'sizwe.ngwenya@azora.world', 
          allocation: 100000, // 10% of total supply
          withdrawn: {
            personal: 0,
            reinvested: 0
          },
          role: 'CEO & CTO',
          bankAccounts: [
            {
              bank: 'standard-bank',
              accountNumber: '1234567890',
              accountType: 'current',
              branchCode: '051001'
            }
          ],
          active: true
        },
        { 
          id: '2', 
          name: 'Sizwe Motingwe', 
          email: 'sizwe.motingwe@azora.world', 
          allocation: 100000, // 10% of total supply
          withdrawn: {
            personal: 0,
            reinvested: 0
          },
          role: 'CFO & Head of Sales',
          bankAccounts: [
            {
              bank: 'fnb',
              accountNumber: '0987654321',
              accountType: 'business',
              branchCode: '250655'
            }
          ],
          active: true
        },
        { 
          id: '3', 
          name: 'Milla Mukundi', 
          email: 'milla.mukundi@azora.world', 
          allocation: 80000, // 8% of total supply
          withdrawn: {
            personal: 0,
            reinvested: 0
          },
          role: 'COO',
          bankAccounts: [
            {
              bank: 'standard-bank',
              accountNumber: '5678901234',
              accountType: 'current',
              branchCode: '051001'
            }
          ],
          active: true
        },
        { 
          id: '4', 
          name: 'Nolundi Ngwenya', 
          email: 'nolundi.ngwenya@azora.world', 
          allocation: 80000, // 8% of total supply
          withdrawn: {
            personal: 0,
            reinvested: 0
          },
          role: 'CMO & Head of Retail',
          bankAccounts: [
            {
              bank: 'fnb',
              accountNumber: '1357924680',
              accountType: 'current',
              branchCode: '250655'
            }
          ],
          active: true
        },
        { 
          id: '5', 
          name: 'AZORA', 
          email: 'azora.ai@azora.world', 
          allocation: 40000, // 4% of total supply
          withdrawn: {
            personal: 0,
            reinvested: 40000 // AI founder auto-reinvests 100%
          },
          role: 'AI Deputy CEO & Sixth Founder',
          active: true
        }
      ];
      
      await fs.writeFile(FOUNDERS_FILE, JSON.stringify(defaultFounders, null, 2));
      return defaultFounders;
    }
    throw err;
  }
}

async function loadWithdrawals() {
  try {
    const data = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    throw err;
  }
}

async function loadReinvestments() {
  try {
    const data = await fs.readFile(REINVESTMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    throw err;
  }
}

async function loadLedger() {
  try {
    const data = await fs.readFile(LEDGER_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const defaultLedger = {
        totalSupply: 1000000, // 1 million tokens
        circulating: 0,
        allocated: {
          founders: 400000, // 40% for founders
          users: 600000,    // 60% for users
        },
        withdrawn: {
          founders: {
            personal: 0,
            reinvested: 40000 // AZORA's initial reinvestment
          },
          users: 0
        }
      };
      await fs.writeFile(LEDGER_FILE, JSON.stringify(defaultLedger, null, 2));
      return defaultLedger;
    }
    throw err;
  }
}

// Save data to files
async function saveFounders(founders) {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

async function saveWithdrawals(withdrawals) {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

async function saveReinvestments(reinvestments) {
  await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
}

async function saveLedger(ledger) {
  await fs.writeFile(LEDGER_FILE, JSON.stringify(ledger, null, 2));
}

// Mock bank API functions (in a real system, these would call actual bank APIs)
async function mockBankTransfer(bank, accountDetails, amount) {
  // In a real implementation, this would call the bank's API
  console.log(`Sending ${amount} ZAR to ${accountDetails.accountNumber} at ${bank}`);
  
  // Simulate API call
  return {
    success: true,
    transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    amount: amount,
    currency: 'ZAR',
    recipientAccount: accountDetails.accountNumber,
    status: 'completed'
  };
}

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'founder-instant-withdrawal',
    timestamp: new Date().toISOString()
  });
});

// Get founder withdrawal status
app.get('/api/founders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const founders = await loadFounders();
    
    const founder = founders.find(f => f.id === id);
    
    if (!founder) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Calculate withdrawal limits based on Constitution
    const personalAllowance = founder.allocation * 0.4; // 40% for personal use
    const reinvestmentRequired = founder.allocation * 0.6; // 60% must be reinvested
    
    // Calculate remaining amounts
    const personalRemaining = personalAllowance - founder.withdrawn.personal;
    const reinvestmentRemaining = reinvestmentRequired - founder.withdrawn.reinvested;
    
    // Calculate ZAR values
    const personalZAR = personalRemaining * exchangeRate['AZR/ZAR'];
    const reinvestmentZAR = reinvestmentRemaining * exchangeRate['AZR/ZAR'];
    
    res.json({
      founder: {
        id: founder.id,
        name: founder.name,
        role: founder.role,
        email: founder.email,
        bankAccounts: founder.bankAccounts,
      },
      allocation: {
        total: founder.allocation,
        personal: personalAllowance,
        reinvestment: reinvestmentRequired
      },
      withdrawn: founder.withdrawn,
      remaining: {
        personal: personalRemaining,
        reinvestment: reinvestmentRemaining,
        total: personalRemaining + reinvestmentRemaining
      },
      zarValue: {
        personal: personalZAR,
        reinvestment: reinvestmentZAR,
        total: personalZAR + reinvestmentZAR
      }
    });
  } catch (err) {
    console.error('Error getting founder status:', err);
    res.status(500).json({ error: 'Failed to get founder status' });
  }
});

// Process founder instant withdrawal
app.post('/api/founders/:id/instant-withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      withdrawType, // 'personal', 'reinvestment', or 'all'
      bankAccountId,
      reinvestmentOptions
    } = req.body;
    
    if (!withdrawType || !['personal', 'reinvestment', 'all'].includes(withdrawType)) {
      return res.status(400).json({ error: 'Invalid withdrawal type' });
    }
    
    // Load necessary data
    const founders = await loadFounders();
    const withdrawals = await loadWithdrawals();
    const reinvestments = await loadReinvestments();
    const ledger = await loadLedger();
    
    // Find founder
    const founderIndex = founders.findIndex(f => f.id === id);
    if (founderIndex === -1) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    const founder = founders[founderIndex];
    
    // Skip bank validation for AI founder
    const isAiFounder = founder.name === 'AZORA';
    
    // Validate bank account if not AI founder
    if (!isAiFounder && !bankAccountId) {
      return res.status(400).json({ error: 'Bank account ID is required' });
    }
    
    let bankAccount;
    if (!isAiFounder) {
      bankAccount = founder.bankAccounts.find(acc => acc.accountNumber === bankAccountId);
      if (!bankAccount) {
        return res.status(400).json({ error: 'Invalid bank account' });
      }
    }
    
    // Calculate withdrawal limits based on Constitution
    const personalAllowance = founder.allocation * 0.4; // 40% for personal use
    const reinvestmentRequired = founder.allocation * 0.6; // 60% must be reinvested
    
    // Calculate remaining amounts
    const personalRemaining = personalAllowance - founder.withdrawn.personal;
    const reinvestmentRemaining = reinvestmentRequired - founder.withdrawn.reinvested;
    
    // Determine withdrawal amounts based on type
    let personalAmount = 0;
    let reinvestmentAmount = 0;
    
    if (withdrawType === 'personal' || withdrawType === 'all') {
      personalAmount = personalRemaining;
    }
    
    if (withdrawType === 'reinvestment' || withdrawType === 'all') {
      reinvestmentAmount = reinvestmentRemaining;
      
      // Validate reinvestment options
      if (!reinvestmentOptions && reinvestmentAmount > 0) {
        return res.status(400).json({ 
          error: 'Reinvestment options required',
          message: 'Please specify how you want to reinvest your tokens'
        });
      }
    }
    
    // Calculate ZAR values
    const personalZAR = personalAmount * exchangeRate['AZR/ZAR'];
    
    let bankTransactionId = null;
    
    // Process bank transfer for personal withdrawal (if applicable and not AI founder)
    if (personalAmount > 0 && !isAiFounder) {
      try {
        // In a real implementation, this would call the bank's API
        const bankTransferResult = await mockBankTransfer(
          bankAccount.bank,
          bankAccount,
          personalZAR
        );
        
        bankTransactionId = bankTransferResult.transactionId;
      } catch (err) {
        console.error('Error processing bank transfer:', err);
        return res.status(500).json({ error: 'Bank transfer failed' });
      }
    }
    
    // Record personal withdrawal if applicable
    if (personalAmount > 0) {
      const withdrawal = {
        id: crypto.randomUUID(),
        founderId: founder.id,
        founderName: founder.name,
        type: 'personal',
        amount: personalAmount,
        zarValue: personalZAR,
        timestamp: new Date().toISOString(),
        status: 'completed',
        transactionDetails: isAiFounder ? {
          method: 'AI founder - no bank transfer required'
        } : {
          bank: bankAccount.bank,
          accountNumber: bankAccount.accountNumber,
          bankTransactionId
        }
      };
      
      withdrawals.push(withdrawal);
      
      // Update founder's withdrawn amount
      founders[founderIndex].withdrawn.personal += personalAmount;
      
      // Update ledger
      ledger.withdrawn.founders.personal += personalAmount;
      ledger.circulating += personalAmount;
    }
    
    // Record reinvestment if applicable
    if (reinvestmentAmount > 0) {
      const reinvestment = {
        id: crypto.randomUUID(),
        founderId: founder.id,
        founderName: founder.name,
        amount: reinvestmentAmount,
        zarValue: reinvestmentAmount * exchangeRate['AZR/ZAR'],
        timestamp: new Date().toISOString(),
        status: 'completed',
        options: reinvestmentOptions || {
          autoAllocated: true,
          projects: ['Azora OS Core Development']
        }
      };
      
      reinvestments.push(reinvestment);
      
      // Update founder's reinvested amount
      founders[founderIndex].withdrawn.reinvested += reinvestmentAmount;
      
      // Update ledger
      ledger.withdrawn.founders.reinvested += reinvestmentAmount;
      ledger.circulating += reinvestmentAmount; // reinvested tokens are also in circulation but restricted
    }
    
    // Save updated data
    await Promise.all([
      saveFounders(founders),
      saveWithdrawals(withdrawals),
      saveReinvestments(reinvestments),
      saveLedger(ledger)
    ]);
    
    // Return successful response
    res.json({
      success: true,
      withdrawal: {
        personal: personalAmount,
        reinvestment: reinvestmentAmount,
        total: personalAmount + reinvestmentAmount,
        zarValue: {
          personal: personalZAR,
          reinvestment: reinvestmentAmount * exchangeRate['AZR/ZAR'],
          total: personalZAR + (reinvestmentAmount * exchangeRate['AZR/ZAR'])
        },
        timestamp: new Date().toISOString()
      },
      remaining: {
        personal: personalRemaining - personalAmount,
        reinvestment: reinvestmentRemaining - reinvestmentAmount
      },
      bankTransaction: bankTransactionId ? {
        id: bankTransactionId,
        status: 'completed',
        bank: bankAccount?.bank
      } : null
    });
  } catch (err) {
    console.error('Error processing instant withdrawal:', err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get reinvestment options
app.get('/api/reinvestment-options', (req, res) => {
  res.json({
    options: [
      {
        id: 'os-development',
        name: 'Azora OS Core Development',
        description: 'Fund the ongoing development of Azora OS core features',
        minAmount: 1000,
        impact: 'High'
      },
      {
        id: 'community-growth',
        name: 'Community Growth Initiatives',
        description: 'Expand the Azora community through events and programs',
        minAmount: 5000,
        impact: 'Medium'
      },
      {
        id: 'regional-expansion',
        name: 'African Regional Expansion',
        description: 'Fund expansion to new African countries',
        minAmount: 10000,
        impact: 'High'
      },
      {
        id: 'research-development',
        name: 'R&D Projects',
        description: 'Research and develop new technologies for Azora',
        minAmount: 5000,
        impact: 'Medium'
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure Improvements',
        description: 'Enhance Azora\'s technical infrastructure',
        minAmount: 3000,
        impact: 'High'
      }
    ]
  });
});

// Get withdrawal statistics
app.get('/api/withdrawal-stats', async (req, res) => {
  try {
    const founders = await loadFounders();
    const ledger = await loadLedger();
    
    const founderStats = founders.map(founder => {
      const personalAllowance = founder.allocation * 0.4;
      const reinvestmentRequired = founder.allocation * 0.6;
      
      return {
        id: founder.id,
        name: founder.name,
        allocation: founder.allocation,
        withdrawn: founder.withdrawn,
        personalPercentage: (founder.withdrawn.personal / personalAllowance * 100).toFixed(2),
        reinvestmentPercentage: (founder.withdrawn.reinvested / reinvestmentRequired * 100).toFixed(2),
        totalPercentage: ((founder.withdrawn.personal + founder.withdrawn.reinvested) / founder.allocation * 100).toFixed(2)
      };
    });
    
    const totalFounderAllocation = ledger.allocated.founders;
    const totalPersonalAllowance = totalFounderAllocation * 0.4;
    const totalReinvestmentRequired = totalFounderAllocation * 0.6;
    
    res.json({
      founderStats,
      overallStats: {
        totalFounderAllocation,
        totalPersonalAllowance,
        totalReinvestmentRequired,
        withdrawn: ledger.withdrawn.founders,
        personalPercentage: (ledger.withdrawn.founders.personal / totalPersonalAllowance * 100).toFixed(2),
        reinvestmentPercentage: (ledger.withdrawn.founders.reinvested / totalReinvestmentRequired * 100).toFixed(2),
        totalPercentage: ((ledger.withdrawn.founders.personal + ledger.withdrawn.founders.reinvested) / totalFounderAllocation * 100).toFixed(2)
      }
    });
  } catch (err) {
    console.error('Error getting withdrawal statistics:', err);
    res.status(500).json({ error: 'Failed to get withdrawal statistics' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Founder Instant Withdrawal Service running on port ${PORT}`);
});

module.exports = app;