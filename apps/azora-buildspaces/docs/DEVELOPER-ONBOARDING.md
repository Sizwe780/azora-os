# BuildSpaces Developer Onboarding Guide

Welcome to BuildSpaces development! This guide will help you get started contributing to the BuildSpaces project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Constitutional Compliance](#constitutional-compliance)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher
- **PostgreSQL**: v14 or higher (optional for local dev)
- **Git**: Latest version

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Prisma
- **Docker** (for containerized development)
- **Postman** or **Insomnia** (for API testing)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Azora-OS/azora.git
cd azora
```

### 2. Install Dependencies

```bash
# Install pnpm globally if you haven't
npm install -g pnpm@9

# Install project dependencies
pnpm install --no-frozen-lockfile
```

### 3. Environment Setup

Create a `.env` file in the `apps/azora-buildspaces` directory:

```bash
cp apps/azora-buildspaces/.env.example apps/azora-buildspaces/.env
```

Edit `.env` with your configuration:

```env
# Database (optional for development)
DATABASE_URL=postgresql://user:password@localhost:5432/azora_buildspaces

# Code Execution
PISTON_API_URL=https://emkc.org/api/v2/piston

# Design Integration
FIGMA_TOKEN=your_figma_token_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Agent Service
NEXT_PUBLIC_AGENT_API_URL=http://localhost:3010

# Optional: Redis for rate limiting
REDIS_URL=redis://localhost:6379
RATE_LIMIT_BACKEND=redis
```

### 4. Database Setup (Optional)

If using a database:

```bash
# Generate Prisma client
npx prisma generate --schema=../../prisma/schema.prisma

# Run migrations
npx prisma migrate dev --schema=../../prisma/schema.prisma

# Seed the database (optional)
npx prisma db seed --schema=../../prisma/schema.prisma
```

### 5. Start Development Server

```bash
# From the root of the monorepo
pnpm -w -F azora-buildspaces dev

# Or from the buildspaces directory
cd apps/azora-buildspaces
pnpm dev
```

Visit `http://localhost:3000` to see the application.

---

## Project Structure

```
apps/azora-buildspaces/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── agents/          # Agent invocation endpoints
│   │   ├── buildspaces/     # BuildSpace management
│   │   ├── chat/            # Chat sessions
│   │   ├── design/          # Figma integration
│   │   ├── health/          # Health check
│   │   ├── knowledge/       # Knowledge base
│   │   └── metrics/         # Prometheus metrics
│   ├── auth/                # Authentication pages
│   ├── features/            # Feature pages
│   └── workspace/           # Main workspace page
├── components/              # React components
│   ├── rooms/              # BuildSpace "rooms"
│   │   ├── code-chamber/   # Code editor
│   │   ├── command-desk/   # AI chat interface
│   │   ├── design-studio/  # Design import
│   │   ├── maker-lab/      # Database designer
│   │   └── ...
│   └── ui/                 # Shared UI components
├── lib/                     # Utility libraries
│   ├── agents/             # Agent interfaces
│   ├── knowledge/          # Knowledge indexing
│   ├── services/           # External services
│   └── ...
├── tests/                   # Test files
│   ├── api/                # API tests
│   ├── lib/                # Library tests
│   └── setupTests.ts       # Test configuration
├── docs/                    # Documentation
├── prisma/                  # Prisma schema (local)
└── public/                  # Static assets
```

---

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `refactor/*`: Code improvements

### Creating a Feature

```bash
# Create a new branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create a Pull Request
```

### Commit Message Format

Follow Conventional Commits:

```
feat: add new feature
fix: resolve bug in component
docs: update API documentation
test: add tests for utility
refactor: improve code structure
chore: update dependencies
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (automatic)
- **Linting**: ESLint (automatic)

Run linting:

```bash
pnpm lint
```

Fix linting issues:

```bash
pnpm lint --fix
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

Tests are located in `tests/` directory. Example:

```typescript
// tests/api/my-endpoint.test.ts
describe('My Endpoint', () => {
  it('should return expected result', async () => {
    const result = await myFunction()
    expect(result).toBeDefined()
  })
})
```

### Test Coverage Goals

- **Overall**: > 80%
- **Critical paths**: > 90%
- **UI components**: > 70%

---

## Constitutional Compliance

All code must adhere to the Azora Constitution:

### 1. No Mock Protocol

❌ **Don't:**
```typescript
const mockData = [
  { id: 1, name: 'Fake User' },
  { id: 2, name: 'Test User' }
]
```

✅ **Do:**
```typescript
// Fetch real data from database or API
const users = await db.user.findMany()

// Or start with empty state
const users = []
```

### 2. Truth Mandate

- All data must be authentic
- No fake initial states
- Database-backed persistence

### 3. Ubuntu Philosophy

- Collaborative features prioritized
- Real-time sync using Yjs
- Shared state for teamwork

### 4. Security by Design

- Rate limiting on all endpoints
- Input validation
- Secure code execution (Piston API)
- Audit logging

### Checklist Before Submitting

- [ ] No mock data or fake initial states
- [ ] All database queries use Prisma
- [ ] Security headers configured
- [ ] Error handling implemented
- [ ] Tests added for new code
- [ ] Documentation updated
- [ ] Constitutional alignment verified

---

## Deployment

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Docker Build

```bash
# Build Docker image
docker build -t buildspaces:latest -f apps/azora-buildspaces/Dockerfile .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  buildspaces:latest
```

### Environment Variables (Production)

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for authentication
- `NEXTAUTH_URL`: Production URL

Optional:
- `PISTON_API_URL`: Custom Piston instance
- `FIGMA_TOKEN`: Figma API token
- `REDIS_URL`: Redis for rate limiting
- `SENTRY_DSN`: Error tracking

### CI/CD Pipeline

GitHub Actions workflows:
- `.github/workflows/buildspaces.yml`: Build and test
- `.github/workflows/security.yml`: Security scans
- `.github/workflows/e2e-buildspaces.yml`: E2E tests

---

## Troubleshooting

### Common Issues

#### 1. Dependency Installation Fails

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules
rm -rf node_modules

# Reinstall
pnpm install --no-frozen-lockfile
```

#### 2. Database Connection Issues

Check your `DATABASE_URL` in `.env`:
```bash
# Test connection
npx prisma db pull --schema=../../prisma/schema.prisma
```

#### 3. Build Errors

```bash
# Clean build artifacts
rm -rf .next

# Rebuild
pnpm build
```

#### 4. TypeScript Errors

```bash
# Regenerate Prisma client
npx prisma generate --schema=../../prisma/schema.prisma

# Check types
pnpm type-check
```

### Getting Help

- **GitHub Issues**: https://github.com/Azora-OS/azora/issues
- **Discussions**: https://github.com/Azora-OS/azora/discussions
- **Discord**: https://discord.gg/azora
- **Documentation**: https://docs.azora.dev

---

## Key Concepts

### BuildSpaces "Rooms"

Each room is a specialized development environment:

1. **Code Chamber**: Monaco editor for coding
2. **Spec Chamber**: AI-powered spec generation
3. **Command Desk**: Chat interface with AI agents
4. **Design Studio**: Figma design import
5. **AI Studio**: Jupyter-like notebook
6. **Maker Lab**: Database schema designer
7. **Knowledge Ocean**: Code knowledge base
8. **Collaboration Pod**: Real-time teamwork
9. **Innovation Theater**: Showcase presentations

### AI Agents

- **Sankofa**: Code generation and specifications
- **Elara**: Creative content and documentation
- **Themba**: Testing and validation
- **Kwame**: Scaffolding and project setup

### State Management

- **Yjs**: Collaborative real-time state
- **Zustand**: Local application state
- **Prisma**: Database persistence

### Security Layers

1. **Rate Limiting**: Middleware-based (middleware.ts)
2. **CSP Headers**: Content Security Policy
3. **CORS**: Cross-origin resource sharing
4. **Audit Logging**: All significant actions logged
5. **Code Execution**: Sandboxed via Piston API

---

## Best Practices

### 1. Component Design

```typescript
// Use TypeScript for all components
interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return <div onClick={onAction}>{title}</div>
}
```

### 2. API Routes

```typescript
// Always include error handling
export async function POST(request: Request) {
  try {
    const data = await request.json()
    // Process data
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Database Queries

```typescript
// Use Prisma for type-safe queries
import { prisma } from '@/lib/db'

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { projects: true }
})
```

### 4. Async Operations

```typescript
// Use proper error handling
try {
  const result = await fetchData()
  return result
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network errors
  }
  throw error
}
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Yjs Docs**: https://docs.yjs.dev
- **Azora Constitution**: `CONSTITUTION.md` in root
- **BuildSpaces Vision**: `docs/vision/AZORA-BUILDSPACES-VISION.md`

---

## Contributing

We welcome contributions! Please:

1. Read the [Contributing Guide](../../CONTRIBUTING.md)
2. Follow the [Code of Conduct](../../CODE_OF_CONDUCT.md)
3. Submit PRs with clear descriptions
4. Ensure tests pass and coverage is maintained
5. Follow constitutional compliance guidelines

---

## Next Steps

1. ✅ Set up your development environment
2. ✅ Explore the codebase
3. ✅ Run tests and understand test patterns
4. ✅ Pick an issue to work on
5. ✅ Submit your first PR!

**Welcome to the BuildSpaces team! 🚀**

---

*Last Updated: January 2026*
