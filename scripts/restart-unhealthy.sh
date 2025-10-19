#!/bin/bash
# Restart containers if healthcheck fails (for Docker Compose local dev)
for SERVICE in $(docker-compose ps --services); do
  STATUS=$(docker inspect --format='{{json .State.Health.Status}}' $(docker-compose ps -q $SERVICE) 2>/dev/null)
  if [[ "$STATUS" != "\"healthy\"" ]]; then
    echo "Restarting $SERVICE (status: $STATUS)"
    docker-compose restart $SERVICE
  fi
done
