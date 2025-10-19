#!/bin/bash

echo "📦 Fixing missing package.json files..."

# Services that need package.json
services=(
  "services/constitution-service"
  "services/founder-ledger-service"
  "services/learning-service"
  "services/memory-service"
  "services/notification-service"
  "services/sovereign-minter"
  "services/workflow-engine-service"
)

for service in "${services[@]}"; do
  if [ ! -f "$service/package.json" ]; then
    echo "Creating package.json for $service..."
    service_name=$(basename "$service")
    cat > "$service/package.json" << PACKAGE
{
  "name": "$service_name",
  "version": "1.0.0",
  "description": "Azora OS - $service_name",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
PACKAGE
    echo "✅ Created package.json for $service_name"
  fi
done

echo "✅ All services have package.json files!"
