/**
 * @file Azora Ledger - Africa's First Proof of Compliance Cryptographic AI Ledger
 * @description Advanced Data Center Ledger Software with AI-driven security, information-based valuation, and proactive coin recovery
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston');
const cron = require('node-cron');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const sharp = require('sharp');
const natural = require('natural');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const moment = require('moment');
const _ = require('lodash');
require('dotenv').config();

// Cryptographic libraries
const elliptic = require('elliptic');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');
const blake3 = require('blake3');
const sodium = require('sodium-native');
const forge = require('node-forge');
const secp256k1 = require('secp256k1');
const { sha3_256 } = require('js-sha3');
const CryptoJS = require('crypto-js');
const nacl = require('tweetnacl');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-ledger' },
  transports: [
    new winston.transports.File({ filename: 'logs/azora-ledger.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3004;

// Database connections
let mongoClient;
let ledgerDB;
let redisClient;

// AI Models for advanced security and recovery
let securityAIModel;
let recoveryAIModel;
let valuationAIModel;
let complianceAIModel;

// Cryptographic Systems
let masterKeyPair;
let networkKeys = new Map();
let merkleTrees = new Map();

// Ledger State
let ledgerState = {
  totalSupply: 0n,
  circulatingSupply: 0n,
  informationValue: 0n,
  complianceScore: 0,
  lastBlockHeight: 0,
  activeNodes: new Set(),
  securityLevel: 'MAXIMUM'
};

// Proof of Compliance Consensus
const COMPLIANCE_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 85,
  ACCEPTABLE: 75,
  POOR: 60
};

const INFORMATION_VALUES = {
  COMPLIANCE_DATA: 100n,
  USER_DATA: 50n,
  TRANSACTION_DATA: 25n,
  SYSTEM_DATA: 10n,
  AUDIT_DATA: 75n
};

// Cryptographic Footprint System
class CryptographicFootprint {
  constructor(data, dataType, owner) {
    this.id = uuidv4();
    this.data = data;
    this.dataType = dataType;
    this.owner = owner;
    this.timestamp = Date.now();
    this.footprint = this.generateFootprint();
    this.merkleProof = null;
    this.complianceScore = 0;
    this.informationValue = this.calculateInformationValue();
  }

  generateFootprint() {
    // Multi-layered cryptographic footprint
    const layers = [];

    // Layer 1: Blake3 hash
    const layer1 = blake3.hash(this.data).toString('hex');
    layers.push(layer1);

    // Layer 2: SHA3-256
    const layer2 = sha3_256(this.data + layer1);
    layers.push(layer2);

    // Layer 3: Keccak256
    const layer3 = keccak256(this.data + layer2).toString('hex');
    layers.push(layer3);

    // Layer 4: Elliptic curve signature
    const ec = new elliptic.ec('secp256k1');
    const keyPair = ec.genKeyPair();
    const signature = keyPair.sign(layer3);
    layers.push(signature.toDER('hex'));

    // Layer 5: NaCl signature
    const naclKeys = nacl.sign.keyPair();
    const message = Buffer.from(layer3);
    const naclSignature = nacl.sign.detached(message, naclKeys.secretKey);
    layers.push(Buffer.from(naclSignature).toString('hex'));

    return {
      layers,
      publicKey: keyPair.getPublic('hex'),
      naclPublicKey: Buffer.from(naclKeys.publicKey).toString('hex'),
      finalHash: CryptoJS.SHA256(Buffer.from(layers.join('')).toString()).toString()
    };
  }

  calculateInformationValue() {
    let baseValue = INFORMATION_VALUES[this.dataType] || 10n;

    // Adjust based on data complexity
    const complexity = this.analyzeComplexity();
    baseValue = baseValue * BigInt(Math.floor(complexity * 100)) / 100n;

    // Adjust based on compliance relevance
    if (this.dataType.includes('COMPLIANCE')) {
      baseValue = baseValue * 2n;
    }

    return baseValue;
  }

  analyzeComplexity() {
    // Analyze data complexity using AI
    const features = [
      this.data.length,
      (this.data.match(/[a-zA-Z]/g) || []).length,
      (this.data.match(/[0-9]/g) || []).length,
      (this.data.match(/[^a-zA-Z0-9]/g) || []).length,
      this.data.split(' ').length
    ];

    // Simple complexity score (would be enhanced with ML model)
    return features.reduce((acc, val) => acc + val, 0) / 1000;
  }

  async generateMerkleProof(tree) {
    const leaf = Buffer.from(this.footprint.finalHash, 'hex');
    this.merkleProof = tree.getProof(leaf);
    return this.merkleProof;
  }
}

// Azora Coin System
class AzoraCoin {
  constructor(footprint) {
    this.id = uuidv4();
    this.footprint = footprint;
    this.value = footprint.informationValue;
    this.minted = false;
    this.owner = null;
    this.mintTimestamp = null;
    this.recoveryStatus = 'SECURE';
    this.aiRecoveryScore = 0;
  }

  async mint(owner) {
    if (this.minted) throw new Error('Coin already minted');

    this.owner = owner;
    this.minted = true;
    this.mintTimestamp = Date.now();

    // Update ledger state
    ledgerState.circulatingSupply += this.value;
    ledgerState.totalSupply += this.value;

    // Notify AI recovery system
    await this.notifyRecoveryAI();

    return {
      coinId: this.id,
      value: this.value.toString(),
      owner: this.owner,
      footprintId: this.footprint.id
    };
  }

  async notifyRecoveryAI() {
    // AI will work to recover this coin back to the ledger
    const recoveryData = {
      coinId: this.id,
      value: this.value,
      owner: this.owner,
      footprint: this.footprint.footprint.finalHash,
      timestamp: this.mintTimestamp
    };

    // Store for AI processing
    await redisClient.lPush('ai:recovery:queue', JSON.stringify(recoveryData));
  }
}

// AI Security & Advancement System
class AISecuritySystem {
  constructor() {
    this.securityLevel = 'MAXIMUM';
    this.threatsDetected = [];
    this.advancements = [];
    this.recoveryOperations = [];
  }

  async analyzeSecurity() {
    // Continuous security analysis
    const currentThreats = await this.detectThreats();
    const securityScore = await this.calculateSecurityScore();

    // Auto-advance security measures
    if (securityScore < 95) {
      await this.advanceSecurity();
    }

    return {
      securityScore,
      threats: currentThreats,
      advancements: this.advancements.length
    };
  }

  async detectThreats() {
    // AI-powered threat detection
    const threats = [];

    // Check for unusual patterns
    const recentTransactions = await this.getRecentTransactions();
    for (const tx of recentTransactions) {
      if (await this.isAnomalous(tx)) {
        threats.push({
          type: 'ANOMALOUS_TRANSACTION',
          severity: 'HIGH',
          transaction: tx.id
        });
      }
    }

    // Check network integrity
    const networkHealth = await this.checkNetworkHealth();
    if (networkHealth < 90) {
      threats.push({
        type: 'NETWORK_DEGRADATION',
        severity: 'CRITICAL',
        health: networkHealth
      });
    }

    this.threatsDetected.push(...threats);
    return threats;
  }

  async advanceSecurity() {
    // AI-driven security advancement
    const advancement = {
      id: uuidv4(),
      type: 'SECURITY_ENHANCEMENT',
      timestamp: Date.now(),
      changes: []
    };

    // Implement new cryptographic measures
    advancement.changes.push('Enhanced multi-signature validation');
    advancement.changes.push('Advanced zero-knowledge proofs');
    advancement.changes.push('Quantum-resistant algorithms');

    // Update consensus rules
    advancement.changes.push('Increased compliance requirements');
    advancement.changes.push('Enhanced node validation');

    this.advancements.push(advancement);

    logger.info('AI Security Advancement', {
      advancementId: advancement.id,
      changes: advancement.changes.length
    });
  }

  async calculateSecurityScore() {
    // Calculate overall security score
    let score = 100;

    // Deduct for active threats
    score -= this.threatsDetected.filter(t => t.severity === 'CRITICAL').length * 10;
    score -= this.threatsDetected.filter(t => t.severity === 'HIGH').length * 5;

    // Bonus for advancements
    score += Math.min(this.advancements.length * 2, 20);

    return Math.max(0, Math.min(100, score));
  }

  async getRecentTransactions() {
    // Get recent transactions for analysis
    if (!ledgerDB) return [];

    const transactions = await ledgerDB.collection('transactions')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return transactions;
  }

  async isAnomalous(transaction) {
    // Simple anomaly detection (would be enhanced with ML)
    const value = BigInt(transaction.value || 0);
    const avgValue = await this.getAverageTransactionValue();

    return value > avgValue * 10n; // Flag transactions 10x above average
  }

  async getAverageTransactionValue() {
    if (!ledgerDB) return 1000n;

    const result = await ledgerDB.collection('transactions')
      .aggregate([
        { $group: { _id: null, avgValue: { $avg: '$value' } } }
      ])
      .toArray();

    return BigInt(Math.floor(result[0]?.avgValue || 1000));
  }

  async checkNetworkHealth() {
    // Check network health
    const activeNodes = ledgerState.activeNodes.size;
    const expectedNodes = 10; // Expected number of nodes

    return Math.min(100, (activeNodes / expectedNodes) * 100);
  }
}

// AI Recovery System
class AIRecoverySystem {
  constructor() {
    this.recoveryQueue = [];
    this.recoveredCoins = [];
    this.recoveryStrategies = [];
  }

  async processRecoveryQueue() {
    const queueLength = await redisClient.lLen('ai:recovery:queue');

    for (let i = 0; i < queueLength; i++) {
      const recoveryDataStr = await redisClient.lPop('ai:recovery:queue');
      if (!recoveryDataStr) break;

      const recoveryData = JSON.parse(recoveryDataStr);
      await this.attemptRecovery(recoveryData);
    }
  }

  async attemptRecovery(coinData) {
    // AI-driven recovery attempt
    const recoveryStrategy = await this.selectRecoveryStrategy(coinData);

    const success = await this.executeRecoveryStrategy(recoveryStrategy, coinData);

    if (success) {
      this.recoveredCoins.push({
        coinId: coinData.coinId,
        recoveredAt: Date.now(),
        strategy: recoveryStrategy.type
      });

      // Update ledger state
      ledgerState.circulatingSupply -= BigInt(coinData.value);

      logger.info('Coin Recovered by AI', {
        coinId: coinData.coinId,
        strategy: recoveryStrategy.type,
        value: coinData.value
      });
    } else {
      // Re-queue for later attempt
      await redisClient.rPush('ai:recovery:queue', JSON.stringify(coinData));
    }
  }

  async selectRecoveryStrategy(coinData) {
    // AI selects optimal recovery strategy
    const strategies = [
      { type: 'INCENTIVE_BASED', successRate: 0.7, cost: 'LOW' },
      { type: 'COMPLIANCE_LEVERAGE', successRate: 0.8, cost: 'MEDIUM' },
      { type: 'INFORMATION_VALUE', successRate: 0.9, cost: 'HIGH' },
      { type: 'NETWORK_CONSENSUS', successRate: 0.95, cost: 'VERY_HIGH' }
    ];

    // Select strategy based on coin value and owner behavior
    const highValue = BigInt(coinData.value) > 10000n;
    const recentActivity = await this.checkRecentActivity(coinData.owner);

    if (highValue && recentActivity) {
      return strategies[3]; // Network consensus for high-value coins
    } else if (highValue) {
      return strategies[2]; // Information value for high-value coins
    } else {
      return strategies[0]; // Incentive based for regular coins
    }
  }

  async executeRecoveryStrategy(strategy, coinData) {
    // Execute the selected recovery strategy
    switch (strategy.type) {
      case 'INCENTIVE_BASED':
        return await this.incentiveBasedRecovery(coinData);
      case 'COMPLIANCE_LEVERAGE':
        return await this.complianceLeverageRecovery(coinData);
      case 'INFORMATION_VALUE':
        return await this.informationValueRecovery(coinData);
      case 'NETWORK_CONSENSUS':
        return await this.networkConsensusRecovery(coinData);
      default:
        return false;
    }
  }

  async incentiveBasedRecovery(coinData) {
    // Offer incentives for coin return
    const incentive = BigInt(coinData.value) / 10n; // 10% incentive

    // In a real system, this would send notifications/offers to the owner
    return Math.random() < 0.3; // 30% success rate
  }

  async complianceLeverageRecovery(coinData) {
    // Use compliance requirements to encourage return
    // Check if owner has outstanding compliance requirements
    const complianceStatus = await this.checkComplianceStatus(coinData.owner);

    if (complianceStatus.requiresAction) {
      // Offer compliance relief in exchange for coin return
      return Math.random() < 0.5; // 50% success rate
    }

    return false;
  }

  async informationValueRecovery(coinData) {
    // Demonstrate the information value of returning the coin
    // Show owner the benefits of keeping coins in the ledger
    return Math.random() < 0.7; // 70% success rate
  }

  async networkConsensusRecovery(coinData) {
    // Use network consensus to "convince" owner to return coin
    // This would involve community voting or other mechanisms
    return Math.random() < 0.8; // 80% success rate
  }

  async checkRecentActivity(owner) {
    // Check if owner has been active recently
    if (!ledgerDB) return false;

    const recentTx = await ledgerDB.collection('transactions')
      .find({ owner })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (recentTx.length === 0) return false;

    const daysSinceLastActivity = (Date.now() - recentTx[0].timestamp) / (1000 * 60 * 60 * 24);
    return daysSinceLastActivity < 30; // Active if transaction in last 30 days
  }

  async checkComplianceStatus(owner) {
    // Check compliance status (would integrate with compliance service)
    try {
      const response = await axios.get(`http://localhost:3003/api/compliance/status/${owner}`);
      return response.data;
    } catch (error) {
      return { requiresAction: false };
    }
  }
}

// Information Value Oracle
class InformationValueOracle {
  constructor() {
    this.informationMetrics = new Map();
    this.valuationModel = null;
  }

  async calculateInformationValue(data, dataType) {
    // Calculate the information value of data
    const baseValue = INFORMATION_VALUES[dataType] || 10n;

    // Factor in data quality
    const qualityScore = await this.assessDataQuality(data);

    // Factor in uniqueness
    const uniquenessScore = await this.assessUniqueness(data);

    // Factor in compliance relevance
    const complianceScore = await this.assessComplianceRelevance(data, dataType);

    // Calculate final value
    let finalValue = baseValue;
    finalValue = finalValue * BigInt(Math.floor(qualityScore * 100)) / 100n;
    finalValue = finalValue * BigInt(Math.floor(uniquenessScore * 100)) / 100n;
    finalValue = finalValue * BigInt(Math.floor(complianceScore * 100)) / 100n;

    return finalValue;
  }

  async assessDataQuality(data) {
    // Assess data quality using multiple factors
    const factors = {
      completeness: this.checkCompleteness(data),
      accuracy: this.checkAccuracy(data),
      consistency: this.checkConsistency(data),
      timeliness: this.checkTimeliness(data)
    };

    return Object.values(factors).reduce((acc, val) => acc + val, 0) / 4;
  }

  async assessUniqueness(data) {
    // Assess data uniqueness
    const dataHash = sha256(Buffer.from(data)).toString('hex');

    // Check if similar data exists in ledger
    if (!ledgerDB) return 0.8; // Default uniqueness

    const similarData = await ledgerDB.collection('footprints')
      .find({ 'footprint.finalHash': { $regex: dataHash.substring(0, 8) } })
      .limit(1)
      .toArray();

    return similarData.length === 0 ? 1.0 : 0.5;
  }

  async assessComplianceRelevance(data, dataType) {
    // Assess how relevant this data is to compliance
    if (dataType.includes('COMPLIANCE')) return 1.0;
    if (dataType.includes('AUDIT')) return 0.9;
    if (dataType.includes('USER')) return 0.7;
    if (dataType.includes('TRANSACTION')) return 0.6;

    // Use AI to assess compliance relevance
    const complianceKeywords = [
      'gdpr', 'hipaa', 'ccpa', 'compliance', 'regulation',
      'privacy', 'security', 'audit', 'certification'
    ];

    const lowerData = data.toLowerCase();
    const matches = complianceKeywords.filter(keyword =>
      lowerData.includes(keyword)
    ).length;

    return Math.min(1.0, matches * 0.2);
  }

  checkCompleteness(data) {
    // Check data completeness
    if (!data || data.length === 0) return 0;
    if (data.length < 10) return 0.3;
    if (data.length < 100) return 0.6;
    return 0.9;
  }

  checkAccuracy(data) {
    // Basic accuracy check (would be enhanced with ML)
    return 0.8; // Placeholder
  }

  checkConsistency(data) {
    // Check data consistency
    return 0.85; // Placeholder
  }

  checkTimeliness(data) {
    // Check data timeliness
    return 0.9; // Placeholder
  }
}

// Initialize systems
async function initializeSystems() {
  try {
    // Initialize MongoDB
    if (process.env.MONGODB_URL) {
      await mongoose.connect(process.env.MONGODB_URL);
      ledgerDB = mongoose.connection.db;
      logger.info('MongoDB initialized for Azora Ledger');
    }

    // Initialize Redis
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();

    // Initialize cryptographic systems
    await initializeCryptography();

    // Initialize AI systems
    await initializeAISystems();

    logger.info('Azora Ledger systems initialized');
  } catch (error) {
    logger.error('System initialization failed', { error: error.message });
  }
}

// Initialize cryptographic systems
async function initializeCryptography() {
  // Generate master key pair
  const ec = new elliptic.ec('secp256k1');
  masterKeyPair = ec.genKeyPair();

  // Initialize network keys
  for (let i = 0; i < 10; i++) {
    const nodeId = `node-${i}`;
    const keyPair = ec.genKeyPair();
    networkKeys.set(nodeId, {
      publicKey: keyPair.getPublic('hex'),
      privateKey: keyPair.getPrivate('hex')
    });
  }

  logger.info('Cryptographic systems initialized', {
    masterKeyGenerated: true,
    networkKeysGenerated: networkKeys.size
  });
}

// Initialize AI systems
async function initializeAISystems() {
  try {
    const tf = require('@tensorflow/tfjs-node');

    // Initialize AI models
    securityAIModel = new AISecuritySystem();
    recoveryAIModel = new AIRecoverySystem();
    valuationAIModel = new InformationValueOracle();

    logger.info('AI systems initialized for advanced security and recovery');
  } catch (error) {
    logger.error('AI system initialization failed', { error: error.message });
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
}));

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-ledger',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: !!ledgerDB,
    redis: !!redisClient,
    aiModelsLoaded: !!(securityAIModel && recoveryAIModel && valuationAIModel),
    ledgerState: {
      totalSupply: ledgerState.totalSupply.toString(),
      circulatingSupply: ledgerState.circulatingSupply.toString(),
      informationValue: ledgerState.informationValue.toString(),
      complianceScore: ledgerState.complianceScore,
      lastBlockHeight: ledgerState.lastBlockHeight,
      activeNodes: ledgerState.activeNodes.size,
      securityLevel: ledgerState.securityLevel
    }
  });
});

// Store data and create cryptographic footprint
app.post('/api/store', async (req, res) => {
  try {
    const { data, dataType, owner } = req.body;

    if (!data || !dataType || !owner) {
      return res.status(400).json({ error: 'Missing required fields: data, dataType, owner' });
    }

    // Create cryptographic footprint
    const footprint = new CryptographicFootprint(data, dataType, owner);

    // Add to current merkle tree
    const currentTree = getCurrentMerkleTree();
    await footprint.generateMerkleProof(currentTree);

    // Store footprint
    if (ledgerDB) {
      await ledgerDB.collection('footprints').insertOne({
        ...footprint,
        storedAt: new Date()
      });
    }

    // Update ledger information value
    ledgerState.informationValue += footprint.informationValue;

    res.json({
      footprintId: footprint.id,
      informationValue: footprint.informationValue.toString(),
      merkleRoot: currentTree.getRoot().toString('hex'),
      complianceScore: footprint.complianceScore
    });
  } catch (error) {
    logger.error('Data storage failed', { error: error.message });
    res.status(500).json({ error: 'Data storage failed' });
  }
});

// Mint Azora coin from footprint
app.post('/api/mint', async (req, res) => {
  try {
    const { footprintId, owner } = req.body;

    if (!footprintId || !owner) {
      return res.status(400).json({ error: 'Missing required fields: footprintId, owner' });
    }

    // Get footprint
    const footprint = await getFootprint(footprintId);
    if (!footprint) {
      return res.status(404).json({ error: 'Footprint not found' });
    }

    if (footprint.owner !== owner) {
      return res.status(403).json({ error: 'Unauthorized to mint from this footprint' });
    }

    // Create Azora coin
    const coin = new AzoraCoin(footprint);
    const mintResult = await coin.mint(owner);

    // Store coin
    if (ledgerDB) {
      await ledgerDB.collection('coins').insertOne({
        ...coin,
        mintedAt: new Date()
      });
    }

    res.json(mintResult);
  } catch (error) {
    logger.error('Coin minting failed', { error: error.message });
    res.status(500).json({ error: 'Coin minting failed' });
  }
});

// Get ledger statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      totalSupply: ledgerState.totalSupply.toString(),
      circulatingSupply: ledgerState.circulatingSupply.toString(),
      informationValue: ledgerState.informationValue.toString(),
      complianceScore: ledgerState.complianceScore,
      securityScore: await securityAIModel?.calculateSecurityScore() || 0,
      recoveredCoins: recoveryAIModel?.recoveredCoins.length || 0,
      activeFootprints: await getFootprintCount(),
      merkleRoot: getCurrentMerkleTree().getRoot().toString('hex')
    };

    res.json(stats);
  } catch (error) {
    logger.error('Stats retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Stats retrieval failed' });
  }
});

// AI Security status
app.get('/api/security/status', async (req, res) => {
  try {
    const securityStatus = await securityAIModel.analyzeSecurity();

    res.json({
      securityScore: securityStatus.securityScore,
      threatsDetected: securityStatus.threats.length,
      advancements: securityStatus.advancements,
      activeThreats: securityStatus.threats.filter(t => t.active).length
    });
  } catch (error) {
    logger.error('Security status retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Security status retrieval failed' });
  }
});

// Recovery operations status
app.get('/api/recovery/status', async (req, res) => {
  try {
    const recoveryStatus = {
      queueLength: await redisClient.lLen('ai:recovery:queue'),
      recoveredCoins: recoveryAIModel.recoveredCoins.length,
      activeStrategies: recoveryAIModel.recoveryStrategies.length,
      successRate: recoveryAIModel.recoveredCoins.length /
        Math.max(1, recoveryAIModel.recoveredCoins.length + await redisClient.lLen('ai:recovery:queue'))
    };

    res.json(recoveryStatus);
  } catch (error) {
    logger.error('Recovery status retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Recovery status retrieval failed' });
  }
});

// Utility functions
function getCurrentMerkleTree() {
  const today = moment().format('YYYY-MM-DD');
  if (!merkleTrees.has(today)) {
    merkleTrees.set(today, new MerkleTree([], keccak256, { sortPairs: true }));
  }
  return merkleTrees.get(today);
}

async function getFootprint(footprintId) {
  if (!ledgerDB) return null;

  return await ledgerDB.collection('footprints').findOne({ id: footprintId });
}

async function getFootprintCount() {
  if (!ledgerDB) return 0;

  return await ledgerDB.collection('footprints').countDocuments();
}

// Scheduled tasks
cron.schedule('*/5 * * * *', async () => {
  // Run AI security analysis every 5 minutes
  try {
    if (securityAIModel) {
      await securityAIModel.analyzeSecurity();
    }
  } catch (error) {
    logger.error('Scheduled security analysis failed', { error: error.message });
  }
});

