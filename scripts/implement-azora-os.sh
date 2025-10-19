#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Beginning Full Implementation of Azora OS...${NC}"

# --- 1. Install Dependencies ---
echo -e "\n${YELLOW}Step 1: Installing all project dependencies...${NC}"
(cd /workspaces/azora-os/azora-coin && npm install)
(cd /workspaces/azora-os/services/compliance-service && npm install)
(cd /workspaces/azora-os/services/azora-coin-integration && npm install)
(cd /workspaces/azora-os/apps/main-app && npm install)
echo -e "${GREEN}✅ All dependencies installed.${NC}"

# --- 2. Start Local Blockchain Network ---
echo -e "\n${YELLOW}Step 2: Starting local Hardhat blockchain network...${NC}"
(cd /workspaces/azora-os/azora-coin && npx hardhat node > /workspaces/azora-os/logs/blockchain.log 2>&1 &)
# Wait a few seconds for the node to initialize
sleep 5
echo -e "${GREEN}✅ Local blockchain is running in the background.${NC}"

# --- 3. Deploy AzoraCoin Smart Contract ---
echo -e "\n${YELLOW}Step 3: Deploying AzoraCoin contract to local network...${NC}"
DEPLOY_OUTPUT=$(cd /workspaces/azora-os/azora-coin && npx hardhat run scripts/deploy.js --network localhost)
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "AzoraCoin deployed to:" | awk '{print $4}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "❌ CRITICAL: Failed to deploy contract or capture address. Aborting."
    exit 1
fi
echo -e "${GREEN}✅ AzoraCoin contract deployed at address: $CONTRACT_ADDRESS${NC}"

# --- 4. Update Environment Configuration ---
echo -e "\n${YELLOW}Step 4: Updating .env with the new contract address...${NC}"
# Use sed to replace the contract address line in the main .env file
sed -i "s|^AZORA_COIN_CONTRACT=.*|AZORA_COIN_CONTRACT=$CONTRACT_ADDRESS|" /workspaces/azora-os/.env
echo -e "${GREEN}✅ .env file updated.${NC}"

# --- 5. Start Backend Services ---
echo -e "\n${YELLOW}Step 5: Starting backend services...${NC}"
(cd /workspaces/azora-os/services/compliance-service && npm start > /workspaces/azora-os/logs/compliance-service.log 2>&1 &)
echo "✅ Compliance Service started on port 4081."
(cd /workspaces/azora-os/services/azora-coin-integration && npm start > /workspaces/azora-os/logs/azora-coin-integration.log 2>&1 &)
echo "✅ Azora Coin Integration Service started on port 4092."
sleep 3 # Give services a moment to start

# --- 6. Start Frontend Application ---
echo -e "\n${YELLOW}Step 6: Starting the main UI application...${NC}"
(cd /workspaces/azora-os/apps/main-app && npm run dev > /workspaces/azora-os/logs/main-app.log 2>&1 &)
echo -e "${GREEN}✅ Main application is starting on http://localhost:5173${NC}"

# --- 7. Final Verification ---
echo -e "\n${YELLOW}Step 7: Running final launch readiness check...${NC}"
sleep 5 # Wait for all services to be fully available
/workspaces/azora-os/launch-readiness.sh

echo -e "\n\n${GREEN}🎉 Azora OS Full Implementation Completehttp://localhost:5173{NC}"
echo "You can access the main application at: http://localhost:5173"
echo "To view logs, check the /workspaces/azora-os/logs directory."
echo "To stop all background processes, run: pkill -f 'node|hardhat'"
