#!/bin/bash
echo "Checking service health..."

# Add a list of expected services and ports
declare -A services=(
  ["HR AI Deputy"]="4091"
  ["Onboarding Service"]="4070"
  ["Security Core"]="4022"
  ["Conversation Service"]="4011"
  ["Autonomous Operations"]="4009"
  ["Compliance Dashboard"]="4086"
)

for service in "${!services[@]}"; do
  port=${services[$service]}
  echo "Checking $service on port $port..."
  curl -s http://localhost:$port/health || echo "Service $service not responding"
done
