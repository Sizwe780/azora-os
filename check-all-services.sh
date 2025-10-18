#!/bin/bash

echo "🔍 Comprehensive Service Check"
echo "=============================="
echo ""

# Check Docker containers
echo "📦 Docker Containers:"
docker-compose ps

echo ""
echo "🏥 Service Health:"

services=(
  "4001:AI Orchestrator"
  "4004:Auth Service"
  "4070:Onboarding"
  "4081:Compliance"
  "4091:HR AI Deputy"
  "4092:Azora Coin Integration"
  "5173:Main App"
)

for service in "${services[@]}"; do
  IFS=':' read -r port name <<< "$service"
  if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
    echo "✅ $name (Port $port)"
  else
    echo "❌ $name (Port $port)"
  fi
done

echo ""
echo "🪙 Azora Coin Status:"
if [ ! -z "$AZORA_COIN_CONTRACT" ] && [ "$AZORA_COIN_CONTRACT" != "0x0000000000000000000000000000000000000000" ]; then
  echo "✅ Contract deployed at: $AZORA_COIN_CONTRACT"
  echo "✅ Max supply: 1,000,000 AZR"
else
  echo "⚠️  Contract not deployed yet"
  echo "   Run: cd azora-coin && npx hardhat run scripts/deploy.js --network localhost"
fi

echo ""
echo "=============================="
