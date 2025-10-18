#!/bin/bash

# Azora OS Start Script
# Follows the Azora Constitution Article IX: Development Principles

echo "🚀 Starting Azora OS..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Ensure .env files exist
if [ ! -f ".env" ]; then
  echo "ℹ️ Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️ Please update the .env file with your settings!"
fi

# Check for azora-coin .env file
if [ ! -f "azora-coin/.env" ]; then
  echo "ℹ️ Creating azora-coin/.env file from azora-coin/.env.example..."
  cp azora-coin/.env.example azora-coin/.env
  echo "⚠️ Please update the azora-coin/.env file with your blockchain settings!"
fi

# Install dependencies in the azora-coin directory
echo "📦 Installing Azora Coin dependencies..."
cd azora-coin
npm install
npx hardhat compile
cd ..

# Install dependencies in the main app directory
echo "📦 Installing Main App dependencies..."
cd apps/main-app
npm install
cd ../..

# Build and run services with Docker Compose
echo "🐳 Building and starting services..."
docker-compose build
docker-compose up -d

# Report on services status
echo "🔍 Checking service status..."
docker ps

# Start development server for main app
echo "🚀 Starting Main App development server..."
cd apps/main-app
npm run dev &
APP_PID=$!

# Print helpful information
echo ""
echo "✅ Azora OS is now running!"
echo "📱 Main App: http://localhost:5173"
echo "�� Azora Coin contract deployed"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
trap "kill $APP_PID; docker-compose down; echo '🛑 Azora OS stopped.'" INT TERM
wait
