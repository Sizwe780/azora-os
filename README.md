# Azora OS

**Enterprise-grade AI platform with autonomous services, built on biological and natural principles.**

Azora OS is a modular, API-first platform that integrates AI, blockchain, and enterprise services following constitutional governance principles inspired by biological systems, quantum computing, and natural ecosystems.

## Current Status

- **12+ Services Upgraded**: Enterprise-grade with TypeScript, Prisma ORM, PostgreSQL persistence, and comprehensive audit trails
- **Constitutional Governance**: AI-driven compliance with biological, cosmological, and natural principles
- **Production Ready**: Docker, health checks, and scalable architecture

## Architecture

### Core Services (Upgraded)
- **ai-unified**: Unified AI task routing and model management
- **ai-recommendations**: Personalized AI recommendations with user profiling
- **ai-valuation**: User growth tracking and AI-powered valuation
- **wallet**: Cryptocurrency wallet with Azora Coin integration
- **auth**: Authentication and authorization service
- **analytics**: Real-time analytics and reporting
- **marketplace**: Service marketplace with AI matching
- **notification-service**: Multi-channel notification system
- **billing-service**: Subscription and payment processing
- **ledger**: Financial ledger with audit trails
- **ai-evolution-engine**: AI model evolution and optimization
- **ai-ml-engine**: Machine learning pipeline orchestration

### Technology Stack
- **Backend**: TypeScript, Express.js, Prisma ORM
- **Database**: PostgreSQL with per-service databases
- **AI Integration**: OpenAI, custom models, unified API
- **Blockchain**: Ethereum, Azora Coin smart contracts
- **Deployment**: Docker, Kubernetes, multi-cloud
- **Security**: Zero-trust, audit logging, compliance frameworks

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose

### Development Setup

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd azora-os
   npm install
   ```

2. **Start databases:**
   ```bash
   docker-compose -f docker/production.yml up postgres-primary -d
   ```

3. **Start a service:**
   ```bash
   cd services/ai-unified
   npm run build
   npm start
   ```

4. **Access health check:**
   ```bash
   curl http://localhost:3000/health
   ```

### Production Deployment

```bash
docker-compose -f docker/production.yml up -d
```

## Constitution & Governance

Azora OS operates under the Azora Constitution, implementing:

- **Biological Principles**: Immune systems, organelle architecture, DNA polymerase validation
- **Cosmological Economics**: Fusion energy models, black hole economics, multiverse value creation
- **Natural Governance**: Mycelial networks, trophic levels, keystone species resilience
- **Phoenix Protocol**: Genetic resurrection and evolutionary adaptation

## Development

### Service Upgrade Pattern

Each service follows this upgrade pattern:

1. **TypeScript Migration**: Convert to TypeScript with proper types
2. **Database Integration**: Add Prisma ORM with PostgreSQL
3. **AI Integration**: Connect to unified AI services
4. **Audit & Compliance**: Add comprehensive audit trails
5. **Health Checks**: Implement `/health` endpoints
6. **Testing**: Add unit and integration tests

### Contributing

1. Follow the constitutional principles
2. Maintain audit trails for all operations
3. Ensure services are API-first and modular
4. Add comprehensive error handling
5. Include health checks and monitoring

## License

See LICENSE file for details.

## Contact

- **Founder**: Sizwe Ngwenya
- **Email**: legal@azora.world
- **Domain**: azora.world

---

## For Developers

- **Onboarding:**  
  - Start with `/onboarding-wizard/`
  - See `/docs/DEVELOPER_GUIDE.md`
- **Structure:**  
  - `/apps` — Frontend, mobile, PWA
  - `/services` — All microservices
  - `/shared` — Shared libs
  - `/k8s` — Kubernetes manifests
  - `/scripts` — DevOps, launch
- **Env:**  
  - Copy `.env.example` to `.env` and configure.

---

## Feedback, Analytics & Adoption

- **Feedback loop:**  
  - In-app feedback panel (see `/services/feedback/`)
  - User journey and analytics (`/services/analytics/`)
- **Automated onboarding:**  
  - `/onboarding-wizard/` guides new users and tracks progress.
- **Scale:**  
  - Plugin new modules via `/plugins/`.
  - Use `/scripts/scale.sh` for horizontal/vertical scaling.

---

## Security & Compliance

- **Zero Trust:** All APIs gated by policy.
- **Audit Logs:** Real-time compliance audit.
- **Data Residency:** Sovereign and multi-cloud, region control.
- **Open APIs:** OIDC, OAuth2, JWT, DID supported.

---

## Contributing

- PRs & issues welcome!
- Write tests, follow atomic/component conventions.
- See `/docs/CONTRIBUTING.md` for guidelines.

---

**Azora OS — Build the Future, Compliantly.**  
azora.world