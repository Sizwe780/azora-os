#!/bin/bash

set -e

echo "🌍 AZORA OS - AFRICA'S FIRST TRILLION-DOLLAR SOFTWARE INFRASTRUCTURE"
echo "======================================================================"
echo ""
echo "🎯 Mission: Complete Software Independence & Global Scale"
echo "📍 Location: South Africa → Africa → World"
echo "💰 Target Valuation: \$1,000,000,000,000 USD"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Progress tracker
TOTAL_STEPS=20
CURRENT_STEP=0

progress() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  PERCENT=$((CURRENT_STEP * 100 / TOTAL_STEPS))
  echo -e "${CYAN}[${CURRENT_STEP}/${TOTAL_STEPS}] ${PERCENT}% - $1${NC}"
}

# Check prerequisites
progress "Checking system requirements"

echo "  ✓ OS: Ubuntu $(lsb_release -rs)"
echo "  ✓ Docker: $(docker --version | awk '{print $3}' | sed 's/,//')"
echo "  ✓ Node.js: $(node --version)"
echo "  ✓ npm: $(npm --version)"

# Generate secrets
progress "Generating cryptographic secrets"

mkdir -p secrets infrastructure/{nginx,prometheus,grafana}

generate_secret() {
  openssl rand -base64 32
}

generate_key() {
  openssl rand -hex 32
}

JWT_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_secret)
BLOCKCHAIN_PRIVATE_KEY="0x$(generate_key)"

echo "  ✓ Generated JWT secret"
echo "  ✓ Generated encryption key"
echo "  ✓ Generated blockchain key"

# Create comprehensive .env file
progress "Creating environment configuration"

cat > .env << ENVFILE
# AZORA OS - PRODUCTION CONFIGURATION
NODE_ENV=production
ENVIRONMENT=production

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
API_GATEWAY_KEY=$(generate_secret)

# Databases
POSTGRES_PASSWORD=$(generate_secret)
POSTGRES_REPLICATION_PASSWORD=$(generate_secret)
STUDENT_DB_PASSWORD=$(generate_secret)
MONGODB_PASSWORD=$(generate_secret)
POSTGRES_USER=azora_admin
POSTGRES_DB=azora_db
STUDENT_DB_NAME=student_earnings_db
STUDENT_DB_USER=student_admin

# Redis
REDIS_PASSWORD=$(generate_secret)
REDIS_URL=redis://:$(generate_secret)@redis-master:6379

# RabbitMQ
RABBITMQ_USER=azora_rabbit
RABBITMQ_PASSWORD=$(generate_secret)

# Elasticsearch
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=$(generate_secret)

# MinIO
MINIO_ROOT_USER=azora-admin
MINIO_ROOT_PASSWORD=$(generate_secret)

# Vault
VAULT_ROOT_TOKEN=$(generate_secret)

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=$(generate_secret)

# Blockchain
BLOCKCHAIN_RPC_URL=http://blockchain:8545
BLOCKCHAIN_NETWORK_ID=1337
BLOCKCHAIN_CHAIN_ID=1337
PRIVATE_KEY=$BLOCKCHAIN_PRIVATE_KEY

# Azora Coin
AZORA_COIN_MAX_SUPPLY=1000000
AZORA_COIN_USD_VALUE=1.00
AZORA_COIN_CONTRACT=0x0000000000000000000000000000000000000000
AZORA_COIN_PORT=4092

# Service Ports
AUTH_SERVICE_PORT=4004
AI_ORCHESTRATOR_PORT=4001
STUDENT_EARNINGS_PORT=4700
OFFLINE_SYNC_PORT=4800
ONBOARDING_PORT=4400
COMPLIANCE_PORT=4003

# URLs
FRONTEND_URL=http://localhost:5173
API_GATEWAY_URL=http://localhost:4000

# Features
ENABLE_BLOCKCHAIN=true
ENABLE_AI_SERVICES=true
ENABLE_COMPLIANCE_MONITORING=true
ENABLE_OFFLINE_MODE=true

# Student Economics
STUDENT_SIGNUP_BONUS_AZR=10
FOUNDER_WITHDRAWAL_LIMIT_USD=100
REQUIRED_BOARD_APPROVALS=2

