/**
 * @file Azora Coin Integration Service
 * @description Manages Azora Coin at $1.00 USD with founder withdrawals
 */

const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Contract ABI (simplified)
const AZORA_COIN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function USD_VALUE() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function getTokenValueUSD() view returns (uint256)",
  "function registerStudent(address, uint256) returns (bool)",
  "function rewardStudent(address, uint256, string) returns (bool)",
  "function allocateToFounder(address, uint256) returns (bool)",
  "function requestWithdrawal(uint256) returns (uint256)",
  "function approveWithdrawal(uint256) returns (bool)",
  "function getFounderInfo(address) view returns (uint256, uint256, uint256)",
  "function totalStudentsJoined() view returns (uint256)",
  "function totalFounders() view returns (uint256)",
  "function proposeMint(address,uint256,bytes32,bytes) returns (bool)",
  "function approveMint(uint256) returns (bool)",
  "function executeMint(uint256) returns (bool)"
];

let provider;
let contract;
let wallet;

// Initialize blockchain connection
const initBlockchain = async () => {
  try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545';
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
      wallet = new ethers.Wallet(privateKey, provider);
    }
    
    const contractAddress = process.env.AZORA_COIN_CONTRACT;
    if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
      contract = new ethers.Contract(contractAddress, AZORA_COIN_ABI, wallet || provider);
      console.log('✅ Connected to Azora Coin contract:', contractAddress);
    } else {
      console.log('⚠️  Azora Coin contract not deployed yet');
    }
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error.message);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-coin-integration',
    contractDeployed: !!contract,
    usdValue: 1.00
<<<<<<< HEAD
  

=======
  }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Get token info
