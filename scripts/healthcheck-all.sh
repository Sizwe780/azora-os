#!/bin/bash
for PORT in {3010..3109}; do
  STATUS=$(curl -s http://localhost:$PORT/health | grep -o '"status":"ok"')
  if [ "$STATUS" = '"status":"ok"' ]; then
    echo "Service on port $PORT is HEALTHY"
  else
    echo "Service on port $PORT is DOWN or UNHEALTHY"
  fi
done
