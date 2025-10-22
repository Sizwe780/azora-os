/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4093;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_DIR = path.join(DATA_DIR, 'founders');
const WITHDRAWALS_DIR = path.join(DATA_DIR, 'withdrawals');
const PARTNERS_DIR = path.join(DATA_DIR, 'partners');
const COMPLIANCE_URL = process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:4081';
const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:4090';

// Create necessary directories
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(FOUNDERS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(WITHDRAWALS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(PARTNERS_DIR, { recursive: true }).catch(console.error);
})();

// Exchange rates - In production would be fetched from an API
const EXCHANGE_RATES = {
  "ZAR": 18.50, // South African Rand to USD
  "NGN": 790.00, // Nigerian Naira to USD
  "KES": 130.25, // Kenyan Shilling to USD
  "GHS": 12.15, // Ghanaian Cedi to USD
  "USD": 1.00
};

// Supported withdrawal methods by country
const WITHDRAWAL_METHODS = {
  "ZA": [
    { id: "bank_transfer", name: "Bank Transfer (FNB, Standard Bank, Absa, Nedbank)", fee: 0.01 },
    { id: "ewallet", name: "eWallet", fee: 0.015 },
    { id: "mobile_money", name: "Mobile Money", fee: 0.02 },
    { id: "crypto", name: "Cryptocurrency (BTC, ETH, USDT)", fee: 0.005 }
  ],
  "NG": [
    { id: "bank_transfer", name: "Bank Transfer (GTBank, Access Bank, UBA)", fee: 0.01 },
    { id: "mobile_money", name: "Mobile Money", fee: 0.02 },
    { id: "crypto", name: "Cryptocurrency (BTC, ETH, USDT)", fee: 0.005 }
  ],
  "KE": [
    { id: "mpesa", name: "M-Pesa", fee: 0.01 },
    { id: "bank_transfer", name: "Bank Transfer", fee: 0.015 },
    { id: "crypto", name: "Cryptocurrency (BTC, ETH, USDT)", fee: 0.005 }
  ],
  "GH": [
    { id: "mobile_money", name: "Mobile Money (MTN, Vodafone, AirtelTigo)", fee: 0.015 },
    { id: "bank_transfer", name: "Bank Transfer", fee: 0.02 },
    { id: "crypto", name: "Cryptocurrency (BTC, ETH, USDT)", fee: 0.005 }
  ],
  "US": [
    { id: "ach", name: "ACH Transfer", fee: 0.005 },
    { id: "wire", name: "Wire Transfer", fee: 0.02 },
    { id: "crypto", name: "Cryptocurrency (BTC, ETH, USDT)", fee: 0.005 }
  ]
};

// Founder tiers
const FOUNDER_TIERS = {
  "genesis": {
    name: "Genesis Founder",
    minWithdrawal: 100, // USD
    maxWithdrawal: 10000, // USD
    cooldown: 30, // days between withdrawals
    guaranteedWithdrawal: true,
    priority: 1
  },
  "early": {
    name: "Early Founder",
    minWithdrawal: 50, // USD
    maxWithdrawal: 5000, // USD
    cooldown: 60, // days between withdrawals
    guaranteedWithdrawal: true,
    priority: 2
  },
  "contributor": {
    name: "Contributor",
    minWithdrawal: 25, // USD
    maxWithdrawal: 2500, // USD
    cooldown: 90, // days between withdrawals
    guaranteedWithdrawal: false,
    priority: 3
  }
};

// Get founder data
async function getFounder(founderId) {
  try {
    const filePath = path.join(FOUNDERS_DIR, `${founderId}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

// Save founder data
async function saveFounder(founder) {
  const filePath = path.join(FOUNDERS_DIR, `${founder.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(founder, null, 2));
}

// Create founder
async function createFounder(data) {
  const id = data.id || uuidv4();
  
  const founder = {
    id,
    name: data.name,
    email: data.email,
    country: data.country,
    tier: data.tier || "early",
    walletAddress: data.walletAddress,
    createdAt: new Date().toISOString(),
    totalWithdrawn: 0,
    lastWithdrawal: null,
    kycVerified: false,
    active: true,
    partners: [],
    withdrawalMethods: []
  };
  
  await saveFounder(founder);
  
  // Log to compliance service
  try {
    await fetch(`${COMPLIANCE_URL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'founder-benefits',
        action: 'founder.created',
        founderId: id,
        country: data.country,
        tier: data.tier || "early",
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.error('Failed to log to compliance service:', err);
  }
  
  return founder;
}

// Record withdrawal
async function recordWithdrawal(withdrawalData) {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  
  const withdrawal = {
    id,
    founderId: withdrawalData.founderId,
    amount: withdrawalData.amount,
    amountUSD: withdrawalData.amountUSD,
    currency: withdrawalData.currency,
    method: withdrawalData.method,
    status: 'pending',
    createdAt: timestamp,
    processedAt: null,
    completedAt: null,
    failedAt: null,
    failureReason: null,
    transactionId: null,
    guaranteedWithdrawal: withdrawalData.guaranteedWithdrawal || false
  };
  
  const filePath = path.join(WITHDRAWALS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(withdrawal, null, 2));
  
  // Update founder's last withdrawal
  const founder = await getFounder(withdrawalData.founderId);
  if (founder) {
    founder.lastWithdrawal = timestamp;
    founder.totalWithdrawn += withdrawalData.amountUSD;
    await saveFounder(founder);
  }
  
  // Log to compliance service
  try {
    await fetch(`${COMPLIANCE_URL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'founder-benefits',
        action: 'withdrawal.created',
        founderId: withdrawalData.founderId,
        withdrawalId: id,
        amount: withdrawalData.amount,
        amountUSD: withdrawalData.amountUSD,
        currency: withdrawalData.currency,
        method: withdrawalData.method,
        guaranteed: withdrawalData.guaranteedWithdrawal || false,
        timestamp
      })
    });
  } catch (err) {
    console.error('Failed to log to compliance service:', err);
  }
  
  return withdrawal;
}

