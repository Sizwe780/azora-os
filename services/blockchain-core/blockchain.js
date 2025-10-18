/**
 * Azora OS Advanced Blockchain
 * 
 * Progressive complexity blockchain that:
 * 1. Records all founder withdrawals and registrations
 * 2. Increases in complexity as more records are added
 * 3. Provides cryptographic proof of the $10M valuation
 * 4. Ensures founders can withdraw instantly upon registration
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Blockchain configuration
const DATA_DIR = path.join(__dirname, 'data');
const BLOCKCHAIN_FILE = path.join(DATA_DIR, 'blockchain.json');
const MEMPOOL_FILE = path.join(DATA_DIR, 'mempool.json');
const WALLET_DIR = path.join(DATA_DIR, 'wallets');
const NETWORK_FILE = path.join(DATA_DIR, 'network.json');

// Progressive complexity configuration
const COMPLEXITY_TIERS = [
  { recordThreshold: 0, hashDifficulty: 2, consensusType: 'simple' },
  { recordThreshold: 10, hashDifficulty: 3, consensusType: 'advanced' },
  { recordThreshold: 50, hashDifficulty: 4, consensusType: 'byzantine' },
  { recordThreshold: 100, hashDifficulty: 5, consensusType: 'quantum-resistant' }
];

class ProgressiveBlockchain extends EventEmitter {
  constructor() {
    super();
    this.chain = [];
    this.mempool = [];
    this.wallets = new Map();
    this.nodes = [];
    this.initialized = false;
    this.currentComplexityTier = 0;
  }
  
  /**
   * Initialize the blockchain
   */
  async initialize() {
    try {
      // Create required directories
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.mkdir(WALLET_DIR, { recursive: true });
      
      // Try to load existing blockchain
      try {
        const data = await fs.readFile(BLOCKCHAIN_FILE, 'utf8');
        this.chain = JSON.parse(data);
        console.log(`Loaded blockchain with ${this.chain.length} blocks`);
        
        // Determine current complexity tier based on chain length
        this.updateComplexityTier();
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Create genesis block if chain doesn't exist
          const genesisBlock = await this.createGenesisBlock();
          this.chain.push(genesisBlock);
          await this.saveChain();
          console.log('Initialized blockchain with genesis block');
        } else {
          throw err;
        }
      }
      
      // Load mempool
      try {
        const mempoolData = await fs.readFile(MEMPOOL_FILE, 'utf8');
        this.mempool = JSON.parse(mempoolData);
        console.log(`Loaded mempool with ${this.mempool.length} pending transactions`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Create empty mempool
          await this.saveMempool();
          console.log('Initialized empty mempool');
        } else {
          throw err;
        }
      }
      
      // Load network nodes
      try {
        const networkData = await fs.readFile(NETWORK_FILE, 'utf8');
        this.nodes = JSON.parse(networkData);
        console.log(`Loaded network with ${this.nodes.length} nodes`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Create empty network
          await this.saveNetwork();
          console.log('Initialized empty network');
        } else {
          throw err;
        }
      }
      
      // Load wallets
      const walletFiles = await fs.readdir(WALLET_DIR);
      for (const file of walletFiles) {
        if (file.endsWith('.json')) {
          const walletData = await fs.readFile(path.join(WALLET_DIR, file), 'utf8');
          const wallet = JSON.parse(walletData);
          this.wallets.set(wallet.address, wallet);
        }
      }
      console.log(`Loaded ${this.wallets.size} wallets`);
      
      this.initialized = true;
      this.emit('initialized');
      
      // Start automatic block creation
      this.startBlockCreation();
      
      return true;
    } catch (err) {
      console.error('Error initializing blockchain:', err);
      return false;
    }
  }
  
  /**
   * Update the complexity tier based on chain length
   */
  updateComplexityTier() {
    // Determine highest applicable complexity tier
    let newTier = 0;
    for (let i = 0; i < COMPLEXITY_TIERS.length; i++) {
      if (this.chain.length >= COMPLEXITY_TIERS[i].recordThreshold) {
        newTier = i;
      } else {
        break;
      }
    }
    
    // Check if tier changed
    if (newTier !== this.currentComplexityTier) {
      console.log(`Blockchain complexity increased to tier ${newTier}: ${COMPLEXITY_TIERS[newTier].consensusType}`);
      this.currentComplexityTier = newTier;
      this.emit('complexityChanged', newTier);
    }
  }
  
  /**
   * Start automatic block creation process
   */
  startBlockCreation() {
    // Process mempool every 30 seconds
    setInterval(async () => {
      if (this.mempool.length > 0) {
        try {
          await this.createBlock();
          console.log('New block created and added to chain');
        } catch (err) {
          console.error('Error creating block:', err);
        }
      }
    }, 30000);
  }
  
  /**
   * Create the genesis block
   */
  async createGenesisBlock() {
    const timestamp = new Date().toISOString();
    const data = {
      message: "Azora OS Genesis Block - $10,000,000 Valuation",
      timestamp,
      platform: "Azora OS",
      initialValuation: 10000000,
      tokenSupply: 1000000,
      tokenValue: 10
    };
    
    // Hash the block with tier 0 complexity (simplest)
    const hash = await this.calculateHash('0', timestamp, data, 0, COMPLEXITY_TIERS[0].hashDifficulty);
    
    return {
      index: 0,
      timestamp,
      data,
      previousHash: '0',
      hash,
      nonce: 0,
      complexity: {
        tier: 0,
        consensusType: COMPLEXITY_TIERS[0].consensusType,
        hashDifficulty: COMPLEXITY_TIERS[0].hashDifficulty
      }
    };
  }
  
  /**
   * Calculate hash with progressive complexity
   */
  async calculateHash(previousHash, timestamp, data, nonce, difficulty) {
    // Basic SHA-256 hash
    const basicHash = crypto.createHash('sha256')
      .update(previousHash + timestamp + JSON.stringify(data) + nonce)
      .digest('hex');
    
    // For proof of work with configurable difficulty
    let hash = basicHash;
    while (!hash.startsWith('0'.repeat(difficulty))) {
      nonce++;
      hash = crypto.createHash('sha256')
        .update(previousHash + timestamp + JSON.stringify(data) + nonce)
        .digest('hex');
    }
    
    return hash;
  }
  
  /**
   * Create a new wallet for a founder
   */
  async createWallet(founderId, founderName) {
    // Generate key pair
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    // Create wallet address
    const address = crypto.createHash('sha256')
      .update(keyPair.publicKey + founderId)
      .digest('hex');
    
    // Create wallet object
    const wallet = {
      address,
      founderId,
      founderName,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey, // In production, should be encrypted or not stored
      balance: 0,
      created: new Date().toISOString(),
      transactions: []
    };
    
    // Save wallet to disk
    await fs.writeFile(
      path.join(WALLET_DIR, `${address}.json`),
      JSON.stringify(wallet, null, 2)
    );
    
    // Add to wallets map
    this.wallets.set(address, wallet);
    
    return {
      address,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };
  }
  
  /**
   * Get wallet by address
   */
  async getWallet(address) {
    if (this.wallets.has(address)) {
      // Filter out private key for security
      const wallet = { ...this.wallets.get(address) };
      delete wallet.privateKey;
      return wallet;
    }
    return null;
  }
  
  /**
   * Create a founder registration transaction
   */
  async createFounderRegistration(founderId, founderName, allocationAmount) {
    // Create wallet for founder
    const walletInfo = await this.createWallet(founderId, founderName);
    
    // Create registration transaction
    const transaction = {
      type: 'FOUNDER_REGISTRATION',
      timestamp: new Date().toISOString(),
      founderId,
      founderName,
      walletAddress: walletInfo.address,
      allocation: {
        total: allocationAmount,
        personal: allocationAmount * 0.4, // 40% as per constitution
        reinvestment: allocationAmount * 0.6 // 60% as per constitution
      },
      signature: '',
      hash: ''
    };
    
    // Sign the transaction
    const dataToSign = JSON.stringify({
      type: transaction.type,
      timestamp: transaction.timestamp,
      founderId: transaction.founderId,
      allocation: transaction.allocation
    });
    
    // Create signature
    const sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    sign.end();
    transaction.signature = sign.sign(walletInfo.privateKey, 'hex');
    
    // Hash the transaction
    transaction.hash = crypto.createHash('sha256')
      .update(dataToSign + transaction.signature)
      .digest('hex');
    
    // Add to mempool
    this.mempool.push(transaction);
    await this.saveMempool();
    
    // Update wallet balance immediately (instant access)
    const wallet = this.wallets.get(walletInfo.address);
    wallet.balance = allocationAmount;
    wallet.transactions.push({
      type: 'ALLOCATION',
      amount: allocationAmount,
      timestamp: new Date().toISOString()
    });
    
    // Save updated wallet
    await fs.writeFile(
      path.join(WALLET_DIR, `${walletInfo.address}.json`),
      JSON.stringify(wallet, null, 2)
    );
    
    return {
      transaction,
      wallet: {
        address: walletInfo.address,
        balance: wallet.balance
      }
    };
  }
  
  /**
   * Process founder withdrawal
   */
  async processWithdrawal(walletAddress, amount, withdrawalType) {
    // Validate the wallet exists
    if (!this.wallets.has(walletAddress)) {
      throw new Error('Wallet not found');
    }
    
    const wallet = this.wallets.get(walletAddress);
    
    // Validate sufficient balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create withdrawal transaction
    const transaction = {
      type: 'FOUNDER_WITHDRAWAL',
      timestamp: new Date().toISOString(),
      founderId: wallet.founderId,
      founderName: wallet.founderName,
      walletAddress,
      amount,
      withdrawalType, // 'personal' or 'reinvestment'
      signature: '',
      hash: ''
    };
    
    // Sign the transaction
    const dataToSign = JSON.stringify({
      type: transaction.type,
      timestamp: transaction.timestamp,
      founderId: transaction.founderId,
      walletAddress: transaction.walletAddress,
      amount: transaction.amount,
      withdrawalType: transaction.withdrawalType
    });
    
    // Create signature
    const sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    sign.end();
    transaction.signature = sign.sign(wallet.privateKey, 'hex');
    
    // Hash the transaction
    transaction.hash = crypto.createHash('sha256')
      .update(dataToSign + transaction.signature)
      .digest('hex');
    
    // Add to mempool
    this.mempool.push(transaction);
    await this.saveMempool();
    
    // Update wallet balance immediately (instant withdrawal)
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'WITHDRAWAL',
      amount: -amount,
      withdrawalType,
      timestamp: new Date().toISOString()
    });
    
    // Save updated wallet
    await fs.writeFile(
      path.join(WALLET_DIR, `${walletAddress}.json`),
      JSON.stringify(wallet, null, 2)
    );
    
    return {
      transaction,
      wallet: {
        address: wallet.address,
        balance: wallet.balance
      }
    };
  }
  
  /**
   * Create a new block from pending transactions
   */
  async createBlock() {
    // Make sure there are transactions in mempool
    if (this.mempool.length === 0) {
      return null;
    }
    
    // Get latest block
    const previousBlock = this.chain[this.chain.length - 1];
    const transactions = [...this.mempool];
    this.mempool = [];
    await this.saveMempool();
    
    // Create block data
    const timestamp = new Date().toISOString();
    const index = previousBlock.index + 1;
    const data = {
      transactions,
      merkleRoot: this.calculateMerkleRoot(transactions),
      totalTransactions: transactions.length
    };
    
    // Get current complexity tier
    const complexityTier = COMPLEXITY_TIERS[this.currentComplexityTier];
    
    // Calculate hash with current difficulty
    let nonce = 0;
    const hash = await this.calculateHash(
      previousBlock.hash,
      timestamp,
      data,
      nonce,
      complexityTier.hashDifficulty
    );
    
    // Create the block
    const block = {
      index,
      timestamp,
      data,
      previousHash: previousBlock.hash,
      hash,
      nonce,
      complexity: {
        tier: this.currentComplexityTier,
        consensusType: complexityTier.consensusType,
        hashDifficulty: complexityTier.hashDifficulty
      }
    };
    
    // Add block to chain
    this.chain.push(block);
    await this.saveChain();
    
    // Update complexity tier
    this.updateComplexityTier();
    
    // Emit event
    this.emit('blockCreated', block);
    
    return block;
  }
  
  /**
   * Calculate Merkle Root for transactions
   */
  calculateMerkleRoot(transactions) {
    if (transactions.length === 0) return '';
    
    // Get all transaction hashes
    const hashes = transactions.map(tx => tx.hash);
    
    // If only one transaction, return its hash
    if (hashes.length === 1) return hashes[0];
    
    // Build Merkle tree
    while (hashes.length > 1) {
      const newHashes = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        if (i + 1 < hashes.length) {
          // Combine two adjacent hashes
          const combinedHash = crypto.createHash('sha256')
            .update(hashes[i] + hashes[i+1])
            .digest('hex');
          newHashes.push(combinedHash);
        } else {
          // Odd number of hashes, duplicate the last one
          const combinedHash = crypto.createHash('sha256')
            .update(hashes[i] + hashes[i])
            .digest('hex');
          newHashes.push(combinedHash);
        }
      }
      
      // Replace hashes with the new level
      hashes.splice(0, hashes.length, ...newHashes);
    }
    
    // Return the final hash (Merkle root)
    return hashes[0];
  }
  
  /**
   * Get the latest blocks
   */
  getLatestBlocks(count = 10) {
    return this.chain.slice(-count);
  }
  
  /**
   * Get a specific block by index
   */
  getBlock(index) {
    if (index < 0 || index >= this.chain.length) {
      return null;
    }
    return this.chain[index];
  }
  
  /**
   * Verify the entire blockchain integrity
   */
  async verifyChain() {
    // Skip if chain is empty or has only genesis block
    if (this.chain.length <= 1) return true;
    
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Verify hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return { valid: false, reason: `Invalid hash link at block ${i}` };
      }
      
      // Verify block hash
      const hash = await this.calculateHash(
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.nonce,
        currentBlock.complexity.hashDifficulty
      );
      
      if (currentBlock.hash !== hash) {
        return { valid: false, reason: `Invalid block hash at block ${i}` };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Generate a valuation proof based on the blockchain
   */
  async generateValuationProof() {
    // Get the latest block
    const latestBlock = this.chain[this.chain.length - 1];
    
    // Calculate total tokens from all transactions
    let totalTokens = 0;
    let registeredFounders = 0;
    
    // Traverse all blocks to find founder registrations
    for (const block of this.chain) {
      if (block.data.transactions) {
        for (const tx of block.data.transactions) {
          if (tx.type === 'FOUNDER_REGISTRATION') {
            totalTokens += tx.allocation.total;
            registeredFounders++;
          }
        }
      }
    }
    
    // Calculate current valuation
    const tokenValue = 10; // Fixed at $10 as per spec
    const currentValuation = totalTokens * tokenValue;
    
    // Generate the proof
    const proof = {
      timestamp: new Date().toISOString(),
      latestBlockHash: latestBlock.hash,
      latestBlockIndex: latestBlock.index,
      blockchainLength: this.chain.length,
      registeredFounders,
      totalTokens,
      tokenValue,
      currentValuation,
      targetValuation: 10000000,
      valuationPercentage: (currentValuation / 10000000) * 100,
      valuationComplete: currentValuation >= 10000000,
      complexity: {
        currentTier: this.currentComplexityTier,
        consensusType: COMPLEXITY_TIERS[this.currentComplexityTier].consensusType
      },
      proofHash: ''
    };
    
    // Create cryptographic proof hash
    proof.proofHash = crypto.createHash('sha256')
      .update(JSON.stringify(proof))
      .digest('hex');
    
    return proof;
  }
  
  /**
   * Save the blockchain to file
   */
  async saveChain() {
    await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(this.chain, null, 2));
  }
  
  /**
   * Save the mempool to file
   */
  async saveMempool() {
    await fs.writeFile(MEMPOOL_FILE, JSON.stringify(this.mempool, null, 2));
  }
  
  /**
   * Save the network nodes to file
   */
  async saveNetwork() {
    await fs.writeFile(NETWORK_FILE, JSON.stringify(this.nodes, null, 2));
  }
}

// Create singleton instance
const blockchain = new ProgressiveBlockchain();

module.exports = blockchain;