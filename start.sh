#!/bin/bash

echo "�� Starting Azora OS..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "⚠️ .env file not found. Creating from .env.production..."
  cp .env.production .env
  echo "✅ .env file created. Please review it before proceeding."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose up -d

# Start development server
echo "🔧 Starting development server..."
npm run dev
