"use client"

import * as Sentry from "@sentry/react"
import { useEffect } from "react"

export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return

    try {
      // Initialize Sentry. If it was already initialized elsewhere, this is a no-op.
      Sentry.init({
        dsn,
        // Capture 10% of transactions by default; tune in production
        tracesSampleRate: 0.1,
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
      })
    } catch (e) {
      // If Sentry is not compatible in this runtime, warn and continue
      // (avoid throwing during app bootstrap)
      // eslint-disable-next-line no-console
      console.warn('Sentry init failed', e)
    }
  }, [])

  return null
}
