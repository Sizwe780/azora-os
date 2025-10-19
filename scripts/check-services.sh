#!/bin/bash

echo "🔍 Azora OS Service Integration Check"
echo "------------------------------------"

# Check for docker-compose
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ docker-compose.yml not found. Cannot check services."
  exit 1
fi

# Bring up services
echo "🚀 Starting all services with docker-compose..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to initialize (30 seconds)..."
sleep 30

# Check each service
echo "🔍 Checking service health..."

# Extract service names and ports from docker-compose.yml
services=$(grep -E "^ {2}[a-zA-Z0-9_-]+:" docker-compose.yml | sed 's/://' | tr -d ' ')

for service in $services; do
  # Try to get the port mapping
  port=$(grep -A 20 "$service:" docker-compose.yml | grep -E "published:" | head -1 | awk '{print $2}')
  
  if [ -z "$port" ]; then
    echo "⚠️ Could not determine port for $service. Skipping health check."
    continue
  fi
  
  echo "🔍 Checking $service on port $port..."
  
  # Try different health check endpoints
  for endpoint in health healthz status ping; do
    if curl -s "http://localhost:$port/$endpoint" > /dev/null 2>&1; then
      echo "✅ $service is healthy ($endpoint endpoint responded)"
      break
    fi
  done
  
  # If none of the endpoints responded, mark as potentially unhealthy
  if [ $? -ne 0 ]; then
    echo "⚠️ $service may not be healthy. Could not reach health endpoints."
  fi
done

echo "📋 Service check complete!"
