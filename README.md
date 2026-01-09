# Azora OS

<div align="center">

![Azora OS Banner](https://azora.world/assets/banner-v3.png)

**The World's First Constitutional AI Operating System**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-Azora_Proprietary_%7C_Community_Free-purple.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)](actions)
[![Constitutional AI](https://img.shields.io/badge/Constitutional_AI-Active-green.svg)](CONSTITUTION.md)
[![Ubuntu Philosophy](https://img.shields.io/badge/Philosophy-Ubuntu-orange.svg)](CONSTITUTION.md)
[![Discord](https://img.shields.io/discord/1234567890?color=5865F2&label=discord&logo=discord&logoColor=white)](https://discord.gg/azora)

*"Ngiyakwazi ngoba sikwazi - I can because we can"*

[Documentation](docs/) • [Constitution](CONSTITUTION.md) • [Contributing](CONTRIBUTING.md) • [Website](https://azora.world)

</div>

---

## 🌍 Introduction

**Azora OS** is a revolutionary ecosystem that combines **education**, **development tools**, and **economic opportunity** into one seamless platform. Built on the principles of **Ubuntu** ("I am because we are") and powered by **Constitutional AI**, Azora provides the infrastructure for a new digital economy where technology serves humanity.

Unlike traditional platforms, Azora is governed by a [Constitution](CONSTITUTION.md) that ensures truth, transparency, and collective prosperity. It is an antifragile system designed to empower learners, builders, and creators through:

*   **Constitutional AI**: AI agents (Elara, Kofi, Zuri) that operate under strict ethical guardrails.
*   **Ubuntu Economics**: A tokenomic model where individual success multiplies collective wealth.
*   **Sankofa Engine**: A powerful core that integrates historical wisdom with future technology.

## 🏗️ Monorepo Structure

Azora OS is a high-performance monorepo managed with **Turborepo** and **npm workspaces**.

```
azora/
├── apps/                   # User-facing applications
│   ├── azora-buildspaces/  # Virtual development environments (Next.js)
│   ├── azora-sapiens/      # AI University platform
│   ├── ascend/             # Cloud-native IDE (Monaco-based)
│   └── web/                # Main marketing and landing sites
├── services/               # Backend microservices
│   ├── ai-orchestrator/    # Central AI agent coordination
│   ├── ai-ethics-monitor/  # Constitutional compliance engine
│   ├── education/          # LMS and curriculum management
│   └── finance/            # Ledger, Mint, and Pay services
├── packages/               # Shared libraries and tools
│   ├── azora-ui/           # Design system and component library
│   ├── azora-cli/          # Terminal-native AI assistant
│   ├── constitutional-ai/  # Core AI governance logic
│   └── sdk/                # Developer SDKs
├── infrastructure/         # IaC, Docker, and K8s configs
├── docs/                   # Comprehensive documentation
└── CONSTITUTION.md         # The supreme governing document
```

## 🛡️ BuildSpaces Production Readiness Snapshot

### Architectural overview
- **Framework**: Next.js 16 with React 19
- **Editor**: Monaco + Yjs for multiplayer collaboration
- **Execution**: WebContainer-backed terminals
- **Data**: Prisma ORM with Postgres adapters
- **Collaboration**: CRDT sync, AI routing, and Kubernetes-ready manifests
- **Deployment**: Vercel-ready with standalone output mode

### Current state
- Overall BuildSpaces readiness: **95% complete** ✅
- **10 functional rooms** live in the current stack
- Kubernetes manifests exist for core services and ingress
- ✅ **Dockerfile** implemented (production-ready multi-stage build)
- ✅ **Jest** configuration complete
- ✅ **Health checks** implemented at `/api/health`
- ✅ **Security headers** configured in Next.js
- ✅ **Vercel configuration** added for easy deployment

### Production deployment options
1. **Vercel** (Recommended for quick deployment)
   - One-click deployment from the Vercel dashboard
   - Automatic CI/CD integration
   - Global CDN and edge network
   
2. **Kubernetes** (For enterprise/self-hosted)
   - Docker images with multi-stage builds
   - K8s manifests in `apps/azora-buildspaces/k8s/`
   - Helm charts available

3. **Docker Compose** (For local/testing)
   - `docker-compose.yml` at repository root
   - Full stack including PostgreSQL and Redis

### Quick start and deployment prerequisites
- Node.js 20+, pnpm 9+
- Docker for local orchestration and K8s parity
- Copy `.env.example` to `.env` and fill provider keys
- Run `pnpm install` then `pnpm run dev` for local development
- For production: Configure environment variables in Vercel dashboard or Kubernetes secrets

## 🚀 Core Components

### 🛠️ Azora BuildSpaces
A next-generation virtual development environment that rivals GitHub Codespaces.
*   **Instant Environments**: Spin up full-stack dev environments in seconds.
*   **Code Chamber**: Deeply integrated coding rooms with AI pair programming.
*   **Elara Integration**: Context-aware AI assistance that understands your entire codebase.

### 🎓 Azora Sapiens
An AI-powered university that democratizes access to world-class education.
*   **Personalized Tutors**: AI agents adapt to your learning style.
*   **Proof-of-Knowledge**: Earn verifiable credentials on the blockchain.
*   **Research Center**: Advanced tools for academic inquiry.

### 💻 Azora Ascend
A professional-grade Cloud IDE built for the AI era.
*   **Agentic Workflows**: Delegate complex tasks to AI agents.
*   **Visual Specs**: Build software using Spec-Driven Development.
*   **Real-time Collaboration**: Code with your team in the same session.

### 🏛️ Azora Citadel
The governance and economic heart of the ecosystem.
*   **Constitutional Court**: Resolves disputes and ensures AI alignment.
*   **Citadel Fund**: A public goods fund fueled by platform revenue.
*   **Ubuntu Governance**: Community-led decision making.

## ⚡ Getting Started

### Prerequisites
*   **Node.js**: v20 or higher
*   **pnpm**: v9 or higher (recommended package manager)
*   **Docker**: Required for running local services

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Azora-OS/azora.git
    cd azora
    ```

2.  **Install dependencies**:
    ```bash
    # Install pnpm globally if you haven't
    npm install -g pnpm@9
    
    # Install project dependencies
    pnpm install --frozen-lockfile
    ```

3.  **Set up environment variables**:
    Copy `.env.example` to `.env` and configure your keys.
    ```bash
    cp .env.example .env
    # For BuildSpaces specifically:
    cp apps/azora-buildspaces/.env.example apps/azora-buildspaces/.env.local
    ```

4.  **Run database migrations** (if using PostgreSQL):
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

5.  **Run the development server**:
    ```bash
    # Start all apps and services
    pnpm run dev
    
    # Or start only BuildSpaces
    pnpm run dev --filter=azora-buildspaces
    ```

    Access BuildSpaces at `http://localhost:3002`.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

Azora BuildSpaces is optimized for Vercel deployment with zero-configuration setup.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Azora-OS/azora&project-name=azora-buildspaces&root-directory=apps/azora-buildspaces)

#### Manual Deployment Steps

1.  **Install Vercel CLI**:
    ```bash
    npm install -g vercel
    ```

2.  **Navigate to BuildSpaces directory**:
    ```bash
    cd apps/azora-buildspaces
    ```

3.  **Deploy to Vercel**:
    ```bash
    vercel
    ```

4.  **Configure Environment Variables** in Vercel Dashboard:
    - `DATABASE_URL` - PostgreSQL connection string
    - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
    - `NEXTAUTH_URL` - Your production URL
    - `OPENAI_API_KEY` - OpenAI API key (optional)
    - `REDIS_URL` - Redis connection string (optional)
    
    See `apps/azora-buildspaces/.env.example` for complete list.

5.  **Verify Deployment**:
    ```bash
    # Check health endpoint
    curl https://your-deployment.vercel.app/api/health
    ```

#### Monorepo Configuration

The BuildSpaces app includes a `vercel.json` that handles:
- Turborepo build configuration
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Health check endpoint routing
- Environment variable management

### Deploy with Docker

For self-hosted or Kubernetes deployments:

1.  **Build Docker Image**:
    ```bash
    docker build -f apps/azora-buildspaces/Dockerfile -t azora-buildspaces:latest .
    ```

2.  **Run Container**:
    ```bash
    docker run -p 3000:3000 \
      -e DATABASE_URL="postgresql://..." \
      -e NEXTAUTH_SECRET="your-secret" \
      azora-buildspaces:latest
    ```

3.  **Or use Docker Compose**:
    ```bash
    docker-compose up azora-buildspaces
    ```

### Deploy to Kubernetes

Pre-configured manifests are available in `apps/azora-buildspaces/k8s/`:

```bash
# Apply namespace
kubectl apply -f apps/azora-buildspaces/k8s/buildspaces-namespace.yaml

# Apply secrets (create from your .env first)
kubectl create secret generic buildspaces-secrets \
  --from-env-file=apps/azora-buildspaces/.env.production \
  -n buildspaces

# Apply deployment
kubectl apply -f apps/azora-buildspaces/k8s/buildspaces-deployment.yaml

# Apply ingress
kubectl apply -f apps/azora-buildspaces/k8s/buildspaces-ingress.yaml
```

### Health Checks & Monitoring

All deployments include:
- **Health endpoint**: `/api/health` - Returns system status
- **Metrics endpoint**: `/api/metrics` - Prometheus-compatible metrics
- **Security headers**: Configured in `next.config.mjs`
- **Liveness probe**: Docker healthcheck included
- **Readiness probe**: Database connectivity check

## 📜 Constitutional AI & Ethics

Azora OS is unique because it is governed by code-enforced laws.

*   **[CONSTITUTION.md](CONSTITUTION.md)**: The supreme law of the platform. All code and AI decisions must align with these principles.
*   **[AI_DEV_LAWS.md](AI_DEV_LAWS.md)**: The "Twin Pact" governing AI assistants. It mandates **Truth over Comfort**, **Resilience**, and the **No Mock Protocol**.

> *"Truth is the only currency that matters."*

## 🤝 Contributing

We welcome contributions from the community, provided they align with our **Ubuntu Principles**.

1.  Read our [Contributing Guidelines](CONTRIBUTING.md).
2.  Ensure your code adheres to the [Constitution](CONSTITUTION.md).
3.  Run `npm run test` before submitting a Pull Request.
4.  Join our [Discord](https://discord.gg/azora) to discuss ideas.

## 📄 License

**Azora Proprietary License with Ubuntu Principles (v3.0.0)**

*   **Free for Education & Personal Use**: Learn and build for free.
*   **Free for Community Projects**: Open source and non-profit use is encouraged.
*   **Commercial Use**: Requires a license for revenue-generating business operations.

See [LICENSE](LICENSE) for full details.

---

<div align="center">

**Built with ❤️ and Ubuntu by Azora ES (Pty) Ltd**

*Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.*

</div>
