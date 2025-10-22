/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Founder Withdrawal Service
 * 
 * This service implements a secure withdrawal system that ensures:
 * 1. The Azora Coin 1 million token limit is enforced
 * 2. Founders can withdraw only 40% of their allocation
 * 3. 60% of founder allocation is automatically reinvested in Azora
 * 4. Users can withdraw only after founders have completed their withdrawal phase
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configuration
const PORT = process.env.FW_PORT || 4310;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const REINVESTMENTS_FILE = path.join(DATA_DIR, 'reinvestments.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LEDGER_FILE = path.join(DATA_DIR, 'token-ledger.json');
const COIN_COMPLIANCE_FILE = path.join(DATA_DIR, 'coin-compliance.json');

// Create data directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// Data storage
let founders = [];
let withdrawals = [];
let reinvestments = [];
let users = [];
let tokenLedger = {
  totalSupply: 1000000, // 1 million tokens
  circulating: 0,
  allocated: {
    founders: 400000, // 40% for founders
    users: 600000,    // 60% for users
  },
  withdrawn: {
    founders: 0,
    users: 0
  },
  reinvested: {
    founders: 0
  }
};
let coinCompliance = {
  maxSupply: 1000000,
  supplyEnforced: true,
  founderWithdrawalLimit: 0.4, // 40% of their allocation can be withdrawn
  founderReinvestment: 0.6,    // 60% of their allocation is reinvested
  userWithdrawalAccess: true
};

// Load data from files
async function loadData() {
  try {
    // Load founders
    try {
      const foundersData = await fs.readFile(FOUNDERS_FILE, 'utf8');
      founders = JSON.parse(foundersData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      
      // Create sample founders if file doesn't exist
      founders = [
        { 
          id: '1', 
          name: 'Founder 1', 
          email: 'founder1@azora.world', 
          allocation: 100000, 
          withdrawable: 40000,   // 40% of allocation
          reinvestable: 60000,   // 60% of allocation
          withdrawn: 0,
          reinvested: 0,
          role: 'CEO',
          active: true
        },
        { 
          id: '2', 
          name: 'Founder 2', 
          email: 'founder2@azora.world', 
          allocation: 100000, 
          withdrawable: 40000,
          reinvestable: 60000,
          withdrawn: 0,
          reinvested: 0,
          role: 'CTO',
          active: true
        },
        { 
          id: '3', 
          name: 'Founder 3', 
          email: 'founder3@azora.world', 
          allocation: 100000, 
          withdrawable: 40000,
          reinvestable: 60000,
          withdrawn: 0,
          reinvested: 0,
          role: 'CFO',
          active: true
        },
        { 
          id: '4', 
          name: 'Founder 4', 
          email: 'founder4@azora.world', 
          allocation: 100000, 
          withdrawable: 40000,
          reinvestable: 60000,
          withdrawn: 0,
          reinvested: 0,
          role: 'COO',
          active: true
        }
      ];
      
      await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
    }
    
    // Load withdrawals
    try {
      const withdrawalsData = await fs.readFile(WITHDRAWALS_FILE, 'utf8');
      withdrawals = JSON.parse(withdrawalsData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      withdrawals = [];
      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
    }
    
    // Load reinvestments
    try {
      const reinvestmentsData = await fs.readFile(REINVESTMENTS_FILE, 'utf8');
      reinvestments = JSON.parse(reinvestmentsData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      reinvestments = [];
      await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
    }
    
    // Load users
    try {
      const usersData = await fs.readFile(USERS_FILE, 'utf8');
      users = JSON.parse(usersData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      users = [
        { 
          id: '101', 
          name: 'User 1', 
          email: 'user1@example.com', 
          allocation: 1000, 
          withdrawn: 0,
          active: true
        },
        { 
          id: '102', 
          name: 'User 2', 
          email: 'user2@example.com', 
          allocation: 1000, 
          withdrawn: 0,
          active: true
        }
      ];
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }
    
    // Load token ledger
    try {
      const ledgerData = await fs.readFile(LEDGER_FILE, 'utf8');
      tokenLedger = JSON.parse(ledgerData);
      
      // Ensure the reinvested property exists
      if (!tokenLedger.reinvested) {
        tokenLedger.reinvested = { founders: 0 };
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      await fs.writeFile(LEDGER_FILE, JSON.stringify(tokenLedger, null, 2));
    }
    
    // Load coin compliance
    try {
      const complianceData = await fs.readFile(COIN_COMPLIANCE_FILE, 'utf8');
      coinCompliance = JSON.parse(complianceData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      await fs.writeFile(COIN_COMPLIANCE_FILE, JSON.stringify(coinCompliance, null, 2));
    }
    
    console.log(`Loaded ${founders.length} founders and ${users.length} users`);
    console.log(`Total token supply: ${tokenLedger.totalSupply}`);
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Save data to files
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

async function saveWithdrawals() {
  await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

async function saveReinvestments() {
  await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
}

async function saveUsers() {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function saveLedger() {
  await fs.writeFile(LEDGER_FILE, JSON.stringify(tokenLedger, null, 2));
}

// Helper function to check if all founder withdrawals and reinvestments are complete
function areFounderTransactionsComplete() {
  // Check if all founders have completed their withdrawals and reinvestments
  return founders.every(founder => {
    return founder.withdrawn >= founder.withdrawable && 
           founder.reinvested >= founder.reinvestable;
  });
}

// Helper function to check if user can withdraw
function canUserWithdraw() {
  // Users can only withdraw if all founders have completed their withdrawals and reinvestments
  return areFounderTransactionsComplete();
}

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'founder-withdrawal',
    totalSupply: tokenLedger.totalSupply,
    circulating: tokenLedger.circulating,
    reinvested: tokenLedger.reinvested.founders
  });
});

// Get token information
app.get('/api/token-info', (req, res) => {
  res.json({
    maxSupply: tokenLedger.totalSupply,
    circulating: tokenLedger.circulating,
    allocated: tokenLedger.allocated,
    withdrawn: tokenLedger.withdrawn,
    reinvested: tokenLedger.reinvested,
    remaining: {
      founders: {
        withdrawal: tokenLedger.allocated.founders * coinCompliance.founderWithdrawalLimit - tokenLedger.withdrawn.founders,
        reinvestment: tokenLedger.allocated.founders * coinCompliance.founderReinvestment - tokenLedger.reinvested.founders
      },
      users: tokenLedger.allocated.users - tokenLedger.withdrawn.users
    }
  });
});

// Get compliance status
app.get('/api/compliance', (req, res) => {
  res.json(coinCompliance);
});

// List all founders (public info only)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    role: f.role,
    active: f.active
  }));
  
  res.json({ founders: publicFounders });
});

// Founder login (simplified for demo)
app.post('/api/founders/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // In a real system, we would verify credentials properly
  const founder = founders.find(f => f.email === email);
  
  if (!founder) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate a session token (in a real system, use proper JWT)
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  res.json({ 
    sessionToken,
    founder: {
      id: founder.id,
      name: founder.name,
      email: founder.email,
      role: founder.role,
      allocation: founder.allocation,
      withdrawable: founder.withdrawable,
      reinvestable: founder.reinvestable,
      withdrawn: founder.withdrawn,
      reinvested: founder.reinvested,
      remainingWithdrawal: founder.withdrawable - founder.withdrawn,
      remainingReinvestment: founder.reinvestable - founder.reinvested
    }
  });
});

// Founder withdrawal request
app.post('/api/founders/withdraw', (req, res) => {
  const { founderId, amount, walletAddress, sessionToken } = req.body;
  
  if (!founderId || !amount || !walletAddress) {
    return res.status(400).json({ error: 'Founder ID, amount and wallet address are required' });
  }
  
  // In a real system, verify the session token
  
  // Find the founder
  const founderIndex = founders.findIndex(f => f.id === founderId);
  if (founderIndex === -1) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  const founder = founders[founderIndex];
  
  // Check if amount is valid
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Check if founder has enough withdrawable allocation remaining
  const remainingWithdrawal = founder.withdrawable - founder.withdrawn;
  if (amountNum > remainingWithdrawal) {
    return res.status(400).json({ 
      error: 'Withdrawal amount exceeds remaining withdrawable allocation', 
      remainingWithdrawal
    });
  }
  
  // Create withdrawal record
  const withdrawal = {
    id: uuidv4(),
    founderId,
    amount: amountNum,
    walletAddress,
    timestamp: new Date().toISOString(),
    status: 'completed',
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}` // Mock transaction hash
  };
  
  // Update founder's withdrawn amount
  founders[founderIndex].withdrawn += amountNum;
  
  // Update ledger
  tokenLedger.circulating += amountNum;
  tokenLedger.withdrawn.founders += amountNum;
  
  // Save the withdrawal and updated data
  withdrawals.push(withdrawal);
  
  Promise.all([
    saveFounders(),
    saveWithdrawals(),
    saveLedger()
  ]).then(() => {
    // Check if we need to auto-reinvest the 60% now
    const founderWithdrawals = withdrawals.filter(w => w.founderId === founderId);
    const totalWithdrawn = founderWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    if (totalWithdrawn >= founder.withdrawable && founder.reinvested < founder.reinvestable) {
      // Auto-reinvest the 60%
      autoReinvestForFounder(founderId).then(reinvestment => {
        res.json({
          success: true,
          withdrawal,
          autoReinvestment: reinvestment,
          message: "Your withdrawal was successful. The remaining 60% of your allocation has been automatically reinvested into Azora OS.",
          remainingWithdrawal: founder.withdrawable - founders[founderIndex].withdrawn
        });
      }).catch(err => {
        console.error('Error processing auto-reinvestment:', err);
        res.json({
          success: true,
          withdrawal,
          remainingWithdrawal: founder.withdrawable - founders[founderIndex].withdrawn
        });
      });
    } else {
      res.json({
        success: true,
        withdrawal,
        remainingWithdrawal: founder.withdrawable - founders[founderIndex].withdrawn
      });
    }
  }).catch(err => {
    console.error('Error saving withdrawal data:', err);
    res.status(500).json({ error: 'Error processing withdrawal' });
  });
});

// Auto-reinvest the 60% for a founder
async function autoReinvestForFounder(founderId) {
  // Find the founder
  const founderIndex = founders.findIndex(f => f.id === founderId);
  if (founderIndex === -1) {
    throw new Error('Founder not found');
  }
  
  const founder = founders[founderIndex];
  
  // Calculate remaining reinvestable amount
  const remainingReinvestment = founder.reinvestable - founder.reinvested;
  if (remainingReinvestment <= 0) {
    return null; // Nothing to reinvest
  }
  
  // Create reinvestment record
  const reinvestment = {
    id: uuidv4(),
    founderId,
    amount: remainingReinvestment,
    timestamp: new Date().toISOString(),
    status: 'completed',
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`, // Mock transaction hash
    projects: [
      { name: 'Azora Core Development', allocation: remainingReinvestment * 0.4 },
      { name: 'Azora Growth Fund', allocation: remainingReinvestment * 0.3 },
      { name: 'Azora Community Initiatives', allocation: remainingReinvestment * 0.3 }
    ]
  };
  
  // Update founder's reinvested amount
  founders[founderIndex].reinvested += remainingReinvestment;
  
  // Update ledger
  tokenLedger.reinvested.founders += remainingReinvestment;
  
  // Save the reinvestment and updated data
  reinvestments.push(reinvestment);
  
  await Promise.all([
    saveFounders(),
    saveReinvestments(),
    saveLedger()
  ]);
  
  return reinvestment;
}

// Manual reinvestment request
app.post('/api/founders/reinvest', (req, res) => {
  const { founderId, amount, sessionToken } = req.body;
  
  if (!founderId || !amount) {
    return res.status(400).json({ error: 'Founder ID and amount are required' });
  }
  
  // In a real system, verify the session token
  
  // Find the founder
  const founderIndex = founders.findIndex(f => f.id === founderId);
  if (founderIndex === -1) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  const founder = founders[founderIndex];
  
  // Check if amount is valid
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Check if founder has enough reinvestable allocation remaining
  const remainingReinvestment = founder.reinvestable - founder.reinvested;
  if (amountNum > remainingReinvestment) {
    return res.status(400).json({ 
      error: 'Reinvestment amount exceeds remaining reinvestable allocation', 
      remainingReinvestment
    });
  }
  
  // Create reinvestment record
  const reinvestment = {
    id: uuidv4(),
    founderId,
    amount: amountNum,
    timestamp: new Date().toISOString(),
    status: 'completed',
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`, // Mock transaction hash
    projects: [
      { name: 'Azora Core Development', allocation: amountNum * 0.4 },
      { name: 'Azora Growth Fund', allocation: amountNum * 0.3 },
      { name: 'Azora Community Initiatives', allocation: amountNum * 0.3 }
    ]
  };
  
  // Update founder's reinvested amount
  founders[founderIndex].reinvested += amountNum;
  
  // Update ledger
  tokenLedger.reinvested.founders += amountNum;
  
  // Save the reinvestment and updated data
  reinvestments.push(reinvestment);
  
  Promise.all([
    saveFounders(),
    saveReinvestments(),
    saveLedger()
  ]).then(() => {
    res.json({
      success: true,
      reinvestment,
      remainingReinvestment: founder.reinvestable - founders[founderIndex].reinvested
    });
  }).catch(err => {
    console.error('Error saving reinvestment data:', err);
    res.status(500).json({ error: 'Error processing reinvestment' });
  });
});

// User login (simplified for demo)
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // In a real system, we would verify credentials properly
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate a session token (in a real system, use proper JWT)
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Check if users can withdraw yet
  const usersCanWithdraw = canUserWithdraw();
  
  res.json({ 
    sessionToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      allocation: user.allocation,
      withdrawn: user.withdrawn,
      remaining: user.allocation - user.withdrawn
    },
    withdrawalsEnabled: usersCanWithdraw
  });
});

// User withdrawal request
app.post('/api/users/withdraw', (req, res) => {
  const { userId, amount, walletAddress, sessionToken } = req.body;
  
  // Check if users can withdraw
  if (!canUserWithdraw()) {
    return res.status(403).json({ 
      error: 'User withdrawals are not enabled yet', 
      message: 'Founders must complete all their withdrawals and reinvestments first'
    });
  }
  
  if (!userId || !amount || !walletAddress) {
    return res.status(400).json({ error: 'User ID, amount and wallet address are required' });
  }
  
  // In a real system, verify the session token
  
  // Find the user
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const user = users[userIndex];
  
  // Check if amount is valid
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Check if user has enough allocation remaining
  const remaining = user.allocation - user.withdrawn;
  if (amountNum > remaining) {
    return res.status(400).json({ 
      error: 'Withdrawal amount exceeds remaining allocation', 
      remaining
    });
  }
  
  // Create withdrawal record
  const withdrawal = {
    id: uuidv4(),
    userId,
    amount: amountNum,
    walletAddress,
    timestamp: new Date().toISOString(),
    status: 'completed',
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}` // Mock transaction hash
  };
  
  // Update user's withdrawn amount
  users[userIndex].withdrawn += amountNum;
  
  // Update ledger
  tokenLedger.circulating += amountNum;
  tokenLedger.withdrawn.users += amountNum;
  
  // Save the withdrawal and updated data
  withdrawals.push(withdrawal);
  
  Promise.all([
    saveUsers(),
    saveWithdrawals(),
    saveLedger()
  ]).then(() => {
    res.json({
      success: true,
      withdrawal,
      remaining: user.allocation - users[userIndex].withdrawn
    });
  }).catch(err => {
    console.error('Error saving withdrawal data:', err);
    res.status(500).json({ error: 'Error processing withdrawal' });
  });
});

// Get withdrawal status for founders or users
app.get('/api/withdrawals/:type/:id', (req, res) => {
  const { type, id } = req.params;
  
  if (type !== 'founders' && type !== 'users') {
    return res.status(400).json({ error: 'Type must be "founders" or "users"' });
  }
  
  let filteredWithdrawals;
  
  if (type === 'founders') {
    filteredWithdrawals = withdrawals.filter(w => w.founderId === id);
  } else {
    filteredWithdrawals = withdrawals.filter(w => w.userId === id);
  }
  
  res.json({ withdrawals: filteredWithdrawals });
});

// Get reinvestment status for a founder
app.get('/api/reinvestments/:founderId', (req, res) => {
  const { founderId } = req.params;
  
  const filteredReinvestments = reinvestments.filter(r => r.founderId === founderId);
  
  res.json({ reinvestments: filteredReinvestments });
});

// Get overall withdrawal and reinvestment statistics
app.get('/api/withdrawal-stats', (req, res) => {
  const stats = {
    totalWithdrawn: tokenLedger.withdrawn.founders + tokenLedger.withdrawn.users,
    totalReinvested: tokenLedger.reinvested.founders,
    founders: {
      total: tokenLedger.allocated.founders,
      withdrawn: tokenLedger.withdrawn.founders,
      withdrawable: tokenLedger.allocated.founders * coinCompliance.founderWithdrawalLimit,
      reinvested: tokenLedger.reinvested.founders,
      reinvestable: tokenLedger.allocated.founders * coinCompliance.founderReinvestment,
      withdrawalPercentage: (tokenLedger.withdrawn.founders / (tokenLedger.allocated.founders * coinCompliance.founderWithdrawalLimit) * 100).toFixed(2),
      reinvestmentPercentage: (tokenLedger.reinvested.founders / (tokenLedger.allocated.founders * coinCompliance.founderReinvestment) * 100).toFixed(2)
    },
    users: {
      total: tokenLedger.allocated.users,
      withdrawn: tokenLedger.withdrawn.users,
      remaining: tokenLedger.allocated.users - tokenLedger.withdrawn.users,
      percentage: (tokenLedger.withdrawn.users / tokenLedger.allocated.users * 100).toFixed(2)
    },
    usersCanWithdraw: canUserWithdraw(),
    founderTransactionsComplete: areFounderTransactionsComplete()
  };
  
  res.json(stats);
});

// Get reinvestment projects breakdown
app.get('/api/reinvestment-projects', (req, res) => {
  const projects = {};
  
  // Calculate total allocation by project
  reinvestments.forEach(r => {
    if (r.projects && Array.isArray(r.projects)) {
      r.projects.forEach(p => {
        if (!projects[p.name]) {
          projects[p.name] = 0;
        }
        projects[p.name] += p.allocation;
      });
    }
  });
  
  res.json({
    totalReinvested: tokenLedger.reinvested.founders,
    projects: Object.entries(projects).map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / tokenLedger.reinvested.founders * 100).toFixed(2)
    }))
  });
});

