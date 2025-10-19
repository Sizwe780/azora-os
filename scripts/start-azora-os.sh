#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Azora OS...${NC}"

# Check if Docker is running
if command -v docker &> /dev/null; then
  if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker is not running. Some features may not be available.${NC}"
  else
    echo -e "${GREEN}✅ Docker is running.${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ Docker is not installed. Some features may not be available.${NC}"
fi

# Ensure environment files exist
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️ .env file not found, creating...${NC}"
  cat > .env << 'ENVEOF'
# Azora OS Environment Configuration
NODE_ENV=development

# API Keys (replace with your actual keys)
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=...

# Blockchain Configuration
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://localhost:8545
AZORA_COIN_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Service Ports
COMPLIANCE_PORT=4081
AZORA_COIN_PORT=4092
MAIN_APP_PORT=5173

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/azora?schema=public"
ENVEOF
  echo -e "${GREEN}✅ .env file created.${NC}"
fi

# Check for azora-coin/.env file
if [ ! -f "azora-coin/.env" ]; then
  echo -e "${YELLOW}⚠️ azora-coin/.env file not found, creating...${NC}"
  cat > azora-coin/.env << 'ENVEOF'
# Azora Coin Environment Configuration

# Network URLs
GOERLI_URL=https://eth-goerli.alchemyapi.io/v2/your-api-key
MUMBAI_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key

# Private Keys - DO NOT SHARE OR COMMIT ACTUAL KEYS!
PRIVATE_KEY=0xYourPrivateKeyHere

# API Keys
ETHERSCAN_API_KEY=YourEtherscanApiKey

# Deployment
DEPLOYER_ADDRESS=0xYourDeployerAddress
AZORA_ADDRESS=0xAzoraAIAddress
BOARD_MEMBER1=0xBoardMember1Address
BOARD_MEMBER2=0xBoardMember2Address
BOARD_MEMBER3=0xBoardMember3Address
BOARD_MEMBER4=0xBoardMember4Address
BOARD_MEMBER5=0xBoardMember5Address
ENVEOF
  echo -e "${GREEN}✅ azora-coin/.env file created.${NC}"
fi

# Run compliance check
if [ -f "./check-full-compliance.sh" ]; then
  echo -e "${BLUE}Running compliance check...${NC}"
  ./check-full-compliance.sh
else
  echo -e "${RED}❌ check-full-compliance.sh not found.${NC}"
fi

# Run UI consistency check
if [ -f "./ensure-ui-consistency.sh" ]; then
  echo -e "${BLUE}Ensuring UI consistency...${NC}"
  ./ensure-ui-consistency.sh
else
  echo -e "${RED}❌ ensure-ui-consistency.sh not found.${NC}"
fi

# Start services
echo -e "${BLUE}Starting services...${NC}"

# Start the compliance service in the background
echo -e "${BLUE}Starting compliance service...${NC}"
if [ -d "services/compliance-service" ]; then
  cd services/compliance-service
  node index.js > ../../logs/compliance-service.log 2>&1 &
  cd ../..
  echo -e "${GREEN}✅ Compliance service started on port 4081.${NC}"
else
  echo -e "${RED}❌ Compliance service directory not found.${NC}"
fi

# Start the Azora Coin integration service in the background
echo -e "${BLUE}Starting Azora Coin integration service...${NC}"
if [ -d "services/azora-coin-integration" ]; then
  cd services/azora-coin-integration
  node index.js > ../../logs/azora-coin-integration.log 2>&1 &
  cd ../..
  echo -e "${GREEN}✅ Azora Coin integration service started on port 4092.${NC}"
else
  echo -e "${RED}❌ Azora Coin integration service directory not found.${NC}"
fi

# Start the UI
echo -e "${BLUE}Starting UI...${NC}"
if [ -d "UI Overhaul" ]; then
  cd "UI Overhaul"
  npm install > ../logs/ui-install.log 2>&1
  npm run dev > ../logs/ui-dev.log 2>&1 &
  cd ..
  echo -e "${GREEN}✅ UI started at http://localhost:5173${NC}"
else
  echo -e "${RED}❌ UI Overhaul directory not found.${NC}"
fi

echo -e "${GREEN}✅ Azora OS started successfully!${NC}"
echo -e "${GREEN}✅ Open http://localhost:5173 to access the application.${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Print service status
echo ""
echo -e "${BLUE}Service Status:${NC}"
echo "Compliance Service: http://localhost:4081/health"
echo "Azora Coin Integration: http://localhost:4092/health"
echo "UI: http://localhost:5173"
echo ""
echo -e "${BLUE}To stop services, use:${NC} pkill -f 'node index.js'"
