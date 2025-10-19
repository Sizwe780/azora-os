# Azora OS

**Sovereign. Compliant. Autonomous.**  
**The next-generation, open, modular AI OS for organizations.**

---

## Features

- **100+ Microservices**: Modular, API-first, K8s- and Docker-native.
- **Atomic UI**: Mobile-first, accessible, dark/light, PWA, and App/Play Store ready.
- **AI/ML/LLM**: Native OpenAI, custom models, AI search, recommendations, analytics.
- **Fintech & Blockchain**: Payments, wallets, NFTs, open banking, multi-tenant SaaS.
- **Security & Compliance**: Zero trust, audit, digital assets, sovereign/multicloud.
- **Innovation**: Quantum/AR/IoT, digital twin, edge compute, workflow automation.
- **DevOps**: CI/CD, health checks, observability, auto-healing.
- **Extensibility**: Plugin system, API-first, cloud/edge ready.

---

## Quickstart

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start all services & UI:**
   ```bash
   docker-compose up --build
   ```
   or for prod:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```
3. **Access the UI:**  
   [http://localhost:3000](http://localhost:3000) or your prod domain

4. **Kubernetes:**  
   ```bash
   kubectl apply -f k8s/
   ```

---

## Launch, Roadmap, and Valuation

- **Launch script:** `/scripts/launch.sh`
- **Roadmap:** `ROADMAP.md`
- **Valuation:** `VALUATION-REPORT.md`
- **Investor deck:** `/investor-deck/`

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