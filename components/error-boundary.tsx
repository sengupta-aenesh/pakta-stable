'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error | null
    resetError: () => void
    errorId: string | null
  }>
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorId: string | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Capture error with Sentry and get the error ID
    this.errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        section: 'error_boundary',
      },
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.errorId = null
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
            errorId={this.errorId}
          />
        )
      }

      // Default error UI
      return <DefaultErrorFallback 
        error={this.state.error} 
        resetError={this.resetError}
        errorId={this.errorId}
      />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ 
  error, 
  resetError, 
  errorId 
}: {
  error: Error | null
  resetError: () => void
  errorId: string | null
}) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>

        {errorId && (
          <div className="bg-gray-100 rounded p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Error ID (for support):</p>
            <code className="text-xs font-mono text-gray-700">{errorId}</code>
          </div>
        )}

        {isDevelopment && error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-red-800 mb-2">Development Error Details:</p>
            <code className="text-xs text-red-700 break-words">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={resetError}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          If this problem persists, please contact support with the error ID above.
        </p>
      </div>
    </div>
  )
}

// Export a HOC version for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{
    error: Error | null
    resetError: () => void
    errorId: string | null
  }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryClass fallback={fallback}>
      <Component {...props} />
    </ErrorBoundaryClass>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundaryClass