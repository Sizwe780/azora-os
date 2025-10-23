# Azora ES Deployment Guide

This guide provides comprehensive instructions for deploying the Azora ES microservices platform in various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Configuration](#production-configuration)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows (WSL2)
- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended
- **Storage**: 20GB+ free space

### Software Dependencies
- **Go**: 1.21 or later
- **Docker**: 20.10 or later
- **Docker Compose**: 2.0 or later
- **kubectl**: For Kubernetes deployment
- **PostgreSQL**: 15 or later (or Docker)
- **Redis**: 7 or later (or Docker)
- **Kafka**: For analytics (or Docker)

### Cloud Resources (for production)
- **AWS/GCP/Azure account**
- **Kubernetes cluster** (EKS/GKE/AKS)
- **Container registry** (ECR/GCR/ACR)
- **Database instances**
- **Redis cluster**
- **Kafka cluster**

## Local Development

### 1. Clone Repository
```bash
git clone https://github.com/Sizwe780/azora-os
cd azora-os
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Go dependencies for all services
for service in services/*; do
  if [ -d "$service" ]; then
    cd "$service"
    go mod tidy
    cd ../..
  fi
done
```

### 3. Start Infrastructure
```bash
# Create docker-compose.yml for local development
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: azora
      POSTGRES_USER: azora
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

volumes:
  postgres_data:
EOF

# Start infrastructure
docker-compose up -d
```

### 4. Initialize Database
```bash
# Wait for PostgreSQL to be ready
sleep 10

# Run database migrations (create tables)
# Note: In a real deployment, you'd use migration tools like golang-migrate
# For now, services will auto-create tables on first run
```

### 5. Configure Environment
```bash
# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=postgresql://azora:password@localhost:5432/azora?sslmode=disable

# Redis
REDIS_URL=localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# LLM Service
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here

# AI Agent
LLM_SERVICE_URL=http://localhost:8084

# JWT Secret (generate a secure random string)
JWT_SECRET=your-256-bit-secret-here
EOF
```

### 6. Build and Run Services
```bash
# Build all services
npx nx run-many --target=build --all

# Run services in background (use tmux/screen or multiple terminals)
cd services/user-service && go run main.go &
cd services/session-service && go run main.go &
cd services/course-service && go run main.go &
cd services/enrollment-service && go run main.go &
cd services/llm-wrapper-service && go run main.go &
cd services/ai-agent-service && go run main.go &
cd services/analytics-service && go run main.go &
```

### 7. Verify Deployment
```bash
# Check service health
curl http://localhost:8080/health  # User Service
curl http://localhost:8083/health  # Session Service
curl http://localhost:8081/health  # Course Service
curl http://localhost:8082/health  # Enrollment Service
curl http://localhost:8084/health  # LLM Wrapper Service
curl http://localhost:8085/health  # AI Agent Service
curl http://localhost:8086/health  # Analytics Service
```

## Docker Deployment

### 1. Build Images
```bash
# Build all service images
for service in services/*; do
  if [ -d "$service" ]; then
    service_name=$(basename "$service")
    cd "$service"
    docker build -t "azora-$service_name:latest" .
    cd ../..
  fi
done

# Build infrastructure images if needed
docker build -f infrastructure/k8s/Dockerfile.postgres -t azora-postgres:latest .
```

### 2. Create Docker Compose Production File
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: azora
      POSTGRES_USER: azora
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U azora"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      zookeeper:
        condition: service_healthy
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 30s
      timeout: 10s
      retries: 3

  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "2181"]
      interval: 30s
      timeout: 10s
      retries: 3

  user-service:
    image: azora-user-service:latest
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      DATABASE_URL: postgresql://azora:password@postgres:5432/azora?sslmode=disable
      REDIS_URL: redis:6379
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - jwt_secret
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  session-service:
    image: azora-session-service:latest
    depends_on:
      redis:
        condition: service_started
    environment:
      REDIS_URL: redis:6379
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - jwt_secret

  course-service:
    image: azora-course-service:latest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://azora:password@postgres:5432/azora?sslmode=disable

  enrollment-service:
    image: azora-enrollment-service:latest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://azora:password@postgres:5432/azora?sslmode=disable

  llm-wrapper-service:
    image: azora-llm-wrapper-service:latest
    depends_on:
      redis:
        condition: service_started
    environment:
      LLM_PROVIDER: openai
      OPENAI_API_KEY_FILE: /run/secrets/openai_api_key
      REDIS_URL: redis:6379
    secrets:
      - openai_api_key

  ai-agent-service:
    image: azora-ai-agent-service:latest
    depends_on:
      redis:
        condition: service_started
      llm-wrapper-service:
        condition: service_healthy
    environment:
      REDIS_URL: redis:6379
      LLM_SERVICE_URL: http://llm-wrapper-service:8084

  analytics-service:
    image: azora-analytics-service:latest
    depends_on:
      redis:
        condition: service_started
      kafka:
        condition: service_healthy
    environment:
      REDIS_URL: redis:6379
      KAFKA_BROKERS: kafka:9092

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  openai_api_key:
    file: ./secrets/openai_api_key.txt

