#!/bin/bash

# Azora OS Complete Ecosystem Deployment Script
# This script deploys the complete Azora OS system including all services, apps, and compliance frameworks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="azora-os"
KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config}"
DEPLOYMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/infra/kubernetes"
DOCKER_COMPOSE_FILE="docker-compose.yml"
COMPLIANCE_COMPOSE_FILE="docker-compose.compliance.yml"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed. Please install it first."
        exit 1
    fi

    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed. Please install it first."
        exit 1
    fi

    # Check if kubectl is installed (optional for Kubernetes deployment)
    if command -v kubectl &> /dev/null; then
        log_info "kubectl is available for Kubernetes deployments"
    else
        log_warning "kubectl not available - Kubernetes deployment will not work"
    fi

    log_success "Prerequisites check passed"
}

# Build and start full system with docker-compose
deploy_full_system() {
    log_info "Deploying complete Azora OS system with docker-compose..."

    # Build and start all services
    log_info "Building and starting all services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --build

    # Wait for core services to be healthy
    log_info "Waiting for core services to be healthy..."
    wait_for_service "postgres" 5432
    wait_for_service "redis" 6379
    wait_for_service "ai-orchestrator" 4001

    log_success "Full system deployment completed"
}

# Deploy compliance services only
deploy_compliance_system() {
    log_info "Deploying compliance monitoring system..."

    # Build and start compliance services
    docker-compose -f $COMPLIANCE_COMPOSE_FILE up -d --build

    # Wait for compliance services
    log_info "Waiting for compliance services..."
    wait_for_service "gdpr-compliance" 4080
    wait_for_service "south-african-compliance" 4090

    log_success "Compliance system deployment completed"
}

# Wait for a service to be healthy
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    log_info "Waiting for $service_name on port $port..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f $DOCKER_COMPOSE_FILE ps $service_name | grep -q "Up"; then
            if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
                log_success "$service_name is healthy"
                return 0
            fi
        fi
        sleep 5
        ((attempt++))
    done

    log_warning "$service_name did not become healthy within timeout"
}

# Deploy to Kubernetes (legacy)
deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."

    # Create namespace
    kubectl apply -f "$DEPLOYMENT_DIR/namespace.yaml" 2>/dev/null || true

    # Apply configurations
    local manifests=(
        "configmap.yaml"
        "services.yaml"
        "deployments.yaml"
    )

    for manifest in "${manifests[@]}"; do
        if [ -f "$DEPLOYMENT_DIR/$manifest" ]; then
            log_info "Applying $manifest..."
            kubectl apply -f "$DEPLOYMENT_DIR/$manifest"
        fi
    done

    log_success "Kubernetes deployment completed"
}

# Run comprehensive health checks
run_health_checks() {
    log_info "Running comprehensive health checks..."

    local all_healthy=true

    # Check databases
    check_service "PostgreSQL" "http://localhost:5432" || all_healthy=false
    check_service "Redis" "http://localhost:6379" || all_healthy=false

    # Check core AI services
    check_service "AI Orchestrator" "http://localhost:4001/health" || all_healthy=false
    check_service "Neural Context Engine" "http://localhost:4005/health" || all_healthy=false

    # Check business services
    check_service "Assistant" "http://localhost:4000/health" || all_healthy=false
    check_service "Auth Service" "http://localhost:4004/health" || all_healthy=false
    check_service "Store Service" "http://localhost:4002/health" || all_healthy=false

    # Check quantum services
    check_service "Quantum Microservice" "http://localhost:5000/health" || all_healthy=false
    check_service "Shield Service" "http://localhost:5001/health" || all_healthy=false

    # Check compliance services
    check_service "GDPR Compliance" "http://localhost:4080/health" || all_healthy=false
    check_service "South African Compliance" "http://localhost:4090/health" || all_healthy=false

    # Check frontend apps
    check_service "Main App" "http://localhost:5175" || all_healthy=false
    check_service "Security Dashboard" "http://localhost:5176" || all_healthy=false
    check_service "Driver PWA" "http://localhost:3001" || all_healthy=false
    check_service "Staff PWA" "http://localhost:5177" || all_healthy=false

    if [ "$all_healthy" = true ]; then
        log_success "All services are healthy!"
        return 0
    else
        log_error "Some services are not healthy"
        return 1
    fi
}

