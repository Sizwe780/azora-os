// api/v1/ledger/index.ts
import { LedgerService } from '../../../backend/ledger/ledgerService';

const ledgerService = new LedgerService();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'blocks':
        return Response.json(ledgerService.getBlocks());
      case 'chain':
        return Response.json(ledgerService.exportChain());
      case 'tokens':
        return Response.json(ledgerService.exportTokens());
      case 'stats':
        return Response.json(ledgerService.getBlockchainStats());
      case 'pending':
        return Response.json(ledgerService.getPendingEntries());
      case 'value':
        return Response.json({ ecosystemValue: ledgerService.getEcosystemValue() });
      case 'verify':
        return Response.json({ valid: ledgerService.verifyBlockchainIntegrity() });
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Ledger API GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'transaction': {
        const entry = ledgerService.recordTransaction(data.txId, data.from, data.to, data.amount, data.type);
        return Response.json(entry);
      }
      case 'compliance': {
        const complianceEntry = ledgerService.recordComplianceCheck(data.entityId, data.checkType, data.result, data.details);
        return Response.json(complianceEntry);
      }
      case 'onboarding': {
        const onboardEntry = ledgerService.recordOnboarding(data.clientId, data.details);
        return Response.json(onboardEntry);
      }
      case 'mint': {
        const token = ledgerService.mintClientToken(data.clientId, data.amount);
        return Response.json(token);
      }
      case 'mine': {
        const mined = ledgerService.forceMineBlock();
        return Response.json({ mined, stats: ledgerService.getBlockchainStats() });
      }
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Ledger API POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}