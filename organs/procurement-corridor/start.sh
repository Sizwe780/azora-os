#!/bin/bash

# 🚀 AZORA Procurement Corridor - Quick Start Script
# Phase 1: Sovereign Immune System

echo "🏛️  AZORA Procurement Corridor - Phase 1"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run from /services/procurement-corridor/"
  exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "✅ .env file created. Please edit it with your API keys."
  echo ""
  echo "Required variables:"
  echo "  - DATABASE_URL"
  echo "  - POLYGON_RPC_URL"
  echo "  - BLOCKCHAIN_PRIVATE_KEY"
  echo "  - OPENAI_API_KEY"
  echo "  - ANTHROPIC_API_KEY"
  echo "  - STRIPE_SECRET_KEY"
  echo ""
  read -p "Press Enter to continue after editing .env file..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Display service info
echo "✅ Environment ready!"
echo ""
echo "Service Configuration:"
echo "  Port: 5100"
echo "  Environment: development"
echo "  Phase: Sovereign Immune System - Phase 1"
echo ""

# Start the server
echo "🚀 Starting Procurement Corridor service..."
echo ""
npm run dev
