#!/bin/bash
echo "Starting Azora OS services..."

npx hardhat node &
node services/identity/identity.js &
node services/guardian/guardian.js &
node services/ledger/ledger.js &
node services/wallet/wallet.js &
node services/azora-coin-integration/index.js &
node services/founder-withdrawal/founder-instant-withdrawal.js &
node services/liquidity/liquidity.js &
node services/reporting/reporting.js &

echo "All services started. Check logs for errors."
node services/ai-valuation/ai-valuation.js &
node services/partnerships/partnerships.js &