app.get('/api/token-info', async (req, res) => {
  try {
    if (!contract) {
      return res.json({
        name: 'Azora Coin',
        symbol: 'AZR',
        maxSupply: '1000000.0',
        totalSupply: '0.0',
        usdValue: '1.00',
        deployed: false
<<<<<<< HEAD
      ;
=======
      }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const [name, symbol, totalSupply, maxSupply, usdValue] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      contract.MAX_SUPPLY(),
      contract.getTokenValueUSD()
    ]);
    
    res.json({
      name,
      symbol,
      maxSupply: ethers.utils.formatEther(maxSupply),
      totalSupply: ethers.utils.formatEther(totalSupply),
      usdValue: ethers.utils.formatEther(usdValue),
      deployed: true,
      contractAddress: contract.address
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Token info error:', error);
    res.status(500).json({ error: 'Failed to get token info' ;
  }
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Token info error:', error);
    res.status(500).json({ error: 'Failed to get token info' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Register student (gets signup bonus)
app.post('/api/students/register', async (req, res) => {
  try {
    if (!contract || !wallet) {
<<<<<<< HEAD
      return res.status(503).json({ error: 'Contract not available' ;
=======
      return res.status(503).json({ error: 'Contract not available' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const { studentAddress, bonusAmount = '10' } = req.body;
    
    if (!ethers.utils.isAddress(studentAddress)) {
<<<<<<< HEAD
      return res.status(400).json({ error: 'Invalid student address' ;
=======
      return res.status(400).json({ error: 'Invalid student address' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const bonus = ethers.utils.parseEther(bonusAmount);
    const tx = await contract.registerStudent(studentAddress, bonus);
    await tx.wait();
    
    const balance = await contract.balanceOf(studentAddress);
    const totalStudents = await contract.totalStudentsJoined();
    
    res.json({
      success: true,
      student: studentAddress,
      bonusAmount: ethers.utils.formatEther(bonus),
      bonusValueUSD: parseFloat(ethers.utils.formatEther(bonus)) * 1.00,
      balance: ethers.utils.formatEther(balance),
      balanceUSD: parseFloat(ethers.utils.formatEther(balance)) * 1.00,
      totalStudents: totalStudents.toString(),
      txHash: tx.hash
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ error: error.message ;
  }
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ error: error.message }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Reward student for activity
app.post('/api/students/reward', async (req, res) => {
  try {
    if (!contract || !wallet) {
<<<<<<< HEAD
      return res.status(503).json({ error: 'Contract not available' ;
=======
      return res.status(503).json({ error: 'Contract not available' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const { studentAddress, amount, reason } = req.body;
    
    if (!ethers.utils.isAddress(studentAddress)) {
<<<<<<< HEAD
      return res.status(400).json({ error: 'Invalid student address' ;
=======
      return res.status(400).json({ error: 'Invalid student address' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const rewardAmount = ethers.utils.parseEther(amount);
    const tx = await contract.rewardStudent(studentAddress, rewardAmount, reason);
    await tx.wait();
    
    const balance = await contract.balanceOf(studentAddress);
    
    res.json({
      success: true,
      student: studentAddress,
      rewardAmount: ethers.utils.formatEther(rewardAmount),
      rewardValueUSD: parseFloat(ethers.utils.formatEther(rewardAmount)) * 1.00,
      reason,
      newBalance: ethers.utils.formatEther(balance),
      newBalanceUSD: parseFloat(ethers.utils.formatEther(balance)) * 1.00,
      txHash: tx.hash
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Student reward error:', error);
    res.status(500).json({ error: error.message ;
  }
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Student reward error:', error);
    res.status(500).json({ error: error.message }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Allocate to founder
app.post('/api/founders/allocate', async (req, res) => {
  try {
    if (!contract || !wallet) {
<<<<<<< HEAD
      return res.status(503).json({ error: 'Contract not available' ;
=======
      return res.status(503).json({ error: 'Contract not available' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const { founderAddress, amount } = req.body;
    
    if (!ethers.utils.isAddress(founderAddress)) {
<<<<<<< HEAD
      return res.status(400).json({ error: 'Invalid founder address' ;
=======
      return res.status(400).json({ error: 'Invalid founder address' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const allocation = ethers.utils.parseEther(amount);
    const tx = await contract.allocateToFounder(founderAddress, allocation);
    await tx.wait();
    
    const founderInfo = await contract.getFounderInfo(founderAddress);
    
    res.json({
      success: true,
      founder: founderAddress,
      allocated: ethers.utils.formatEther(founderInfo[0]),
      allocatedUSD: parseFloat(ethers.utils.formatEther(founderInfo[0])) * 1.00,
      withdrawn: ethers.utils.formatEther(founderInfo[1]),
      available: ethers.utils.formatEther(founderInfo[2]),
      availableUSD: parseFloat(ethers.utils.formatEther(founderInfo[2])) * 1.00,
      txHash: tx.hash
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Founder allocation error:', error);
    res.status(500).json({ error: error.message ;
  }
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Founder allocation error:', error);
    res.status(500).json({ error: error.message }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Request founder withdrawal ($100 limit)
app.post('/api/founders/withdraw', async (req, res) => {
  try {
    if (!contract || !wallet) {
<<<<<<< HEAD
      return res.status(503).json({ error: 'Contract not available' ;
=======
      return res.status(503).json({ error: 'Contract not available' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const { amount = '100' } = req.body;
    
    const withdrawAmount = ethers.utils.parseEther(amount);
    const tx = await contract.requestWithdrawal(withdrawAmount);
    const receipt = await tx.wait();
    
    // Extract request ID from event
    const event = receipt.events.find(e => e.event === 'WithdrawalRequested');
    const requestId = event?.args?.requestId?.toString();
    
    res.json({
      success: true,
      requestId,
      amount: amount,
      amountUSD: parseFloat(amount) * 1.00,
      status: 'pending_approval',
      requiredApprovals: 2,
      txHash: tx.hash,
      message: `Withdrawal request created for $${parseFloat(amount).toFixed(2)} USD`
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: error.message ;
  }
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: error.message }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Get founder balance and info
app.get('/api/founders/:address', async (req, res) => {
  try {
    if (!contract) {
<<<<<<< HEAD
      return res.status(503).json({ error: 'Contract not available' ;
=======
      return res.status(503).json({ error: 'Contract not available' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const { address } = req.params;
    
    if (!ethers.utils.isAddress(address)) {
<<<<<<< HEAD
      return res.status(400).json({ error: 'Invalid address' ;
=======
      return res.status(400).json({ error: 'Invalid address' }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const [founderInfo, balance] = await Promise.all([
      contract.getFounderInfo(address),
      contract.balanceOf(address)
    ]);
    
    const allocated = parseFloat(ethers.utils.formatEther(founderInfo[0]));
    const withdrawn = parseFloat(ethers.utils.formatEther(founderInfo[1]));
    const available = parseFloat(ethers.utils.formatEther(founderInfo[2]));
    const currentBalance = parseFloat(ethers.utils.formatEther(balance));
    
    res.json({
      address,
      allocated: allocated.toFixed(2),
      allocatedUSD: (allocated * 1.00).toFixed(2),
      withdrawn: withdrawn.toFixed(2),
      withdrawnUSD: (withdrawn * 1.00).toFixed(2),
      available: available.toFixed(2),
      availableUSD: (available * 1.00).toFixed(2),
      currentBalance: currentBalance.toFixed(2),
      currentBalanceUSD: (currentBalance * 1.00).toFixed(2),
      canWithdraw: available >= 100,
      maxWithdrawal: Math.min(available, 100).toFixed(2),
      maxWithdrawalUSD: (Math.min(available, 100) * 1.00).toFixed(2)
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Founder info error:', error);
    res.status(500).json({ error: error.message ;
  }
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Founder info error:', error);
    res.status(500).json({ error: error.message }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    if (!contract) {
      return res.json({
        deployed: false,
        totalStudents: 0,
        totalFounders: 0,
        totalSupply: '0.0',
        maxSupply: '1000000.0',
        utilization: '0.00'
<<<<<<< HEAD
      ;
=======
      }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
    }
    
    const [totalSupply, maxSupply, totalStudents, totalFounders] = await Promise.all([
      contract.totalSupply(),
      contract.MAX_SUPPLY(),
      contract.totalStudentsJoined(),
      contract.totalFounders()
    ]);
    
    const supply = parseFloat(ethers.utils.formatEther(totalSupply));
    const max = parseFloat(ethers.utils.formatEther(maxSupply));
    
    res.json({
      deployed: true,
      contractAddress: contract.address,
      totalStudents: totalStudents.toString(),
      totalFounders: totalFounders.toString(),
      totalSupply: supply.toFixed(2),
      totalSupplyUSD: (supply * 1.00).toFixed(2),
      maxSupply: max.toFixed(2),
      maxSupplyUSD: (max * 1.00).toFixed(2),
      utilization: ((supply / max) * 100).toFixed(2) + '%',
      usdValue: '1.00'
<<<<<<< HEAD
    ;
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message ;
  }
;

// Add local bank simulation (replace external bank APIs)
const localBankDB = {};  // In-memory DB for bank accounts (use real DB in production)

app.post('/api/simulate-bank-transfer', (req, res) => {
  const { accountId, amount, currency } = req.body;
  if (!localBankDB[accountId]) localBankDB[accountId] = { balance: 0 };
  localBankDB[accountId].balance += amount;
  res.json({ success: true, newBalance: localBankDB[accountId].balance ;
;

// Enhanced mint with caching and rate limiting
const mintCache = new Map();
const rateLimit = {};  // Simple rate limiter

app.post('/api/mint-to-founder', (req, res) => {
  const { founderAddress, amount } = req.body;
  const key = `${founderAddress}-${Date.now()}`;
  
  // Rate limit: 10 mints per minute per address
  if (!rateLimit[founderAddress]) rateLimit[founderAddress] = [];
  rateLimit[founderAddress] = rateLimit[founderAddress].filter(t => Date.now() - t < 60000);
  if (rateLimit[founderAddress].length >= 10) {
    return res.status(429).json({ error: 'Rate limit exceeded' ;
  }
  rateLimit[founderAddress].push(Date.now());
  
  // Check cache for recent mints
  if (mintCache.has(key)) {
    return res.json(mintCache.get(key));
  }
  
  try {
    const complianceHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`Founder Allocation: ${founderAddress}`));
    const tx = await contract.proposeMint(founderAddress, ethers.utils.parseEther(amount.toString()), complianceHash, '0x');
    await tx.wait();
    
    // Auto-approve if AZORA (for demo)
    const requestId = tx.hash;  // Simplified; extract from event in production
    await contract.approveMint(requestId);
    await contract.executeMint(requestId);
    
    // Cache result
    mintCache.set(key, { success: true, transaction: tx.hash ;
    res.json({ success: true, transaction: tx.hash ;
  } catch (error) {
    res.status(500).json({ error: error.message ;
  }
;

// Advanced withdrawal with multi-step approval and logging
app.post('/api/advanced-withdraw', async (req, res) => {
  const { founderAddress, amountAzr, bankAccountId, approvalSteps } = req.body;
  // Multi-step approval logic (e.g., founder, compliance officer)
  for (const step of approvalSteps) {
    // Simulate approval checks
    if (!step.approved) return res.status(403).json({ error: `Approval failed at step: ${step.name}` ;
  }
  
  // Log to local file
  const fs = require('fs');
  fs.appendFileSync('withdrawals.log', `${new Date().toISOString()}: ${founderAddress} withdrew ${amountAzr} AZR to ${bankAccountId}\n`);
  
  try {
    const zarAmount = amountAzr * 1;  // Simplified conversion
    // Simulate bank transfer
    const transferTx = await contract.requestWithdrawal(zarAmount);
    await transferTx.wait();
    
    res.json({ success: true, zarAmount, bankTransferId: 'local-' + Date.now() ;
  } catch (error) {
    res.status(500).json({ error: error.message ;
  }
;

// Withdraw bonus directly (for testing)
app.post('/api/withdraw/bonus', (req, res) => {
  const { founderId, amountAzr } = req.body;
  // Convert to ZAR (1 AZR = 18 ZAR)
  const zarAmount = amountAzr * 18;
  // Simulate bank transfer
  res.json({ withdrawnZar: zarAmount, bank: 'Standard Bank', account: 'YourAccount' ;
;

// Mint bonus
app.post('/api/mint/bonus', (req, res) => {
  const { founderId, bonusAmount } = req.body;
  // Mint bonus AZR (10% of total)
  const bonus = bonusAmount * 0.1;
  // Simulate minting
  res.json({ mintedBonus: bonus, founderId ;
;
=======
    }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message }); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
  }
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)

const PORT = process.env.AZORA_COIN_PORT || 4092;
console.log(`💸 Founder Withdrawal: $100.00 USD per request`);
console.log(`📊 Max Supply: 1,000,000 AZR ($1,000,000 USD)`);
console.log(`💰 Azora Coin Value: $1.00 USD`);
console.log(`✅ Azora Coin Integration Service running on port ${PORT}`);
await initBlockchain();
app.listen(PORT, async () => {
  await initBlockchain();
  console.log(`✅ Azora Coin Integration Service running on port ${PORT}`);
  console.log(`💰 Azora Coin Value: $1.00 USD`);
  console.log(`📊 Max Supply: 1,000,000 AZR ($1,000,000 USD)`);
  console.log(`💸 Founder Withdrawal: $100.00 USD per request`);
<<<<<<< HEAD
;
=======
}); app.listen(4092, () => console.log("Azora Coin Integration running on port 4092"));
>>>>>>> 417edfe (Refactor Azora Coin Integration service and update startup script)
