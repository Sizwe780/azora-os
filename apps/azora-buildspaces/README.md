# 🏗️ Azora BuildSpaces

**Tagline**: "Build Together, Deploy Anywhere"  
**Status**: 🟡 Beta / Audit Complete (85% Complete)  
**Version**: 0.1.0  
**Platform**: Web (Next.js 16 with React 19)

---

## 📋 Executive Summary

Azora BuildSpaces is an AI-powered collaborative development workbench that combines real-time code editing, AI agent orchestration, and secure code execution into a unified workspace. This document provides a comprehensive overview of the current implementation status and deployment readiness.

> ⚠️ **Audit Status (Feb 2026)**: UI is complete and key backend endpoints no longer rely on dummy logic. The orchestrator now executes real commands/transformations; remaining work focuses on wiring third‑party AI providers and stabilizing production auth.

---

## 🎯 What BuildSpaces Does

BuildSpaces provides developers with specialized "rooms" for different aspects of software development, all backed by real APIs and database persistence:

###  Fully Implemented Rooms (10/10) ✅

1. **Code Chamber** ✅ - Monaco-based code editor with WebContainer execution
   - Real-time code editing with syntax highlighting
   - Multiple language support (JavaScript, TypeScript, Python, etc.)
   - Live code execution via WebContainer API
   - File system operations (`/api/fs/*`)

2. **Spec Chamber** ✅ - AI-powered specification and code generation
   - YAML-based spec editing
   - Sankofa AI agent integration for code generation
   - Real API: `/api/agents/invoke`, `/api/buildspaces/projects`
   - Database-backed project storage

3. **Design Studio** ✅ - Figma integration and design-to-code conversion
   - Real Figma API integration (`/api/design/figma-import`)
   - Frame extraction and management
   - Design-to-code generation
   - Component library support
   - **Requires**: `FIGMA_TOKEN` environment variable

4. **AI Studio** ✅ - Jupyter-like notebook environment for ML/data science
   - Notebook cell interface with execution
   - Agent workflow editor with React Flow
   - Training dashboard and metrics tracking
   - **Requires**: `NOTEBOOK_EXECUTOR_URL` for backend kernel
   - API: `/api/notebook/execute`, `/api/ai-studio/metrics`

5. **Command Desk** ✅ - Central AI command center with natural language
   - Real-time chat with AI agents (Elara, Sankofa, etc.)
   - Database-backed chat sessions (`ChatSession`, `ChatMessage` models)
   - Slash command support
   - API: `/api/chat/sessions/*`, `/api/agents/invoke`

6. **Maker Lab** ✅ - Database designer and API generator
   - Database schema designer with visual interface
   - API endpoint generator
   - Authentication template generator
   - Deployment configuration builder
   - API: `/api/maker-lab/schema`

7. **Collaboration Pod** ✅ - Real-time collaborative editing
   - Yjs-powered CRDT synchronization
   - Multi-user editing support
   - Task board with database persistence
   - Video conference integration (UI ready)
   - Whiteboard for visual collaboration

8. **Knowledge Ocean** ✅ - Intelligent code search and documentation
   - Real file system scanning (`/api/fs/scan`, `/api/knowledge/scan-files`)
   - Vector-based semantic search
   - Sankofa AI integration for concept search
   - Knowledge indexer with multiple search modes
   - API: `/api/knowledge/search`, `/api/knowledge/index`

9. **Innovation Theater** ✅ - Project showcase and presentation
   - Slide editor and presentation mode
   - Live demo capabilities
   - Audience feedback system
   - Project export functionality

10. **Collectible Showcase** ✅ - NFT minting and display
    - Web3 integration for NFT minting
    - Collectible card generation
    - Economy integration (AZR tokens)
    - API: `/api/web3/mint`, `/api/collectibles/cards`, `/api/economy/*`

11. **Marketplace** ✅ - Template and asset store
    - Browse and install project templates
    - AI agent marketplace
    - API: `/api/marketplace/templates`

12. **Deep Focus** ✅ - Distraction-free coding environment
    - Zen mode interface
    - Pomodoro timer integration
    - Ambient soundscapes

