// api-server.js
// Simple API server for testing the ledger blockchain

const express = require('express');
const cors = require('cors');
const { LedgerService } = require('./backend/ledger/ledgerService.ts');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize ledger service
console.log('Initializing ledger service...');
const ledgerService = new LedgerService('./test-blockchain.json');
console.log('Ledger service initialized successfully');

// API routes
app.get('/api/v1/ledger', (req, res) => {
  try {
    const { action } = req.query;

    switch (action) {
      case 'blocks':
        return res.json(ledgerService.getBlocks());
      case 'chain':
        return res.json(ledgerService.exportChain());
      case 'tokens':
        return res.json(ledgerService.exportTokens());
      case 'stats':
        return res.json(ledgerService.getBlockchainStats());
      case 'pending':
        return res.json(ledgerService.getPendingEntries());
      case 'value':
        return res.json({ ecosystemValue: ledgerService.getEcosystemValue() });
      case 'verify':
        return res.json({ valid: ledgerService.verifyBlockchainIntegrity() });
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Ledger API GET error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/v1/ledger', (req, res) => {
  try {
    const { action, ...data } = req.body;

    switch (action) {
      case 'transaction': {
        const entry = ledgerService.recordTransaction(data.txId, data.from, data.to, data.amount, data.type);
        return res.json(entry);
      }
      case 'compliance': {
        const complianceEntry = ledgerService.recordComplianceCheck(data.entityId, data.checkType, data.result, data.details);
        return res.json(complianceEntry);
      }
      case 'onboarding': {
        const onboardEntry = ledgerService.recordOnboarding(data.clientId, data.details);
        return res.json(onboardEntry);
      }
      case 'mint': {
        const token = ledgerService.mintClientToken(data.clientId, data.amount);
        return res.json(token);
      }
      case 'mine': {
        const mined = ledgerService.forceMineBlock();
        return res.json({ mined, stats: ledgerService.getBlockchainStats() });
      }
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Ledger API POST error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Azora Ledger API server listening on port ${port}`);
  console.log('Blockchain stats:', ledgerService.getBlockchainStats());
});