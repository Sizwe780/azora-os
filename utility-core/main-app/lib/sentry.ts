/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import * as Sentry from '@sentry/react'

const initSentry = () => {
  // Use Vite's import.meta.env for frontend environment variables
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    if (import.meta.env.MODE === 'development') {
      console.warn('Sentry DSN not found. Error tracking disabled.')
    }
    return
  }

  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE || 'development',
    beforeSend(event) {
      // Filter out development errors in production
      if (import.meta.env.MODE === 'production' && event.exception) {
        // You can add custom filtering logic here
        return event
      }
      return event
    },
  })

  console.log('Sentry initialized for error tracking')
}

export default initSentry