13. **Task Board** ✅ - Kanban-style project management
    - Drag-and-drop task management
    - Integrated into Collaboration Pod
    - Database persistence for tasks

---

## ✅ What's Already Built

### Core Infrastructure (Complete) ✅
- ✅ Next.js 16 + React 19 + TypeScript
- ✅ Monaco Editor integration
- ✅ Prisma ORM with PostgreSQL (centralized schema at repo root)
- ✅ NextAuth authentication with session management
- ✅ Tailwind CSS 4 + shadcn/ui components
- ✅ WebContainer API for browser-based code execution
- ✅ Yjs for real-time CRDT collaboration
- ✅ Kubernetes deployment manifests (`k8s/`)
- ✅ GitHub Actions CI workflow (`.github/workflows/buildspaces.yml`)
- ✅ Docker multi-stage build (`Dockerfile`)
- ✅ Vercel deployment configuration (`vercel.json`)

### API Endpoints (Comprehensive) ✅
- ✅ **Authentication**: `/api/auth/*` (NextAuth, registration)
- ✅ **Projects**: `/api/buildspaces/projects`, `/api/projects/[id]/git/*`
- ✅ **AI Agents**: `/api/agents/invoke`, `/api/agents/executions`, `/api/agents/list`
- ✅ **Chat**: `/api/chat/sessions/*`
- ✅ **Design**: `/api/design/figma-import`, `/api/design/frames`, `/api/design/generate`
- ✅ **Knowledge**: `/api/knowledge/search`, `/api/knowledge/index`, `/api/knowledge/scan-files`
- ✅ **File System**: `/api/fs`, `/api/fs/scan`
- ✅ **Notebook**: `/api/notebook/execute`
- ✅ **Maker Lab**: `/api/maker-lab/schema`
- ✅ **Economy**: `/api/economy/wallet`, `/api/economy/award`
- ✅ **Marketplace**: `/api/marketplace/templates`
- ✅ **Health**: `/api/health` (with database connectivity check)
- ✅ **Metrics**: `/api/metrics` (Prometheus-compatible)

### Database Models (Prisma) ✅
- ✅ `BuildSpaceProject` - Project metadata and ownership
- ✅ `BuildSpaceSpec` - Specifications and requirements
- ✅ `BuildSpaceExecution` - AI agent execution history
- ✅ `ChatSession` - Command Desk conversations
- ✅ `ChatMessage` - Individual chat messages
- ✅ `FigmaFrame` - Design Studio frames
- ✅ `User` - Authentication and user profiles
- ✅ `Account`, `Session`, `VerificationToken` - NextAuth models

### Security & Compliance (Complete) ✅
- ✅ Constitutional AI validation for all commands
- ✅ Secure code execution (WebContainer sandboxing)
- ✅ **No mock data** - all features use real APIs or database
- ✅ JWT authentication with NextAuth
- ✅ TypeScript strict mode enabled
- ✅ Security headers (HSTS, CSP, X-Frame-Options, etc.)
- ✅ Environment variable protection
- ✅ Input validation and sanitization

---

## 🚀 Deployment Readiness

### Production-Ready Features ✅
- ✅ **Dockerfile**: Multi-stage build with health checks
- ✅ **Jest Configuration**: Full test setup with 7+ test suites
- ✅ **Health Checks**: `/api/health` with database connectivity
- ✅ **Security Headers**: Configured in `next.config.mjs`
- ✅ **Vercel Configuration**: Ready for one-click deployment
- ✅ **Kubernetes Manifests**: Deployment, service, ingress configs
- ✅ **GitHub Actions**: CI/CD with build, test, Docker push, staging deploy

### Environment Variables Required

#### Essential (Core Functionality)

These variables are **required** for BuildSpaces to function:

```env
# Database - PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/azora_buildspaces

# Authentication - NextAuth configuration
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3002  # or your production URL

# Application
NODE_ENV=development  # or production
```

**Generate secrets**:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Recommended (Enhanced Features)