// Get partner data
async function getPartner(partnerId) {
  try {
    const filePath = path.join(PARTNERS_DIR, `${partnerId}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

// Save partner data
async function savePartner(partner) {
  const filePath = path.join(PARTNERS_DIR, `${partner.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(partner, null, 2));
}

// Create partner
async function createPartner(data) {
  const id = data.id || uuidv4();
  
  const partner = {
    id,
    name: data.name,
    country: data.country,
    type: data.type || "business",
    joinDate: new Date().toISOString(),
    founder: data.founder || null,
    balance: data.initialBalance || 0,
    currency: data.currency || "USD",
    active: true,
    withdrawalCommitments: []
  };
  
  await savePartner(partner);
  
  // If partner linked to founder, update founder
  if (data.founder) {
    const founder = await getFounder(data.founder);
    if (founder) {
      founder.partners.push({
        id,
        name: data.name,
        joinDate: partner.joinDate
      });
      await saveFounder(founder);
    }
  }
  
  // Log to compliance service
  try {
    await fetch(`${COMPLIANCE_URL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'founder-benefits',
        action: 'partner.created',
        partnerId: id,
        founderLinked: data.founder ? true : false,
        founderId: data.founder || null,
        country: data.country,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.error('Failed to log to compliance service:', err);
  }
  
  return partner;
}

// API Endpoints

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'founder-benefits-service' });
});

// Get founder tiers
app.get('/api/founders/tiers', (_req, res) => {
  res.json({ tiers: FOUNDER_TIERS });
});

// Get withdrawal methods
app.get('/api/withdrawal-methods', (req, res) => {
  const { country = 'ZA' } = req.query;
  const countryCode = country.toUpperCase();
  
  const methods = WITHDRAWAL_METHODS[countryCode] || WITHDRAWAL_METHODS.US;
  
  res.json({ methods });
});

// Get exchange rates
app.get('/api/exchange-rates', (_req, res) => {
  res.json({ rates: EXCHANGE_RATES });
});

// Register founder
app.post('/api/founders', async (req, res) => {
  try {
    const { name, email, country, tier, walletAddress } = req.body;
    
    if (!name || !email || !country) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if tier is valid
    if (tier && !FOUNDER_TIERS[tier]) {
      return res.status(400).json({ error: 'Invalid founder tier' });
    }
    
    const founder = await createFounder({
      name,
      email,
      country,
      tier,
      walletAddress
    });
    
    res.status(201).json({
      success: true,
      founder: {
        id: founder.id,
        name: founder.name,
        country: founder.country,
        tier: founder.tier,
        guaranteedWithdrawal: FOUNDER_TIERS[founder.tier].guaranteedWithdrawal,
        minWithdrawal: FOUNDER_TIERS[founder.tier].minWithdrawal
      }
    });
  } catch (err) {
    console.error('Error registering founder:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get founder details
app.get('/api/founders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const founder = await getFounder(id);
    
    if (!founder) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Calculate next available withdrawal date
    const tierDetails = FOUNDER_TIERS[founder.tier];
    let nextWithdrawalDate = null;
    
    if (founder.lastWithdrawal) {
      const lastWithdrawalDate = new Date(founder.lastWithdrawal);
      nextWithdrawalDate = new Date(lastWithdrawalDate);
      nextWithdrawalDate.setDate(nextWithdrawalDate.getDate() + tierDetails.cooldown);
    }
    
    res.json({
      founder: {
        id: founder.id,
        name: founder.name,
        email: founder.email,
        country: founder.country,
        tier: founder.tier,
        tierDetails,
        walletAddress: founder.walletAddress,
        createdAt: founder.createdAt,
        totalWithdrawn: founder.totalWithdrawn,
        lastWithdrawal: founder.lastWithdrawal,
        nextWithdrawalDate: nextWithdrawalDate?.toISOString() || null,
        partners: founder.partners,
        withdrawalMethods: founder.withdrawalMethods,
        canWithdrawNow: !nextWithdrawalDate || new Date() >= nextWithdrawalDate
      }
    });
  } catch (err) {
    console.error('Error getting founder:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process withdrawal
app.post('/api/founders/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency = 'USD', method } = req.body;
    
    if (!amount || !method) {
      return res.status(400).json({ error: 'Amount and withdrawal method are required' });
    }
    
    const founder = await getFounder(id);
    if (!founder) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Check if founder can withdraw now
    const tierDetails = FOUNDER_TIERS[founder.tier];
    let canWithdrawNow = true;
    
    if (founder.lastWithdrawal) {
      const lastWithdrawalDate = new Date(founder.lastWithdrawal);
      const nextWithdrawalDate = new Date(lastWithdrawalDate);
      nextWithdrawalDate.setDate(nextWithdrawalDate.getDate() + tierDetails.cooldown);
      canWithdrawNow = new Date() >= nextWithdrawalDate;
    }
    
    if (!canWithdrawNow) {
      return res.status(400).json({ error: 'Withdrawal cooldown period has not elapsed' });
    }
    
    // Convert amount to USD
    const exchangeRate = EXCHANGE_RATES[currency] || 1;
    const amountUSD = amount / exchangeRate;
    
    // Check min/max withdrawal
    if (amountUSD < tierDetails.minWithdrawal) {
      return res.status(400).json({ 
        error: `Withdrawal amount is below the minimum of ${tierDetails.minWithdrawal} USD` 
      });
    }
    
    if (amountUSD > tierDetails.maxWithdrawal) {
      return res.status(400).json({ 
        error: `Withdrawal amount exceeds the maximum of ${tierDetails.maxWithdrawal} USD` 
      });
    }
    
    // Check if this is a guaranteed withdrawal (South Africa founders with tier that has guarantee)
    const isGuaranteed = tierDetails.guaranteedWithdrawal && founder.country === 'ZA';
    
    // Record withdrawal
    const withdrawal = await recordWithdrawal({
      founderId: id,
      amount,
      amountUSD,
      currency,
      method,
      guaranteedWithdrawal: isGuaranteed
    });
    
    res.status(201).json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount,
        amountUSD,
        currency,
        method,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
        guaranteed: isGuaranteed
      }
    });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register partner
app.post('/api/partners', async (req, res) => {
  try {
    const { name, country, type, founder, initialBalance, currency } = req.body;
    
    if (!name || !country) {
      return res.status(400).json({ error: 'Name and country are required' });
    }
    
    // If founder is provided, verify it exists
    if (founder) {
      const founderExists = await getFounder(founder);
      if (!founderExists) {
        return res.status(400).json({ error: 'Founder not found' });
      }
    }
    
    const partner = await createPartner({
      name,
      country,
      type,
      founder,
      initialBalance,
      currency
    });
    
    res.status(201).json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        country: partner.country,
        type: partner.type,
        joinDate: partner.joinDate,
        founderLinked: partner.founder ? true : false
      }
    });
  } catch (err) {
    console.error('Error registering partner:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Partner commits to fund founder withdrawals
app.post('/api/partners/:id/commit-withdrawal', async (req, res) => {
  try {
    const { id } = req.params;
    const { founderId, amount, currency = 'USD', duration } = req.body;
    
    if (!founderId || !amount || !duration) {
      return res.status(400).json({ error: 'Founder ID, amount, and duration are required' });
    }
    
    const partner = await getPartner(id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    const founder = await getFounder(founderId);
    if (!founder) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Convert amount to partner's currency if different
    let commitmentAmount = amount;
    if (currency !== partner.currency) {
      const exchangeRate = EXCHANGE_RATES[currency] / EXCHANGE_RATES[partner.currency];
      commitmentAmount = amount * exchangeRate;
    }
    
    // Check if partner has sufficient balance
    if (commitmentAmount > partner.balance) {
      return res.status(400).json({ error: 'Insufficient balance for commitment' });
    }
    
    // Create commitment
    const commitmentId = uuidv4();
    const commitment = {
      id: commitmentId,
      founderId,
      amount: commitmentAmount,
      currency: partner.currency,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    };
    
    // Update partner
    partner.balance -= commitmentAmount;
    partner.withdrawalCommitments.push(commitment);
    await savePartner(partner);
    
    // Log to compliance service
    try {
      await fetch(`${COMPLIANCE_URL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'founder-benefits',
          action: 'partner.withdrawal.commitment',
          partnerId: id,
          founderId,
          amount: commitmentAmount,
          currency: partner.currency,
          duration,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to log to compliance service:', err);
    }
    
    res.json({
      success: true,
      commitment: {
        id: commitmentId,
        founderId,
        founderName: founder.name,
        amount: commitmentAmount,
        currency: partner.currency,
        startDate: commitment.startDate,
        endDate: commitment.endDate
      }
    });
  } catch (err) {
    console.error('Error creating withdrawal commitment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all withdrawal commitments for a founder
app.get('/api/founders/:id/withdrawal-commitments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const founder = await getFounder(id);
    if (!founder) {
      return res.status(404).json({ error: 'Founder not found' });
    }
    
    // Collect all commitments from all partners
    const commitments = [];
    const partnerFiles = await fs.readdir(PARTNERS_DIR);
    
    for (const file of partnerFiles) {
      const partner = JSON.parse(
        await fs.readFile(path.join(PARTNERS_DIR, file), 'utf8')
      );
      
      const founderCommitments = partner.withdrawalCommitments.filter(
        c => c.founderId === id && c.active
      );
      
      founderCommitments.forEach(commitment => {
        commitments.push({
          ...commitment,
          partnerId: partner.id,
          partnerName: partner.name
        });
      });
    }
    
    // Calculate total guaranteed amount
    const totalByUSD = commitments.reduce((total, commitment) => {
      const rate = EXCHANGE_RATES[commitment.currency] || 1;
      return total + (commitment.amount / rate);
    }, 0);
    
    // Calculate if the founder has $100 guaranteed in ZAR
    const has100USD = totalByUSD >= 100;
    const zarEquivalent = has100USD ? 100 * EXCHANGE_RATES.ZAR : totalByUSD
    
    res.json({
      commitments,
      totalGuaranteedUSD: totalByUSD,
      has100USDEquivalent: has100USD,
      zarEquivalent: zarEquivalent
    });
  } catch (err) {
    console.error('Error getting withdrawal commitments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Founder benefits service running on port ${PORT}`);
});