volumes:
  postgres_data:
  redis_data:
```

### 3. Create Secrets Directory
```bash
mkdir -p secrets

# Create secret files (replace with actual values)
echo "your-db-password" > secrets/db_password.txt
echo "your-256-bit-jwt-secret" > secrets/jwt_secret.txt
echo "your-openai-api-key" > secrets/openai_api_key.txt

# Set proper permissions
chmod 600 secrets/*
```

### 4. Deploy
```bash
# Start production deployment
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Kubernetes Deployment

### 1. Prerequisites
```bash
# Install kubectl, helm, etc.
# Configure access to your Kubernetes cluster
kubectl cluster-info
```

### 2. Create Namespace
```bash
kubectl create namespace azora-es
kubectl config set-context --current --namespace=azora-es
```

### 3. Create Secrets
```bash
# Database secrets
kubectl create secret generic db-secrets \
  --from-literal=username=azora \
  --from-literal=password=your-db-password

# JWT secrets
kubectl create secret generic jwt-secrets \
  --from-literal=secret=your-256-bit-jwt-secret

# LLM secrets
kubectl create secret generic llm-secrets \
  --from-literal=openai-api-key=your-openai-api-key
```

### 4. Deploy Infrastructure
```bash
# Deploy PostgreSQL with CloudNativePG
kubectl apply -f infrastructure/k8s/postgres-cluster.yaml

# Deploy Redis with Redis Enterprise
kubectl apply -f infrastructure/k8s/redis-cluster.yaml

# Deploy Kafka
kubectl apply -f infrastructure/k8s/kafka.yaml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=postgres-cluster --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis-cluster --timeout=300s
kubectl wait --for=condition=ready pod -l app=kafka --timeout=300s
```

### 5. Deploy Services
```bash
# Deploy all services
kubectl apply -f infrastructure/k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

### 6. Configure Ingress (Optional)
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: azora-es-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.azora.local
    http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 8080
      - path: /sessions
        pathType: Prefix
        backend:
          service:
            name: session-service
            port:
              number: 8083
      - path: /courses
        pathType: Prefix
        backend:
          service:
            name: course-service
            port:
              number: 8081
      - path: /enrollments
        pathType: Prefix
        backend:
          service:
            name: enrollment-service
            port:
              number: 8082
      - path: /ai
        pathType: Prefix
        backend:
          service:
            name: ai-agent-service
            port:
              number: 8085
      - path: /analytics
        pathType: Prefix
        backend:
          service:
            name: analytics-service
            port:
              number: 8086
```

## Production Configuration

### Environment Variables
```bash
# Production .env.prod
DATABASE_URL=postgresql://azora:password@postgres-cluster:5432/azora?sslmode=require
REDIS_URL=redis-cluster:6379
KAFKA_BROKERS=kafka-cluster:9092
LLM_PROVIDER=openai
OPENAI_API_KEY=production-api-key
LLM_SERVICE_URL=http://llm-wrapper-service:8084
JWT_SECRET=production-jwt-secret
LOG_LEVEL=info
```

### Resource Limits
```yaml
# Update deployments with production resource limits
spec:
  template:
    spec:
      containers:
      - resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Security Hardening
```yaml
# Security context
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
```

## Monitoring & Observability

### Health Checks
```bash
# Check all service health endpoints
SERVICES=("user-service:8080" "session-service:8083" "course-service:8081" "enrollment-service:8082" "llm-wrapper-service:8084" "ai-agent-service:8085" "analytics-service:8086")

for service in "${SERVICES[@]}"; do
  name=$(echo $service | cut -d: -f1)
  port=$(echo $service | cut -d: -f2)
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
  echo "$name: $status"
done
```

### Metrics Collection
```yaml
# prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'azora-services'
      static_configs:
      - targets: ['user-service:8080', 'session-service:8083', 'course-service:8081', 'enrollment-service:8082', 'llm-wrapper-service:8084', 'ai-agent-service:8085', 'analytics-service:8086']
```

### Logging
```bash
# View logs
kubectl logs -f deployment/user-service
kubectl logs -f deployment/ai-agent-service

# Centralized logging with fluent-bit
kubectl apply -f infrastructure/k8s/fluent-bit.yaml
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
kubectl exec -it postgres-cluster-0 -- psql -U azora -d azora -c "SELECT version();"

# Check database logs
kubectl logs -f postgres-cluster-0
```

#### Service Communication Issues
```bash
# Check service endpoints
kubectl get endpoints

# Test service-to-service communication
kubectl exec -it deployment/user-service -- curl http://session-service:8083/health
```

#### Pod Startup Issues
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name> --previous

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### Resource Issues
```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Check resource limits
kubectl describe pod <pod-name> | grep -A 10 "Limits:"
```

### Performance Tuning

#### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
```

#### Redis Optimization
```bash
# Redis configuration for production
maxmemory 512mb
maxmemory-policy allkeys-lru
tcp-keepalive 300
```

#### Kafka Optimization
```properties
# server.properties
num.partitions=3
default.replication.factor=2
min.insync.replicas=2
```

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL backup
kubectl exec postgres-cluster-0 -- pg_dump -U azora azora > backup.sql

# Automated backups with cronjob
kubectl apply -f infrastructure/k8s/backup-cronjob.yaml
```

### Configuration Backup
```bash
# Backup Kubernetes manifests
kubectl get all -o yaml > k8s-backup.yaml

# Backup secrets (be careful!)
kubectl get secrets -o yaml > secrets-backup.yaml
```

## Scaling

### Horizontal Pod Autoscaling
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-agent-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling
```bash
# Scale PostgreSQL
kubectl scale postgresql postgres-cluster --replicas=3

# Add Redis replicas
kubectl scale deployment redis-cluster --replicas=3
```

## Security Checklist

- [ ] Secrets management implemented
- [ ] Network policies applied
- [ ] RBAC configured
- [ ] TLS/SSL enabled
- [ ] Security contexts set
- [ ] Image vulnerability scanning
- [ ] Audit logging enabled
- [ ] Regular security updates
- [ ] Penetration testing completed

## Support

### Getting Help
1. Check the troubleshooting section above
2. Review service logs: `kubectl logs deployment/<service-name>`
3. Check Kubernetes events: `kubectl get events`
4. Review GitHub issues for similar problems
5. Contact support@azora.world for enterprise support

### Useful Commands
```bash
# Quick health check
kubectl get pods --all-namespaces | grep azora

# Check service endpoints
kubectl get endpoints -l app.kubernetes.io/name=azora

# Port forward for debugging
kubectl port-forward svc/user-service 8080:8080

# Debug container
kubectl exec -it deployment/user-service -- /bin/sh
```

---

This deployment guide covers the complete lifecycle of deploying Azora ES from local development to production Kubernetes clusters. For enterprise-specific requirements or custom deployments, contact enterprise@azora.world.