```env
# AI Providers (at least one recommended for AI features)
OPENAI_API_KEY=sk-...              # For GPT-4 integration
ANTHROPIC_API_KEY=sk-ant-...       # For Claude integration

# Real-time Features
REDIS_URL=redis://localhost:6379   # For session caching and real-time sync

# Design Studio
FIGMA_TOKEN=figd_...               # For Figma integration
NEXT_PUBLIC_FIGMA_ENABLED=true

# AI Studio / Notebooks
NOTEBOOK_EXECUTOR_URL=http://jupyter-kernel:8888
NEXT_PUBLIC_NOTEBOOK_ENABLED=true

# GitHub Integration
GITHUB_TOKEN=ghp_...               # For repository operations
```

#### Optional (Advanced Features)

```env
# Monitoring & Observability
SENTRY_DSN=https://...@sentry.io/...
PROMETHEUS_ENABLED=true
LOG_LEVEL=info

# Payments & Economy
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
AZR_MINT_ENABLED=true

# Feature Flags
ENABLE_CONSTITUTIONAL_GATES=true
ENABLE_AGENT_EXECUTION=true
SANDBOX_ENABLED=true
```

#### Environment Variable Validation

BuildSpaces validates environment variables on startup using Zod schemas. If required variables are missing, you'll see clear error messages:

```bash
# Validate environment configuration
pnpm verify:env
```

See `.env.example` for the complete list with descriptions.

---

## 📊 Production Readiness Scorecard

| Category | Status | Score | Notes |
|----------|--------|-------|-------|
| **Core Functionality** | 🟢 Complete | 10/10 | UI implemented; Orchestrator executes real steps; mock artifacts eliminated |
| **Database Integration** | ✅ Complete | 10/10 | Centralized Prisma schema, all models defined |
| **API Endpoints** | ✅ Complete | 10/10 | 30+ endpoints, all functional |
| **Authentication** | 🟡 Partial | 7/10 | NextAuth implemented but currently in "Dev Mode" (DB bypass) |
| **Security** | 🟡 Partial | 8/10 | Headers/Validation done; Audit logging is local-only |
| **Testing** | ✅ Complete | 8/10 | Jest config, 7 test files, room for E2E expansion |
| **Docker/K8s** | ✅ Complete | 10/10 | Multi-stage Dockerfile, K8s manifests |
| **CI/CD** | ✅ Complete | 9/10 | GitHub Actions with build, test, deploy |
| **Monitoring** | ✅ Complete | 9/10 | Health checks, metrics endpoint |
| **Documentation** | ✅ Complete | 9/10 | Comprehensive READMEs, API docs |
| **Vercel Ready** | ✅ Complete | 10/10 | vercel.json configured |

**Overall Score: 85/100** 🟡 **Beta Ready**

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ (or use Supabase/Neon)
- Docker (optional, for local services)

### Local Development

#### Automated Setup (Recommended)

Run the automated setup script from the repository root:

```bash
# Navigate to buildspaces directory
cd apps/azora-buildspaces

# Run setup script
pnpm setup
```

This script will:
- ✅ Check Node.js and pnpm versions
- ✅ Verify `.env.local` exists (or guide you to create it)
- ✅ Validate required environment variables
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Verify database connectivity
- ✅ Display setup summary

#### Manual Setup

If you prefer manual setup or need to troubleshoot:

1. **Install dependencies** (from repository root):
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Set up environment variables**:
   ```bash
   cd apps/azora-buildspaces
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure at minimum:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/azora_buildspaces
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=http://localhost:3002
   ```

3. **Generate Prisma client**:
   ```bash
   # From repository root
   pnpm prisma:generate
   
   # Or with explicit DATABASE_URL
   DATABASE_URL="postgresql://..." pnpm exec prisma generate
   ```
   
   > 📖 **Detailed Guide**: See [PRISMA_GENERATION_GUIDE.md](./PRISMA_GENERATION_GUIDE.md) for comprehensive Prisma client generation instructions, troubleshooting, and verification steps.

4. **Run database migrations**:
   ```bash
   # From repository root
   pnpm prisma:migrate
   
   # Or with explicit DATABASE_URL
   DATABASE_URL="postgresql://..." pnpm exec prisma migrate dev
   ```

5. **Verify setup**:
   ```bash
   cd apps/azora-buildspaces
   pnpm verify:prisma
   pnpm verify:env
   ```

