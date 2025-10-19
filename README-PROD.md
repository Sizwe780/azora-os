# Azora OS Production Launch

## Launch all services & UI in production mode:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

## Check health of all services:
bash scripts/healthcheck-all.sh

## Access the app:
http://localhost
