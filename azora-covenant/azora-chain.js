/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora ES Blockchain Integration
 *
 * Records all transactions on a secure, immutable ledger
 * Enables founder withdrawals with constitutional compliance
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app for blockchain API
const app = express();
app.use(cors());
app.use(express.json());

// Constants
const PORT = process.env.BLOCKCHAIN_PORT || 5050;
const DATA_DIR = path.join(__dirname, 'data');
const BLOCKS_FILE = path.join(DATA_DIR, 'blocks.json');
const PENDING_TX_FILE = path.join(DATA_DIR, 'pending_transactions.json');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const GENESIS_TIMESTAMP = new Date('2025-10-10T10:00:00.000Z').toISOString(); // Launch day

// Ensure data directory exists
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// Blockchain data structure
class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.previousHash +
          this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block #${this.index} mined: ${this.hash}`);
  }
}

class Transaction {
  constructor(fromAddress, toAddress, amount, type, metadata = {}) {
    this.id = uuidv4();
    this.timestamp = new Date().toISOString();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.type = type; // 'trade', 'withdrawal', 'investment', 'reinvestment', etc.
    this.metadata = metadata;
    this.signature = '';
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.fromAddress +
          this.toAddress +
          this.amount +
          this.type +
          JSON.stringify(this.metadata) +
          this.timestamp
      )
      .digest('hex');
  }

  signTransaction(signingKey) {
    const hashTx = this.calculateHash();
    this.signature = crypto
      .createSign('SHA256')
      .update(hashTx)
      .sign(signingKey, 'base64');
  }

  isValid() {
    // For system transactions, we can skip signature validation
    if (this.fromAddress === 'system') return true;

    if (!this.signature || this.signature.length === 0) {
      return false;
    }

    try {
      const publicKey = crypto.createPublicKey(this.fromAddress);
      return crypto
        .createVerify('SHA256')
        .update(this.calculateHash())
        .verify(publicKey, this.signature, 'base64');
    } catch (e) {
      return false;
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 3; // Mining difficulty
    this.miningReward = 0; // No mining reward for private blockchain
    this.initialized = false;
  }

  async initialize() {
    try {
      // Try to load existing blockchain
      try {
        const blocksData = await fs.readFile(BLOCKS_FILE, 'utf8');
        this.chain = JSON.parse(blocksData);
        console.log(`Loaded ${this.chain.length} blocks from file`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Create genesis block
          this.createGenesisBlock();
          await this.saveChain();
          console.log('Created genesis block');
        } else {
          throw err;
        }
      }

      // Load pending transactions
      try {
        const txData = await fs.readFile(PENDING_TX_FILE, 'utf8');
        this.pendingTransactions = JSON.parse(txData);
        console.log(`Loaded ${this.pendingTransactions.length} pending transactions`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.writeFile(PENDING_TX_FILE, JSON.stringify(this.pendingTransactions));
          console.log('Created empty pending transactions file');
        } else {
          throw err;
        }
      }

      this.initialized = true;
    } catch (err) {
      console.error('Error initializing blockchain:', err);
      throw err;
    }
  }

  createGenesisBlock() {
    // Create genesis transaction - Initial token allocation
    const genesisTx = new Transaction(
      'system',
      'treasury',
      1000000, // 1 million tokens
      'genesis',
      {
        description: 'Initial allocation of 1,000,000 tokens at $10 each',
        totalValue: '$10,000,000 USD',
        constitutionalReference: 'Article 4, Section 1'
      }
    );

    const genesisBlock = new Block(
      0,
      GENESIS_TIMESTAMP,
      [genesisTx],
      '0'
    );
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async minePendingTransactions(miningRewardAddress) {
    // Create a new block with all pending transactions
    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    // Mine the block
    block.mineBlock(this.difficulty);

    // Add the block to the chain
    this.chain.push(block);

    // Reset pending transactions
    this.pendingTransactions = [];
    
    // Save updates
    await Promise.all([
      this.saveChain(),
      this.savePendingTransactions()
    ]);

    return block;
  }

  async addTransaction(transaction) {
    // Validate transaction fields
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to addresses');
    }

    // Validate transaction
    if (transaction.fromAddress !== 'system' && !transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
    await this.savePendingTransactions();
    
    return transaction;
  }

  async founderWithdrawal(founderId, amount, metadata) {
    // Create a founder withdrawal transaction
    const transaction = new Transaction(
      'treasury',
      founderId,
      amount,
      'founder_withdrawal',
      metadata
    );

    // Add transaction to pending
    await this.addTransaction(transaction);

    // If we have enough transactions, mine a block
    if (this.pendingTransactions.length >= 5) {
      await this.minePendingTransactions('system');
    }

    return transaction;
  }

  async recordTrade(trade) {
    // Create a trade transaction
    const transaction = new Transaction(
      trade.sellOrderId,
      trade.buyOrderId,
      trade.amount,
      'trade',
      {
        price: trade.price,
        total: trade.total,
        timestamp: trade.timestamp
      }
    );

    // Add transaction to pending
    await this.addTransaction(transaction);

    return transaction;
  }

  getAddressBalance(address) {
    let balance = 0;

    // Go through each block and transactions
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        // If the address is the sender, subtract the amount
        if (trans.fromAddress === address) {
          balance -= parseFloat(trans.amount);
        }

        // If the address is the recipient, add the amount
        if (trans.toAddress === address) {
          balance += parseFloat(trans.amount);
        }
      }
    }

    // Also check pending transactions
    for (const trans of this.pendingTransactions) {
      // If the address is the sender, subtract the amount
      if (trans.fromAddress === address) {
        balance -= parseFloat(trans.amount);
      }

      // If the address is the recipient, add the amount
      if (trans.toAddress === address) {
        balance += parseFloat(trans.amount);
      }
    }

    return balance;
  }

  isChainValid() {
    // Check if the Genesis block hasn't been tampered with
    if (this.chain[0].hash !== this.chain[0].calculateHash()) {
      return false;
    }

    // Check the remaining blocks on the chain
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Validate each transaction in the block
      for (const transaction of currentBlock.transactions) {
        if (transaction.fromAddress !== 'system' && !transaction.isValid()) {
          return false;
        }
      }
    }

    return true;
  }

  async saveChain() {
    await fs.writeFile(BLOCKS_FILE, JSON.stringify(this.chain, null, 2));
  }

  async savePendingTransactions() {
    await fs.writeFile(PENDING_TX_FILE, JSON.stringify(this.pendingTransactions, null, 2));
  }
}