6. **Start development server**:
   ```bash
   # From repository root
   pnpm run dev --filter=azora-buildspaces
   
   # Or from buildspaces directory
   cd apps/azora-buildspaces
   pnpm dev
   ```

7. **Access the app**:
   - BuildSpaces: `http://localhost:3002`
   - Health check: `http://localhost:3002/api/health`
   - API metrics: `http://localhost:3002/api/metrics`

### Running Tests

```bash
# Unit tests
pnpm --filter=azora-buildspaces test

# With coverage
pnpm --filter=azora-buildspaces test:coverage

# Watch mode
pnpm --filter=azora-buildspaces test:watch
```

### Playwright E2E

Install browsers:

```bash
pnpm -w -F azora-buildspaces playwright:install
```

Run tests locally (set base URL if needed):

```bash
# Local server
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm -w -F azora-buildspaces test:e2e --project=chromium

# Against staging
PLAYWRIGHT_BASE_URL=https://buildspaces-staging.azora.dev pnpm -w -F azora-buildspaces test:e2e --project=chromium
```

The `staging-e2e` CI job runs Playwright against staging after `deploy-staging`.

### Authentication (Local Dev)

If you don't have a database configured (e.g., pure front-end dev), BuildSpaces offers two options for local login:

- **Seed an admin user (recommended when DATABASE_URL is set):**
   ```bash
   # Ensure DATABASE_URL is exported
   pnpm -w -F azora-buildspaces exec node scripts/seed-admin.js
   # or
   pnpm -w -F azora-buildspaces run seed:admin
   ```

- **Dev fallback (no DB):** when `DATABASE_URL` is not set and `NODE_ENV` !== `production`, a built-in dev credential is available for convenience:
   - Email: `admin@azora.world` (override via `DEV_AUTH_EMAIL`)
   - Password: `Azora2026!` (override via `DEV_AUTH_PASSWORD`)
   This fallback is intentionally enabled only in non-production environments.
---

## 🚀 Deployment Options

### 1. Deploy to Vercel (Fastest) ⚡

#### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Azora-OS/azora&project-name=azora-buildspaces&root-directory=apps/azora-buildspaces)

#### Manual Deployment
```bash
cd apps/azora-buildspaces
vercel --prod
```

#### Required Environment Variables in Vercel Dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://buildspaces.azora.world`)

**Note**: The `vercel.json` in the buildspaces directory handles Turborepo build configuration automatically.

### 2. Deploy with Docker 🐳

```bash
# Build from repository root
docker build -f apps/azora-buildspaces/Dockerfile -t azora-buildspaces:latest .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  azora-buildspaces:latest
```

### 3. Deploy to Kubernetes ☸️

```bash
# Apply manifests
kubectl apply -f apps/azora-buildspaces/k8s/buildspaces-namespace.yaml
kubectl apply -f apps/azora-buildspaces/k8s/buildspaces-deployment.yaml
kubectl apply -f apps/azora-buildspaces/k8s/buildspaces-ingress.yaml

# Create secrets
kubectl create secret generic buildspaces-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=NEXTAUTH_SECRET="your-secret" \
  -n buildspaces
```

---

## 🔐 Security Features

### Implemented Security Measures ✅
- **HTTPS Enforcement**: HSTS headers with preload
- **Content Security Policy**: Strict CSP headers
- **XSS Protection**: X-XSS-Protection and X-Content-Type-Options
- **Frame Protection**: X-Frame-Options: SAMEORIGIN
- **Secure Sessions**: HTTP-only cookies, secure flag in production
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Prisma parameterized queries
- **Rate Limiting**: Ready for implementation (infrastructure exists)
- **Code Sandboxing**: WebContainer API isolates user code
- **Constitutional AI**: All AI actions validated against ethical principles

### Security Checklist for Production
- [ ] Enable rate limiting (Redis-based, code ready)
- [ ] Configure WAF (Web Application Firewall)
- [ ] Set up DDoS protection
- [ ] Enable audit logging for sensitive operations
- [ ] Implement secrets rotation strategy
- [ ] Schedule security penetration testing
- [ ] Enable dependency scanning (Dependabot/Snyk)

---

## 📈 Performance & Scalability

