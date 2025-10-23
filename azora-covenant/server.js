/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora ES Blockchain Node
 *
 * Records all founder withdrawals and transactions in an immutable ledger
 * Supports the $10M valuation with transparent, verifiable transaction history
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
const PORT = process.env.PORT || 5001;
const DATA_DIR = path.join(__dirname, 'data');
const BLOCKCHAIN_FILE = path.join(DATA_DIR, 'blockchain.json');
const PENDING_TX_FILE = path.join(DATA_DIR, 'pending_transactions.json');

// Default blockchain structure
const DEFAULT_BLOCKCHAIN = {
  name: 'Azora ES Blockchain',
  symbol: 'AZR',
  blocks: [
    {
      index: 0,
      timestamp: new Date('2025-10-10T10:00:00Z').toISOString(),
      transactions: [
        {
          id: 'genesis-transaction',
          type: 'GENESIS',
          data: {
            message: 'Azora ES Genesis Block - $10M Valuation',
            totalSupply: 1000000,
            tokenPrice: 10.0
          },
          timestamp: new Date('2025-10-10T10:00:00Z').toISOString(),
          hash: 'genesis-hash'
        }
      ],
      previousHash: '0',
      hash: 'genesis-block-hash',
      nonce: 0
    }
  ],
  currentDifficulty: 2,
  totalTransactions: 1,
  lastUpdated: new Date('2025-10-10T10:00:00Z').toISOString()
};

// Default pending transactions
const DEFAULT_PENDING_TX = [];

// Initialize the blockchain data
async function initBlockchain() {
  try {
    // Create data directory if needed
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check if blockchain file exists
    try {
      await fs.access(BLOCKCHAIN_FILE);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Create default blockchain
        await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(DEFAULT_BLOCKCHAIN, null, 2));
        console.log('Created new blockchain');
      } else {
        throw err;
      }
    }
    
    // Check if pending transactions file exists
    try {
      await fs.access(PENDING_TX_FILE);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Create default pending transactions
        await fs.writeFile(PENDING_TX_FILE, JSON.stringify(DEFAULT_PENDING_TX, null, 2));
        console.log('Created pending transactions file');
      } else {
        throw err;
      }
    }
    
    console.log('Blockchain initialized');
  } catch (err) {
    console.error('Error initializing blockchain:', err);
  }
}

// Get the blockchain data
async function getBlockchain() {
  const data = await fs.readFile(BLOCKCHAIN_FILE, 'utf8');
  return JSON.parse(data);
}

// Save the blockchain data
async function saveBlockchain(blockchain) {
  await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
}

// Get pending transactions
async function getPendingTransactions() {
  const data = await fs.readFile(PENDING_TX_FILE, 'utf8');
  return JSON.parse(data);
}

// Save pending transactions
async function savePendingTransactions(transactions) {
  await fs.writeFile(PENDING_TX_FILE, JSON.stringify(transactions, null, 2));
}

// Calculate hash of data
function calculateHash(data) {
  return crypto.createHash('sha256')
    .update(typeof data === 'object' ? JSON.stringify(data) : data)
    .digest('hex');
}

// Create a new transaction
async function createTransaction(transactionData) {
  // Generate transaction ID if not provided
  const txId = transactionData.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Create transaction object
  const transaction = {
    id: txId,
    type: transactionData.type,
    data: transactionData,
    timestamp: new Date().toISOString(),
    hash: null
  };
  
  // Calculate transaction hash
  transaction.hash = calculateHash(transaction);
  
  // Add to pending transactions
  const pendingTransactions = await getPendingTransactions();
  pendingTransactions.push(transaction);
  await savePendingTransactions(pendingTransactions);
  
  // If we have enough transactions, mine a new block
  if (pendingTransactions.length >= 5) {
    await mineBlock();
  }
  
  return transaction;
}

// Mine a new block
async function mineBlock() {
  // Get blockchain and pending transactions
  const blockchain = await getBlockchain();
  const pendingTransactions = await getPendingTransactions();
  
  // Don't mine if there are no pending transactions
  if (pendingTransactions.length === 0) {
    return null;
  }
  
  // Get the last block
  const lastBlock = blockchain.blocks[blockchain.blocks.length - 1];
  
  // Create a new block
  const newBlock = {
    index: lastBlock.index + 1,
    timestamp: new Date().toISOString(),
    transactions: pendingTransactions,
    previousHash: lastBlock.hash,
    hash: null,
    nonce: 0
  };
  
  // Mine the block (find a hash with required difficulty)
  while (true) {
    const blockData = {
      index: newBlock.index,
      timestamp: newBlock.timestamp,
      transactions: newBlock.transactions,
      previousHash: newBlock.previousHash,
      nonce: newBlock.nonce
    };
    
    const hash = calculateHash(blockData);
    
    // Check if hash meets difficulty (starts with required number of zeros)
    if (hash.startsWith('0'.repeat(blockchain.currentDifficulty))) {
      newBlock.hash = hash;
      break;
    }
    
    newBlock.nonce++;
  }
  
  // Add the new block to the blockchain
  blockchain.blocks.push(newBlock);
  blockchain.totalTransactions += pendingTransactions.length;
  blockchain.lastUpdated = new Date().toISOString();
  
  // Save the blockchain
  await saveBlockchain(blockchain);
  
  // Clear pending transactions
  await savePendingTransactions([]);
  
  return newBlock;
}

