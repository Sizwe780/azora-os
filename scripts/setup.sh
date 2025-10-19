#!/bin/bash

echo "🚀 Azora OS Setup Script"
echo "------------------------"
echo "Following the Azora Constitution Article IX: Development Principles"

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Starting Docker..."
  sudo service docker start
  sleep 3
  if ! docker info > /dev/null 2>&1; then
    echo "❌ Failed to start Docker. Please start Docker manually and try again."
    exit 1
  fi
  echo "✅ Docker started successfully."
else
  echo "✅ Docker is running."
fi

# Check for environment files
echo "Checking environment files..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your settings."
  else
    echo "⚙️ Creating basic .env file..."
    cat > .env << 'ENVFILE'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/azora
REDIS_URL=redis://localhost:6379
JWT_SECRET=development_secret_change_in_production
ENVFILE
    echo "✅ Created basic .env file. Please update with your settings."
  fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✅ Dependencies installed."

# Check for database
echo "Checking database..."
if docker ps | grep -q "postgres"; then
  echo "✅ PostgreSQL is running."
else
  echo "⚙️ Starting PostgreSQL container..."
  docker run --name azora-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=azora -d -p 5432:5432 postgres:14
  echo "✅ PostgreSQL started."
fi

# Check for Redis
echo "Checking Redis..."
if docker ps | grep -q "redis"; then
  echo "✅ Redis is running."
else
  echo "⚙️ Starting Redis container..."
  docker run --name azora-redis -d -p 6379:6379 redis:alpine
  echo "✅ Redis started."
fi

echo "🔧 Running database migrations..."
npm run migrate || echo "❌ Migration command failed. Please check database configuration."

echo "🧪 Setting up test environment..."
npm run test:setup || echo "❌ Test setup failed. Continuing..."

echo "📋 Development environment setup complete!"
echo "To start development server: npm run dev"
echo "To run tests: npm test"
echo ""
echo "As per the Azora Constitution:"
echo "- No Mock Protocol: All implementations must be real and functional"
echo "- Completion Mandate: Development continues until everything works"
echo "- Advancement Imperative: Always seek improvements"