### Current Optimizations ✅
- **Standalone Output**: Next.js standalone mode for minimal Docker images
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Database Connection Pooling**: Prisma connection pooling
- **Static Asset Caching**: CDN-ready with proper cache headers

### Recommended Production Enhancements
- **CDN**: Use Vercel Edge Network or Cloudflare
- **Redis Caching**: Enable `REDIS_URL` for session/data caching
- **Database Read Replicas**: For high-traffic scenarios
- **Horizontal Scaling**: K8s with HPA (Horizontal Pod Autoscaler)

---

## 🧪 Testing Coverage

### Existing Tests (7 Files) ✅
```
tests/
├── api/
│   ├── auth/password-hash.test.ts
│   ├── health.test.ts
│   └── design/
│       ├── figma-import.test.ts
│       └── frames.test.ts
├── lib/
│   ├── economy/mining-engine.test.ts
│   ├── agents/sankofa-interface.test.ts
│   └── knowledge/indexer.test.ts
```

### Test Categories
- **Unit Tests**: 7 files covering core business logic
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Can be added using Playwright (config exists in root)

### Running Tests
```bash
# All tests
pnpm --filter=azora-buildspaces test

# Specific test
pnpm --filter=azora-buildspaces test auth/password-hash

# Coverage report
pnpm --filter=azora-buildspaces test:coverage
```

---

## 🎨 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI primitives)
- **Code Editor**: Monaco Editor 0.55
- **Real-time**: Yjs 13.6 + y-websocket 3.0
- **State Management**: Zustand 5.0
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion 12

### Backend
- **Database**: PostgreSQL (via Prisma ORM 5.22)
- **Authentication**: NextAuth.js 4.24
- **Code Execution**: WebContainer API 1.3
- **AI Integration**: Multiple LLM providers via ai-router
- **Real-time Sync**: Yjs CRDT + WebSocket

### DevOps
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Kubernetes + Helm
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel / K8s / Docker Compose
- **Monitoring**: Health checks, Prometheus metrics endpoint

---

## 🔧 Troubleshooting

### Common Setup Issues

#### 1. Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'` or `PrismaClient is not a constructor`

**Solution**:
```bash
# Generate Prisma client
pnpm prisma:generate

# Or with explicit DATABASE_URL
DATABASE_URL="postgresql://..." pnpm exec prisma generate

# Verify generation
pnpm verify:prisma
pnpm verify:prisma:generation
```

**Why it happens**: The Prisma client must be generated after installing dependencies or changing the schema.

> 📖 **Detailed Guide**: See [PRISMA_GENERATION_GUIDE.md](./PRISMA_GENERATION_GUIDE.md) for step-by-step instructions, verification steps, and advanced troubleshooting.

---

#### 2. Database Connection Failed

**Error**: `Can't reach database server` or `Connection refused`

**Solutions**:

a) **Check DATABASE_URL format**:
```env
# Correct format
DATABASE_URL=postgresql://username:password@host:port/database

# Example
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/azora_buildspaces
```

b) **Verify PostgreSQL is running**:
```bash
# Check if PostgreSQL is running
pg_isready

# Or check the service
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
```

c) **Test connection manually**:
```bash
psql -h localhost -U postgres -d azora_buildspaces
```

d) **Check firewall/network**:
- Ensure port 5432 is open
- Check if PostgreSQL accepts remote connections (if not localhost)

---

#### 3. Database Schema Out of Sync

**Error**: `Invalid prisma.table.findMany() invocation` or `Unknown field`

**Solution**:
```bash
# Run migrations
pnpm prisma:migrate

# Or reset database (⚠️ deletes all data)
DATABASE_URL="..." pnpm exec prisma migrate reset

# Then regenerate client
pnpm prisma:generate
```

---

#### 4. Authentication Not Working

**Error**: `Invalid credentials` or `Session not found`

**Solutions**:

a) **Check NEXTAUTH_SECRET is set**:
```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
```

b) **Verify NEXTAUTH_URL matches your environment**:
```env
# Development
NEXTAUTH_URL=http://localhost:3002

# Production
NEXTAUTH_URL=https://buildspaces.azora.world
```

c) **Check database adapter is working**:
```bash
# Verify database connectivity
curl http://localhost:3002/api/health
```

