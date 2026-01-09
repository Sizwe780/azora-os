# 🤖 Implementation Guide for Coding Agent

**Purpose**: This document provides a systematic implementation plan for a coding agent to make BuildSpaces production-ready.

**Target**: Complete all 🔴 CRITICAL items from PRODUCTION-LAUNCH-CHECKLIST.md

---

## 📋 Implementation Strategy

### Phase 1: Infrastructure Foundation (Priority: CRITICAL)
**Estimated Time**: 2-3 days  
**Dependencies**: None

#### Task 1.1: Create Dockerfile
**File**: `apps/azora-buildspaces/Dockerfile`

```dockerfile
# Multi-stage build for production Next.js app
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=../../prisma/schema.prisma

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

**Also create**: `apps/azora-buildspaces/.dockerignore`
```
node_modules
.next
.git
.env.local
*.log
README.md
.vscode
.idea
```

**Update**: `next.config.mjs` - Add `output: 'standalone'`

---

#### Task 1.2: Create Jest Configuration
**File**: `apps/azora-buildspaces/jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx,js,jsx}',
    '<rootDir>/**/__tests__/**/*.{ts,tsx,js,jsx}',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
```

**Also create**: `apps/azora-buildspaces/jest.setup.js`
```javascript
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));
```

**Install dependencies**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

---

#### Task 1.3: Create Health Check Endpoint
**File**: `apps/azora-buildspaces/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheck {
  status: 'ok' | 'error';
  timestamp?: string;
  error?: string;
  responseTime?: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthCheck;
    agentService: HealthCheck;
    redis?: HealthCheck;
  };
  uptime: number;
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

