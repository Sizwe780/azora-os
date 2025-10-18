#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking Azora Coin System..."
echo "======================================"

# Check if the Azora Coin contract is compiled
if [ -d "azora-coin/artifacts/contracts/AzoraCoin.sol" ]; then
  echo -e "${GREEN}✅ Azora Coin contract compiled${NC}"
else
  echo -e "${RED}❌ Azora Coin contract not compiled${NC}"
  echo "   Run: cd azora-coin && npx hardhat compile"
fi

# Check if the integration service is running
COIN_SERVICE_RUNNING=$(curl -s http://localhost:4092/health || echo "")
if [ ! -z "$COIN_SERVICE_RUNNING" ]; then
  echo -e "${GREEN}✅ Azora Coin Integration Service running on port 4092${NC}"
else
  echo -e "${YELLOW}⚠️ Azora Coin Integration Service not running${NC}"
  echo "   Start it with: docker-compose up -d azora-coin-integration"
fi

# Check if the contract address is set
if [ -f ".env" ] && grep -q "AZORA_COIN_CONTRACT=" .env; then
  CONTRACT_ADDRESS=$(grep "AZORA_COIN_CONTRACT=" .env | cut -d= -f2)
  if [ ! -z "$CONTRACT_ADDRESS" ] && [ "$CONTRACT_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then
    echo -e "${GREEN}✅ Azora Coin contract address configured${NC}"
    echo "   Address: $CONTRACT_ADDRESS"
  else
    echo -e "${YELLOW}⚠️ Azora Coin contract address not set${NC}"
    echo "   Update it in .env after deployment"
  fi
else
  echo -e "${YELLOW}⚠️ AZORA_COIN_CONTRACT not found in .env${NC}"
fi

# Check integration with other services
echo ""
echo "Checking Integration with Other Services:"

# Check compliance service integration
COMPLIANCE_SERVICE_RUNNING=$(curl -s http://localhost:4081/health || echo "")
if [ ! -z "$COMPLIANCE_SERVICE_RUNNING" ]; then
  echo -e "${GREEN}✅ Compliance Service running and integrated${NC}"
else
  echo -e "${YELLOW}⚠️ Compliance Service not running (required for compliance validation)${NC}"
fi

# Check document vault integration
DOCUMENT_VAULT_RUNNING=$(curl -s http://localhost:4087/health || echo "")
if [ ! -z "$DOCUMENT_VAULT_RUNNING" ]; then
  echo -e "${GREEN}✅ Document Vault Service running for secure records${NC}"
else
  echo -e "${YELLOW}⚠️ Document Vault Service not running${NC}"
fi

echo ""
echo "🧮 Azora Coin Summary:"
echo "  - 1,000,000 AZR total supply"
echo "  - Proof of Compliance minting"
echo "  - Multi-signature governance"
echo "  - Following Constitution Article XII"

echo ""
echo "📚 Next Steps:"
echo "  1. Update .env with real blockchain connection info"
echo "  2. Deploy contract: cd azora-coin && ./start.sh deploy"
echo "  3. Update AZORA_COIN_CONTRACT in .env with deployed address"
echo "  4. Restart integration service: docker-compose restart azora-coin-integration"
echo ""
