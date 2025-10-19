#!/bin/bash

echo "🏥 Checking all Azora OS services..."
echo ""

# Define services with their ports
declare -A services=(
  ["HR AI Deputy"]="4091"
  ["Auth Service"]="4004"
  ["Onboarding"]="4070"
  ["Compliance Dashboard"]="4086"
  ["API Gateway"]="4000"
  ["Orchestrator"]="4999"
  ["ARIA Assistant"]="5005"
  ["Azora Pay"]="5000"
  ["Frontend"]="5173"
)

healthy=0
total=0

for service in "${!services[@]}"; do
  port=${services[$service]}
  total=$((total + 1))
  
  echo -n "Checking $service (port $port)... "
  
  if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
    echo "✅ HEALTHY"
    healthy=$((healthy + 1))
  else
    echo "❌ DOWN"
  fi
done

echo ""
echo "Health Summary: $healthy/$total services healthy"

if [ "$healthy" -eq "$total" ]; then
  echo "✅ All services are operational!"
  exit 0
else
  echo "⚠️  Some services are down"
  exit 1
fi
