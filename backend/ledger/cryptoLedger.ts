// cryptoLedger.ts
// Azora OS: Advanced Blockchain Ledger with Proof-of-Work

import crypto from 'crypto';
import fs from 'fs';

export interface LedgerEntry {
  id: string;
  timestamp: number;
  data: unknown;
  previousHash: string;
  hash: string;
  signature: string;
  publicKey: string;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
}

export interface AzoraToken {
  id: string;
  owner: string;
  amount: number;
  minted: boolean;
}

export interface Block {
  index: number;
  timestamp: number;
  entries: LedgerEntry[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
  minerReward: number;
}

export class AzoraBlockchain {
  private chain: Block[] = [];
  private pendingEntries: LedgerEntry[] = [];
  private tokens: Map<string, AzoraToken> = new Map();
  private privateKey!: string;
  private publicKey!: string;
  private ledgerPath: string;
  private difficulty: number = 4; // Starting difficulty
  private blockTime: number = 60000; // Target block time in ms (1 minute)
  private maxEntriesPerBlock: number = 10;

  constructor(ledgerPath: string = './azora-blockchain.json') {
    this.ledgerPath = ledgerPath;
    this.generateKeys();
    this.loadBlockchain();
    if (this.chain.length === 0) {
      this.createGenesisBlock();
    }
  }

  private generateKeys(): void {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  private loadBlockchain(): void {
    try {
      if (fs.existsSync(this.ledgerPath)) {
        const data = fs.readFileSync(this.ledgerPath, 'utf8');
        const parsed = JSON.parse(data);
        this.chain = parsed.chain || [];
        this.tokens = new Map(parsed.tokens || []);
        this.difficulty = parsed.difficulty || 4;
      }
    } catch (error) {
      console.error('Failed to load blockchain:', error);
    }
  }

  private saveBlockchain(): void {
    try {
      const data = {
        chain: this.chain,
        tokens: Array.from(this.tokens.entries()),
        difficulty: this.difficulty,
      };
      fs.writeFileSync(this.ledgerPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save blockchain:', error);
    }
  }

  private createGenesisBlock(): void {
    const genesisEntries: LedgerEntry[] = [{
      id: 'genesis',
      timestamp: Date.now(),
      data: { type: 'genesis', message: 'Azora Blockchain Genesis Block' },
      previousHash: '0',
      hash: '',
      signature: '',
      publicKey: this.publicKey,
      nonce: 0,
      difficulty: 1,
      merkleRoot: '',
    }];

    const merkleRoot = this.calculateMerkleRoot(genesisEntries);
    genesisEntries[0].merkleRoot = merkleRoot;
    const blockData = this.getBlockData(0, Date.now(), genesisEntries, '0', 0, 1, merkleRoot);
    genesisEntries[0].hash = crypto.createHash('sha256').update(blockData).digest('hex');
    genesisEntries[0].signature = this.signEntry(genesisEntries[0].hash);

    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      entries: genesisEntries,
      previousHash: '0',
      hash: genesisEntries[0].hash,
      nonce: 0,
      difficulty: 1,
      merkleRoot,
      minerReward: 100, // Genesis reward
    };

    this.chain.push(genesisBlock);
    this.saveBlockchain();
  }

  private calculateMerkleRoot(entries: LedgerEntry[]): string {
    if (entries.length === 0) return crypto.createHash('sha256').update('').digest('hex');

    let hashes = entries.map(entry => crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex'));

    while (hashes.length > 1) {
      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = i + 1 < hashes.length ? hashes[i + 1] : left;
        newHashes.push(crypto.createHash('sha256').update(left + right).digest('hex'));
      }
      hashes = newHashes;
    }

    return hashes[0];
  }

  private getBlockData(index: number, timestamp: number, entries: LedgerEntry[], previousHash: string, nonce: number, difficulty: number, merkleRoot: string): string {
    return JSON.stringify({
      index,
      timestamp,
      entries: entries.map(e => ({ id: e.id, timestamp: e.timestamp, data: e.data, previousHash: e.previousHash })),
      previousHash,
      nonce,
      difficulty,
      merkleRoot,
    });
  }

  private mineBlock(entries: LedgerEntry[]): Block | null {
    const index = this.chain.length;
    const timestamp = Date.now();
    const previousHash = this.chain[this.chain.length - 1].hash;
    const merkleRoot = this.calculateMerkleRoot(entries);

    let nonce = 0;
    let hash = '';
    const target = '0'.repeat(this.difficulty);

    while (true) {
      const blockData = this.getBlockData(index, timestamp, entries, previousHash, nonce, this.difficulty, merkleRoot);
      hash = crypto.createHash('sha256').update(blockData).digest('hex');

      if (hash.startsWith(target)) {
        break;
      }

      nonce++;
      if (nonce > 10000000) { // Prevent infinite loop
        return null;
      }
    }

    const minerReward = this.calculateMinerReward(index);

    const block: Block = {
      index,
      timestamp,
      entries,
      previousHash,
      hash,
      nonce,
      difficulty: this.difficulty,
      merkleRoot,
      minerReward,
    };

    return block;
  }

  private calculateMinerReward(blockIndex: number): number {
    // Halving every 1000 blocks, starting at 50 AZORA tokens
    const halvings = Math.floor(blockIndex / 1000);
    return Math.max(50 / Math.pow(2, halvings), 0.01);
  }

  private adjustDifficulty(): void {
    if (this.chain.length < 10) return; // Not enough blocks

    const recentBlocks = this.chain.slice(-10);
    const avgBlockTime = recentBlocks.reduce((sum, block, i) => {
      if (i === 0) return sum;
      return sum + (block.timestamp - recentBlocks[i - 1].timestamp);
    }, 0) / 9;

    const targetTime = this.blockTime;
    const ratio = avgBlockTime / targetTime;

    if (ratio < 0.8) {
      this.difficulty = Math.min(this.difficulty + 1, 8); // Increase difficulty
    } else if (ratio > 1.2) {
      this.difficulty = Math.max(this.difficulty - 1, 1); // Decrease difficulty
    }
  }

  createEntry(id: string, data: unknown): LedgerEntry {
    const timestamp = Date.now();
    const previousHash = this.pendingEntries.length > 0 ? this.pendingEntries[this.pendingEntries.length - 1].hash : '0';
    const entryData = JSON.stringify({ id, timestamp, data, previousHash });
    const hash = crypto.createHash('sha256').update(entryData).digest('hex');
    const signature = this.signEntry(hash);

    return {
      id,
      timestamp,
      data,
      previousHash,
      hash,
      signature,
      publicKey: this.publicKey,
      nonce: 0,
      difficulty: this.difficulty,
      merkleRoot: '',
    };
  }

  addEntry(id: string, data: unknown): LedgerEntry {
    const entry = this.createEntry(id, data);
    this.pendingEntries.push(entry);

    // Mine block if we have enough entries or it's been too long
    if (this.pendingEntries.length >= this.maxEntriesPerBlock) {
      this.minePendingBlock();
    }

    return entry;
  }

  private minePendingBlock(): void {
    if (this.pendingEntries.length === 0) return;

    const block = this.mineBlock([...this.pendingEntries]);
    if (block) {
      this.chain.push(block);
      this.pendingEntries = [];
      this.adjustDifficulty();

      // Reward miner
      const rewardTokenId = `mining-reward-${block.index}`;
      this.mintToken(rewardTokenId, 'miner-pool', block.minerReward);

      this.saveBlockchain();
    }
  }

  signEntry(hash: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    return sign.sign(this.privateKey, 'hex');
  }

  verifySignature(hash: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(hash);
    return verify.verify(publicKey, signature, 'hex');
  }

  getChain(): Block[] {
    return this.chain;
  }

  getPendingEntries(): LedgerEntry[] {
    return this.pendingEntries;
  }

  verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const block = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (block.previousHash !== prevBlock.hash) return false;
      if (block.index !== i) return false;

      // Verify block hash
      const blockData = this.getBlockData(block.index, block.timestamp, block.entries, block.previousHash, block.nonce, block.difficulty, block.merkleRoot);
      const calculatedHash = crypto.createHash('sha256').update(blockData).digest('hex');
      if (block.hash !== calculatedHash) return false;

      // Verify entries
      for (const entry of block.entries) {
        const entryData = JSON.stringify({ id: entry.id, timestamp: entry.timestamp, data: entry.data, previousHash: entry.previousHash });
        const entryHash = crypto.createHash('sha256').update(entryData).digest('hex');
        if (entry.hash !== entryHash) return false;
        if (!this.verifySignature(entry.hash, entry.signature, entry.publicKey)) return false;
      }

      // Verify merkle root
      if (block.merkleRoot !== this.calculateMerkleRoot(block.entries)) return false;

      // Verify proof-of-work
      const target = '0'.repeat(block.difficulty);
      if (!block.hash.startsWith(target)) return false;
    }
    return true;
  }

