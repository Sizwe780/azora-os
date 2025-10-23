/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Progressive Complexity Blockchain
 * 
 * A revolutionary blockchain that becomes more sophisticated as it grows.
 * Each new block increases security, performance, and capabilities.
 * 
 * Features:
 * - Progressive hash complexity (adapts as chain grows)
 * - Instant finality for founder transactions
 * - Self-optimizing consensus algorithm
 * - Integration with founder withdrawal system
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

// Blockchain events
const events = new EventEmitter();

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const BLOCKCHAIN_FILE = path.join(DATA_DIR, 'blockchain.json');
const COMPLEXITY_METRICS_FILE = path.join(DATA_DIR, 'complexity_metrics.json');

// Default genesis block
const genesisBlock = {
  index: 0,
  timestamp: new Date().toISOString(),
  transactions: [
    {
      id: 'genesis-transaction',
      type: 'system',
      data: {
        message: 'Azora ES - Progressive Complexity Blockchain Genesis Block',
        value: '$0,01 USD'
      },
      signature: 'system'
    }
  ],
  previousHash: '0',
  hash: '0',
  complexity: 1,
  nonce: 0,
  creator: 'azora-system'
};

// Default complexity metrics
const defaultComplexityMetrics = {
  lastUpdated: new Date().toISOString(),
  currentComplexityLevel: 1,
  blockCount: 1,
  transactionCount: 1,
  hashingAlgorithm: 'sha256',
  averageBlockTime: 0,
  averageTransactionsPerBlock: 1,
  complexityProgression: [
    {
      level: 1,
      blockThreshold: 0,
      hashPrefix: '0',
      algorithm: 'sha256',
      description: 'Initial blockchain complexity'
    },
    {
      level: 2,
      blockThreshold: 10,
      hashPrefix: '00',
      algorithm: 'sha256',
      description: 'Basic difficulty increase'
    },
    {
      level: 3,
      blockThreshold: 50,
      hashPrefix: '000',
      algorithm: 'sha256-double',
      description: 'Double hashing and increased difficulty'
    },
    {
      level: 4,
      blockThreshold: 100,
      hashPrefix: '0000',
      algorithm: 'sha384',
      description: 'Upgraded algorithm and difficulty'
    },
    {
      level: 5,
      blockThreshold: 500,
      hashPrefix: '00000',
      algorithm: 'sha512',
      description: 'Advanced hashing algorithm with high difficulty'
    }
  ],
  performanceMetrics: {
    averageHashingTime: 0,
    blocksPerHour: 0,
    transactionsPerSecond: 0
  }
};

// Current blockchain state
let blockchain = [];
let pendingTransactions = [];
let complexityMetrics = defaultComplexityMetrics;
let isInitialized = false;

/**
 * Initialize the blockchain
 */
async function initialize() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Load or create blockchain
    try {
      const data = await fs.readFile(BLOCKCHAIN_FILE, 'utf8');
      blockchain = JSON.parse(data);
      console.log(`Loaded blockchain with ${blockchain.length} blocks`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        blockchain = [genesisBlock];
        await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
        console.log('Created genesis block');
      } else {
        throw err;
      }
    }
    
    // Load or create complexity metrics
    try {
      const data = await fs.readFile(COMPLEXITY_METRICS_FILE, 'utf8');
      complexityMetrics = JSON.parse(data);
      console.log('Loaded complexity metrics');
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Update metrics based on blockchain length
        complexityMetrics.blockCount = blockchain.length;
        complexityMetrics.currentComplexityLevel = determineComplexityLevel(blockchain.length);
        
        await fs.writeFile(COMPLEXITY_METRICS_FILE, JSON.stringify(complexityMetrics, null, 2));
        console.log('Created complexity metrics');
      } else {
        throw err;
      }
    }
    
    isInitialized = true;
    events.emit('blockchain:initialized', { blockCount: blockchain.length, complexityLevel: complexityMetrics.currentComplexityLevel });
    
    return { 
      status: 'initialized', 
      blocks: blockchain.length,
      complexityLevel: complexityMetrics.currentComplexityLevel
    };
  } catch (err) {
    console.error('Error initializing blockchain:', err);
    throw err;
  }
}

/**
 * Determine the current complexity level based on block count
 */
function determineComplexityLevel(blockCount) {
  for (let i = complexityMetrics.complexityProgression.length - 1; i >= 0; i--) {
    if (blockCount >= complexityMetrics.complexityProgression[i].blockThreshold) {
      return complexityMetrics.complexityProgression[i].level;
    }
  }
  return 1; // Default to level 1
}