// Create blockchain instance
const azoraChain = new Blockchain();

// API Endpoints

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    blockchain: {
      initialized: azoraChain.initialized,
      blocks: azoraChain.chain.length,
      pendingTransactions: azoraChain.pendingTransactions.length,
      isValid: azoraChain.isChainValid()
    },
    timestamp: new Date().toISOString()
  });
});

// Get full blockchain
app.get('/api/blockchain', (req, res) => {
  res.json(azoraChain.chain);
});

// Get pending transactions
app.get('/api/pending-transactions', (req, res) => {
  res.json(azoraChain.pendingTransactions);
});

// Get specific block
app.get('/api/blocks/:index', (req, res) => {
  const blockIndex = parseInt(req.params.index);
  if (blockIndex < 0 || blockIndex >= azoraChain.chain.length) {
    return res.status(404).json({ error: 'Block not found' });
  }
  res.json(azoraChain.chain[blockIndex]);
});

// Get address transactions and balance
app.get('/api/address/:address', (req, res) => {
  const { address } = req.params;
  const balance = azoraChain.getAddressBalance(address);

  // Find all transactions involving this address
  const transactions = [];

  for (const block of azoraChain.chain) {
    for (const tx of block.transactions) {
      if (tx.fromAddress === address || tx.toAddress === address) {
        transactions.push({
          ...tx,
          blockIndex: block.index,
          blockHash: block.hash,
          confirmed: true
        });
      }
    }
  }

  // Also include pending transactions
  for (const tx of azoraChain.pendingTransactions) {
    if (tx.fromAddress === address || tx.toAddress === address) {
      transactions.push({
        ...tx,
        confirmed: false
      });
    }
  }

  res.json({
    address,
    balance,
    transactions
  });
});

