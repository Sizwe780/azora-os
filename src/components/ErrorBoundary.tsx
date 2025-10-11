import React from 'react'
import * as Sentry from '@sentry/react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Winston
    console.error('Error caught by boundary:', error, errorInfo)

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-gray-400 mb-6">
        We apologize for the inconvenience. Our team has been notified.
      </p>
      {error && (
        <details className="mb-6 text-left bg-gray-800 p-4 rounded">
          <summary className="cursor-pointer text-sm">Error Details</summary>
          <pre className="mt-2 text-xs text-red-400 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
      <button
        onClick={resetError}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
)

export default ErrorBoundary