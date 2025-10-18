/**
 * Azora Coin Integration Service
 * Provides API endpoints to interact with the Azora Coin blockchain
 * Handles minting, transactions, and compliance verification
 * 
 * Port: 4092
 */

const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4092;

// Load contract ABI
const azoraCoinABI = require('../../apps/main-app/src/contracts/azoraCoin').azoraCoinABI;

// Connect to the provider (use environment variable or default)
const provider = new ethers.providers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
);

// Load wallet from private key
const wallet = process.env.BLOCKCHAIN_PRIVATE_KEY 
  ? new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider)
  : ethers.Wallet.createRandom().connect(provider);

// Contract address from environment variable or default
const contractAddress = process.env.AZORA_COIN_CONTRACT || '0x0000000000000000000000000000000000000000';

// Create contract instance
const azoraCoin = new ethers.Contract(contractAddress, azoraCoinABI, wallet);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-coin-integration',
    contractAddress,
    walletAddress: wallet.address,
    timestamp: new Date().toISOString()
  });
});

// Get token info
app.get('/api/token-info', async (req, res) => {
  try {
    const [name, symbol, decimals, totalSupply, maxSupply, requiredApprovals] = await Promise.all([
      azoraCoin.name(),
      azoraCoin.symbol(),
      azoraCoin.decimals(),
      azoraCoin.totalSupply(),
      azoraCoin.MAX_SUPPLY(),
      azoraCoin.requiredApprovals()
    ]);
    
    res.json({
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      maxSupply: ethers.utils.formatUnits(maxSupply, decimals),
      requiredApprovals: requiredApprovals.toString()
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// Get balance
app.get('/api/balance/:address', async (req, res) => {
  try {
    const balance = await azoraCoin.balanceOf(req.params.address);
    const decimals = await azoraCoin.decimals();
    
    res.json({
      address: req.params.address,
      balance: ethers.utils.formatUnits(balance, decimals)
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Propose mint
app.post('/api/propose-mint', async (req, res) => {
  try {
    const { recipient, amount, complianceRecord } = req.body;
    
    if (!recipient || !amount || !complianceRecord) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Verify compliance with the compliance service
    try {
      const complianceResponse = await axios.post('http://localhost:4081/api/verify-compliance', {
        type: 'mint',
        record: complianceRecord
      });
      
      if (!complianceResponse.data.compliant) {
        return res.status(403).json({ error: 'Compliance verification failed', details: complianceResponse.data });
      }
    } catch (complianceError) {
      console.error('Error verifying compliance:', complianceError);
      return res.status(500).json({ error: 'Failed to verify compliance' });
    }
    
    // Create compliance hash
    const complianceHash = ethers.utils.id(JSON.stringify(complianceRecord));
    
    // Convert amount to token units
    const decimals = await azoraCoin.decimals();
    const tokenAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // Create proof (simplified for demo)
    const proofData = ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'bytes32', 'uint256'],
      [recipient, tokenAmount, complianceHash, Date.now()]
    );
    
    // Submit mint proposal
    const tx = await azoraCoin.proposeMint(
      recipient,
      tokenAmount,
      complianceHash,
      proofData
    );
    
    const receipt = await tx.wait();
    
    // Find the MintRequested event
    const mintEvent = receipt.events.find(e => e.event === 'MintRequested');
    const requestId = mintEvent ? mintEvent.args.requestId : null;
    
    res.json({
      success: true,
      transaction: tx.hash,
      requestId
    });
  } catch (error) {
    console.error('Error proposing mint:', error);
    res.status(500).json({ error: 'Failed to propose mint', details: error.message });
  }
});

// Approve mint
app.post('/api/approve-mint/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const tx = await azoraCoin.approveMint(requestId);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transaction: tx.hash
    });
  } catch (error) {
    console.error('Error approving mint:', error);
    res.status(500).json({ error: 'Failed to approve mint', details: error.message });
  }
});

// Transfer tokens
app.post('/api/transfer', async (req, res) => {
  try {
    const { to, amount } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Convert amount to token units
    const decimals = await azoraCoin.decimals();
    const tokenAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // Transfer tokens
    const tx = await azoraCoin.transfer(to, tokenAmount);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transaction: tx.hash
    });
  } catch (error) {
    console.error('Error transferring tokens:', error);
    res.status(500).json({ error: 'Failed to transfer tokens', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log('');
  console.log('💰 Azora Coin Integration Service');
  console.log('============================');
  console.log(`Port: ${PORT}`);
  console.log('Status: Online');
  console.log('');
  console.log('Features:');
  console.log('  ✅ Token minting with compliance validation');
  console.log('  ✅ Multi-signature approval system');
  console.log('  ✅ 1 million AZR max supply');
  console.log('  ✅ Proof of Compliance (PoC) protocol');
  console.log('  ✅ Blockchain-backed transactions');
  console.log('  ✅ Constitution-as-Code compliance');
  console.log('');
  console.log('🇿🇦 Built by Sizwe Ngwenya for Azora World');
  console.log('Making cryptocurrency sovereign and compliant!');
  console.log('');
});

module.exports = app;
