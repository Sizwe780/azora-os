import { NextRequest, NextResponse } from "next/server"

const RATE_LIMIT = 100
const WINDOW_MS = 60_000

type Bucket = { count: number; expiresAt: number }
const buckets = new Map<string, Bucket>()

function getIp(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for")
  if (header) return header.split(",")[0]?.trim() || "unknown"
  return req.ip ?? "unknown"
}

function isRateLimited(ip: string) {
  const now = Date.now()
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
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' wss: https:; font-src 'self' data:; frame-ancestors 'none';"
  )
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), autoplay=(), payment=()"
  )
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
