# Vigil Service Deployment

This directory contains deployment configurations for the Azora Vigil AI surveillance service.

## Docker Deployment

### Local Development

1. Start the services:
```bash
docker-compose -f deploy/docker-compose.yml up -d
```

2. Check logs:
```bash
docker-compose -f deploy/docker-compose.yml logs -f vigil-api
```

3. Stop services:
```bash
docker-compose -f deploy/docker-compose.yml down
```

### Production Build

```bash
# Build the Docker image
docker build -f deploy/Dockerfile -t azora/vigil-api:latest .

# Run the container
docker run -p 3005:3005 \
  -e JWT_SECRET="your-secret" \
  -e DATABASE_URL="postgres://..." \
  azora/vigil-api:latest
```

## Kubernetes Deployment

### Using Helm

1. Install the chart:
```bash
helm install vigil ./deploy/helm/vigil \
  --namespace vigil \
  --create-namespace \
  --set config.jwtSecret="your-secret" \
  --set secrets.dbPassword="your-db-password"
```

2. Upgrade the deployment:
```bash
helm upgrade vigil ./deploy/helm/vigil --namespace vigil
```

3. Uninstall:
```bash
helm uninstall vigil --namespace vigil
```

### Configuration

Key configuration options in `values.yaml`:

- `replicaCount`: Number of pod replicas
- `image.repository`: Docker image repository
- `config.database.*`: Database connection settings
- `config.mqtt.broker`: MQTT broker URL
- `config.kafka.brokers`: Kafka broker URLs
- `ingress.enabled`: Enable ingress
- `autoscaling.enabled`: Enable horizontal pod autoscaling

### Secrets Management

Create secrets separately for production:

```bash
kubectl create secret generic vigil-secrets \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=database-url="postgres://user:pass@host:5432/db" \
  --from-literal=azure-eventgrid-key="your-key" \
  --namespace vigil
```

### Monitoring

The Helm chart includes Prometheus metrics endpoints. For Grafana dashboards, see the monitoring directory.

### Scaling

- Horizontal Pod Autoscaling is enabled by default
- Scales based on CPU and memory utilization
- Minimum 2 replicas, maximum 10 replicas

### Networking

- Service exposed on port 3005
- Ingress can be enabled for external access
- WebSocket support for real-time metrics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Service port | `3005` |
| `JWT_SECRET` | JWT signing secret | Required |
| `UI_ORIGIN` | Allowed CORS origins | Required |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `MQTT_BROKER` | MQTT broker URL | `mqtt://localhost:1883` |
| `KAFKA_BROKERS` | Kafka broker URLs | `localhost:9092` |

## Health Checks

- `/health`: Basic health check
- `/health/liveness`: Kubernetes liveness probe
- `/health/readiness`: Kubernetes readiness probe

## Troubleshooting

### Check pod status:
```bash
kubectl get pods -n vigil
```

### View logs:
```bash
kubectl logs -f deployment/vigil -n vigil
```

### Debug container:
```bash
kubectl exec -it deployment/vigil -n vigil -- /bin/sh
```