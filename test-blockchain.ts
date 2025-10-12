// test-blockchain.ts
// Simple test script to demonstrate the Azora Blockchain

import { LedgerService } from './backend/ledger/ledgerService.js';

console.log('🚀 Initializing Azora Ledger Service...\n');

const ledgerService = new LedgerService('./test-blockchain.json');

// Check initial state
console.log('📊 Initial Blockchain Stats:');
console.log(ledgerService.getBlockchainStats());
console.log();

// Add some test transactions
console.log('💰 Adding test transactions...\n');

ledgerService.recordTransaction('test-tx-1', 'userA', 'userB', 100);
ledgerService.recordComplianceCheck('company1', 'kyc', true, 'KYC verification passed');
ledgerService.recordOnboarding('client123', { company: 'Test Corp', employees: 50 });

// Check updated stats
console.log('📊 Updated Blockchain Stats:');
console.log(ledgerService.getBlockchainStats());
console.log();

// Mint some tokens
console.log('🪙 Minting AZORA tokens...\n');

ledgerService.mintClientToken('client123', 1000);
ledgerService.mintClientToken('client456', 500);

// Check final stats
console.log('📊 Final Blockchain Stats:');
console.log(ledgerService.getBlockchainStats());
console.log();

// Verify blockchain integrity
console.log('🔒 Verifying blockchain integrity...');
const isValid = ledgerService.verifyBlockchainIntegrity();
console.log(`✅ Blockchain is ${isValid ? 'VALID' : 'INVALID'}\n`);

// Show ecosystem value growth
console.log('💎 Ecosystem Value Growth:');
console.log(`Current Value: $${ledgerService.getEcosystemValue().toLocaleString()}`);
console.log('(Value grows exponentially with blockchain complexity and adoption)\n');

console.log('🎉 Azora Blockchain demonstration complete!');
console.log('The ledger is now cryptographically secure and will increase in value as more data is added!');