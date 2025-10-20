# Azora OS Monitoring & Observability

## Overview

Azora OS implements comprehensive monitoring and observability using Prometheus, Grafana, and AlertManager to ensure high availability and performance of all services.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Services      │    │   Prometheus    │    │    Grafana      │
│   (Metrics)     │───▶│   (Collection)  │───▶│  (Visualization)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │  AlertManager   │
                    │   (Alerting)    │
                    └─────────────────┘
```

## Services Monitored

### Core Services
- **API Gateway** (port 3000) - Main entry point for all API requests
- **Email Service** (port 3000) - Email processing and delivery
- **Messaging Service** (port 4200) - Real-time messaging and notifications
- **Chamber of Ghosts** (port 3005) - AI/ML processing service

### AI Services
- **AI/ML Engine** (port 4055) - Core AI processing
- **AI Orchestrator** (port 4001) - AI service coordination

### Infrastructure
- **Node Exporter** (port 9100) - System metrics (CPU, memory, disk, network)
- **cAdvisor** (port 8080) - Container metrics

## Quick Start

### Automated Setup
```bash
# Run the monitoring setup script
./setup-monitoring.sh
```

### Manual Setup
```bash
# Start monitoring stack
docker-compose -f docker/docker-compose.monitoring.yml up -d

# Access dashboards
open http://localhost:3001  # Grafana (admin/admin)
open http://localhost:9090  # Prometheus
open http://localhost:9093  # AlertManager
```

## Dashboards

### Azora OS Overview Dashboard
- **Service Health Status**: Overall health of all services
- **API Gateway Metrics**: Request rates, response times, error rates
- **Email Service Metrics**: Queue size, delivery rates, bounce rates
- **Messaging Service Metrics**: Message throughput, connection counts
- **System Resources**: CPU, memory, disk usage across all services
- **Error Rates**: Application error rates and trends

### Custom Dashboards
Create additional dashboards for specific services using the Grafana UI or by adding JSON files to:
```
infra/monitoring/grafana/dashboards/
```

## Metrics Collection

### Service Metrics
Each service exposes metrics at `/metrics` endpoint using the Prometheus client library.

#### Standard Metrics
- `http_requests_total`: Total HTTP requests by method, endpoint, status
- `http_request_duration_seconds`: Request duration histograms
- `service_health_status`: Service health (0=unhealthy, 1=healthy)
- `service_uptime_seconds`: Service uptime
- `memory_usage_bytes`: Memory usage
- `cpu_usage_percent`: CPU usage percentage

#### Business Metrics
- **Email Service**: `emails_sent_total`, `emails_bounced_total`, `queue_size`
- **Messaging Service**: `messages_sent_total`, `active_connections`, `message_latency`
- **AI Services**: `predictions_total`, `model_inference_time`, `accuracy_score`

### System Metrics
Collected via Node Exporter:
- CPU usage and load
- Memory and swap usage
- Disk I/O and usage
- Network I/O
- System uptime and load averages

## Alerting

### Alert Rules
Alerts are configured in `infra/monitoring/prometheus/alert_rules.yml`:

#### Critical Alerts
- **ServiceDown**: Service not responding for 5+ minutes
- **HighErrorRate**: Error rate > 5% for 10+ minutes
- **HighMemoryUsage**: Memory usage > 90% for 5+ minutes
- **HighCPUUsage**: CPU usage > 95% for 5+ minutes

#### Warning Alerts
- **DegradedService**: Service responding slowly (> 2s avg response time)
- **HighQueueSize**: Email queue > 1000 messages
- **LowDiskSpace**: Disk usage > 80%

### Notification Channels
Configured in `infra/monitoring/alertmanager.yml`:
- **Email**: SMTP configuration for critical alerts
- **Slack**: Real-time notifications for ops team
- **PagerDuty**: Escalation for critical production issues

## Configuration Files

### Prometheus Configuration
```yaml
# infra/monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
    metrics_path: '/metrics'

  - job_name: 'email-service'
    static_configs:
      - targets: ['email-service:3000']
    metrics_path: '/metrics'

  # ... additional services
```

### AlertManager Configuration
```yaml
# infra/monitoring/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@azora-os.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'ops@azora-os.com'
```

## Troubleshooting

### Common Issues

#### Services Not Appearing in Prometheus
1. Check if service is running: `docker-compose ps`
2. Verify metrics endpoint: `curl http://localhost:3000/metrics`
3. Check Prometheus targets: http://localhost:9090/targets/

#### Grafana Dashboard Not Loading
1. Verify Grafana is running: `docker-compose logs grafana`
2. Check datasource configuration
3. Ensure dashboard JSON is valid

#### Alerts Not Firing
1. Check alert rules syntax: `promtool check rules infra/monitoring/prometheus/alert_rules.yml`
2. Verify AlertManager configuration
3. Check notification channel settings

### Logs
```bash
# View all monitoring logs
docker-compose -f docker/docker-compose.monitoring.yml logs

# View specific service logs
docker-compose -f docker/docker-compose.monitoring.yml logs prometheus
docker-compose -f docker/docker-compose.monitoring.yml logs grafana
```

## Scaling and Production

### High Availability
- Run multiple Prometheus instances with federation
- Use Thanos or Cortex for long-term storage
- Deploy AlertManager in cluster mode

### Security
- Enable TLS for all monitoring endpoints
- Use authentication for Grafana dashboards
- Restrict network access to monitoring ports

### Performance
- Configure appropriate scrape intervals based on service criticality
- Use Prometheus recording rules for expensive queries
- Implement metric aggregation for high-cardinality metrics

## Development

### Adding New Metrics
1. Import Prometheus client in your service
2. Define metrics using appropriate types (Counter, Gauge, Histogram)
3. Expose metrics at `/metrics` endpoint
4. Update Prometheus configuration with new job
5. Add metrics to Grafana dashboards

### Testing Alerts
Use the Prometheus alerting test tool:
```bash
promtool test rules infra/monitoring/prometheus/alert_rules.yml
```

## Contributing

When adding new services:
1. Ensure `/metrics` endpoint is implemented
2. Add service to `prometheus.yml` scrape configs
3. Update Grafana dashboards with relevant panels
4. Configure appropriate alerting rules
5. Update this documentation

## Support

For monitoring issues:
- Check service logs: `docker-compose logs <service>`
- Verify configurations: `promtool check config prometheus.yml`
- Test metrics endpoints: `curl http://localhost:<port>/metrics`
- Review Grafana datasource status
