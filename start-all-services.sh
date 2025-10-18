#!/bin/bash

echo "🚀 Starting Azora OS - Complete System"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  exit 1
fi

# Check .env
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
  cp .env.production .env
  echo -e "${GREEN}✅ Created .env file${NC}"
  echo -e "${YELLOW}⚠️  Please review and update .env with your credentials${NC}"
  exit 1
fi

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start infrastructure services
echo ""
echo "🏗️  Starting infrastructure services..."
docker-compose up -d redis postgres mongodb rabbitmq

# Wait for infrastructure
echo "⏳ Waiting for infrastructure to be ready..."
sleep 15

# Start backend services
echo ""
echo "⚚️  Starting backend microservices..."
docker-compose up -d

# Check service health
echo ""
echo "🏥 Checking service health..."
sleep 10

services=(
  "http://localhost:4004/health:Auth Service"
  "http://localhost:4001/health:AI Orchestrator"
  "http://localhost:4092/health:Azora Coin Integration"
  "http://localhost:4081/health:Compliance Service"
  "http://localhost:4070/health:Onboarding Service"
  "http://localhost:4091/health:HR AI Deputy"
)

for service in "${services[@]}"; do
  IFS=':' read -r url name <<< "$service"
  if curl -sf "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $name${NC}"
  else
    echo -e "${YELLOW}⚠️  $name (starting...)${NC}"
  fi
done

echo ""
echo "======================================"
echo "🎉 Azora OS is starting!"
echo ""
echo "📊 Access Points:"
echo "  • Main App: http://localhost:5173"
echo "  • Driver PWA: http://localhost:3001"
echo "  • Compliance UI: http://localhost:3000"
echo "  • API Gateway: http://localhost:4000"
echo ""
echo "🪙 Azora Coin:"
echo "  • Max Supply: 1,000,000 AZR"
echo "  • Integration Service: http://localhost:4092"
echo ""
echo "📝 Next Steps:"
echo "  1. Deploy Azora Coin contract (see azora-coin/README.md)"
echo "  2. Update AZORA_COIN_CONTRACT in .env"
echo "  3. Review service logs: docker-compose logs -f"
echo ""
echo "🔍 Monitor services: docker-compose ps"
echo "======================================"
