/**
 * Azora OS Blockchain Node
 * 
 * A lightweight blockchain implementation to:
 * 1. Record founder withdrawals with immutable history
 * 2. Verify the constitutional compliance of withdrawals
 * 3. Maintain a transparent ledger of transactions
 * 4. Support the $10M platform valuation
 */

const express = require('express');
const crypto = require('crypto');
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
const PORT = process.env.BLOCKCHAIN_PORT || 5050;
const DATA_DIR = path.join(__dirname, 'data');
const BLOCKCHAIN_FILE = path.join(DATA_DIR, 'blockchain.json');
const ADDRESSES_FILE = path.join(DATA_DIR, 'addresses.json');
const MEMPOOL_FILE = path.join(DATA_DIR, 'mempool.json');

// Create data directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Error creating data directory:', err);
    }
  }
})();

// Data stores
let blockchain = [];
let addresses = {};
let mempool = [];

// Genesis block data
const genesisBlock = {
  index: 0,
  timestamp: new Date('2025-10-10T10:10:10Z').toISOString(), // Azora launch date
  transactions: [
    {
      id: uuidv4(),
      type: 'genesis',
      data: {
        message: 'Azora OS Genesis Block - Constitutional Blockchain',
        totalTokens: 1000000,
        valuePerToken: 10, // $10 USD
        totalValue: 10000000, // $10M USD
        constitutionHash: '8f7d88e6e74a465c96bef7871a44b4a458eacec689437868c7e32cd678462090' // SHA-256 of constitution
      },
      sender: 'genesis',
      recipient: 'system',
      amount: 1000000,
      fee: 0,
      hash: '',
      signature: 'genesis-signature'
    }
  ],
  previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
  nonce: 0,
  hash: ''
};

// Calculate block hash
function calculateHash(block) {
  // Remove the hash field from the block for hash calculation
  const blockData = {
    ...block,
    hash: ''
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(blockData))
    .digest('hex');
}

// Create new block
function createNewBlock(transactions, previousBlock) {
  const newBlock = {
    index: previousBlock.index + 1,
    timestamp: new Date().toISOString(),
    transactions,
    previousHash: previousBlock.hash,
    nonce: 0,
    hash: ''
  };
  
  // Mine the block (simplified)
  newBlock.hash = calculateHash(newBlock);
  
  return newBlock;
}

// Validate a block
function isValidBlock(block, previousBlock) {
  // Check index
  if (block.index !== previousBlock.index + 1) {
    return false;
  }
  
  // Check previous hash
  if (block.previousHash !== previousBlock.hash) {
    return false;
  }
  
  // Check block hash
  const calculatedHash = calculateHash(block);
  if (block.hash !== calculatedHash) {
    return false;
  }
  
  return true;
}

// Validate the entire blockchain
function isValidChain(chain) {
  // Check each block
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];
    
    if (!isValidBlock(currentBlock, previousBlock)) {
      return false;
    }
  }
  
  return true;
}

// Initialize blockchain
async function initializeBlockchain() {
  try {
    try {
      const data = await fs.readFile(BLOCKCHAIN_FILE, 'utf8');
      blockchain = JSON.parse(data);
      console.log(`Loaded blockchain with ${blockchain.length} blocks`);
      
      // Validate the loaded blockchain
      if (!isValidChain(blockchain)) {
        console.error('Invalid blockchain detected!');
        throw new Error('Invalid blockchain');
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Initialize with genesis block
        genesisBlock.hash = calculateHash(genesisBlock);
        blockchain = [genesisBlock];
        await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
        console.log('Created new blockchain with genesis block');
      } else {
        throw err;
      }
    }
    
    try {
      const data = await fs.readFile(ADDRESSES_FILE, 'utf8');
      addresses = JSON.parse(data);
      console.log(`Loaded ${Object.keys(addresses).length} addresses`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Initialize addresses
        addresses = {
          system: {
            balance: 1000000,
            transactions: []
          }
        };
        await fs.writeFile(ADDRESSES_FILE, JSON.stringify(addresses, null, 2));
        console.log('Created new addresses file');
      } else {
        throw err;
      }
    }
    
    try {
      const data = await fs.readFile(MEMPOOL_FILE, 'utf8');
      mempool = JSON.parse(data);
      console.log(`Loaded ${mempool.length} pending transactions`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Initialize mempool
        mempool = [];
        await fs.writeFile(MEMPOOL_FILE, JSON.stringify(mempool, null, 2));
        console.log('Created new mempool file');
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Error initializing blockchain:', err);
  }
}

// Save blockchain data
async function saveBlockchain() {
  await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
}

async function saveAddresses() {
  await fs.writeFile(ADDRESSES_FILE, JSON.stringify(addresses, null, 2));
}

async function saveMempool() {
  await fs.writeFile(MEMPOOL_FILE, JSON.stringify(mempool, null, 2));
}

// Create a new transaction
function createTransaction(type, data, sender, recipient, amount) {
  // Create transaction
  const transaction = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    type,
    data,
    sender,
    recipient,
    amount,
    fee: 0,
    hash: '',
    signature: 'signed' // In a real system, would use cryptographic signatures
  };
  
  // Calculate transaction hash
  transaction.hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({...transaction, hash: '', signature: ''}))
    .digest('hex');
  
  return transaction;
}