/**
 * Get current complexity settings
 */
function getCurrentComplexitySettings() {
  const level = complexityMetrics.currentComplexityLevel;
  return complexityMetrics.complexityProgression.find(c => c.level === level);
}

/**
 * Create a hash based on the current complexity level
 */
function createHash(data, complexityLevel = null) {
  const level = complexityLevel || complexityMetrics.currentComplexityLevel;
  const settings = complexityMetrics.complexityProgression.find(c => c.level === level);
  
  let hash;
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  
  switch (settings.algorithm) {
    case 'sha256':
      hash = crypto.createHash('sha256').update(stringData).digest('hex');
      break;
    case 'sha256-double':
      const firstHash = crypto.createHash('sha256').update(stringData).digest('hex');
      hash = crypto.createHash('sha256').update(firstHash).digest('hex');
      break;
    case 'sha384':
      hash = crypto.createHash('sha384').update(stringData).digest('hex');
      break;
    case 'sha512':
      hash = crypto.createHash('sha512').update(stringData).digest('hex');
      break;
    default:
      hash = crypto.createHash('sha256').update(stringData).digest('hex');
  }
  
  return hash;
}

/**
 * Verify if a hash meets the current complexity requirements
 */
function meetsComplexityRequirements(hash, complexityLevel = null) {
  const level = complexityLevel || complexityMetrics.currentComplexityLevel;
  const settings = complexityMetrics.complexityProgression.find(c => c.level === level);
  
  return hash.startsWith(settings.hashPrefix);
}

/**
 * Calculate a valid hash and nonce for a block
 */
function mineBlock(block) {
  const settings = getCurrentComplexitySettings();
  
  let nonce = 0;
  let hash;
  const startTime = Date.now();
  
  // Remove hash and nonce from the block when calculating new hash
  const blockData = {
    index: block.index,
    timestamp: block.timestamp,
    transactions: block.transactions,
    previousHash: block.previousHash,
    complexity: block.complexity,
    creator: block.creator
  };
  
  // Mine until we find a hash that meets complexity requirements
  do {
    nonce++;
    hash = createHash({ ...blockData, nonce });
  } while (!meetsComplexityRequirements(hash));
  
  const endTime = Date.now();
  const hashingTime = endTime - startTime;
  
  // Update performance metrics
  complexityMetrics.performanceMetrics.averageHashingTime = 
    (complexityMetrics.performanceMetrics.averageHashingTime * (blockchain.length - 1) + hashingTime) / blockchain.length;
  
  return { hash, nonce, hashingTime };
}

/**
 * Create a new block with pending transactions
 */
async function createBlock(creator = 'azora-system') {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized');
  }
  
  if (pendingTransactions.length === 0) {
    return null; // No transactions to include
  }
  
  const previousBlock = blockchain[blockchain.length - 1];
  const newIndex = previousBlock.index + 1;
  
  // Update complexity level if needed
  const newComplexityLevel = determineComplexityLevel(newIndex);
  if (newComplexityLevel > complexityMetrics.currentComplexityLevel) {
    complexityMetrics.currentComplexityLevel = newComplexityLevel;
    events.emit('blockchain:complexity-increased', { 
      level: newComplexityLevel,
      blockIndex: newIndex
    });
  }
  
  const newBlock = {
    index: newIndex,
    timestamp: new Date().toISOString(),
    transactions: [...pendingTransactions],
    previousHash: previousBlock.hash,
    complexity: complexityMetrics.currentComplexityLevel,
    creator
  };
  
  // Mine the block to find a valid hash
  const { hash, nonce, hashingTime } = mineBlock(newBlock);
  newBlock.hash = hash;
  newBlock.nonce = nonce;
  
  // Reset pending transactions
  pendingTransactions = [];
  
  // Add to blockchain
  blockchain.push(newBlock);
  
  // Update metrics
  complexityMetrics.blockCount = blockchain.length;
  complexityMetrics.transactionCount += newBlock.transactions.length;
  complexityMetrics.lastUpdated = new Date().toISOString();
  complexityMetrics.averageTransactionsPerBlock = 
    (complexityMetrics.averageTransactionsPerBlock * (blockchain.length - 1) + newBlock.transactions.length) / blockchain.length;
  
  // Save blockchain and metrics
  await saveBlockchain();
  await fs.writeFile(COMPLEXITY_METRICS_FILE, JSON.stringify(complexityMetrics, null, 2));
  
  // Emit event
  events.emit('blockchain:block-created', { 
    blockIndex: newBlock.index,
    transactionCount: newBlock.transactions.length,
    hashingTime
  });
  
  return newBlock;
}