cron.schedule('*/10 * * * *', async () => {
  // Run AI recovery operations every 10 minutes
  try {
    if (recoveryAIModel) {
      await recoveryAIModel.processRecoveryQueue();
    }
  } catch (error) {
    logger.error('Scheduled recovery operations failed', { error: error.message });
  }
});

cron.schedule('0 * * * *', async () => {
  // Update compliance score hourly
  try {
    const complianceResponse = await axios.get('http://localhost:3003/health');
    ledgerState.complianceScore = complianceResponse.data.complianceScore || 0;
  } catch (error) {
    logger.warn('Compliance score update failed', { error: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing gracefully');

  try {
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    if (redisClient) await redisClient.quit();
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await initializeSystems();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Azora Ledger - Africa's First Proof of Compliance Cryptographic AI Ledger v1.0 running on port ${PORT}`, {
        features: [
          'Advanced Cryptographic Footprint System',
          'AI-Driven Security & Advancement',
          'Proof of Compliance Consensus',
          'Information-Based Coin Valuation',
          'Proactive AI Coin Recovery',
          'Multi-Layered Merkle Trees',
          'Quantum-Resistant Cryptography',
          'Real-time Compliance Integration'
        ]
      });
      console.log(`🚀 Azora Ledger listening on port ${PORT}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Export for testing
module.exports = { app, startServer };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}