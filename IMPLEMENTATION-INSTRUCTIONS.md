# 🧭 Implementation Instructions for Coding Agents

> Quick start guide with prioritized tasks, common fixes, and troubleshooting for BuildSpaces.

## Prioritized Task Order
1. Add **Dockerfile**, health checks, rate limiter, security headers.
2. Add **Jest config**; make `npm test` pass baseline.
3. Fix **Code Chamber id prop** handling.
4. Remove **mock data** (Command Desk, Knowledge Ocean, Design Studio, AI Studio, Maker Lab).
5. Wire **Terminal** to WebContainer; replace dead `ws://localhost:3001`.
6. Add **Git ops** via isomorphic-git.
7. Update **documentation** and checklists.

## Quick Start
- Node 20+, npm 10+, Docker installed.
- `npm ci && npm run dev` to start locally.
- Copy `.env.example` → `.env`; keep secrets out of git.

## Common Fix Templates

### Code Chamber id prop
```tsx
type Props = { id?: string };
export function CodeChamber({ id }: Props) {
  const pathname = usePathname();
  const roomId = useMemo(() => id ?? pathname.split('/').pop() ?? 'default', [id, pathname]);
  return <EditorPane roomId={roomId} />;
}
```

### Mock data removal pattern
```tsx
const [messages, setMessages] = useState<Message[]>([]);
useEffect(() => {
  fetch('/api/chat/sessions/current/messages')
    .then(r => r.json())
    .then(d => setMessages(d.messages ?? []));
}, []);
```

### Health endpoint
```ts
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
export const GET = () => NextResponse.json({ ok: true, ts: Date.now() });
```

### Rate limiter hook
```ts
// middleware.ts
import { NextResponse } from 'next/server';
import { limitByIp } from '@/lib/rate-limit';
export async function middleware(req: Request) {
  await limitByIp(req);
  return NextResponse.next();
}
```

## Testing Procedures
- Run `npm test -- --passWithNoTests` after adding Jest config.
- Add unit tests for Code Chamber id derivation.
- Add integration tests for health endpoint (200) and rate limiter (429 path).
- Playwright smoke: open room, type in editor, run command in terminal (WebContainer).

## Troubleshooting
- **Jest not found**: ensure dev dependency installed and config present.
- **Terminal connection refused**: verify WebContainer boot; remove hardcoded ws://localhost:3001.
- **Mock data still visible**: check loader hooks; ensure DB/API paths used in production builds.
- **CSP blocking Monaco**: allow `blob:` and `data:` for workers.

## Success Criteria
- Documentation updated (README, plans, checklists).
- Tests/linters runnable locally; CI configured.
- Production gaps (Dockerfile, health, rate limiting, security headers) addressed.
- No hardcoded mock data in production paths.
