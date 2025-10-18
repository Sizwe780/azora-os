#!/bin/bash

echo "🔄 Deploying Distributed Tracing & Recovery System"
echo "=================================================="
echo ""

# Initialize database schema
echo "📊 Initializing database schema..."
cat infrastructure/tracing-schema.sql >> infrastructure/database-schema.sql

# Install dependencies
echo "📦 Installing dependencies..."
npm install --save ioredis pg express axios node-cron uuid

# Start services
echo "🚀 Starting tracing and recovery services..."
docker-compose -f docker-compose.autonomous.yml up -d tracing-recovery snapshot-scheduler

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 10

# Test tracing service
echo ""
echo "🧪 Testing tracing service..."
curl -s http://localhost:4998/health | jq .

# Test snapshot creation
echo ""
echo "📸 Testing snapshot creation..."
curl -s -X POST http://localhost:4998/api/snapshot/auth | jq .

# Test recovery analysis
echo ""
echo "🔍 Testing failure analysis..."
curl -s -X POST http://localhost:4998/api/analyze-failure/auth | jq .

echo ""
echo "✅ Distributed Tracing & Recovery System deployed!"
echo ""
echo "🌐 Access Points:"
echo "   • Tracing API: http://localhost:4998"
echo "   • Record trace: POST /api/trace"
echo "   • Analyze failure: POST /api/analyze-failure/:service"
echo "   • Execute recovery: POST /api/recover/:service"
echo ""
echo "📊 Features:"
echo "   ✅ Automatic trace collection from all services"
echo "   ✅ Neighbor awareness tracking"
echo "   ✅ Periodic state snapshots (every 15 min)"
echo "   ✅ AI-powered failure analysis"
echo "   ✅ Automatic recovery execution"
echo "   ✅ Interaction pattern learning"
echo ""
