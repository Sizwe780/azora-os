"use client"

import * as Sentry from "@sentry/react"
import { useEffect } from "react"

export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return

    try {
      // Avoid re-initializing if Sentry already has a client
      // @ts-ignore - Sentry types may vary in runtime
      if ((Sentry.getCurrentHub?.()?.getClient?.()) != null) return
    } catch (e) {
      // Continue to init if check fails
    }

    Sentry.init({
      dsn,
      // Capture 10% of transactions by default; tune in production
      tracesSampleRate: 0.1,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    })
  }, [])

  return null
}
