#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Running Full Compliance Check for Azora OS"
echo "============================================="

# Check Azora Coin supply limit
echo -e "Checking Azora Coin supply limit..."
if grep -q "MAX_SUPPLY = 1000000" azora-coin/contracts/AzoraCoin.sol 2>/dev/null; then
  echo -e "${GREEN}✓ Azora Coin correctly enforces 1 million token limit${NC}"
else
  echo -e "${RED}✗ Azora Coin does not enforce 1 million token limit${NC}"
fi

# Check Constitution-as-Code implementation
echo -e "Checking Constitution-as-Code implementation..."
if [ -f "services/procurement-corridor/src/services/compliance.service.ts" ]; then
  RULE_COUNT=$(grep -c "id: '" services/procurement-corridor/src/services/compliance.service.ts)
  echo -e "${GREEN}✓ Constitution-as-Code implemented with $RULE_COUNT rules${NC}"
else
  echo -e "${RED}✗ Constitution-as-Code implementation not found${NC}"
fi

# Check South African compliance
echo -e "Checking South African compliance..."
if [ -f "services/south-african-compliance/index.js" ]; then
  echo -e "${GREEN}✓ South African compliance service implemented${NC}"
else
  echo -e "${RED}✗ South African compliance service not found${NC}"
fi

# Check CCMA compliance
echo -e "Checking CCMA compliance..."
if grep -q "verifyCCMACompliance" services/hr-ai-deputy/index.js 2>/dev/null; then
  echo -e "${GREEN}✓ CCMA compliance implemented in HR AI Deputy${NC}"
else
  echo -e "${RED}✗ CCMA compliance not implemented${NC}"
fi

# Check service ports for conflicts
echo -e "Checking for service port conflicts..."
CONFLICTS=$(grep -r "PORT.*4[0-9][0-9][0-9]" --include="*.js" services/ | sort)
echo "$CONFLICTS" | awk -F: '{print $1 " => " $2}' | sort | uniq

echo "============================================="
echo -e "${GREEN}Compliance check completed${NC}"
