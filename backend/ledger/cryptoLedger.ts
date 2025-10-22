/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// cryptoLedger.ts
// Azora OS: Advanced Blockchain Ledger with Proof-of-Work

import fs from "fs"
import path from "path"
import crypto from "crypto"

export interface LedgerEntry {
  id: string
  key: string
  payload: any
  timestamp: number
  signature?: string
}

export interface AzoraToken {
  id: string
  owner: string
  amount: number
  issuedAt: number
}

export interface Block {
  index: number
  timestamp: number
  entries: LedgerEntry[]
  previousHash: string
  nonce: number
  hash: string
}

export class AzoraBlockchain {
  private chain: Block[] = []
  private pendingEntries: LedgerEntry[] = []
  private tokens: Map<string, AzoraToken> = new Map()
  private privateKey: string
  private difficulty: number = 3
  private storagePath: string

  constructor(storagePath?: string, opts?: { difficulty?: number; privateKey?: string }) {
    this.storagePath = storagePath || path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json")
    this.difficulty = opts?.difficulty ?? this.difficulty
    this.privateKey = opts?.privateKey ?? crypto.randomBytes(32).toString("hex")
    this.load()
  }

  private computeHash(block: Omit<Block, "hash">) {
    const data = `${block.index}|${block.timestamp}|${JSON.stringify(block.entries)}|${block.previousHash}|${block.nonce}`
    return crypto.createHash("sha256").update(data).digest("hex")
  }

  private mineBlock(block: Omit<Block, "hash">) {
    let nonce = 0
    let hash = ""
    const target = "0".repeat(this.difficulty)
    while (true) {
      const candidate = { ...block, nonce }
      hash = this.computeHash(candidate)
      if (hash.startsWith(target)) {
        return { ...candidate, hash }
      }
      nonce++
    }
  }

  private signEntry(entry: LedgerEntry) {
    const hmac = crypto.createHmac("sha256", this.privateKey)
    hmac.update(JSON.stringify({ key: entry.key, payload: entry.payload, timestamp: entry.timestamp, id: entry.id }))
    return hmac.digest("hex")
  }

  private persist() {
    try {
      const dump = {
        chain: this.chain,
        tokens: Array.from(this.tokens.entries()),
        privateKey: this.privateKey,
        difficulty: this.difficulty
      }
      fs.mkdirSync(path.dirname(this.storagePath), { recursive: true })
      fs.writeFileSync(this.storagePath, JSON.stringify(dump, null, 2), "utf8")
    } catch (err) {
      console.error("Failed to persist blockchain:", err)
    }
  }

  private load() {
    try {
      if (!fs.existsSync(this.storagePath)) {
        const genesis: Block = {
          index: 0,
          timestamp: Date.now(),
          entries: [],
          previousHash: "0",
          nonce: 0,
          hash: ""
        }
        const mined = this.mineBlock({ ...genesis, hash: "" })
        this.chain = [mined]
        this.persist()
        return
      }
      const raw = fs.readFileSync(this.storagePath, "utf8")
      const parsed = JSON.parse(raw)
      this.chain = parsed.chain ?? []
      this.tokens = new Map(parsed.tokens ?? [])
      this.privateKey = parsed.privateKey ?? this.privateKey
      this.difficulty = parsed.difficulty ?? this.difficulty
    } catch (err) {
      console.error("Failed to load blockchain, creating new:", err)
      this.chain = []
    }
  }

  addEntry(key: string, payload: any) {
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      key,
      payload,
      timestamp: Date.now()
    }
    entry.signature = this.signEntry(entry)
    this.pendingEntries.push(entry)
    // Immediately create a block containing pending entries (simple approach)
    const last = this.chain[this.chain.length - 1]
    const blockBase: Omit<Block, "hash"> = {
      index: last ? last.index + 1 : 1,
      timestamp: Date.now(),
      entries: this.pendingEntries.splice(0),
      previousHash: last ? last.hash : "0",
      nonce: 0
    }
    const mined = this.mineBlock(blockBase)
    this.chain.push(mined)
    this.persist()
    return entry.id
  }

  mintToken(tokenId: string, owner: string, amount: number) {
    const token: AzoraToken = { id: tokenId, owner, amount, issuedAt: Date.now() }
    this.tokens.set(tokenId, token)
    this.addEntry(`token-${tokenId}`, { type: "mint", token })
    return token
  }

  getBlockchainStats() {
    return {
      blocks: this.chain.length,
      latestHash: this.chain[this.chain.length - 1]?.hash ?? null,
      tokens: this.tokens.size,
      difficulty: this.difficulty,
      pendingEntries: this.pendingEntries.length
    }
  }

  verifyEntrySignature(entry: LedgerEntry) {
    const expected = (() => {
      const hmac = crypto.createHmac("sha256", this.privateKey)
      hmac.update(JSON.stringify({ key: entry.key, payload: entry.payload, timestamp: entry.timestamp, id: entry.id }))
      return hmac.digest("hex")
    })()
    return expected === entry.signature
  }

  // Legacy alias for backward compatibility
  static CryptoLedger = AzoraBlockchain
}
export const CryptoLedger = AzoraBlockchain