async function checkAgentService(): Promise<HealthCheck> {
  const start = Date.now();
  const agentUrl = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:3010';
  
  try {
    const response = await fetch(`${agentUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    if (response.ok) {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - start,
      };
    } else {
      return {
        status: 'error',
        error: `HTTP ${response.status}`,
        responseTime: Date.now() - start,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Connection failed',
      responseTime: Date.now() - start,
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  
  // Only check if Redis is configured
  if (!process.env.REDIS_URL) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: 0,
    };
  }
  
  try {
    // Add Redis check when implemented
    // For now, return ok if URL is configured
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

export async function GET() {
  const startTime = Date.now();
  
  const checks = {
    database: await checkDatabase(),
    agentService: await checkAgentService(),
    redis: await checkRedis(),
  };
  
  // Determine overall health
  const criticalChecks = [checks.database];
  const hasError = criticalChecks.some(check => check.status === 'error');
  
  const status: HealthStatus['status'] = hasError ? 'unhealthy' : 
    checks.agentService.status === 'error' ? 'degraded' : 'healthy';
  
  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
  };
  
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(response, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
```

---

#### Task 1.4: Update Kubernetes Deployment
**File**: `apps/azora-buildspaces/k8s/buildspaces-deployment.yaml`

**Update the deployment to reference the Docker image and add health probes**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: buildspaces
  namespace: azora-buildspaces
spec:
  replicas: 3
  selector:
    matchLabels:
      app: buildspaces
  template:
    metadata:
      labels:
        app: buildspaces
    spec:
      containers:
      - name: buildspaces
        image: ghcr.io/azora-os/azora-buildspaces:latest  # Update this
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: buildspaces-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: buildspaces-secrets
              key: nextauth-secret
        - name: NEXTAUTH_URL
          value: "https://buildspaces.azora.ai"
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: buildspaces-hpa
  namespace: azora-buildspaces
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: buildspaces
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

### Phase 2: Security Implementation (Priority: CRITICAL)

#### Task 2.1: Implement Rate Limiting
**File**: `apps/azora-buildspaces/lib/middleware/rate-limiter.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return async (request: NextRequest) => {
    // Get client identifier (IP or user ID)
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    const now = Date.now();
    const key = `${identifier}:${request.nextUrl.pathname}`;
    
    // Clean up old entries
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetAt < now) {
          rateLimitStore.delete(k);
        }
      }
    }
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 1,
        resetAt: now + finalConfig.windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }
    
    // Check if limit exceeded
    const remaining = Math.max(0, finalConfig.max - entry.count);
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    
    // Add rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': finalConfig.max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': entry.resetAt.toString(),
    });
    
    if (entry.count > finalConfig.max) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
        },
        { 
          status: 429,
          headers: {
            ...Object.fromEntries(headers),
            'Retry-After': resetInSeconds.toString(),
          },
        }
      );
    }
    
    return null; // Allow request
  };
}

// Preset configurations
export const rateLimitConfigs = {
  codeExecution: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 executions per minute
  },
  aiGeneration: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 generations per minute
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
};
```

**Apply to expensive endpoints**:

**File**: `apps/azora-buildspaces/app/api/buildspaces/execute/route.ts`

```typescript
import { rateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(rateLimitConfigs.codeExecution)(request);
  if (rateLimitResult) return rateLimitResult;
  
  // ... rest of the code execution logic
}
```

---

#### Task 2.2: Add Security Headers
**File**: `apps/azora-buildspaces/next.config.mjs`

**Add to the config**:

```javascript
const nextConfig = {
  output: 'standalone', // For Docker
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
};
```

---

### Phase 3: Mock Data Removal (Priority: CRITICAL)

#### Task 3.1: Remove Mock Data from Command Desk
**File**: `apps/azora-buildspaces/components/rooms/command-desk.tsx`

**Find and remove**:
```typescript
// Remove these arrays:
const initialMessages = [ ... ];
const initialTasks = [ ... ];
```

**Replace with**:
```typescript
// Start with empty state - data will be loaded from database
const [messages, setMessages] = useState<Message[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);

// Load from database on mount
useEffect(() => {
  loadSessionMessages();
}, []);
```

---

#### Task 3.2: Remove Mock Data from Knowledge Ocean
**File**: `apps/azora-buildspaces/components/rooms/knowledge-ocean.tsx`

**Remove**:
```typescript
const projectKnowledge = [ ... ];
```

**Replace with**:
```typescript
const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadKnowledge() {
    try {
      const response = await fetch('/api/knowledge/scan-files');
      const data = await response.json();
      setKnowledge(data);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setLoading(false);
    }
  }
  
  loadKnowledge();
}, []);
```

---

#### Task 3.3: Remove Mock Data from Other Components
Follow the same pattern for:
- `components/rooms/design-studio.tsx` - Remove fake Figma response
- `components/rooms/ai-studio.tsx` - Remove INITIAL_CELLS
- `components/rooms/maker-lab/DatabaseDesigner.tsx` - Remove hardcoded schema

---

### Phase 4: Testing Infrastructure (Priority: CRITICAL)

#### Task 4.1: Expand Unit Tests
Create tests for all API routes:

**File**: `apps/azora-buildspaces/tests/api/health.test.ts`

```typescript
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('should return health status', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('checks');
    expect(data.checks).toHaveProperty('database');
  });
});
```

**Create similar tests for**:
- `/api/buildspaces/execute`
- `/api/agents/invoke`
- `/api/chat/sessions`
- All other API routes

---

#### Task 4.2: Create E2E Tests
**File**: `apps/azora-buildspaces/tests/e2e/code-execution.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Code Execution', () => {
  test('should execute JavaScript code', async ({ page }) => {
    await page.goto('http://localhost:3000/workspace/test-project');
    
    // Navigate to Code Chamber
    await page.click('[data-testid="code-chamber"]');
    
    // Type code
    await page.fill('[data-testid="code-editor"]', 'console.log("Hello World")');
    
    // Execute
    await page.click('[data-testid="run-button"]');
    
    // Check output
    await expect(page.locator('[data-testid="output"]')).toContainText('Hello World');
  });
});
```

---

### Phase 5: CI/CD Enhancement (Priority: CRITICAL)

#### Task 5.1: Update GitHub Actions Workflow
**File**: `.github/workflows/buildspaces.yml`

**Add these steps**:

```yaml
      - name: Build Docker image
        run: |
          docker build -t ghcr.io/azora-os/azora-buildspaces:${{ github.sha }} \
            -f apps/azora-buildspaces/Dockerfile .
          
      - name: Log in to GitHub Container Registry
        if: github.event_name != 'pull_request'
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      
      - name: Push Docker image
        if: github.event_name != 'pull_request'
        run: |
          docker push ghcr.io/azora-os/azora-buildspaces:${{ github.sha }}
          docker tag ghcr.io/azora-os/azora-buildspaces:${{ github.sha }} ghcr.io/azora-os/azora-buildspaces:latest
          docker push ghcr.io/azora-os/azora-buildspaces:latest
      
      - name: Run E2E tests
        run: pnpm -w -F azora-buildspaces test:e2e
      
      - name: Run security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 🎯 Implementation Order

**Day 1:**
1. Create Dockerfile
2. Create .dockerignore
3. Create Jest configuration
4. Create health check endpoint
5. Test Docker build locally

**Day 2:**
6. Implement rate limiting
7. Add security headers
8. Update K8s deployment
9. Test health checks

**Day 3:**
10. Remove all mock data from components
11. Verify empty state handling
12. Test data loading from APIs

**Day 4:**
13. Create unit tests for API routes
14. Run tests and fix failures
15. Check code coverage

**Day 5:**
16. Set up Playwright for E2E tests
17. Create E2E tests for critical flows
18. Run E2E tests locally

**Day 6:**
19. Update CI/CD pipeline
20. Test pipeline on feature branch
21. Fix any pipeline issues

**Day 7:**
22. Final integration testing
23. Security review
24. Documentation review
25. Ready for staging deployment

---

## 🧪 Testing Checklist

Before marking as complete, verify:

- [ ] Docker image builds successfully
- [ ] Docker container runs and responds to requests
- [ ] Health check endpoint returns 200
- [ ] All unit tests pass (`npm test`)
- [ ] Code coverage > 80%
- [ ] Rate limiting works (test with curl)
- [ ] Security headers present (check with browser dev tools)
- [ ] No mock data in any component
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] CI/CD pipeline succeeds
- [ ] K8s manifests are valid (`kubectl apply --dry-run`)

---

## 📝 Implementation Notes

### Environment Variables Required
Make sure these are set in `.env.local` for testing:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_AGENT_API_URL="http://localhost:3010"
```

### Database Setup
Before testing:
```bash
npx prisma generate --schema=../../prisma/schema.prisma
npx prisma migrate deploy --schema=../../prisma/schema.prisma
```

### Common Issues
1. **Docker build fails**: Check Node version in Dockerfile matches package.json
2. **Tests fail**: Make sure Jest config paths are correct
3. **Health check fails**: Verify database is running
4. **Rate limiter not working**: Check middleware is applied to routes

---

## 🎯 Success Criteria

Consider implementation complete when:
1. ✅ Docker image builds and runs successfully
2. ✅ All tests pass (unit + E2E)
3. ✅ Code coverage > 80%
4. ✅ No mock data remains
5. ✅ Health checks working
6. ✅ Rate limiting functional
7. ✅ Security headers configured
8. ✅ CI/CD pipeline passes
9. ✅ Documentation updated
10. ✅ Ready for staging deployment

---

**Last Updated**: January 9, 2026  
**For Agent**: Follow this guide systematically, creating files in order, testing each component before moving to the next.

**Built with Ubuntu Philosophy** 💚  
*"I am because we are"*