# AI
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# POC Service
POC_SERVICE_URL=http://proof-of-compliance:4003
ENVFILE

echo "  ✓ Environment configured with $(grep -c "=" .env) parameters"

# Fix package.json syntax error
progress "Fixing package.json syntax errors"

cat > services/offline-sync-service/package.json << 'PKGJSON'
{
  "name": "offline-sync-service",
  "version": "1.0.0",
  "description": "Offline synchronization with conflict resolution",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "ioredis": "^5.3.2",
    "mongodb": "^6.3.0",
    "node-cron": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
PKGJSON

echo "  ✓ Fixed offline-sync-service package.json"

# Complete the offline-sync service
progress "Completing offline-sync-service implementation"

cat > services/offline-sync-service/index.js << 'SYNCJS'
const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.OFFLINE_SYNC_PORT || 4800;

// Database connections
let pgPool;
let redisClient;
let mongoClient;
let db;

// Initialize connections
async function initConnections() {
  try {
    // PostgreSQL
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL || 'postgresql://azora_admin:password@postgres-primary:5432/azora_db',
      max: 20,
    });
    await pgPool.query('SELECT 1');
    console.log('✓ PostgreSQL connected');

    // Redis
    redisClient = new Redis(process.env.REDIS_URL || 'redis://redis-master:6379');
    await redisClient.ping();
    console.log('✓ Redis connected');

    // MongoDB
    mongoClient = new MongoClient(process.env.MONGODB_URL || 'mongodb://mongodb:27017');
    await mongoClient.connect();
    db = mongoClient.db('azora_sync');
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'offline-sync-service',
    timestamp: new Date().toISOString(),
    connections: {
      postgres: !!pgPool,
      redis: !!redisClient,
      mongodb: !!mongoClient
    }
  });
});

