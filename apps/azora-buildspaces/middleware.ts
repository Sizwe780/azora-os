import { NextRequest, NextResponse } from "next/server"
import { securityHeaders as sharedSecurityHeaders } from "./lib/security-headers"

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '100', 10)
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)
const rateLimitWarning =
  "Rate limiting uses in-memory buckets and only protects a single instance. Configure a shared store (e.g., Redis) before scaling horizontally."

type Bucket = { count: number; expiresAt: number }
/**
 * Memory buckets only protect a single instance; production should wire a shared store (e.g., Redis).
 */
const buckets = new Map<string, Bucket>()
let lastCleanup = 0
let warned = false

// Redis client (lazy-loaded)
let redisClient: any = null
let redisInitAttempted = false

async function getRedisClient() {
  if (redisClient) return redisClient
  if (redisInitAttempted) return null
  redisInitAttempted = true

  const url = process.env.REDIS_URL
  if (!url) {
    console.warn('[RateLimiter] REDIS_URL not set; using in-memory buckets')
    return null
  }

  try {
    // Note: ioredis requires Node.js runtime. If this middleware runs in Edge Runtime,
    // this import will fail. Consider using a fetch-based Redis client for Edge.

    const { default: Redis } = await import('ioredis')
    redisClient = new Redis(url)
    return redisClient
  } catch (err) {
    console.warn('[RateLimiter] Failed to load ioredis or connect to Redis, falling back to in-memory:', err)
    return null
  }
}

function getIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"

  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp


  return req.ip ?? "unknown"
}

function cleanupBuckets(now: number) {
  // Cleanup at most once per window to avoid per-request overhead.
  if (now - lastCleanup < WINDOW_MS) return
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.expiresAt < now) {
      buckets.delete(key)
    }
  }
  lastCleanup = now
}

async function isRateLimitedRedis(ip: string) {
  const client = await getRedisClient()
  if (!client) return null

  const key = `ratelimit:${ip}`
  const count = await client.incr(key)
  if (count === 1) {
    await client.pexpire(key, WINDOW_MS)
  }
  return count > RATE_LIMIT
}

function isRateLimitedMemory(ip: string) {
  const now = Date.now()
  cleanupBuckets(now)

  const bucket = buckets.get(ip)
  if (!bucket || bucket.expiresAt < now) {
    buckets.set(ip, { count: 1, expiresAt: now + WINDOW_MS })
    return false
  }

  if (bucket.count >= RATE_LIMIT) {
    return true
  }

  bucket.count += 1
  return false
}
function securityHeaders(response: NextResponse) {
  for (const header of sharedSecurityHeaders) {
    response.headers.set(header.key, header.value)
  }
  return response
}

export async function middleware(req: NextRequest) {
  if (!warned && !process.env.REDIS_URL) {
    console.warn(rateLimitWarning)
    warned = true
  }

  const ip = getIp(req)

  // Prefer Redis-backed limiter if a REDIS_URL is configured
  if (process.env.REDIS_URL) {
    try {
      const limited = await isRateLimitedRedis(ip)
      if (limited === true) {
        const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
        return securityHeaders(res)
      }
    } catch (err) {
      console.warn('[RateLimiter] Redis check failed, falling back to memory limiter:', err)
    }
  }

  if (isRateLimitedMemory(ip)) {
    const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    return securityHeaders(res)
  }

  const res = NextResponse.next()
  return securityHeaders(res)
}

export const config = {
  runtime: 'nodejs',
  // Exclude health endpoint to keep liveness/readiness probes unthrottled.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
}

// -- Test helpers (not used in production) --
export function _test_setRedisClient(client: any) {
  redisClient = client
  redisInitAttempted = true
}

export function _test_resetRateLimiterState() {
  buckets.clear()
  lastCleanup = 0
  warned = false
  redisClient = null
  redisInitAttempted = false
}
