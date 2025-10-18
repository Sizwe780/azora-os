import crypto from 'crypto';
import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';

/**
 * Crypto Backed Ledger
 * 
 * Implements the dual-ledger model described in Article XII, Section 12.3
 * - Records compliance events, reserves, and provides cryptographic proofs
 * - Generates merkle roots for on-chain verification
 */
export class CryptoBackedLedger {
    private ledgerEntries: LedgerEntry[] = [];
    private reserveSnapshots: ReserveSnapshot[] = [];
    private merkleTree: MerkleTree | null = null;
    
    constructor() {
        this.updateMerkleTree();
    }
    
    /**
     * Add a compliance record to the ledger
     * @param record The compliance record to add
     * @param recordHash Hash of the compliance record
     * @returns The ledger entry ID
     */
    public addComplianceRecord(record: any, recordHash: string): string {
        const timestamp = Math.floor(Date.now() / 1000);
        const entryId = crypto.randomUUID();
        
        const entry: LedgerEntry = {
            id: entryId,
            timestamp,
            type: 'COMPLIANCE',
            recordHash,
            data: record,
            verified: false
        };
        
        this.ledgerEntries.push(entry);
        this.updateMerkleTree();
        
        return entryId;
    }
    
    /**
     * Mark a compliance record as verified (after minting)
     * @param recordHash Hash of the compliance record
     */
    public verifyComplianceRecord(recordHash: string): void {
        const entry = this.ledgerEntries.find(e => 
            e.type === 'COMPLIANCE' && e.recordHash === recordHash);
            
        if (entry) {
            entry.verified = true;
            this.updateMerkleTree();
        }
    }
    
    /**
     * Add a reserve snapshot to the ledger
     * @param assets The assets in the reserve
     * @param totalValue Total value of the reserve in USD
     * @param auditor Information about the auditor
     * @returns The snapshot ID
     */
    public addReserveSnapshot(
        assets: ReserveAsset[],
        totalValue: number,
        auditor: { name: string, signature: string }
    ): string {
        const timestamp = Math.floor(Date.now() / 1000);
        const snapshotId = crypto.randomUUID();
        
        const snapshot: ReserveSnapshot = {
            id: snapshotId,
            timestamp,
            assets,
            totalValue,
            auditor
        };
        
        this.reserveSnapshots.push(snapshot);
        
        // Add to ledger entries as well
        const entry: LedgerEntry = {
            id: snapshotId,
            timestamp,
            type: 'RESERVE_SNAPSHOT',
            recordHash: this.hashReserveSnapshot(snapshot),
            data: snapshot,
            verified: true
        };
        
        this.ledgerEntries.push(entry);
        this.updateMerkleTree();
        
        return snapshotId;
    }
    
    /**
     * Get the latest reserve snapshot
     * @returns The latest reserve snapshot
     */
    public getLatestReserveSnapshot(): ReserveSnapshot | null {
        if (this.reserveSnapshots.length === 0) {
            return null;
        }
        
        return this.reserveSnapshots[this.reserveSnapshots.length - 1];
    }
    
    /**
     * Get a merkle proof for a specific ledger entry
     * @param entryId ID of the ledger entry
     * @returns The merkle proof
     */
    public getMerkleProof(entryId: string): string[] {
        if (!this.merkleTree) {
            return [];
        }
        
        const entry = this.ledgerEntries.find(e => e.id === entryId);
        if (!entry) {
            return [];
        }
        
        const leaf = this.hashLedgerEntry(entry);
        return this.merkleTree.getHexProof(leaf);
    }
    
    /**
     * Get the current merkle root
     * @returns The merkle root as a hex string
     */
    public getMerkleRoot(): string {
        if (!this.merkleTree) {
            return '0x0000000000000000000000000000000000000000000000000000000000000000';
        }
        
        return this.merkleTree.getHexRoot();
    }
    
    /**
     * Generate a signed snapshot of the ledger
     * @param signerPrivateKey Private key to sign the snapshot
     * @returns The signed snapshot
     */
    public generateSignedSnapshot(signerPrivateKey: string): SignedLedgerSnapshot {
        const wallet = new ethers.Wallet(signerPrivateKey);
        
        const snapshot = {
            timestamp: Math.floor(Date.now() / 1000),
            entryCount: this.ledgerEntries.length,
            merkleRoot: this.getMerkleRoot(),
            latestReserveValue: this.getLatestReserveSnapshot()?.totalValue || 0
        };
        
        // In a real implementation, we would sign this snapshot
        // Here we're simulating a signature
        const signatureMessage = JSON.stringify(snapshot);
        const signature = wallet.address; // Simplified for example
        
        return {
            ...snapshot,
            signer: wallet.address,
            signature
        };
    }
    
    /**
     * Update the merkle tree with the current ledger entries
     */
    private updateMerkleTree(): void {
        const leaves = this.ledgerEntries.map(entry => this.hashLedgerEntry(entry));
        this.merkleTree = new MerkleTree(leaves, crypto.sha256, { sort: true });
    }
    
    /**
     * Hash a ledger entry for the merkle tree
     * @param entry The ledger entry
     * @returns The hash as a Buffer
     */
    private hashLedgerEntry(entry: LedgerEntry): Buffer {
        const entryString = JSON.stringify({
            id: entry.id,
            timestamp: entry.timestamp,
            type: entry.type,
            recordHash: entry.recordHash,
            verified: entry.verified
        });
        
        return Buffer.from(
            crypto.createHash('sha256').update(entryString).digest('hex'),
            'hex'
        );
    }
    
    /**
     * Hash a reserve snapshot
     * @param snapshot The reserve snapshot
     * @returns The hash as a hex string
     */
    private hashReserveSnapshot(snapshot: ReserveSnapshot): string {
        const snapshotString = JSON.stringify({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            assets: snapshot.assets,
            totalValue: snapshot.totalValue
        });
        
        return '0x' + crypto.createHash('sha256').update(snapshotString).digest('hex');
    }
}

export interface LedgerEntry {
    id: string;
    timestamp: number;
    type: 'COMPLIANCE' | 'RESERVE_SNAPSHOT' | 'MINT' | 'BURN';
    recordHash: string;
    data: any;
    verified: boolean;
}

export interface ReserveAsset {
    type: 'FIAT' | 'CRYPTO' | 'OTHER';
    symbol: string;
    amount: string;
    valueUSD: number;
    custodian: string;
    proof?: string;
}

export interface ReserveSnapshot {
    id: string;
    timestamp: number;
    assets: ReserveAsset[];
    totalValue: number;
    auditor: {
        name: string;
        signature: string;
    };
}

export interface SignedLedgerSnapshot {
    timestamp: number;
    entryCount: number;
    merkleRoot: string;
    latestReserveValue: number;
    signer: string;
    signature: string;
}