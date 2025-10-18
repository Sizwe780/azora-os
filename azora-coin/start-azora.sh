#!/bin/bash
echo "🚀 Starting Azora OS..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "ℹ️ Creating .env file from .env.production..."
  cp .env.production .env
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Ensure compliance-ui has necessary config
if [ ! -d "compliance-ui/node_modules" ]; then
  echo "📦 Installing Compliance UI dependencies..."
  cd compliance-ui
  npm install
  cd ..
fi

# Ensure main-app has necessary config
if [ ! -d "apps/main-app/node_modules" ]; then
  echo "📦 Installing Main App dependencies..."
  cd apps/main-app
  npm install
  cd ../..
fi

# Build and run services with Docker Compose
echo "🐳 Building and starting services..."
docker-compose build
docker-compose up -d

# Check service health
echo "🏥 Checking service health..."
sleep 10  # Give services time to start

# Check specific services (add more as needed)
services=(
  "http://localhost:4070/health"  # Onboarding Service
  "http://localhost:4011/health"  # Conversation Service
  "http://localhost:4091/health"  # HR AI Deputy
  "http://localhost:4082/health"  # SOX Compliance (might not exist)
)

for url in "${services[@]}"; do
  echo "Checking $url..."
  curl -s "$url" || echo "⚠️ Service at $url not responding"
done

echo "🚀 Starting development server..."
npm run dev

echo "✅ Azora OS startup completed!"