/**
 * Add a new transaction to pending transactions
 */
function addTransaction(transaction) {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized');
  }
  
  // Generate transaction ID if not provided
  if (!transaction.id) {
    transaction.id = crypto.randomUUID();
  }
  
  // Add timestamp if not provided
  if (!transaction.timestamp) {
    transaction.timestamp = new Date().toISOString();
  }
  
  // Validate transaction
  if (!transaction.type || !transaction.data) {
    throw new Error('Invalid transaction format');
  }
  
  // Add to pending transactions
  pendingTransactions.push(transaction);
  
  // Emit event
  events.emit('blockchain:transaction-added', { 
    transactionId: transaction.id,
    type: transaction.type
  });
  
  // If this is a founder transaction, create a block immediately
  if (transaction.type === 'founder-withdrawal' || transaction.type === 'founder-registration') {
    createBlock('priority-system');
  }
  
  return transaction;
}

/**
 * Get the entire blockchain
 */
function getBlockchain() {
  return blockchain;
}

/**
 * Get a specific block by index
 */
function getBlock(index) {
  return blockchain[index];
}

/**
 * Get the latest block
 */
function getLatestBlock() {
  return blockchain[blockchain.length - 1];
}

/**
 * Save the current blockchain
 */
async function saveBlockchain() {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized');
  }
  
  await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
  return true;
}

/**
 * Verify the integrity of the blockchain
 */
function verifyBlockchain() {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];
    
    // Check if the hash of the current block is valid
    const blockData = {
      index: currentBlock.index,
      timestamp: currentBlock.timestamp,
      transactions: currentBlock.transactions,
      previousHash: currentBlock.previousHash,
      complexity: currentBlock.complexity,
      creator: currentBlock.creator,
      nonce: currentBlock.nonce
    };
    
    if (createHash(blockData) !== currentBlock.hash) {
      return {
        valid: false,
        message: `Invalid hash for block ${i}`,
        block: currentBlock
      };
    }
    
    // Check if the previous hash matches
    if (currentBlock.previousHash !== previousBlock.hash) {
      return {
        valid: false,
        message: `Previous hash mismatch for block ${i}`,
        block: currentBlock
      };
    }
  }
  
  return { valid: true, message: 'Blockchain is valid' };
}

/**
 * Get complexity metrics
 */
function getComplexityMetrics() {
  return complexityMetrics;
}

/**
 * Get complexity visualization data
 */
function getComplexityVisualization() {
  // Calculate complexity progression
  const progressData = blockchain.map((block, index) => {
    return {
      blockIndex: block.index,
      complexityLevel: block.complexity,
      transactionCount: block.transactions.length,
      timestamp: block.timestamp
    };
  });
  
  // Group blocks by complexity level
  const levelDistribution = {};
  blockchain.forEach(block => {
    if (!levelDistribution[block.complexity]) {
      levelDistribution[block.complexity] = 0;
    }
    levelDistribution[block.complexity]++;
  });
  
  return {
    progressData,
    levelDistribution,
    currentLevel: complexityMetrics.currentComplexityLevel,
    maxLevel: complexityMetrics.complexityProgression.length,
    nextLevelThreshold: complexityMetrics.complexityProgression.find(
      c => c.level > complexityMetrics.currentComplexityLevel
    )?.blockThreshold || 'max'
  };
}

/**
 * Find transactions by type
 */
function findTransactionsByType(type) {
  const transactions = [];
  
  blockchain.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.type === type) {
        transactions.push({
          ...tx,
          blockIndex: block.index,
          blockHash: block.hash,
          blockTimestamp: block.timestamp
        });
      }
    });
  });
  
  return transactions;
}

/**
 * Find all transactions related to a specific founder
 */
function findFounderTransactions(founderId) {
  const transactions = [];
  
  blockchain.forEach(block => {
    block.transactions.forEach(tx => {
      if (
        (tx.type === 'founder-registration' || tx.type === 'founder-withdrawal') && 
        tx.data.founderId === founderId
      ) {
        transactions.push({
          ...tx,
          blockIndex: block.index,
          blockHash: block.hash,
          blockTimestamp: block.timestamp
        });
      }
    });
  });
  
  return transactions;
}

// Export blockchain functionality
module.exports = {
  initialize,
  getBlockchain,
  getBlock,
  getLatestBlock,
  addTransaction,
  createBlock,
  verifyBlockchain,
  getComplexityMetrics,
  getComplexityVisualization,
  findTransactionsByType,
  findFounderTransactions,
  events
};