  // Token management
  mintToken(id: string, owner: string, amount: number): AzoraToken {
    const token: AzoraToken = { id, owner, amount, minted: true };
    this.tokens.set(id, token);
    this.addEntry(`mint-${id}`, { type: 'mint', token });
    this.saveBlockchain();
    return token;
  }

  transferToken(tokenId: string, from: string, to: string, amount: number): boolean {
    const token = this.tokens.get(tokenId);
    if (!token || token.owner !== from || token.amount < amount) return false;
    token.amount -= amount;
    const newToken: AzoraToken = { ...token, owner: to, amount };
    this.tokens.set(tokenId, newToken);
    this.addEntry(`transfer-${tokenId}`, { type: 'transfer', from, to, amount });
    this.saveBlockchain();
    return true;
  }

  getToken(id: string): AzoraToken | undefined {
    return this.tokens.get(id);
  }

  getAllTokens(): AzoraToken[] {
    return Array.from(this.tokens.values());
  }

  // Advanced value calculation based on blockchain complexity
  calculateEcosystemValue(): number {
    const baseValue = 1000000; // Base value in AZORA tokens
    const blockMultiplier = this.chain.length * 0.1;
    const difficultyMultiplier = this.difficulty * 0.5;
    const tokenMultiplier = this.tokens.size * 0.2;
    const complexityMultiplier = Math.log10(this.chain.length + 1) * 0.3;

    // Value increases exponentially with blockchain growth and complexity
    const totalMultiplier = 1 + blockMultiplier + difficultyMultiplier + tokenMultiplier + complexityMultiplier;
    return baseValue * totalMultiplier * Math.pow(1.01, this.chain.length); // 1% growth per block
  }

  getBlockchainStats(): {
    totalBlocks: number;
    totalEntries: number;
    currentDifficulty: number;
    totalTokens: number;
    ecosystemValue: number;
    isValid: boolean;
  } {
    const totalEntries = this.chain.reduce((sum, block) => sum + block.entries.length, 0);
    return {
      totalBlocks: this.chain.length,
      totalEntries,
      currentDifficulty: this.difficulty,
      totalTokens: this.tokens.size,
      ecosystemValue: this.calculateEcosystemValue(),
      isValid: this.verifyChain(),
    };
  }
}

// Legacy alias for backward compatibility
export const CryptoLedger = AzoraBlockchain;
