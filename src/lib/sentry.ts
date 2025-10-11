import * as Sentry from '@sentry/react'

const initSentry = () => {
  const dsn = process.env.VITE_SENTRY_DSN

  if (!dsn) {
    console.warn('Sentry DSN not found. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    beforeSend(event) {
      // Filter out development errors in production
      if (process.env.NODE_ENV === 'production' && event.exception) {
        // You can add custom filtering logic here
        return event
      }
      return event
    },
  })

  console.log('Sentry initialized for error tracking')
}

export default initSentry