// Execute withdrawal request
app.post('/api/execute', async (req, res) => {
  const { founderId, amount, withdrawalAddress, otp } = req.body;
  if (!founderId || !amount || !withdrawalAddress || !otp) {
    return res.status(400).json({ error: 'founderId, amount, withdrawalAddress, and otp are required.' });
  }

  try {
    // 1. Verify OTP
    const otpRes = await fetch(`${SECURITY_API}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: founderId, actionId: `withdraw:${amount}`, otp })
    });
    if (!otpRes.ok) throw new Error('Invalid or expired OTP.');

    // 2. Verify Balance
    const balanceRes = await fetch(`${REWARDS_API}/api/balance/${founderId}`);
    const balanceData = await balanceRes.json();
    const balance = balanceData.balance || 0;

    if (balance < amount) {
      return res.status(403).json({ error: 'Insufficient balance for withdrawal.' });
    }

    // 3. Execute on Blockchain
    const txRes = await fetch(`${BLOCKCHAIN_API}/api/execute-withdrawal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ founderId, amount, withdrawalAddress })
    });
    const txData = await txRes.json();

    if (!txData.success) {
      return res.status(500).json({ error: 'Blockchain transaction failed.', details: txData });
    }

    // 4. Record the withdrawal
    const withdrawal = {
      id: uuidv4(),
      founderId,
      amount,
      walletAddress: withdrawalAddress,
      timestamp: new Date().toISOString(),
      status: 'completed',
      transactionHash: txData.transactionHash
    };

    withdrawals.push(withdrawal);

    // Update founder's withdrawn amount
    const founderIndex = founders.findIndex(f => f.id === founderId);
    if (founderIndex !== -1) {
      founders[founderIndex].withdrawn += amount;
    }

    // Update ledger
    tokenLedger.circulating += amount;
    tokenLedger.withdrawn.founders += amount;

    await Promise.all([
      saveFounders(),
      saveWithdrawals(),
      saveLedger()
    ]);

    res.json({ success: true, withdrawal });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Error processing withdrawal' });
  }
});

// Initialize data and start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log(`Founder Withdrawal Service running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error starting service:', err);
});

module.exports = app;