# BuildSpaces Code Organization

This document describes the code organization structure implemented in BuildSpaces after the consolidation and reorganization effort.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Core Modules](#core-modules)
- [Import Patterns](#import-patterns)
- [Design Principles](#design-principles)
- [Migration Guide](#migration-guide)

---

## Overview

BuildSpaces follows a modular, domain-driven architecture with clear separation of concerns. The codebase is organized into logical modules, each with a single responsibility and well-defined interfaces.

### Key Improvements

- ✅ **Single Source of Truth**: No duplicate implementations
- ✅ **Clear Module Boundaries**: Each module has a specific purpose
- ✅ **Type Safety**: Full TypeScript coverage with Prisma-generated types
- ✅ **Testability**: Business logic separated from UI components
- ✅ **Maintainability**: Consistent patterns and conventions

---

## Directory Structure

```
apps/azora-buildspaces/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   ├── register/        # User registration
│   │   │   └── reset-password/  # Password reset
│   │   ├── health/               # Health check endpoint
│   │   ├── metrics/              # Prometheus metrics
│   │   ├── agents/               # AI agent endpoints
│   │   │   ├── invoke/          # Agent invocation
│   │   │   ├── executions/      # Execution history
│   │   │   └── list/            # Available agents
│   │   ├── buildspaces/          # Project management
│   │   │   ├── projects/        # CRUD operations
│   │   │   └── execute/         # Project execution
│   │   ├── chat/                 # Command Desk chat
│   │   │   └── sessions/        # Chat sessions
│   │   ├── design/               # Design Studio (Figma)
│   │   │   ├── figma-import/    # Import from Figma
│   │   │   ├── frames/          # Frame management
│   │   │   └── generate/        # Design-to-code
│   │   ├── economy/              # Token economy
│   │   │   ├── wallet/          # Wallet operations
│   │   │   └── award/           # Token awards
│   │   ├── fs/                   # File system operations
│   │   │   ├── route.ts         # File CRUD
│   │   │   └── scan/            # Directory scanning
│   │   ├── knowledge/            # Knowledge Ocean
│   │   │   ├── search/          # Semantic search
│   │   │   ├── index/           # Indexing
│   │   │   └── scan-files/      # File scanning
│   │   ├── maker-lab/            # Database designer
│   │   │   └── schema/          # Schema generation
│   │   ├── marketplace/          # Template marketplace
│   │   │   └── templates/       # Template CRUD
│   │   ├── notebook/             # AI Studio notebooks
│   │   │   └── execute/         # Cell execution
│   │   └── collectibles/         # NFT collectibles
│   │       └── cards/           # Card generation
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── [room]/              # Dynamic room routes
│   └── (auth)/                   # Auth layout group
│       ├── login/               # Login page
│       └── register/            # Registration page
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
│   │   ├── providers.ts          # Auth providers
│   │   ├── callbacks.ts          # NextAuth callbacks
│   │   ├── utils.ts              # Password utilities
│   │   └── index.ts              # Main export
│   │
│   ├── config/                   # ✨ Configuration module
│   │   ├── env.ts                # Environment validation
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
│   ├── audit/                    # Launch audit system
│   │   ├── types.ts              # Audit types
│   │   ├── orchestrator.ts       # Audit orchestration
│   │   ├── report-generator.ts   # Report generation
│   │   └── auditors/             # Individual auditors
│   │       ├── index.ts          # Auditor exports
│   │       ├── constitutional-auditor.ts
│   │       ├── no-mock-enforcer.ts
│   │       ├── auth-auditor.ts
│   │       ├── database-auditor.ts
│   │       ├── ai-agent-auditor.ts
│   │       ├── file-system-auditor.ts
│   │       ├── economic-auditor.ts
│   │       ├── security-headers-auditor.ts
│   │       ├── deployment-auditor.ts
│   │       └── performance-auditor.ts
│   │
│   ├── constitutional-guard.ts   # Constitutional validation
│   └── utils.ts                  # General utilities
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── rooms/                    # Room-specific components
│   │   ├── code-chamber/
│   │   ├── spec-chamber/
│   │   ├── design-studio/
│   │   └── ...
│   └── shared/                   # Shared components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── ...
│
├── scripts/                      # ✨ Utility scripts
│   ├── setup.ts                  # Automated setup
│   ├── verify-prisma.ts          # Prisma verification
│   ├── verify-auth-imports.ts    # Import verification
│   ├── test-env-config.ts        # Environment testing
│   └── run-*-audit.ts            # Audit scripts
│
├── tests/                        # Test files
│   ├── api/                      # API endpoint tests
│   │   ├── auth/
│   │   ├── health.test.ts
│   │   └── design/
│   └── lib/                      # Library tests
│       ├── economy/
│       ├── agents/
│       └── knowledge/
│
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── ...
│
├── styles/                       # Global styles
│   └── globals.css
│
├── k8s/                          # Kubernetes manifests
│   ├── buildspaces-namespace.yaml
│   ├── buildspaces-deployment.yaml
│   ├── buildspaces-service.yaml
│   └── buildspaces-ingress.yaml
│
├── .env.example                  # Environment template
├── .env.local                    # Local environment (gitignored)
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Package dependencies
├── jest.config.js                # Jest configuration
├── Dockerfile                    # Docker build
└── README.md                     # Main documentation
```

---

## Core Modules

### 1. Database Module (`lib/database/`)

**Purpose**: Centralized database client and utilities.

**Files**:
- `client.ts` - Prisma client singleton with connection pooling
- `types.ts` - Database type exports (re-exports from Prisma)
- `utils.ts` - Database utility functions
- `index.ts` - Main export point

**Key Features**:
- Singleton pattern prevents multiple client instances
- Graceful degradation with clear error messages
- Prisma v7 adapter configuration for PostgreSQL
- Connection pooling with configurable limits
- Development vs production behavior

**Usage**:
```typescript
import { prisma, PRISMA_AVAILABLE } from 'lib/database/client'
import { getDatabaseStatus } from 'lib/database/utils'

// Check if database is available
if (PRISMA_AVAILABLE) {
  const users = await prisma.user.findMany()
}

// Get detailed status
const status = await getDatabaseStatus()
console.log(status.connected) // true/false
```

**Implementation Details**:
- Uses `@prisma/adapter-pg` for Prisma v7 compatibility
- Implements error-throwing proxy when database unavailable
- Provides helpful error messages with remediation steps
- Exports `PRISMA_AVAILABLE` flag for conditional features

---

### 2. Authentication Module (`lib/auth/`)

**Purpose**: Centralized authentication configuration and utilities.

**Files**:
- `config.ts` - NextAuth configuration with Prisma adapter
- `providers.ts` - Auth provider configurations (GitHub, Google, Credentials)
- `callbacks.ts` - NextAuth callbacks (JWT, session)
- `utils.ts` - Password hashing and verification
- `index.ts` - Main export point

**Key Features**:
- Dynamic provider loading based on environment
- Conditional Prisma adapter usage
- JWT strategy with session callbacks
- Development fallback authentication
- Secure password hashing with pbkdf2

**Usage**:
```typescript
import { authOptions } from 'lib/auth/config'
import { hashPassword, verifyPassword } from 'lib/auth/utils'
import { getAuthProviders } from 'lib/auth/providers'

// Use in NextAuth API route
export default NextAuth(authOptions)

// Hash password
const hashed = await hashPassword('mypassword')

// Verify password
const valid = await verifyPassword('mypassword', hashed)

// Get available providers
const providers = getAuthProviders()
```

**Implementation Details**:
- Uses NextAuth with Prisma adapter when database available
- Falls back to credentials-only in development without database
- Implements secure JWT callbacks for session management
- Provides dev credentials for testing (`admin@azora.world`)

---

### 3. Configuration Module (`lib/config/`)

**Purpose**: Environment variable validation and application constants.

**Files**:
- `env.ts` - Zod schema validation for environment variables
- `constants.ts` - Application constants (ports, timeouts, etc.)
- `index.ts` - Main export point

**Key Features**:
- Type-safe environment variable access
- Zod schema validation with clear error messages
- Separate required vs optional variables
- Development vs production requirements

**Usage**:
```typescript
import { env } from 'lib/config/env'
import { APP_CONSTANTS } from 'lib/config/constants'

// Type-safe environment access
const dbUrl = env.DATABASE_URL // string | undefined
const secret = env.NEXTAUTH_SECRET // string (required)

// Application constants
const port = APP_CONSTANTS.PORT // 3002
const timeout = APP_CONSTANTS.AGENT_TIMEOUT_MS // 60000
```

**Implementation Details**:
- Uses Zod for runtime validation
- Provides helpful error messages for missing variables
- Exports validated `env` object with TypeScript types
- Validates on module import (fail-fast)

---

### 4. Agents Module (`lib/agents/`)

**Purpose**: AI agent orchestration and interfaces.

**Files**:
- `orchestrator.ts` - Workflow orchestration engine
- `sankofa-interface.ts` - Sankofa AI integration
- `types.ts` - Agent types and interfaces

**Key Features**:
- Multi-agent workflow orchestration
- LLM provider abstraction
- Constitutional validation integration
- Execution history tracking

**Usage**:
```typescript
import { WorkflowOrchestrator } from 'lib/agents/orchestrator'
import { SankoFaInterface } from 'lib/agents/sankofa-interface'

// Create orchestrator
const orchestrator = new WorkflowOrchestrator()

// Execute workflow
const result = await orchestrator.executeWorkflow({
  agentId: 'sankofa',
  command: 'generate code',
  context: { ... }
})

// Use Sankofa directly
const sankofa = new SankoFaInterface()
const code = await sankofa.generateCode(spec)
```

---

### 5. Economy Module (`lib/economy/`)

**Purpose**: Token economy and mining engine.

**Files**:
- `mining-engine.ts` - AZR token mining logic
- `wallet.ts` - Wallet operations

**Key Features**:
- Proof-of-contribution mining
- Token awards and transfers
- Wallet balance management
- Transaction history

**Usage**:
```typescript
import { MiningEngine } from 'lib/economy/mining-engine'
import { Wallet } from 'lib/economy/wallet'

// Mine tokens
const engine = new MiningEngine()
const reward = await engine.mine(userId, contribution)

// Wallet operations
const wallet = new Wallet(userId)
const balance = await wallet.getBalance()
await wallet.transfer(toUserId, amount)
```

---

### 6. Knowledge Module (`lib/knowledge/`)

**Purpose**: Knowledge Ocean indexing and search.

**Files**:
- `indexer.ts` - File indexing and vector embeddings
- `search.ts` - Semantic search implementation

**Key Features**:
- File system scanning and indexing
- Vector-based semantic search
- Multiple search modes (exact, fuzzy, semantic)
- Integration with AI agents

**Usage**:
```typescript
import { KnowledgeIndexer } from 'lib/knowledge/indexer'
import { semanticSearch } from 'lib/knowledge/search'

// Index files
const indexer = new KnowledgeIndexer()
await indexer.indexDirectory('/path/to/code')

// Search
const results = await semanticSearch('authentication logic')
```

---

## Import Patterns

### ✅ Correct Imports (Current)

```typescript
// Database
import { prisma, PRISMA_AVAILABLE } from 'lib/database/client'
import { getDatabaseStatus } from 'lib/database/utils'
import type { User, Project } from 'lib/database/types'

// Authentication
import { authOptions } from 'lib/auth/config'
import { hashPassword, verifyPassword } from 'lib/auth/utils'
import { getAuthProviders } from 'lib/auth/providers'

// Configuration
import { env } from 'lib/config/env'
import { APP_CONSTANTS } from 'lib/config/constants'

// Agents
import { WorkflowOrchestrator } from 'lib/agents/orchestrator'
import { SankoFaInterface } from 'lib/agents/sankofa-interface'

// Economy
import { MiningEngine } from 'lib/economy/mining-engine'

// Knowledge
import { KnowledgeIndexer } from 'lib/knowledge/indexer'
```

### ❌ Deprecated Imports (Don't Use)

```typescript
// These files have been removed
import { prisma } from 'lib/db'           // ❌ Use lib/database/client
import { prisma } from 'lib/prisma'       // ❌ Use lib/database/client
import { authOptions } from 'lib/auth'    // ❌ Use lib/auth/config
```

### Module Exports

Each module exports through `index.ts` for clean imports:

```typescript
// lib/database/index.ts
export * from './client'
export * from './types'
export * from './utils'

// lib/auth/index.ts
export * from './config'
export * from './providers'
export * from './callbacks'
export * from './utils'

// lib/config/index.ts
export * from './env'
export * from './constants'
```

This allows importing from the module root:

```typescript
// Both work, but module root is preferred
import { prisma } from 'lib/database'
import { prisma } from 'lib/database/client'
```

---

## Design Principles

### 1. Single Source of Truth

Each piece of functionality has exactly one implementation:

- **Database client**: `lib/database/client.ts` (not `lib/db.ts` or `lib/prisma.ts`)
- **Auth config**: `lib/auth/config.ts` (not `lib/auth.ts`)
- **Environment**: `lib/config/env.ts` (not scattered across files)

### 2. Clear Module Boundaries

Each module has a specific responsibility:

- `lib/database/` - Database operations only
- `lib/auth/` - Authentication only
- `lib/config/` - Configuration only
- `lib/agents/` - AI agent operations only

No cross-cutting concerns or mixed responsibilities.

### 3. Type Safety

All modules are fully typed:

- TypeScript strict mode enabled
- Prisma generates types automatically
- Zod validates runtime data
- No `any` types (except where necessary)

### 4. Testability

Business logic is separated from UI:

- Pure functions where possible
- Dependency injection for external services
- Mock-free testing with real database
- Clear interfaces for testing

### 5. Fail Fast

Errors are caught early:

- Environment validation on startup
- Prisma client generation check
- Database connection verification
- Clear error messages with remediation steps

### 6. Graceful Degradation

Features degrade gracefully when dependencies unavailable:

- Database unavailable → Dev fallback auth
- Redis unavailable → In-memory caching
- AI provider unavailable → Clear error message

---

## Migration Guide

### Updating Existing Code

If you have code using old imports:

#### 1. Find Deprecated Imports

```bash
# Search for old imports
grep -r "from 'lib/db'" apps/azora-buildspaces/
grep -r "from 'lib/prisma'" apps/azora-buildspaces/
grep -r "from 'lib/auth'" apps/azora-buildspaces/ | grep -v "lib/auth/"
```

#### 2. Update Imports

Replace old imports with new ones:

```typescript
// Before
import { prisma } from 'lib/db'
import { authOptions } from 'lib/auth'

// After
import { prisma } from 'lib/database/client'
import { authOptions } from 'lib/auth/config'
```

#### 3. Run Verification

```bash
# Check for remaining deprecated imports
pnpm verify:auth-imports

# Type check
pnpm type-check

# Run tests
pnpm test
```

### Adding New Features

When adding new features, follow these patterns:

#### 1. Choose the Right Module

- Database operations → `lib/database/`
- Authentication → `lib/auth/`
- AI agents → `lib/agents/`
- Token economy → `lib/economy/`
- File operations → `lib/services/file-system.ts`

#### 2. Create Module Files

```typescript
// lib/my-module/
├── index.ts        // Main export
├── types.ts        // TypeScript types
├── utils.ts        // Utility functions
└── service.ts      // Main service class
```

#### 3. Export Through Index

```typescript
// lib/my-module/index.ts
export * from './types'
export * from './utils'
export * from './service'
```

#### 4. Add Tests

```typescript
// tests/lib/my-module/service.test.ts
import { MyService } from 'lib/my-module'

describe('MyService', () => {
  it('should work correctly', async () => {
    const service = new MyService()
    const result = await service.doSomething()
    expect(result).toBeDefined()
  })
})
```

---

## Best Practices

### 1. Import Organization

Organize imports in this order:

```typescript
// 1. External dependencies
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 2. Internal modules (lib/)
import { prisma } from 'lib/database/client'
import { authOptions } from 'lib/auth/config'

// 3. Components
import { Button } from 'components/ui/button'

// 4. Types
import type { User } from 'lib/database/types'

// 5. Utilities
import { formatDate } from 'lib/utils'
```

### 2. Error Handling

Always handle errors gracefully:

```typescript
import { prisma, PRISMA_AVAILABLE } from 'lib/database/client'

// Check availability before using
if (!PRISMA_AVAILABLE) {
  return NextResponse.json(
    { error: 'Database not available' },
    { status: 503 }
  )
}

// Use try-catch for operations
try {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
} catch (error) {
  console.error('Database error:', error)
  return NextResponse.json(
    { error: 'Failed to fetch users' },
    { status: 500 }
  )
}
```

### 3. Type Safety

Use TypeScript types everywhere:

```typescript
import type { User, Project } from 'lib/database/types'

// Type function parameters
async function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

// Type API responses
interface ApiResponse {
  success: boolean
  data?: User
  error?: string
}
```

### 4. Configuration

Use environment variables through the config module:

```typescript
import { env } from 'lib/config/env'

// ✅ Type-safe access
const apiKey = env.OPENAI_API_KEY

// ❌ Don't access process.env directly
const apiKey = process.env.OPENAI_API_KEY
```

---

## Related Documentation

- [README.md](./README.md) - Overview and features
- [SETUP.md](./SETUP.md) - Setup instructions
- [.env.example](./.env.example) - Environment variables
- [Database Guide](../../docs/DATABASE-GUIDE.md)
- [Security Guide](../../docs/SECURITY.md)

---

**Last Updated**: January 2026  
**Status**: Production Ready  
**Version**: 0.1.0
