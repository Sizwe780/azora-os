# Azora OS Kubernetes & Monitoring

## Deploy Main App & Services

1. Build container images and push to your registry.
2. Apply manifests:

   kubectl apply -f main-app-deployment.yaml
   kubectl apply -f ai-personalization-deployment.yaml
   # ...repeat for all services

## Deploy Secrets

   kubectl apply -f app-secrets.yaml

## Monitoring

   kubectl apply -f monitoring-stack.yaml

- Prometheus: <cluster-ip>:9090
- Grafana: <cluster-ip>:3000 (admin/admin)

## Notes

- Customize resource requests/limits, ingress, and autoscaling as needed.
- Use Helm or Kustomize for more advanced setups.