// Record a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, type, metadata } = req.body;

    const transaction = new Transaction(
      fromAddress,
      toAddress,
      amount,
      type,
      metadata
    );

    // For demo purposes, we're skipping signature verification
    // In a real blockchain, you would verify the signature here

    await azoraChain.addTransaction(transaction);
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(400).json({ error: err.message });
  }
});

// Create a founder withdrawal transaction
app.post('/api/founder-withdrawal', async (req, res) => {
  try {
    const { founderId, amount, metadata } = req.body;
    
    if (!founderId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = await azoraChain.founderWithdrawal(
      founderId,
      parseFloat(amount),
      metadata
    );

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error processing founder withdrawal:', err);
    res.status(400).json({ error: err.message });
  }
});

// Mine pending transactions
app.post('/api/mine', async (req, res) => {
  try {
    if (azoraChain.pendingTransactions.length === 0) {
      return res.status(400).json({ error: 'No pending transactions to mine' });
    }

    const newBlock = await azoraChain.minePendingTransactions('system');
    res.json(newBlock);
  } catch (err) {
    console.error('Error mining block:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get blockchain statistics
app.get('/api/stats', (req, res) => {
  // Calculate total number of transactions
  let totalTransactions = 0;
  let founderWithdrawals = 0;
  let tradeVolume = 0;
  let reinvestments = 0;

  for (const block of azoraChain.chain) {
    totalTransactions += block.transactions.length;
    
    for (const tx of block.transactions) {
      if (tx.type === 'founder_withdrawal') {
        founderWithdrawals += parseFloat(tx.amount);
      } else if (tx.type === 'trade') {
        tradeVolume += parseFloat(tx.amount);
      } else if (tx.type === 'reinvestment') {
        reinvestments += parseFloat(tx.amount);
      }
    }
  }

  res.json({
    chainLength: azoraChain.chain.length,
    totalTransactions,
    pendingTransactions: azoraChain.pendingTransactions.length,
    difficulty: azoraChain.difficulty,
    founderWithdrawals,
    tradeVolume,
    reinvestments,
    treasuryBalance: azoraChain.getAddressBalance('treasury'),
    lastBlockTimestamp: azoraChain.chain[azoraChain.chain.length - 1].timestamp
  });
});

// Blockchain Explorer UI
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Azora ES Blockchain Explorer</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f9fc;
      }
      h1, h2, h3 {
        color: #2c3e50;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .block {
        border-left: 4px solid #3498db;
        padding-left: 15px;
        margin-bottom: 15px;
      }
      .transaction {
        margin-left: 20px;
        padding: 10px;
        background-color: #f9f9f9;
        margin-bottom: 10px;
        border-radius: 5px;
      }
      .hash {
        font-family: monospace;
        word-break: break-all;
      }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: white;
        margin-right: 5px;
      }
      .badge-blue { background-color: #3498db; }
      .badge-green { background-color: #2ecc71; }
      .badge-orange { background-color: #f39c12; }
      .badge-red { background-color: #e74c3c; }
      
      .tabs {
        display: flex;
        margin-bottom: 20px;
      }
      .tab {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .tab.active {
        border-bottom: 2px solid #3498db;
        font-weight: bold;
      }
      .tab-content {
        display: none;
      }
      .tab-content.active {
        display: block;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background-color: #f2f2f2;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        color: #7f8c8d;
        font-size: 0.9rem;
      }
      .founder-highlight {
        background-color: #e8f4f8;
        border-left: 4px solid #2980b9;
        padding: 10px;
        margin-top: 10px;
      }
      .btn {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn:hover {
        background-color: #2980b9;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Azora ES Blockchain Explorer</h1>
        <div>Transparent verification of Azora's constitutional compliance</div>
      </div>
      <div>
        <button class="btn" id="mine-btn">Mine Pending Transactions</button>
      </div>
    </div>
    
    <div class="tabs">
      <div class="tab active" data-tab="overview">Overview</div>
      <div class="tab" data-tab="blocks">Blocks</div>
      <div class="tab" data-tab="transactions">Transactions</div>
      <div class="tab" data-tab="founders">Founder Withdrawals</div>
    </div>
    
    <div id="overview-tab" class="tab-content active">
      <div class="card">
        <h2>Blockchain Statistics</h2>
        <table>
          <tr>
            <td><strong>Total Blocks:</strong></td>
            <td id="stat-blocks">Loading...</td>
          </tr>
          <tr>
            <td><strong>Total Transactions:</strong></td>
            <td id="stat-transactions">Loading...</td>
          </tr>
          <tr>
            <td><strong>Pending Transactions:</strong></td>
            <td id="stat-pending">Loading...</td>
          </tr>
          <tr>
            <td><strong>Treasury Balance:</strong></td>
            <td id="stat-treasury">Loading...</td>
          </tr>
          <tr>
            <td><strong>Founder Withdrawals:</strong></td>
            <td id="stat-withdrawals">Loading...</td>
          </tr>
          <tr>
            <td><strong>Trade Volume:</strong></td>
            <td id="stat-volume">Loading...</td>
          </tr>
          <tr>
            <td><strong>Last Block:</strong></td>
            <td id="stat-last-block">Loading...</td>
          </tr>
          <tr>
            <td><strong>Chain Valid:</strong></td>
            <td id="stat-valid">Loading...</td>
          </tr>
        </table>
      </div>
      
      <div class="card">
        <h2>Latest Blocks</h2>
        <div id="latest-blocks">
          Loading...
        </div>
      </div>
    </div>
    
    <div id="blocks-tab" class="tab-content">
      <div class="card">
        <h2>All Blocks</h2>
        <table>
          <thead>
            <tr>
              <th>Height</th>
              <th>Timestamp</th>
              <th>Transactions</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody id="blocks-table">
            <tr>
              <td colspan="4">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="transactions-tab" class="tab-content">
      <div class="card">
        <h2>All Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="transactions-table">
            <tr>
              <td colspan="6">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="card">
        <h2>Pending Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody id="pending-table">
            <tr>
              <td colspan="5">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="founders-tab" class="tab-content">
      <div class="card">
        <h2>Founder Withdrawals</h2>
        <div class="founder-highlight">
          <p>According to the Azora Constitution Article 4, founders can withdraw 40% personally, with 60% reinvested into Azora projects.</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Founder ID</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Timestamp</th>
              <th>Block</th>
            </tr>
          </thead>
          <tbody id="founders-table">
            <tr>
              <td colspan="5">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Azora ES | Blockchain verification of constitutional compliance</p>
    </div>
    
    <script>
      // Tab switching
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.getAttribute('data-tab');
          
          // Update active tab
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // Show active content
          document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
          document.getElementById(tabName + '-tab').classList.add('active');
        });
      });
      
      // Format date
      function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString();
      }
      
      // Format number with commas
      function formatNumber(num) {
        return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
      }
      
      // Get transaction type badge
      function getTypeBadge(type) {
        switch (type) {
          case 'genesis':
            return '<span class="badge badge-blue">Genesis</span>';
          case 'founder_withdrawal':
            return '<span class="badge badge-green">Withdrawal</span>';
          case 'trade':
            return '<span class="badge badge-orange">Trade</span>';
          case 'reinvestment':
            return '<span class="badge badge-blue">Reinvestment</span>';
          default:
            return '<span class="badge badge-blue">' + type + '</span>';
        }
      }
      
      // Get status badge
      function getStatusBadge(confirmed) {
        return confirmed ? 
          '<span class="badge badge-green">Confirmed</span>' : 
          '<span class="badge badge-orange">Pending</span>';
      }
      
      // Fetch blockchain stats
      async function fetchStats() {
        try {
          const response = await fetch('/api/stats');
          const stats = await response.json();
          
          document.getElementById('stat-blocks').textContent = stats.chainLength;
          document.getElementById('stat-transactions').textContent = stats.totalTransactions;
          document.getElementById('stat-pending').textContent = stats.pendingTransactions;
          document.getElementById('stat-treasury').textContent = stats.treasuryBalance.toLocaleString() + ' tokens';
          document.getElementById('stat-withdrawals').textContent = stats.founderWithdrawals.toLocaleString() + ' tokens';
          document.getElementById('stat-volume').textContent = stats.tradeVolume.toLocaleString() + ' tokens';
          document.getElementById('stat-last-block').textContent = formatDate(stats.lastBlockTimestamp);
          
          // Fetch health to get chain validity
          const healthResponse = await fetch('/health');
          const health = await healthResponse.json();
          document.getElementById('stat-valid').innerHTML = health.blockchain.isValid ? 
            '<span class="badge badge-green">Valid</span>' : 
            '<span class="badge badge-red">Invalid</span>';
        } catch (err) {
          console.error('Error fetching stats:', err);
        }
      }
      
      // Fetch latest blocks
      async function fetchLatestBlocks() {
        try {
          const response = await fetch('/api/blockchain');
          const blocks = await response.json();
          
          // Show the last 5 blocks
          const latestBlocks = blocks.slice(-5).reverse();
          
          const html = latestBlocks.map(block => {
            return \`
              <div class="block">
                <h3>Block #\${block.index}</h3>
                <div><strong>Timestamp:</strong> \${formatDate(block.timestamp)}</div>
                <div><strong>Hash:</strong> <span class="hash">\${block.hash}</span></div>
                <div><strong>Prev Hash:</strong> <span class="hash">\${block.previousHash}</span></div>
                <div><strong>Transactions:</strong> \${block.transactions.length}</div>
                
                \${block.transactions.map(tx => {
                  return \`
                    <div class="transaction">
                      \${getTypeBadge(tx.type)}
                      <div><strong>From:</strong> \${tx.fromAddress}</div>
                      <div><strong>To:</strong> \${tx.toAddress}</div>
                      <div><strong>Amount:</strong> \${tx.amount} tokens</div>
                      <div><strong>Timestamp:</strong> \${formatDate(tx.timestamp)}</div>
                    </div>
                  \`;
                }).join('')}
              </div>
            \`;
          }).join('');
          
          document.getElementById('latest-blocks').innerHTML = html;
        } catch (err) {
          console.error('Error fetching latest blocks:', err);
        }
      }
      
      // Fetch all blocks
      async function fetchAllBlocks() {
        try {
          const response = await fetch('/api/blockchain');
          const blocks = await response.json();
          
          const html = blocks.map(block => {
            return \`
              <tr>
                <td>\${block.index}</td>
                <td>\${formatDate(block.timestamp)}</td>
                <td>\${block.transactions.length}</td>
                <td><span class="hash">\${block.hash.substring(0, 16)}...</span></td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('blocks-table').innerHTML = html;
        } catch (err) {
          console.error('Error fetching all blocks:', err);
        }
      }
      
      // Fetch all transactions
      async function fetchAllTransactions() {
        try {
          const response = await fetch('/api/blockchain');
          const blocks = await response.json();
          
          // Collect all transactions
          const transactions = [];
          
          blocks.forEach(block => {
            block.transactions.forEach(tx => {
              transactions.push({
                ...tx,
                blockIndex: block.index,
                confirmed: true
              });
            });
          });
          
          // Sort by timestamp (newest first)
          transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          const html = transactions.map(tx => {
            return \`
              <tr>
                <td>\${getTypeBadge(tx.type)}</td>
                <td>\${tx.fromAddress}</td>
                <td>\${tx.toAddress}</td>
                <td>\${tx.amount} tokens</td>
                <td>\${formatDate(tx.timestamp)}</td>
                <td>\${getStatusBadge(tx.confirmed)}</td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('transactions-table').innerHTML = html || '<tr><td colspan="6">No transactions found</td></tr>';
        } catch (err) {
          console.error('Error fetching all transactions:', err);
        }
      }
      
      // Fetch pending transactions
      async function fetchPendingTransactions() {
        try {
          const response = await fetch('/api/pending-transactions');
          const transactions = await response.json();
          
          const html = transactions.map(tx => {
            return \`
              <tr>
                <td>\${getTypeBadge(tx.type)}</td>
                <td>\${tx.fromAddress}</td>
                <td>\${tx.toAddress}</td>
                <td>\${tx.amount} tokens</td>
                <td>\${formatDate(tx.timestamp)}</td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('pending-table').innerHTML = html || '<tr><td colspan="5">No pending transactions</td></tr>';
        } catch (err) {
          console.error('Error fetching pending transactions:', err);
        }
      }
      
      // Fetch founder withdrawals
      async function fetchFounderWithdrawals() {
        try {
          const response = await fetch('/api/blockchain');
          const blocks = await response.json();
          
          // Collect all founder withdrawal transactions
          const withdrawals = [];
          
          blocks.forEach(block => {
            block.transactions.forEach(tx => {
              if (tx.type === 'founder_withdrawal') {
                withdrawals.push({
                  ...tx,
                  blockIndex: block.index
                });
              }
            });
          });
          
          // Also check pending transactions
          const pendingResponse = await fetch('/api/pending-transactions');
          const pendingTxs = await pendingResponse.json();
          
          pendingTxs.forEach(tx => {
            if (tx.type === 'founder_withdrawal') {
              withdrawals.push({
                ...tx,
                blockIndex: 'Pending'
              });
            }
          });
          
          // Sort by timestamp (newest first)
          withdrawals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          const html = withdrawals.map(tx => {
            const withdrawalType = tx.metadata && tx.metadata.withdrawalType ? tx.metadata.withdrawalType : 'personal';
            
            return \`
              <tr>
                <td>\${tx.toAddress}</td>
                <td>\${tx.amount} tokens</td>
                <td>\${withdrawalType}</td>
                <td>\${formatDate(tx.timestamp)}</td>
                <td>\${tx.blockIndex}</td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('founders-table').innerHTML = html || '<tr><td colspan="5">No founder withdrawals yet</td></tr>';
        } catch (err) {
          console.error('Error fetching founder withdrawals:', err);
        }
      }
      
      // Mine pending transactions
      document.getElementById('mine-btn').addEventListener('click', async () => {
        try {
          const response = await fetch('/api/mine', { method: 'POST' });
          
          if (response.ok) {
            const result = await response.json();
            alert(\`Successfully mined block #\${result.index} with \${result.transactions.length} transactions\`);
            
            // Refresh data
            fetchStats();
            fetchLatestBlocks();
            fetchAllBlocks();
            fetchAllTransactions();
            fetchPendingTransactions();
            fetchFounderWithdrawals();
          } else {
            const error = await response.json();
            alert(\`Error: \${error.error}\`);
          }
        } catch (err) {
          console.error('Error mining block:', err);
          alert('Error mining block. See console for details.');
        }
      });
      
      // Initial data loading
      fetchStats();
      fetchLatestBlocks();
      fetchAllBlocks();
      fetchAllTransactions();
      fetchPendingTransactions();
      fetchFounderWithdrawals();
      
      // Refresh data periodically
      setInterval(fetchStats, 30000); // Every 30 seconds
      setInterval(fetchPendingTransactions, 10000); // Every 10 seconds
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Initialize blockchain and start server
async function initializeAndStart() {
  try {
    await azoraChain.initialize();
    app.listen(PORT, () => {
      console.log(`Azora blockchain service running on port ${PORT}`);
      console.log(`Blockchain explorer: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize blockchain:', err);
  }
}

initializeAndStart();

module.exports = {
  app,
  azoraChain,
  Block,
  Transaction,
  Blockchain
};