#!/usr/bin/env node
const required = [
  { name: 'DATABASE_URL', requiredFor: ['production','staging'] },
  { name: 'REDIS_URL', requiredFor: ['production'] },
  { name: 'SENTRY_DSN', requiredFor: ['production'] },
  { name: 'NEXT_PUBLIC_SENTRY_DSN', requiredFor: ['production'] },
  { name: 'ANTHROPIC_API_KEY', requiredFor: ['staging','production'] },
  { name: 'STAGING_DATABASE_URL', requiredFor: ['staging'] },
]

const env = process.env.NODE_ENV || 'development'
const missing = []
for (const r of required) {
  if (!process.env[r.name]) missing.push(r.name)
}

if (missing.length) {
  console.warn(`[verify-env] Warning: Missing env vars (${missing.join(',')}). Some features (migrations, redis, sentry) may not function.`)
  process.exit(0)
}

console.log('[verify-env] All required env vars present')
process.exit(0)
