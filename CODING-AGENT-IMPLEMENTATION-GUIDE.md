# 🤖 Coding Agent Implementation Guide

> **Audience:** Azora coding agents implementing BuildSpaces production fixes  
> **Stack:** Next.js 16, React 19, Monaco, Prisma, WebContainer, Yjs

## Principles
- Obey **CONSTITUTION.md** and **AI_DEV_LAWS.md** (No Mock Protocol, Truth Mandate).
- Prefer **minimal, production-safe** changes with tests.
- Keep in-memory fallbacks for local dev; production paths must be real data.

## Phase 1: Baseline Production Hardening
1. **Dockerfile (multi-stage)**  
   - Stage: `builder` → `runner` (Node 20, non-root).  
   - Copy prisma schema + run `npm ci` + `npm run build`.  
   - Expose `PORT`, add `HEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1`.
2. **Jest config**  
   - Add `jest.config.cjs` with `testEnvironment: 'jsdom'`, `setupFilesAfterEnv: ['<rootDir>/jest.setup.js']`.  
   - Script: `"test": "jest --passWithNoTests"`.
3. **Health endpoint**  
   ```ts
   // Example: src/app/api/health/route.ts
   import { NextResponse } from 'next/server';
   export const GET = () => NextResponse.json({ ok: true, uptime: process.uptime() });
   ```
4. **Rate limiter middleware**  
   ```ts
   // middleware.ts
   import { NextResponse } from 'next/server';
   import { ipRateLimit } from '@/lib/rate-limit';
   export async function middleware(req: Request) {
     await ipRateLimit(req);
     return NextResponse.next();
   }
   ```
5. **Security headers**  
   - In `next.config.mjs` add `headers()` returning CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

## Phase 2: Core Feature Fixes
1. **Code Chamber id prop**  
   - Expect `id?: string` and derive from URL/context when missing.  
   ```tsx
   type CodeChamberProps = { id?: string };
   export function CodeChamber({ id }: CodeChamberProps) {
     const routerId = useMemo(() => id ?? usePathname().split('/').pop() ?? 'default', [id]);
     return <EditorPane roomId={routerId} />;
   }
   ```
2. **Remove mock data**  
   - Replace static arrays with fetchers + loading state.  
   ```tsx
   const [messages, setMessages] = useState<Message[]>([]);
   useEffect(() => {
     fetch('/api/chat/sessions/current/messages')
       .then(r => r.json())
       .then(d => setMessages(d.messages ?? []));
   }, []);
   ```
3. **DB loading patterns**  
   - Use Prisma client in API routes; add skeleton loader in UI.  
   - Avoid blocking SSR when data is optional; prefer client-side fetch with suspense boundary.

## Phase 3: Terminal + WebContainer Integration
1. **Terminal WebSocket**  
   - Replace `ws://localhost:3001` with WebContainer session wiring.  
   - Use `@webcontainer/api`: `const wc = await WebContainer.boot(); const shell = await wc.spawn('bash');`.
2. **Git via isomorphic-git**  
   ```ts
   import git from 'isomorphic-git';
   import http from 'isomorphic-git/http/web';
   await git.status({ fs, dir, filepath: 'README.md' });
   ```
3. **Figma API hook** (for Design Studio)  
   - Use PAT from env; fetch files via `/v1/files/:key`; cache responses.

## Testing Guidance
- Unit: prefer `@testing-library/react` for UI; mock WebContainer with test doubles.
- Integration: test API routes for 200 + shape.  
- E2E: Playwright smoke for room load, file open, terminal ready.
- Coverage targets: 80% overall, 90% critical paths.

## Delivery Timeline (7 days)
Day 1: Dockerfile + Jest config  
Day 2: Health endpoint + rate limiter + security headers  
Day 3: Code Chamber id fix + tests  
Day 4: Mock data removal (Command Desk, Knowledge Ocean)  
Day 5: Mock data removal (Design Studio, AI Studio, Maker Lab)  
Day 6: Terminal WebContainer wiring + Git ops  
Day 7: Final tests, docs, handoff

## Handoff Checklist
- Tests passing locally; CI green where available.
- Code review completed.
- Security scan run; no critical/high findings.
- README + runbooks updated.