// Get transaction by ID
async function getTransactionById(txId) {
  const blockchain = await getBlockchain();
  
  // Check in blocks
  for (const block of blockchain.blocks) {
    const transaction = block.transactions.find(tx => tx.id === txId);
    if (transaction) {
      return {
        transaction,
        block: {
          index: block.index,
          hash: block.hash
        },
        confirmed: true
      };
    }
  }
  
  // Check in pending transactions
  const pendingTransactions = await getPendingTransactions();
  const pendingTransaction = pendingTransactions.find(tx => tx.id === txId);
  if (pendingTransaction) {
    return {
      transaction: pendingTransaction,
      confirmed: false
    };
  }
  
  return null;
}

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'azora-blockchain',
    timestamp: new Date().toISOString()
  });
});

// Get blockchain info
app.get('/api/blockchain/info', async (req, res) => {
  try {
    const blockchain = await getBlockchain();
    
    const info = {
      name: blockchain.name,
      symbol: blockchain.symbol,
      blocks: blockchain.blocks.length,
      totalTransactions: blockchain.totalTransactions,
      lastBlockIndex: blockchain.blocks[blockchain.blocks.length - 1].index,
      lastBlockHash: blockchain.blocks[blockchain.blocks.length - 1].hash,
      lastUpdated: blockchain.lastUpdated
    };
    
    res.json(info);
  } catch (err) {
    console.error('Error getting blockchain info:', err);
    res.status(500).json({ error: 'Failed to get blockchain info' });
  }
});

// Get blocks
app.get('/api/blocks', async (req, res) => {
  try {
    const blockchain = await getBlockchain();
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate start and end indices
    const startIdx = Math.max(0, blockchain.blocks.length - (page + 1) * limit);
    const endIdx = Math.max(0, blockchain.blocks.length - page * limit);
    
    // Get blocks for the requested page
    const blocks = blockchain.blocks.slice(startIdx, endIdx).reverse();
    
    res.json({
      page,
      limit,
      total: blockchain.blocks.length,
      blocks
    });
  } catch (err) {
    console.error('Error getting blocks:', err);
    res.status(500).json({ error: 'Failed to get blocks' });
  }
});

// Get block by index
app.get('/api/blocks/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const blockchain = await getBlockchain();
    
    const block = blockchain.blocks.find(b => b.index === index);
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }
    
    res.json(block);
  } catch (err) {
    console.error('Error getting block:', err);
    res.status(500).json({ error: 'Failed to get block' });
  }
});

// Get pending transactions
app.get('/api/pending-transactions', async (req, res) => {
  try {
    const pendingTransactions = await getPendingTransactions();
    res.json(pendingTransactions);
  } catch (err) {
    console.error('Error getting pending transactions:', err);
    res.status(500).json({ error: 'Failed to get pending transactions' });
  }
});

// Create new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = await createTransaction(req.body);
    
    res.status(201).json({
      message: 'Transaction created',
      transaction,
      explorerUrl: `/explorer/tx/${transaction.id}`
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction by ID
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTransactionById(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error getting transaction:', err);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// Manual mining endpoint (for testing)
app.post('/api/mine', async (req, res) => {
  try {
    const newBlock = await mineBlock();
    
    if (!newBlock) {
      return res.status(400).json({ error: 'No pending transactions to mine' });
    }
    
    res.status(201).json({
      message: 'Block mined successfully',
      block: newBlock
    });
  } catch (err) {
    console.error('Error mining block:', err);
    res.status(500).json({ error: 'Failed to mine block' });
  }
});

// Serve the explorer UI
app.get('/explorer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Transaction explorer
app.get('/explorer/tx/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Block explorer
app.get('/explorer/block/:index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
async function startServer() {
  try {
    await initBlockchain();
    
    app.listen(PORT, () => {
      console.log(`Blockchain node running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start blockchain node:', err);
  }
}

startServer();