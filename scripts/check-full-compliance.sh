#!/bin/bash
echo "Checking Azora Constitution compliance..."

TOTAL_SUPPLY=$(curl -s http://localhost:8545 | jq '.result' || echo "0")
if [ "$TOTAL_SUPPLY" == "1000000000000000000000000" ]; then
  echo "✅ Total supply correct"
else
  echo "❌ Total supply incorrect"
fi

echo "Compliance check complete."
