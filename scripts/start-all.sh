#!/bin/bash

echo "Starting Azora Buildspaces..."

# Start Orchestrator
echo "Starting Orchestrator on port 3001..."
(cd "services/buildspaces-orchestrator" && npm start) &

# Start Python Bridge
echo "Starting Azora Bridge on port 3010..."
(cd "apps/azrome/native-host" && python azora-bridge.py) &

# Start Frontend
echo "Starting Frontend on port 3000..."
(cd "apps/azora-buildspaces" && npm run dev) &

echo "Services started in background. Logs will appear here."
wait