// Add transaction to mempool
async function addToMempool(transaction) {
  mempool.push(transaction);
  await saveMempool();
  return transaction;
}

// Process founder withdrawal transaction
async function processFounderWithdrawal(founderId, amount, metadata) {
  // Create the transaction
  const transaction = createTransaction(
    'founder-withdrawal',
    {
      founderId,
      withdrawalType: metadata.withdrawalType,
      timestamp: metadata.timestamp,
      ...metadata
    },
    founderId,
    metadata.withdrawalType === 'personal' ? founderId : 'system-reinvestment',
    amount
  );
  
  // Add to mempool
  await addToMempool(transaction);
  
  // Update address balances
  if (!addresses[founderId]) {
    addresses[founderId] = {
      balance: 0,
      transactions: []
    };
  }
  
  // Record the transaction ID in the address's transaction list
  addresses[founderId].transactions.push(transaction.id);
  
  // Update the recipient's balance
  const recipient = metadata.withdrawalType === 'personal' ? founderId : 'system-reinvestment';
  if (!addresses[recipient]) {
    addresses[recipient] = {
      balance: 0,
      transactions: []
    };
  }
  
  addresses[recipient].balance += amount;
  
  // If it's a reinvestment, record in the system-reinvestment address
  if (metadata.withdrawalType === 'reinvestment') {
    if (!addresses['system-reinvestment'].transactions) {
      addresses['system-reinvestment'].transactions = [];
    }
    addresses['system-reinvestment'].transactions.push(transaction.id);
  }
  
  // Save addresses
  await saveAddresses();
  
  // Check if we should mine a block (every 5 transactions)
  if (mempool.length >= 5) {
    await mineBlock();
  }
  
  return transaction;
}

// Mine a new block with pending transactions
async function mineBlock() {
  if (mempool.length === 0) {
    return null;
  }
  
  // Take transactions from mempool
  const transactions = [...mempool];
  mempool = [];
  await saveMempool();
  
  // Create new block
  const newBlock = createNewBlock(transactions, blockchain[blockchain.length - 1]);
  
  // Add to blockchain
  blockchain.push(newBlock);
  await saveBlockchain();
  
  console.log(`Mined new block #${newBlock.index} with ${transactions.length} transactions`);
  
  return newBlock;
}

// API endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'azora-blockchain',
    blocks: blockchain.length,
    pendingTransactions: mempool.length,
    timestamp: new Date().toISOString()
  });
});

// Get blockchain info
app.get('/api/info', (req, res) => {
  res.json({
    blocks: blockchain.length,
    pendingTransactions: mempool.length,
    addresses: Object.keys(addresses).length,
    genesisTimestamp: blockchain[0].timestamp,
    latestBlock: {
      index: blockchain[blockchain.length - 1].index,
      timestamp: blockchain[blockchain.length - 1].timestamp,
      transactions: blockchain[blockchain.length - 1].transactions.length,
      hash: blockchain[blockchain.length - 1].hash
    },
    totalValue: 10000000 // $10M
  });
});

// Get all blocks
app.get('/api/blocks', (req, res) => {
  const simplifiedBlocks = blockchain.map(block => ({
    index: block.index,
    timestamp: block.timestamp,
    transactions: block.transactions.length,
    hash: block.hash
  }));
  
  res.json(simplifiedBlocks);
});

// Get specific block
app.get('/api/blocks/:index', (req, res) => {
  const index = parseInt(req.params.index);
  
  if (isNaN(index) || index < 0 || index >= blockchain.length) {
    return res.status(404).json({ error: 'Block not found' });
  }
  
  res.json(blockchain[index]);
});

