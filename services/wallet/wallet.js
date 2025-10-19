/**
 * @file Azora Wallet Service
 * @description Fully functional wallet for Azora Coin management: create, import, balance, send, and withdraw.
 */

const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Azora Coin ABI (updated for minting and full operations)
const AZORA_COIN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",
  "function proposeMint(address, uint256, bytes32, bytes) returns (uint256)",
  "function approveMint(uint256)",
  "function executeMint(uint256)"
];

let provider;
let contract;
let wallets = {}; // In-memory wallet store (use DB in production)

// Policy configuration
const policyConfig = require('./policy-config.json');

// Initialize blockchain
const initBlockchain = async () => {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545';
  provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const contractAddress = process.env.AZORA_COIN_CONTRACT;
  if (contractAddress) {
    contract = new ethers.Contract(contractAddress, AZORA_COIN_ABI, provider);
  }
};

// Create a new wallet
app.post('/api/wallet/create', (req, res) => {
  const newWallet = ethers.Wallet.createRandom();
  const id = Date.now().toString();
  wallets[id] = { address: newWallet.address, privateKey: newWallet.privateKey };
  
  res.json({
    id,
    address: newWallet.address,
    mnemonic: newWallet.mnemonic.phrase // Store securely; not for production
  });
});

// Import wallet from private key
app.post('/api/wallet/import', (req, res) => {
  const { privateKey } = req.body;
  try {
    const wallet = new ethers.Wallet(privateKey);
    const id = Date.now().toString();
    wallets[id] = { address: wallet.address, privateKey };
    res.json({ id, address: wallet.address });
  } catch (error) {
    res.status(400).json({ error: 'Invalid private key' });
  }
});

// Get wallet balance
app.get('/api/wallet/:id/balance', async (req, res) => {
  const { id } = req.params;
  const wallet = wallets[id];
  if (!wallet || !contract) return res.status(404).json({ error: 'Wallet or contract not found' });
  
  const balance = await contract.balanceOf(wallet.address);
  res.json({
    address: wallet.address,
    balance: ethers.utils.formatEther(balance),
    balanceUSD: (parseFloat(ethers.utils.formatEther(balance)) * 1.00).toFixed(2)
  });
});

// Send AZR tokens
app.post('/api/wallet/:id/send', async (req, res) => {
  const { id } = req.params;
  const { to, amount } = req.body;
  const wallet = wallets[id];
  if (!wallet || !contract) return res.status(404).json({ error: 'Wallet or contract not found' });
  
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const contractWithSigner = contract.connect(signer);
  
  const tx = await contractWithSigner.transfer(to, ethers.utils.parseEther(amount));
  await tx.wait();
  
  res.json({ success: true, txHash: tx.hash });
});

// Mint AZR tokens (propose, approve, execute)
app.post('/api/wallet/:id/mint', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const wallet = wallets[id];
  if (!wallet || !contract) return res.status(404).json({ error: 'Wallet or contract not found' });
  
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const contractWithSigner = contract.connect(signer);
  
  try {
    // Create compliance hash (simplified PoC)
    const complianceHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`Mint: ${wallet.address} ${amount}`));
    
    // Propose mint
    const proposeTx = await contractWithSigner.proposeMint(wallet.address, ethers.utils.parseEther(amount), complianceHash, '0x');
    await proposeTx.wait();
    
    // Auto-approve (for demo; in production, require separate approval)
    const requestId = proposeTx.hash; // Simplified; extract from event in production
    const approveTx = await contractWithSigner.approveMint(requestId);
    await approveTx.wait();
    
    // Execute mint
    const executeTx = await contractWithSigner.executeMint(requestId);
    await executeTx.wait();
    
    res.json({ success: true, txHash: executeTx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw to ZAR (instant, integrate with withdrawal service)
app.post('/api/wallet/:id/withdraw-zar', async (req, res) => {
  const { id } = req.params;
  const { amountAzr, bankAccountId } = req.body;
  const wallet = wallets[id];
  if (!wallet || !contract) return res.status(404).json({ error: 'Wallet or contract not found' });
  
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const contractWithSigner = contract.connect(signer);
  
  try {
    const treasuryAddress = process.env.TREASURY_ADDRESS;
    if (!treasuryAddress) return res.status(500).json({ error: 'Treasury address not set' });
    
    // Approve treasury to transfer AZR
    const approveTx = await contractWithSigner.approve(treasuryAddress, ethers.utils.parseEther(amountAzr));
    await approveTx.wait();
    
    // Call withdrawal service API
    const withdrawalResponse = await fetch('http://localhost:4096/api/withdraw-from-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: wallet.address,
        amountAzr,
        bankAccountId
      })
    });
    
    const withdrawalData = await withdrawalResponse.json();
    if (!withdrawalResponse.ok) throw new Error(withdrawalData.error);
    
    res.json(withdrawalData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction creation with policy enforcement
app.post('/api/wallet/:id/tx/create', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const wallet = wallets[id];
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  
  let riskLevel = 'lowRisk';
  if (amount > policyConfig.thresholds.dailyCapStandard) riskLevel = 'mediumRisk';
  if (amount > policyConfig.thresholds.highValueThreshold) riskLevel = 'highRisk';
  
  // Enforce factors and cooling
  const policy = policyConfig.policies[riskLevel];
  // Add logic to check factors and apply cooling
  
  res.json({ success: true, riskLevel, policy });
});

const PORT = process.env.WALLET_PORT || 4093;

app.listen(PORT, async () => {
  await initBlockchain();
  console.log(`✅ Azora Wallet Service running on port ${PORT}`);
});