# Check individual service
check_service() {
    local service_name=$1
    local url=$2

    echo -n "Checking $service_name... "
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Show deployment information
show_deployment_info() {
    log_success "Azora OS Complete Ecosystem Deployment Successful!"
    echo
    echo "🌟 SYSTEM OVERVIEW:"
    echo "=================="
    echo
    echo "🗄️  DATABASES:"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • Redis: localhost:6379"
    echo
    echo "🤖 AI & ORCHESTRATION:"
    echo "   • AI Orchestrator: http://localhost:4001"
    echo "   • Neural Context Engine: http://localhost:4005"
    echo "   • AI Evolution Engine: http://localhost:4060"
    echo
    echo "💼 BUSINESS SERVICES:"
    echo "   • Assistant: http://localhost:4000"
    echo "   • Knowledge Base: http://localhost:4003"
    echo "   • Auth Service: http://localhost:4004"
    echo "   • Store: http://localhost:4002"
    echo
    echo "⚛️  QUANTUM SERVICES:"
    echo "   • Cold Chain Quantum: http://localhost:4007"
    echo "   • Universal Safety: http://localhost:4008"
    echo "   • Autonomous Operations: http://localhost:4009"
    echo "   • Quantum Tracking: http://localhost:4040"
    echo "   • Quantum Deep Mind: http://localhost:4050"
    echo
    echo "🛡️  SECURITY & COMPLIANCE:"
    echo "   • Security Core: http://localhost:4022"
    echo "   • Security Camera: http://localhost:4020"
    echo "   • Security POS: http://localhost:4021"
    echo "   • GDPR Compliance: http://localhost:4080"
    echo "   • South African Compliance: http://localhost:4090"
    echo
    echo "📱 FRONTEND APPLICATIONS:"
    echo "   • Main App: http://localhost:5175"
    echo "   • Security Dashboard: http://localhost:5176"
    echo "   • Driver PWA: http://localhost:3001"
    echo "   • Staff PWA: http://localhost:5177"
    echo
    echo "🔧 SPECIALIZED SERVICES:"
    echo "   • Quantum Microservice: http://localhost:5000"
    echo "   • Shield Service: http://localhost:5001"
    echo "   • Backend API: http://localhost:3000"
    echo
    echo "📋 MANAGEMENT COMMANDS:"
    echo "======================="
    echo "• View logs: docker-compose logs -f [service-name]"
    echo "• Stop all: docker-compose down"
    echo "• Restart service: docker-compose restart [service-name]"
    echo "• Scale service: docker-compose up -d --scale [service-name]=N"
    echo
    echo "🧪 TESTING:"
    echo "==========="
    echo "• Run integration tests: ./integration-test.sh"
    echo "• Check service health: ./check-services.sh"
    echo
    echo "🎯 COMPLIANCE COVERAGE:"
    echo "======================"
    echo "• GDPR (EU) - General Data Protection Regulation"
    echo "• HIPAA (US) - Health Insurance Portability and Accountability Act"
    echo "• SOX (US) - Sarbanes-Oxley Act"
    echo "• CCPA (US-CA) - California Consumer Privacy Act"
    echo "• PIPEDA (CA) - Personal Information Protection and Electronic Documents Act"
    echo "• LGPD (BR) - Lei Geral de Proteção de Dados"
    echo "• South African Compliance (ZA):"
    echo "  - POPIA - Protection of Personal Information Act"
    echo "  - ECT Act - Electronic Communications and Transactions Act"
    echo "  - CPA - Consumer Protection Act"
    echo "  - NCA - National Credit Act"
    echo "  - FICA - Financial Intelligence Centre Act"
    echo "  - LRA - Labour Relations Act"
    echo "  - BCEA - Basic Conditions of Employment Act"
    echo
    echo "🚀 SYSTEM STATUS: FULLY OPERATIONAL"
    echo "==================================="
}

# Stop all services
stop_system() {
    log_info "Stopping all services..."
    docker-compose -f $DOCKER_COMPOSE_FILE down
    docker-compose -f $COMPLIANCE_COMPOSE_FILE down
    log_success "All services stopped"
}

# Main deployment function
main() {
    log_info "Starting Azora OS Complete Ecosystem Deployment"

    check_prerequisites
    deploy_full_system
    deploy_compliance_system

    if run_health_checks; then
        show_deployment_info
        log_success "Azora OS Complete Ecosystem deployment completed successfully!"
    else
        log_error "Some services failed health checks. Check logs for details."
        docker-compose -f $DOCKER_COMPOSE_FILE logs
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "full")
        check_prerequisites
        deploy_full_system
        run_health_checks
        show_deployment_info
        ;;
    "compliance")
        check_prerequisites
        deploy_compliance_system
        run_health_checks
        ;;
    "k8s")
        deploy_to_kubernetes
        ;;
    "health")
        run_health_checks
        ;;
    "stop")
        stop_system
        ;;
    "logs")
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f "${2:-}"
        ;;
    "restart")
        if [ -n "$2" ]; then
            docker-compose -f $DOCKER_COMPOSE_FILE restart "$2"
        else
            docker-compose -f $DOCKER_COMPOSE_FILE restart
        fi
        ;;
    *)
        main
        ;;
esac