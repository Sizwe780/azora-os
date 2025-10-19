#!/bin/bash

echo "🛑 Stopping all Azora OS services..."
echo ""

# Kill services by port
kill_by_port() {
  local port=$1
  local name=$2
  local pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    kill $pid 2>/dev/null
    echo "✅ Stopped $name (port $port)"
  fi
}

kill_by_port 4095 "Promotions Service"
kill_by_port 5000 "Azora Pay"
kill_by_port 4070 "Onboarding"
kill_by_port 4091 "HR AI Deputy"
kill_by_port 4004 "Auth Service"

# Also try by process name
pkill -f "node.*promotions" 2>/dev/null
pkill -f "node.*azora-pay" 2>/dev/null
pkill -f "node.*onboarding" 2>/dev/null
pkill -f "node.*hr-ai-deputy" 2>/dev/null
pkill -f "node.*auth" 2>/dev/null

echo ""
echo "✅ All Azora OS services stopped"
echo ""
