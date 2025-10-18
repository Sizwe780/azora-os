#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'BANNER'
    _                         ___  ____  
   / \    _____  _ __ __ _   / _ \/ ___| 
  / _ \  |_  / || '__/ _` | | | | \___ \ 
 / ___ \  / /| || | | (_| | | |_| |___) |
/_/   \_\/___|\_||_|  \__,_|  \___/|____/ 
                                          
Production Setup & Deployment
BANNER
echo -e "${NC}"

echo "=================================="
echo ""

# Step 1: Cleanup
echo -e "${BLUE}Step 1/6: Running production cleanup...${NC}"
./production-cleanup.sh

# Step 2: Build Docker images
echo ""
echo -e "${BLUE}Step 2/6: Building Docker images...${NC}"
docker-compose build --parallel

# Step 3: Start infrastructure
echo ""
echo -e "${BLUE}Step 3/6: Starting infrastructure services...${NC}"
docker-compose up -d redis postgres mongodb rabbitmq
sleep 10

# Step 4: Start all services
echo ""
echo -e "${BLUE}Step 4/6: Starting all microservices...${NC}"
docker-compose up -d

# Step 5: Health check
echo ""
echo -e "${BLUE}Step 5/6: Running health checks...${NC}"
sleep 15
./check-all-services.sh

# Step 6: Commit to GitHub
echo ""
echo -e "${BLUE}Step 6/6: Commit to GitHub?${NC}"
read -p "Do you want to commit and push to GitHub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./commit-to-github.sh
fi

echo ""
echo -e "${GREEN}"
cat << 'SUCCESS'
╔════════════════════════════════════════╗
║   🎉 PRODUCTION SETUP COMPLETE! 🎉    ║
╚════════════════════════════════════════╝
SUCCESS
echo -e "${NC}"

echo ""
echo -e "${GREEN}✅ Services Running:${NC}"
echo "  • Main App: http://localhost:5173"
echo "  • API Gateway: http://localhost:4000"
echo "  • Azora Coin: http://localhost:4092"
echo ""
echo -e "${GREEN}🪙 Azora Coin:${NC}"
echo "  • Max Supply: 1,000,000 AZR"
echo "  • Constitution Compliant: ✅"
echo "  • Multi-Sig Governance: ✅"
echo ""
echo -e "${GREEN}📚 Documentation:${NC}"
echo "  • Production Guide: PRODUCTION-GUIDE.md"
echo "  • Constitution: docs/constitution/"
echo ""
echo -e "${BLUE}🇿🇦 From Africa, For Humanity 🚀${NC}"
echo ""
