#!/bin/bash

# Azora Enterprise Portal Deployment Script
# Deploys enterprise.azora.world with compliance dashboard API

set -e

echo "🚀 Starting Azora Enterprise Portal Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to enterprise-ui directory
cd "$(dirname "$0")"

print_status "Building and deploying enterprise portal..."

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down || true

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Check if compliance dashboard is healthy
print_status "Checking compliance dashboard health..."
if curl -f http://localhost:4000/api/health &> /dev/null; then
    print_success "Compliance Dashboard is healthy"
else
    print_error "Compliance Dashboard health check failed"
    docker-compose logs compliance-dashboard
    exit 1
fi

# Check if enterprise UI is accessible
print_status "Checking enterprise UI..."
if curl -f http://localhost &> /dev/null; then
    print_success "Enterprise UI is accessible"
else
    print_error "Enterprise UI is not accessible"
    docker-compose logs enterprise-ui
    exit 1
fi

print_success "🎉 Enterprise Portal deployment completed successfully!"
print_status "🌐 Enterprise Portal: http://localhost"
print_status "📊 Compliance API: http://localhost:4000/api/compliance/dashboard"
print_status ""
print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
print_status ""
print_warning "Note: Configure your domain (enterprise.azora.world) to point to this server"
print_warning "Update nginx configuration with proper SSL certificates for production"