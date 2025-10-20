#!/bin/bash

# Azora OS Monitoring Setup Script
# This script sets up Prometheus, Grafana, and AlertManager for comprehensive monitoring

set -e

echo "🚀 Setting up Azora OS Monitoring Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating monitoring directories..."
mkdir -p infra/monitoring/grafana/{provisioning/datasources,provisioning/dashboards,dashboards}
mkdir -p infra/monitoring/logstash

# Start monitoring stack
print_status "Starting monitoring stack..."
docker-compose -f docker/docker-compose.monitoring.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker/docker-compose.monitoring.yml ps | grep -q "Up"; then
    print_status "✅ Monitoring stack started successfully!"
    echo ""
    echo "📊 Access your monitoring dashboards:"
    echo "  • Prometheus:     http://localhost:9090"
    echo "  • Grafana:        http://localhost:3001 (admin/admin)"
    echo "  • AlertManager:   http://localhost:9093"
    echo "  • Node Exporter:  http://localhost:9100"
    echo ""
    echo "📈 Available Dashboards:"
    echo "  • Azora OS Overview: Main dashboard with all services"
    echo ""
    echo "🔧 Monitored Services:"
    echo "  • API Gateway (port 3000)"
    echo "  • Email Service (port 3000)"
    echo "  • Messaging Service (port 4200)"
    echo "  • Chamber of Ghosts (port 3005)"
    echo "  • AI/ML Engine (port 4055)"
    echo "  • AI Orchestrator (port 4001)"
    echo "  • And many more..."
    echo ""
    print_warning "Remember to update alertmanager.yml with your actual email/Slack configurations!"
else
    print_error "Failed to start monitoring stack. Check docker-compose logs:"
    echo "docker-compose -f docker/docker-compose.monitoring.yml logs"
    exit 1
fi

print_status "🎉 Monitoring setup complete!"
echo ""
echo "💡 Next steps:"
echo "  1. Configure alert notifications in alertmanager.yml"
echo "  2. Set up additional Grafana dashboards for specific services"
echo "  3. Configure alerting rules in Prometheus"
echo "  4. Set up log aggregation with ELK stack if needed"