// Get transactions by address
app.get('/api/address/:address', (req, res) => {
  const { address } = req.params;
  
  if (!addresses[address]) {
    return res.status(404).json({ error: 'Address not found' });
  }
  
  // Collect transactions for this address
  const addressData = addresses[address];
  const transactions = [];
  
  // Find transactions in the blockchain
  for (const block of blockchain) {
    for (const tx of block.transactions) {
      if (tx.sender === address || tx.recipient === address) {
        transactions.push({
          ...tx,
          blockIndex: block.index,
          blockTimestamp: block.timestamp,
          confirmed: true
        });
      }
    }
  }
  
  // Find transactions in the mempool
  for (const tx of mempool) {
    if (tx.sender === address || tx.recipient === address) {
      transactions.push({
        ...tx,
        confirmed: false
      });
    }
  }
  
  res.json({
    address,
    balance: addressData.balance,
    transactionCount: transactions.length,
    transactions
  });
});

// Get pending transactions
app.get('/api/mempool', (req, res) => {
  res.json(mempool);
});

// Record founder withdrawal
app.post('/api/founder-withdrawal', async (req, res) => {
  try {
    const { founderId, amount, metadata } = req.body;
    
    if (!founderId || !amount || !metadata) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Process the withdrawal
    const transaction = await processFounderWithdrawal(founderId, amount, metadata);
    
    res.json({
      success: true,
      transaction,
      mempoolSize: mempool.length
    });
  } catch (err) {
    console.error('Error processing founder withdrawal:', err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Manually mine a block
app.post('/api/mine', async (req, res) => {
  try {
    const newBlock = await mineBlock();
    
    if (!newBlock) {
      return res.status(400).json({ error: 'No pending transactions to mine' });
    }
    
    res.json({
      success: true,
      block: {
        index: newBlock.index,
        timestamp: newBlock.timestamp,
        transactions: newBlock.transactions.length,
        hash: newBlock.hash
      }
    });
  } catch (err) {
    console.error('Error mining block:', err);
    res.status(500).json({ error: 'Failed to mine block' });
  }
});

// Verify the blockchain
app.get('/api/verify', (req, res) => {
  const isValid = isValidChain(blockchain);
  
  res.json({
    isValid,
    blocks: blockchain.length,
    message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid'
  });
});

// Get value metrics
app.get('/api/value-metrics', (req, res) => {
  // Calculate total tokens in circulation
  const totalTokens = 1000000; // Fixed supply from genesis block
  
  // Calculate token allocations
  let personalWithdrawals = 0;
  let reinvestments = 0;
  
  for (const block of blockchain) {
    for (const tx of block.transactions) {
      if (tx.type === 'founder-withdrawal') {
        if (tx.data.withdrawalType === 'personal') {
          personalWithdrawals += tx.amount;
        } else if (tx.data.withdrawalType === 'reinvestment') {
          reinvestments += tx.amount;
        }
      }
    }
  }
  
  for (const tx of mempool) {
    if (tx.type === 'founder-withdrawal') {
      if (tx.data.withdrawalType === 'personal') {
        personalWithdrawals += tx.amount;
      } else if (tx.data.withdrawalType === 'reinvestment') {
        reinvestments += tx.amount;
      }
    }
  }
  
  // Calculate value metrics
  const tokenPrice = 10; // $10 USD per token
  const totalValueUSD = totalTokens * tokenPrice;
  const personalValueUSD = personalWithdrawals * tokenPrice;
  const reinvestmentValueUSD = reinvestments * tokenPrice;
  const remainingValueUSD = totalValueUSD - personalValueUSD - reinvestmentValueUSD;
  
  res.json({
    tokenSupply: totalTokens,
    tokenPrice,
    totalValueUSD,
    tokenAllocations: {
      personalWithdrawals,
      reinvestments,
      remaining: totalTokens - personalWithdrawals - reinvestments
    },
    valueAllocations: {
      personalValueUSD,
      reinvestmentValueUSD,
      remainingValueUSD
    },
    constitutionalCompliance: {
      isCompliant: true,
      personalRatio: personalWithdrawals > 0 && reinvestments > 0 ? 
        personalWithdrawals / (personalWithdrawals + reinvestments) : 0.4,
      reinvestmentRatio: personalWithdrawals > 0 && reinvestments > 0 ? 
        reinvestments / (personalWithdrawals + reinvestments) : 0.6,
      targetRatio: "40% personal, 60% reinvestment"
    },
    timestamp: new Date().toISOString()
  });
});

// Initialize and start server
(async () => {
  try {
    await initializeBlockchain();
    
    app.listen(PORT, () => {
      console.log(`Azora OS Blockchain Node running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start blockchain node:', err);
  }
})();

// Export for testing/imports
module.exports = app;