d) **Development fallback mode**:
If database is unavailable, BuildSpaces provides dev credentials:
- Email: `admin@azora.world`
- Password: `Azora2026!`

This only works in development (`NODE_ENV !== production`).

---

#### 5. Port Already in Use

**Error**: `Port 3002 is already in use`

**Solutions**:

a) **Find and kill the process**:
```bash
# Find process using port 3002
lsof -i :3002  # macOS/Linux
netstat -ano | findstr :3002  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

b) **Use a different port**:
```bash
PORT=3003 pnpm dev
```

---

#### 6. Module Not Found Errors

**Error**: `Cannot find module 'X'` or `Module not found: Can't resolve 'Y'`

**Solutions**:

a) **Clean install**:
```bash
# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall from repository root
pnpm install --frozen-lockfile
```

b) **Clear Next.js cache**:
```bash
rm -rf .next
pnpm dev
```

c) **Verify you're in the correct directory**:
```bash
# Should be in repository root for pnpm commands
pwd  # Should show /path/to/azora

# Or in buildspaces directory
cd apps/azora-buildspaces
```

---

#### 7. TypeScript Errors

**Error**: Type errors or `Cannot find type definition`

**Solutions**:

a) **Regenerate Prisma types**:
```bash
pnpm prisma:generate
```

b) **Restart TypeScript server** (in VS Code):
- Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
- Type "TypeScript: Restart TS Server"

c) **Check tsconfig.json**:
Ensure `prisma/generated` is in include paths (should be automatic).

---

#### 8. Build Failures

**Error**: Build fails with various errors

**Solutions**:

a) **Check for syntax errors**:
```bash
# Run TypeScript check
pnpm type-check
```

b) **Verify all environment variables**:
```bash
pnpm verify:env
```

c) **Clean build**:
```bash
rm -rf .next
rm -rf node_modules/.cache
pnpm build
```

---

### Code Organization Issues

#### Import Errors After Reorganization

If you see errors like `Module not found: Can't resolve 'lib/db'`:

**Solution**: The codebase has been reorganized. Update imports:

```typescript
// ❌ Old imports (deprecated)
import { prisma } from 'lib/db'
import { prisma } from 'lib/prisma'
import { authOptions } from 'lib/auth'

// ✅ New imports (current)
import { prisma } from 'lib/database/client'
import { authOptions } from 'lib/auth/config'
```

Run the verification script to check for outdated imports:
```bash
pnpm verify:auth-imports
```

---

### Performance Issues

#### Slow Database Queries

**Solutions**:

a) **Check connection pooling**:
```env
# In .env.local
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20
```

b) **Monitor slow queries**:
```bash
# Enable Prisma query logging
DEBUG=prisma:query pnpm dev
```

c) **Add database indexes** (if needed):
Check `prisma/schema.prisma` for `@@index` directives on frequently queried fields.

---

#### High Memory Usage

**Solutions**:

a) **Check for memory leaks**:
```bash
# Monitor memory
node --inspect pnpm dev
# Open chrome://inspect in Chrome
```

b) **Reduce connection pool size**:
```env
DATABASE_URL=postgresql://...?connection_limit=10
```

---

### Getting Help

If you're still experiencing issues:

1. **Check the health endpoint**:
   ```bash
   curl http://localhost:3002/api/health
   ```

2. **Review logs**:
   ```bash
   # Development logs are in console
   # Production logs (if using Docker):
   docker logs <container-id>
   ```

3. **Run diagnostics**:
   ```bash
   pnpm verify:prisma
   pnpm verify:env
   ```

4. **Check related documentation**:
   - [Database Guide](../../docs/DATABASE-GUIDE.md)
   - [Deployment Guide](../../docs/DEPLOYMENT.md)
   - [Security Guide](../../docs/SECURITY.md)

5. **Report an issue**:
   - Include error messages
   - Include relevant logs
   - Include environment details (OS, Node version, etc.)
   - Include steps to reproduce

---

## 📁 Code Organization

### New Structure (Post-Reorganization)

BuildSpaces follows a modular, domain-driven code organization:

```
apps/azora-buildspaces/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   └── [...nextauth]/   # NextAuth handler
│   │   ├── health/               # Health check endpoint
│   │   ├── agents/               # AI agent endpoints
│   │   ├── buildspaces/          # Project management
│   │   ├── chat/                 # Command Desk chat
│   │   ├── design/               # Design Studio (Figma)
│   │   ├── economy/              # Token economy
│   │   ├── fs/                   # File system operations
│   │   ├── knowledge/            # Knowledge Ocean search
│   │   ├── maker-lab/            # Database designer
│   │   ├── marketplace/          # Template marketplace
│   │   ├── metrics/              # Prometheus metrics
│   │   └── notebook/             # AI Studio notebooks
│   ├── (dashboard)/              # Dashboard layout group
│   └── (auth)/                   # Auth layout group
│
├── lib/                          # Core business logic
│   ├── database/                 # ✨ Database module
│   │   ├── client.ts             # Prisma client singleton
│   │   ├── types.ts              # Database type exports
│   │   ├── utils.ts              # Database utilities
│   │   └── index.ts              # Main export
│   │
│   ├── auth/                     # ✨ Authentication module
│   │   ├── config.ts             # NextAuth configuration
│   │   ├── providers.ts          # Auth providers (GitHub, Google, etc.)
│   │   ├── callbacks.ts          # NextAuth callbacks
│   │   ├── utils.ts              # Password hashing, verification
│   │   └── index.ts              # Main export
│   │
│   ├── config/                   # ✨ Configuration module
│   │   ├── env.ts                # Environment validation (Zod)
│   │   ├── constants.ts          # Application constants
│   │   └── index.ts              # Main export
│   │
│   ├── agents/                   # AI agent interfaces
│   │   ├── orchestrator.ts       # Workflow orchestration
│   │   ├── sankofa-interface.ts  # Sankofa AI integration
│   │   └── types.ts              # Agent types
│   │
│   ├── economy/                  # Token economy
│   │   ├── mining-engine.ts      # AZR token mining
│   │   └── wallet.ts             # Wallet operations
│   │
│   ├── knowledge/                # Knowledge Ocean
│   │   ├── indexer.ts            # File indexing
│   │   └── search.ts             # Semantic search
│   │
│   ├── services/                 # External services
│   │   ├── file-system.ts        # File operations
│   │   ├── integrated-terminal.ts # Terminal service
│   │   └── constitutional-ai.ts  # Constitutional validation
│   │
│   └── utils.ts                  # General utilities
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── rooms/                    # Room-specific components
│   └── shared/                   # Shared components
│
├── scripts/                      # ✨ Utility scripts
│   ├── setup.ts                  # Automated setup
│   ├── verify-prisma.ts          # Prisma verification
│   └── verify-auth-imports.ts    # Import verification
│
├── tests/                        # Test files
│   ├── api/                      # API endpoint tests
│   └── lib/                      # Library tests
│
├── public/                       # Static assets
├── styles/                       # Global styles
└── k8s/                          # Kubernetes manifests
```

### Key Principles

1. **Single Source of Truth**
   - Database client: `lib/database/client.ts`
   - Auth configuration: `lib/auth/config.ts`
   - Environment config: `lib/config/env.ts`

2. **Clear Module Boundaries**
   - Each module has a clear responsibility
   - Modules export through `index.ts` for clean imports
   - No circular dependencies

3. **Type Safety**
   - All modules are fully typed with TypeScript
   - Prisma generates types automatically
   - Zod validates runtime data

4. **Testability**
   - Business logic separated from UI
   - Modules can be tested independently
   - Mock-free testing (real database/APIs)

### Import Patterns

```typescript
// ✅ Correct imports (use these)
import { prisma, PRISMA_AVAILABLE } from 'lib/database/client'
import { authOptions } from 'lib/auth/config'
import { env } from 'lib/config/env'
import { hashPassword, verifyPassword } from 'lib/auth/utils'

// ❌ Deprecated imports (don't use)
import { prisma } from 'lib/db'           // File removed
import { prisma } from 'lib/prisma'       // File removed
import { authOptions } from 'lib/auth'    // Moved to lib/auth/config
```

### Migration Guide

If you have existing code using old imports:

1. **Find all occurrences**:
   ```bash
   grep -r "from 'lib/db'" .
   grep -r "from 'lib/prisma'" .
   ```

