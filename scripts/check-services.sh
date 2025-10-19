#!/bin/bash
PORTS=({3010..3109})
for PORT in "${PORTS[@]}"; do
  STATUS=$(curl -s http://localhost:$PORT/health | grep ok)
  if [ -z "$STATUS" ]; then
    echo "Service on port $PORT is DOWN"
  else
    echo "Service on port $PORT is UP"
  fi
done
