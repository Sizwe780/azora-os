# Azora OS Monitoring & Logging

## Monitoring

- Prometheus & Grafana K8s stack in `/k8s/monitoring-stack.yaml`
- Health and readiness probes for all deployments ensure auto-healing and rolling updates

## Logging

- Centralized logs via Fluentd DaemonSet to ElasticSearch, or use GCP Cloud Logging/AWS CloudWatch
- See `/k8s/fluentd-daemonset.yaml`

## Auto-Healing

- K8s will restart unhealthy pods automatically
- For Docker Compose dev, run: `bash scripts/restart-unhealthy.sh` to restart unhealthy containers

## Best Practices

- Set resource limits/requests for all pods
- Use alerts in Grafana for error rates, latency, etc.
