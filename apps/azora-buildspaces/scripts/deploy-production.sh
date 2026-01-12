#!/bin/bash
# Production Deployment Script for Azora Buildspaces

set -e

echo "🚀 Starting Azora Buildspaces Production Deployment"

# Configuration
NAMESPACE="buildspaces"
MONITORING_NAMESPACE="monitoring"
IMAGE_TAG=${1:-"latest"}
REGISTRY=${REGISTRY:-"azora"}

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

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if the cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_status "Building Docker image..."
docker build -t ${REGISTRY}/buildspaces:${IMAGE_TAG} .

print_status "Pushing Docker image to registry..."
docker push ${REGISTRY}/buildspaces:${IMAGE_TAG}

print_status "Creating namespaces..."
kubectl apply -f k8s/buildspaces-namespace.yaml

print_status "Creating monitoring namespace..."
kubectl apply -f k8s/monitoring.yaml

print_status "Applying secrets..."
# Note: In production, use proper secret management (e.g., sealed-secrets, external-secrets)
kubectl apply -f k8s/buildspaces-secrets.yaml

print_status "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres-deployment.yaml

print_status "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n ${NAMESPACE}

print_status "Deploying Redis..."
kubectl apply -f k8s/redis-deployment.yaml

print_status "Waiting for Redis to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/redis -n ${NAMESPACE}

print_status "Running database migrations..."
kubectl run db-migration-${IMAGE_TAG} --image=${REGISTRY}/buildspaces:${IMAGE_TAG} --restart=Never -- \
  npx prisma migrate deploy --schema=./prisma/schema.prisma

print_status "Waiting for migration to complete..."
kubectl wait --for=condition=complete --timeout=300s job/db-migration-${IMAGE_TAG} -n ${NAMESPACE}

print_status "Deploying Buildspaces application..."
kubectl apply -f k8s/buildspaces-deployment.yaml

print_status "Waiting for application to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/buildspaces-app -n ${NAMESPACE}

print_status "Deploying ingress..."
kubectl apply -f k8s/buildspaces-ingress.yaml

print_status "Deploying monitoring stack..."
kubectl apply -f k8s/monitoring.yaml

print_status "Waiting for monitoring stack to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n ${MONITORING_NAMESPACE}
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n ${MONITORING_NAMESPACE}

print_status "Deployment completed successfully! 🎉"

print_status "Application URL: https://buildspaces.azora.world"
print_status "API URL: https://api.azora.world"
print_status "Monitoring (Grafana): http://grafana-service.monitoring:3000"
print_status "Metrics (Prometheus): http://prometheus-service.monitoring:9090"

print_warning "Don't forget to:"
print_warning "1. Update DNS records to point to your ingress controller"
print_warning "2. Configure SSL certificates (Let's Encrypt recommended)"
print_warning "3. Set up proper secret management in production"
print_warning "4. Configure backup strategies for PostgreSQL and Redis"
print_warning "5. Set up log aggregation and alerting"

# Show deployment status
print_status "Current deployment status:"
kubectl get all -n ${NAMESPACE}
kubectl get all -n ${MONITORING_NAMESPACE}
