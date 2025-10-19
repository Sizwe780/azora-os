# Azora OS Developer Onboarding

## 1. Requirements

- Node.js 18+
- Docker & Docker Compose
- (Optional) Kubernetes CLI & cluster for cloud deployments

## 2. Getting Started

1. Clone the repo and install dependencies:
   npm install

2. Start all services + UI for development:
   npm run dev

3. Access the UI at http://localhost:3000

4. To run a specific service:
   cd services/ai-personalization
   npm install
   npm start

5. For production:
   npm run build && npm start

6. For Kubernetes:
   See k8s/README.md

## 3. Service Map

See `/services` and `/k8s` for all microservices and manifests.

## 4. Contribution

- Use feature branches and PRs
- Write tests for new features
- Run `npm run lint` and `npm run test` before pushing

## 5. Mobile UI

- All UI is responsive and tested for mobile.
- Use device emulation to verify UX.
