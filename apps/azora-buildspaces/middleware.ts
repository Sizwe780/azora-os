import { NextRequest, NextResponse } from "next/server"
import { securityHeaders as sharedSecurityHeaders } from "./lib/security-headers"

const RATE_LIMIT = 100
const WINDOW_MS = 60_000

type Bucket = { count: number; expiresAt: number }
// For production deployments, swap this in-memory map with a shared store (Redis) to avoid per-instance drift.
const buckets = new Map<string, Bucket>()

function getIp(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for")
  if (header) return header.split(",")[0]?.trim() || "unknown"
  return req.ip ?? "unknown"
}

function cleanupBuckets(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.expiresAt < now) {
      buckets.delete(key)
    }
  }
}

function isRateLimited(ip: string) {
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

export function middleware(req: NextRequest) {
  const ip = getIp(req)

  if (isRateLimited(ip)) {
    const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    return securityHeaders(res)
  }

  const res = NextResponse.next()
  return securityHeaders(res)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
