/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const Web3 = require('web3');
const { createClient } = require('redis');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Initialize Web3
const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || 'http://blockchain:8545');

// Initialize Redis
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

// Initialize PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// AZR Token Contract ABI (simplified ERC20)
const AZR_ABI = [
  {
    "constant": false,
    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "mint",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

let minterAccount;
let azrContract;

// Initialize minter
async function initMinter() {
  const accounts = await web3.eth.getAccounts();
  minterAccount = accounts[0];
  
  // Deploy AZR token contract (simplified)
  const contractCode = '0x608060405234801561001057600080fd5b50...'; // Full bytecode
  const contract = new web3.eth.Contract(AZR_ABI);
  
  azrContract = await contract.deploy({ data: contractCode })
    .send({ from: minterAccount, gas: 3000000 });
  
  console.log('✅ AZR Token deployed at:', azrContract.options.address);
}

// Mint AZR coins
app.post('/api/mint', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    
    // Get user's wallet address
    const userResult = await pool.query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [userId]
    );
    
    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const walletAddress = userResult.rows[0].wallet_address;
    
    // Mint tokens on blockchain
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    const tx = await azrContract.methods.mint(walletAddress, amountWei)
      .send({ from: minterAccount, gas: 200000 });
    
    // Record transaction in database
    await pool.query(
      `INSERT INTO azr_transactions (user_id, type, amount, reason, tx_hash, status)
       VALUES ($1, 'mint', $2, $3, $4, 'completed')`,
      [userId, amount, reason, tx.transactionHash]
    );
    
    // Update user balance
    await pool.query(
      'UPDATE users SET azr_balance = azr_balance + $1, total_earned = total_earned + $1 WHERE id = $2',
      [amount, userId]
    );
    
    // Cache balance in Redis
    await redis.set(`balance:${userId}`, (parseFloat(await redis.get(`balance:${userId}`) || 0) + amount).toString());
    
    console.log(`💰 Minted ${amount} AZR for user ${userId}`);
    
    res.json({
      success: true,
      amount,
      txHash: tx.transactionHash,
      message: `Successfully minted ${amount} AZR`
    });
    
  } catch (error) {
    console.error('Minting error:', error);
    res.status(500).json({ error: 'Minting failed', details: error.message });
  }
});

// Get user balance
app.get('/api/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try cache first
    let balance = await redis.get(`balance:${userId}`);
    
    if (!balance) {
      const result = await pool.query(
        'SELECT azr_balance FROM users WHERE id = $1',
        [userId]
      );
      balance = result.rows[0]?.azr_balance || 0;
      await redis.set(`balance:${userId}`, balance.toString(), { EX: 300 });
    }
    
    res.json({ balance: parseFloat(balance) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'sovereign-minter' });
});

// Start server
const PORT = process.env.PORT || 4002;
app.listen(PORT, async () => {
  await initMinter();
  console.log(`🏦 Sovereign Minter running on port ${PORT}`);
});