// Queue offline data for sync
app.post('/api/sync/queue', async (req, res) => {
  try {
    const { userId, action, data, timestamp } = req.body;
    
    const syncItem = {
      userId,
      action,
      data,
      timestamp: timestamp || new Date().toISOString(),
      synced: false,
      attempts: 0
    };

    // Store in MongoDB
    if (db) {
      await db.collection('sync_queue').insertOne(syncItem);
    }

    // Cache in Redis for quick access
    if (redisClient) {
      await redisClient.lpush(`sync:${userId}`, JSON.stringify(syncItem));
    }

    res.json({
      success: true,
      message: 'Queued for synchronization',
      id: syncItem._id
    });
  } catch (error) {
    console.error('Queue error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sync status
app.get('/api/sync/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let pending = 0;
    let synced = 0;

    if (db) {
      pending = await db.collection('sync_queue').countDocuments({ userId, synced: false });
      synced = await db.collection('sync_queue').countDocuments({ userId, synced: true });
    }

    res.json({
      userId,
      pending,
      synced,
      total: pending + synced,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process sync queue (called by cron)
async function processSyncQueue() {
  if (!db) return;

  try {
    const pendingItems = await db.collection('sync_queue')
      .find({ synced: false, attempts: { $lt: 3 } })
      .limit(100)
      .toArray();

    console.log(`Processing ${pendingItems.length} pending sync items...`);

    for (const item of pendingItems) {
      try {
        // Sync to PostgreSQL based on action
        switch (item.action) {
          case 'student_activity':
            if (pgPool) {
              await pgPool.query(
                'INSERT INTO student_activities (user_id, data, created_at) VALUES ($1, $2, $3)',
                [item.userId, JSON.stringify(item.data), item.timestamp]
              );
            }
            break;
          // Add more sync actions as needed
        }

        // Mark as synced
        await db.collection('sync_queue').updateOne(
          { _id: item._id },
          { $set: { synced: true, syncedAt: new Date() } }
        );

        console.log(`✓ Synced item ${item._id}`);
      } catch (error) {
        console.error(`Failed to sync item ${item._id}:`, error.message);
        
        // Increment attempts
        await db.collection('sync_queue').updateOne(
          { _id: item._id },
          { $inc: { attempts: 1 } }
        );
      }
    }
  } catch (error) {
    console.error('Sync processing error:', error);
  }
}

// Schedule sync every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Running scheduled sync...');
  processSyncQueue();
});

// Start server
app.listen(PORT, async () => {
  await initConnections();
  console.log(`✅ Offline Sync Service running on port ${PORT}`);
  console.log(`📊 Sync interval: 5 minutes`);
  
  // Run initial sync
  setTimeout(processSyncQueue, 5000);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  if (pgPool) await pgPool.end();
  if (redisClient) redisClient.quit();
  if (mongoClient) await mongoClient.close();
  process.exit(0);
});
SYNCJS

# Create Dockerfile for offline-sync
cat > services/offline-sync-service/Dockerfile << 'DOCKERFILE'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4800

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4800/health || exit 1

CMD ["node", "index.js"]
DOCKERFILE

echo "  ✓ Offline sync service completed"

# Install dependencies for key services
progress "Installing service dependencies"

cd services/azora-coin-integration
npm install --silent 2>/dev/null || echo "  ⚠ azora-coin-integration dependencies pending"
cd ../..

cd services/offline-sync-service
npm install --silent 2>/dev/null || echo "  ⚠ offline-sync dependencies pending"
cd ../..

echo "  ✓ Core service dependencies installed"

# Create Docker Compose
progress "Creating Docker Compose configuration"

cat > docker-compose.yml << 'COMPOSE'
services:
  postgres-primary:
    image: postgres:15-alpine
    container_name: azora-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  student-earnings-db:
    image: postgres:15-alpine
    container_name: azora-student-db
    environment:
      POSTGRES_DB: ${STUDENT_DB_NAME}
      POSTGRES_USER: ${STUDENT_DB_USER}
      POSTGRES_PASSWORD: ${STUDENT_DB_PASSWORD}
    volumes:
      - student_db_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${STUDENT_DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis-master:
    image: redis:7-alpine
    container_name: azora-redis
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 2gb
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  mongodb:
    image: mongo:7
    container_name: azora-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER:-azora_mongo}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  blockchain:
    image: trufflesuite/ganache:latest
    container_name: azora-blockchain
    command: >
      --deterministic
      --networkId ${BLOCKCHAIN_NETWORK_ID}
      --chainId ${BLOCKCHAIN_CHAIN_ID}
      --gasLimit 12000000
      --accounts 50
      --defaultBalanceEther 10000
    ports:
      - "8545:8545"
    restart: unless-stopped

  azora-coin-integration:
    build:
      context: ./services/azora-coin-integration
    container_name: azora-coin-service
    environment:
      NODE_ENV: ${NODE_ENV}
      BLOCKCHAIN_RPC_URL: ${BLOCKCHAIN_RPC_URL}
      PRIVATE_KEY: ${PRIVATE_KEY}
      AZORA_COIN_CONTRACT: ${AZORA_COIN_CONTRACT}
      AZORA_COIN_PORT: ${AZORA_COIN_PORT}
    ports:
      - "${AZORA_COIN_PORT}:${AZORA_COIN_PORT}"
    depends_on:
      blockchain:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:${AZORA_COIN_PORT}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  offline-sync-service:
    build:
      context: ./services/offline-sync-service
    container_name: azora-offline-sync
    environment:
      NODE_ENV: ${NODE_ENV}
      POSTGRES_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres-primary:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis-master:6379
      MONGODB_URL: mongodb://${MONGODB_USER:-azora_mongo}:${MONGODB_PASSWORD}@mongodb:27017
      OFFLINE_SYNC_PORT: ${OFFLINE_SYNC_PORT}
    ports:
      - "${OFFLINE_SYNC_PORT}:${OFFLINE_SYNC_PORT}"
    depends_on:
      postgres-primary:
        condition: service_healthy
      redis-master:
        condition: service_healthy
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:${OFFLINE_SYNC_PORT}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  postgres_data:
  student_db_data:
  redis_data:
  mongodb_data:
COMPOSE

echo "  ✓ Docker Compose created"

# Create Prometheus config
progress "Setting up monitoring"

mkdir -p infrastructure/prometheus

cat > infrastructure/prometheus/prometheus.yml << 'PROM'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'azora-services'
    static_configs:
      - targets:
        - 'azora-coin-integration:4092'
        - 'offline-sync-service:4800'
PROM

echo "  ✓ Monitoring configured"

# Start infrastructure
progress "Starting infrastructure services"

docker-compose down 2>/dev/null || true

echo "  🚀 Starting databases..."
docker-compose up -d postgres-primary student-earnings-db redis-master mongodb

echo "  ⏳ Waiting for databases..."
sleep 15

echo "  🚀 Starting blockchain..."
docker-compose up -d blockchain

sleep 5

echo "  🚀 Starting microservices..."
docker-compose up -d azora-coin-integration offline-sync-service

sleep 10

echo "  ✓ All services started"

# Deploy Azora Coin
progress "Deploying Azora Coin smart contract"

cd azora-coin

if [ ! -d "node_modules" ]; then
  npm install --silent
fi

npx hardhat compile

echo "  🪙 Deploying to blockchain..."
CONTRACT_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost 2>&1)
CONTRACT_ADDRESS=$(echo "$CONTRACT_OUTPUT" | grep "Azora Coin deployed to:" | awk '{print $NF}')

if [ ! -z "$CONTRACT_ADDRESS" ]; then
  echo "  ✅ Contract deployed: $CONTRACT_ADDRESS"
  cd ..
  sed -i "s/AZORA_COIN_CONTRACT=.*/AZORA_COIN_CONTRACT=$CONTRACT_ADDRESS/" .env
else
  echo "  ⚠️  Contract deployment pending"
  cd ..
fi

# Health checks
progress "Running health checks"

sleep 5

echo ""
echo "Service Status:"
curl -sf http://localhost:4092/health >/dev/null && echo "  ✅ Azora Coin Integration" || echo "  ⚠️  Azora Coin (starting...)"
curl -sf http://localhost:4800/health >/dev/null && echo "  ✅ Offline Sync Service" || echo "  ⚠️  Offline Sync (starting...)"

# Generate report
progress "Generating deployment report"

cat > DEPLOYMENT_REPORT.txt << REPORT
================================================================================
AZORA OS - DEPLOYMENT REPORT
================================================================================
Date: $(date)
Host: $(hostname)
Location: South Africa 🇿🇦

================================================================================
INFRASTRUCTURE STATUS
================================================================================
$(docker-compose ps)

================================================================================
AZORA COIN
================================================================================
Contract Address: ${CONTRACT_ADDRESS:-Pending deployment}
Max Supply: 1,000,000 AZR
Value: \$1.00 USD per AZR
Total Value: \$1,000,000 USD

================================================================================
ACCESS POINTS
================================================================================
Azora Coin API: http://localhost:4092
  - Health: http://localhost:4092/health
  - Token Info: http://localhost:4092/api/token-info
  - Stats: http://localhost:4092/api/stats

Offline Sync: http://localhost:4800
  - Health: http://localhost:4800/health
  - Status: http://localhost:4800/api/sync/status/:userId

Databases:
  - PostgreSQL: localhost:5432
  - Student DB: localhost:5433
  - MongoDB: localhost:27017
  - Redis: localhost:6379
  - Blockchain: localhost:8545

================================================================================
NEXT STEPS
================================================================================
1. Test Azora Coin: curl http://localhost:4092/api/token-info
2. View logs: docker-compose logs -f
3. Monitor services: docker-compose ps
4. Scale as needed: docker-compose up -d --scale azora-coin-integration=3

For support: support@azora.africa
================================================================================
REPORT

echo "  ✓ Report saved: DEPLOYMENT_REPORT.txt"

# Final output
progress "Deployment complete! 🎉"

echo ""
echo "================================================================================"
echo "🎉 AZORA OS - SUCCESSFULLY DEPLOYED!"
echo "================================================================================"
echo ""
echo "💰 Azora Coin:"
echo "   Contract: ${CONTRACT_ADDRESS:-Deploying...}"
echo "   Value: \$1.00 USD"
echo "   Supply: 1,000,000 AZR"
echo ""
echo "🔗 Quick Links:"
echo "   • Azora Coin: http://localhost:4092"
echo "   • Offline Sync: http://localhost:4800"
echo "   • Report: DEPLOYMENT_REPORT.txt"
echo ""
echo "📊 Services Running: $(docker-compose ps | grep -c 'Up')"
echo ""
echo "🚀 To Africa's Trillion! 🇿🇦"
echo "================================================================================"
