// ledgerService.ts
// Azora OS: Enhanced Ledger Service for Blockchain Integration

import { AzoraBlockchain, Block, LedgerEntry, AzoraToken } from './cryptoLedger';

export class LedgerService {
  private blockchain: AzoraBlockchain;

  constructor(ledgerPath?: string) {
    this.blockchain = new AzoraBlockchain(ledgerPath);
  }

  // Transaction methods
  recordTransaction(txId: string, from: string, to: string, amount: number, type: string = 'transfer'): LedgerEntry {
    const data = { type, from, to, amount, txId };
    return this.blockchain.addEntry(txId, data);
  }

  recordComplianceCheck(entityId: string, checkType: string, result: boolean, details: unknown): LedgerEntry {
    const data = { type: 'compliance', entityId, checkType, result, details };
    return this.blockchain.addEntry(`compliance-${entityId}-${Date.now()}`, data);
  }

  recordOnboarding(clientId: string, details: unknown): LedgerEntry {
    const data = { type: 'onboarding', clientId, details };
    return this.blockchain.addEntry(`onboard-${clientId}`, data);
  }

  recordDocumentVerification(docId: string, verified: boolean, metadata: unknown): LedgerEntry {
    const data = { type: 'document-verification', docId, verified, metadata };
    return this.blockchain.addEntry(`doc-verify-${docId}`, data);
  }

  // Token methods
  mintClientToken(clientId: string, initialAmount: number = 1000): AzoraToken {
    return this.blockchain.mintToken(`client-${clientId}`, clientId, initialAmount);
  }

  transferTokens(tokenId: string, from: string, to: string, amount: number): boolean {
    return this.blockchain.transferToken(tokenId, from, to, amount);
  }

  // Analytics
  getTransactionHistory(): LedgerEntry[] {
    return this.blockchain.getChain().flatMap(block => block.entries.filter(entry => {
      const data = entry.data as { type?: string };
      return data && data.type === 'transfer';
    }));
  }

  getComplianceHistory(): LedgerEntry[] {
    return this.blockchain.getChain().flatMap(block => block.entries.filter(entry => {
      const data = entry.data as { type?: string };
      return data && data.type === 'compliance';
    }));
  }

  getEcosystemValue(): number {
    return this.blockchain.calculateEcosystemValue();
  }

  // Blockchain-specific methods
  getBlockchainStats(): {
    totalBlocks: number;
    totalEntries: number;
    currentDifficulty: number;
    totalTokens: number;
    ecosystemValue: number;
    isValid: boolean;
  } {
    return this.blockchain.getBlockchainStats();
  }

  getBlocks(): Block[] {
    return this.blockchain.getChain();
  }

  getPendingEntries(): LedgerEntry[] {
    return this.blockchain.getPendingEntries();
  }

  // Verification
  verifyBlockchainIntegrity(): boolean {
    return this.blockchain.verifyChain();
  }

  // Export for external APIs
  exportChain(): Block[] {
    return this.blockchain.getChain();
  }

  exportTokens(): AzoraToken[] {
    return this.blockchain.getAllTokens();
  }

  // Mining simulation (for testing)
  forceMineBlock(): boolean {
    // This would normally be handled automatically, but for testing we can force it
    const pending = this.blockchain.getPendingEntries();
    if (pending.length === 0) {
      // Add a dummy entry to mine
      this.blockchain.addEntry('mining-test', { type: 'mining', message: 'Forced mining for testing' });
    }
    return true; // Mining happens automatically in addEntry when threshold is reached
  }
}

// Export default for compatibility with the import in api/v1/ledger/index.ts
export default LedgerService;

// Example usage:
// const service = new LedgerService();
// service.recordTransaction('tx001', 'clientA', 'clientB', 500);
// service.mintClientToken('clientA');
// console.log('Blockchain Stats:', service.getBlockchainStats());