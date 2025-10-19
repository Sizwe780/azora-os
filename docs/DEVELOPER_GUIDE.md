# Azora OS Developer Guide

## Monorepo Structure

- `/apps` – Frontend, React UI, PWA/mobile support
- `/services` – Microservices (Node.js, Express, Python, etc.)
- `/shared` – Shared libraries/utilities
- `/k8s` – Kubernetes manifests
- `/scripts` – DevOps/automation scripts

## Adding a Microservice

1. Scaffold in `/services/{service-name}/`
2. Define endpoints with REST/gRPC/WebSocket as needed.
3. Add Dockerfile and update `docker-compose.yml` and `k8s/`.

## Adding a UI Panel

1. Create a component in `/apps/main-app/src/components/`
2. Route it in the main app.
3. Add API integration via hooks.

## Testing & Linting

- Run `npm run lint-all` and `npm run test-all` before PRs.

## Security

- Use `.env` for secrets.
- Never commit credentials.
- All PRs are scanned on CI for secrets/vulns.

## Contributing

- Fork, branch, PR.
- Link issues to PRs.
- All commits must pass CI.

## Docs

- Document all new APIs in `/docs/`
- Update `/docs/README.md` to index docs.

**Happy building!**