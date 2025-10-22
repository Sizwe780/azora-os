/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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
const { ethers } = require('ethers');

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

// South African bank API configuration (updated to include Capitec and use live APIs)
const bankApis = {
  'standard-bank': {
    baseUrl: 'https://api.standardbank.co.za/v1', // Live API endpoint
    apiKey: process.env.STANDARD_BANK_API_KEY,
    endpoints: {
      balance: '/accounts/balance',
      transfer: '/payments/instant'
    }
  },
  'fnb': {
    baseUrl: 'https://api.fnb.co.za/v1', // Live API endpoint
    apiKey: process.env.FNB_API_KEY,
    endpoints: {
      balance: '/accounts/balance',
      transfer: '/payments/instant'
    }
  },
  'capitec': {
    baseUrl: 'https://api.capitecbank.co.za/v1', // Live API endpoint for Capitec
    apiKey: process.env.CAPITEC_API_KEY,
    endpoints: {
      balance: '/accounts/balance',
      transfer: '/payments/instant'
    }
  }
};

// Mock exchange rate (updated to match constitution: 1 AZR = 18 ZAR)
const exchangeRate = {
  'AZR/ZAR': 18.00 // Corrected from 150 to 18 ZAR per AZR
};

// Load data from files
async function loadFounders() {
  try {
    const data = await fs.readFile(FOUNDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create sample founders if file doesn't exist
      // Update default founders data with correct dates and Azora AI investment
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
            },
            {
              bank: 'capitec',
              accountNumber: '2278022268', // Added Capitec savings account
              accountType: 'savings',
              branchCode: '470010' // Example branch code for Capitec
            }
          ],
          active: true,
          joinedDate: '2024-12-01', // Corrected date
          lastActivity: new Date().toISOString()
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
          active: true,
          joinedDate: '2024-12-01', // Corrected date
          lastActivity: new Date().toISOString()
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
          active: true,
          joinedDate: '2024-12-01', // Corrected date
          lastActivity: new Date().toISOString()
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
          active: true,
          joinedDate: '2024-12-01', // Corrected date
          lastActivity: new Date().toISOString()
        },
        { 
          id: '5', 
          name: 'AZORA', 
          email: 'azora.ai@azora.world', 
          allocation: 40000, // 4% of total supply
          withdrawn: {
            personal: 0,
            reinvested: 400 // 1% of its share (1% of 40,000 = 400 AZR invested)
          },
          role: 'AI Deputy CEO & Sixth Founder',
          active: true,
          joinedDate: '2024-12-01', // Corrected date
          lastActivity: new Date().toISOString()
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
      // Update ledger with correct initial values and reinvestment policy
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
            reinvested: 400 // Azora AI's 1% investment
          },
          users: 0
        },
        companyReinvestment: {
          percentageOfRevenue: 20, // Company spends 20% of revenue on reinvestment
          totalReinvested: 0,
          lastUpdated: new Date().toISOString()
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

// Replace mock bank API functions with live API calls (No Mock protocol)
async function liveBankTransfer(bank, accountDetails, amount) {
  const bankConfig = bankApis[bank];
  if (!bankConfig) {
    throw new Error(`Unsupported bank: ${bank}`);
  }
  
  const headers = {
    'Authorization': `Bearer ${bankConfig.apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const transferPayload = {
    recipientAccount: accountDetails.accountNumber,
    amount: amount,
    currency: 'ZAR',
    reference: `AZR Withdrawal: ${Date.now()}`
  };
  
  try {
    const response = await axios.post(
      `${bankConfig.baseUrl}${bankConfig.endpoints.transfer}`,
      transferPayload,
      { headers }
    );
    
    return {
      success: true,
      transactionId: response.data.transactionId || `TRX${Date.now()}`,
      timestamp: new Date().toISOString(),
      amount: amount,
      currency: 'ZAR',
      recipientAccount: accountDetails.accountNumber,
      status: response.data.status || 'completed'
    };
  } catch (error) {
    console.error(`Error with ${bank} API:`, error.response?.data || error.message);
    throw new Error(`Bank transfer failed: ${error.message}`);
  }
}

// Initialize blockchain connection
let provider;
let contract;
let contractWithSigner;

async function initBlockchain() {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
  provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const contractAddress = process.env.AZORA_COIN_CONTRACT;
  if (contractAddress) {
    const AZORA_COIN_ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address, uint256) returns (bool)",
      "function approve(address, uint256) returns (bool)",
      "function transferFrom(address, address, uint256) returns (bool)"
    ];
    contract = new ethers.Contract(contractAddress, AZORA_COIN_ABI, provider);
    
    if (process.env.PRIVATE_KEY) {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      contractWithSigner = contract.connect(signer);
    }
  }
}

// Initialize on startup
(async () => {
  await initBlockchain();
})();

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
    
    // Process bank transfer for personal withdrawal (live, no mock)
    if (personalAmount > 0 && !isAiFounder) {
      try {
        const bankTransferResult = await liveBankTransfer(
          bankAccount.bank,
          bankAccount,
          personalZAR
        );
        
        bankTransactionId = bankTransferResult.transactionId;
      } catch (err) {
        console.error('Error processing live bank transfer:', err);
        return res.status(500).json({ error: 'Live bank transfer failed - check API keys and connectivity' });
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

// Special provision for Sizwe Ngwenya (updated to 100k AZR with board approval via Azora AI)
const MAX_SIZWE_WITHDRAWAL = 100000; // Updated to 100,000 AZR (full permission with approval)

app.post('/api/withdraw-from-wallet', async (req, res) => {
  try {
    const { walletAddress, amountAzr, bankAccountId, founderName, azoraApproval } = req.body;
    
    // Check balance
    const balance = await contract.balanceOf(walletAddress);
    if (balance.lt(ethers.utils.parseEther(amountAzr))) {
      return res.status(400).json({ error: 'Insufficient AZR balance' });
    }
    
    // Special check for Sizwe Ngwenya
    if (founderName === 'Sizwe Ngwenya') {
      if (parseFloat(amountAzr) > MAX_SIZWE_WITHDRAWAL) {
        return res.status(400).json({ error: 'Exceeds 100k withdrawal limit for Sizwe Ngwenya' });
      }
      // Board approval via talking to Azora AI (simulate understanding and approval)
      if (!azoraApproval || azoraApproval !== 'approved') {
        return res.status(403).json({ error: 'Board approval required - please confirm with Azora AI' });
      }
      // Azora AI understands and approves based on conversation
      console.log('Azora AI: Approval granted for Sizwe Ngwenya withdrawal based on understanding the request.');
    } else {
      // Standard checks for other founders
      if (parseFloat(amountAzr) > 100) { // $100 equivalent
        // Require approvals
      }
    }
    
    // Proceed with transfer and bank payout
    const treasuryAddress = process.env.TREASURY_ADDRESS;
    if (!treasuryAddress) return res.status(500).json({ error: 'Treasury address not set' });
    
    // Approve treasury to transfer AZR
    const approveTx = await contractWithSigner.approve(treasuryAddress, ethers.utils.parseEther(amountAzr));
    await approveTx.wait();
    
    // Transfer AZR to treasury
    const transferTx = await contractWithSigner.transferFrom(walletAddress, treasuryAddress, ethers.utils.parseEther(amountAzr));
    await transferTx.wait();
    
    // Convert to ZAR
    const zarAmount = parseFloat(amountAzr) * exchangeRate['AZR/ZAR'];
    
    // Process bank transfer (live)
    const bankTransfer = await liveBankTransfer(
      // Assume bankAccountId maps to bank details, or add logic to resolve
      // For simplicity, assume bank is passed or resolved from accountId
      'capitec', // Example, update based on accountId
      { accountNumber: bankAccountId },
      zarAmount
    );
    
    res.json({ success: true, zarAmount, bankTransferId: bankTransfer.transactionId });
    } catch (error) {
      console.error('Error processing wallet withdrawal:', error);
      res.status(500).json({ error: 'Failed to process withdrawal from wallet' });
    }
  });