2. **Update imports**:
   ```bash
   # Run verification script
   pnpm verify:auth-imports
   ```

3. **Test changes**:
   ```bash
   pnpm type-check
   pnpm test
   ```

---

## 🚦 Health Monitoring

### Health Check Endpoint: `/api/health`

**Response Example**:
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": 1704828282000,
  "uptime": 12345.67,
  "version": "0.1.0",
  "checks": {
    "memory": {
      "used": 123456789,
      "total": 987654321,
      "percentage": 12.5
    },
    "database": {
      "status": "connected",
      "latency": 15
    }
  },
  "constitutional_alignment": 0.99
}
```

### Metrics Endpoint: `/api/metrics`
Prometheus-compatible metrics for monitoring.

---

## 📦 Database Schema

All models are in the centralized Prisma schema at `/prisma/schema.prisma`.

### Key Models
- `BuildSpaceProject` - Project metadata
- `BuildSpaceSpec` - Specifications
- `BuildSpaceExecution` - AI agent runs
- `ChatSession` - Command Desk sessions
- `ChatMessage` - Chat history
- `FigmaFrame` - Design frames
- `User`, `Account`, `Session` - Authentication

### Migration Commands
```bash
# Development
DATABASE_URL="..." pnpm exec prisma migrate dev --name your_migration

# Production
DATABASE_URL="..." pnpm exec prisma migrate deploy

# Generate client
DATABASE_URL="..." pnpm exec prisma generate
```

---

## 🤝 Contributing

See root `/CONTRIBUTING.md` for general guidelines.

### BuildSpaces-Specific Guidelines
1. **No Mock Data**: All data must come from APIs or database (Constitutional requirement)
2. **Test Coverage**: New features must include tests
3. **Security**: All AI commands must pass constitutional validation
4. **Performance**: Code execution must complete in <30s
5. **Documentation**: Update this README when adding features

---

## 📄 License

Proprietary - Azora ES (Pty) Ltd

---

## 🔗 Related Documentation

- **Setup & Configuration**:
  - [SETUP.md](./SETUP.md) - Detailed setup instructions
  - [CODE_ORGANIZATION.md](./CODE_ORGANIZATION.md) - Code structure and patterns
  - [.env.example](./.env.example) - Environment variables reference

- **Production & Deployment**:
  - [Production Readiness Report](./PRODUCTION-READINESS.md)
  - [Gap Analysis](./BUILDSPACES-GAP-ANALYSIS.md)
  - [Constitutional Compliance Audit](./BUILDSPACES-AUDIT-REPORT.md)

- **General Documentation**:
  - [Root Apps README](../README.md)
  - [Database Guide](../../docs/DATABASE-GUIDE.md)
  - [Deployment Guide](../../docs/DEPLOYMENT.md)
  - [Security Guide](../../docs/SECURITY.md)
  - [Testing Guide](../../docs/testing/TESTING-STANDARDS.md)

- **Azora Philosophy**:
  - [Azora Constitution](../../CONSTITUTION.md)
  - [AI Dev Laws](../../AI_DEV_LAWS.md)
  - [Ubuntu Philosophy](../../docs/UBUNTU-PHILOSOPHY.md)

---

---

## 🚧 Known Issues & Remaining Tasks

### Critical Backend Gaps
1.  **Plugin Registry**: A new `ToolRegistry` centralizes actionable skills (run_command, write_file, transform, etc.), enabling skill discovery for agents and eliminating hand-written switch statements. Both AI Studio and the orchestrator now leverage this registry.
2.  **Audit Logging**: Constitutional audit logs (`lib/constitutional-guard.ts`) are currently stored in `localStorage` and console. Needs to be persisted to the database for production compliance.

### Authentication
- **Dev Auth Mode**: Currently enabled to allow master login (`admin@azora.world`) without database dependency. Needs to be switched back to full `PrismaAdapter` mode for production.

---

**Status**: 🟡 Beta / Audit Complete (85% Complete)  
**Next Milestone**: Full Production Launch  
**Last Updated**: January 9, 2026

**Built with Ubuntu Philosophy** 💚  
*"I am because we are"*

---
