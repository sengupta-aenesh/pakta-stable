import * as Sentry from '@sentry/nextjs'

// User context helper
export function setSentryUser(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

// Clear user context (on logout)
export function clearSentryUser() {
  Sentry.setUser(null)
}

// Set additional context
export function setSentryContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context)
}

// Add breadcrumb for user actions
export function addSentryBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

// Capture custom events/metrics
export function captureUserAction(action: string, data?: Record<string, any>) {
  addSentryBreadcrumb(`User performed: ${action}`, 'user_action', 'info', data)
}

// Capture API errors with context
export function captureAPIError(error: Error, endpoint: string, method: string, statusCode?: number) {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', endpoint)
    scope.setTag('http_method', method)
    scope.setContext('api_request', {
      endpoint,
      method,
      statusCode,
      timestamp: new Date().toISOString(),
    })
    
    if (statusCode) {
      scope.setLevel(statusCode >= 500 ? 'error' : 'warning')
    }
    
    Sentry.captureException(error)
  })
}

// Capture contract-related errors with rich context
export function captureContractError(error: Error, contractId?: string, operation?: string, additionalData?: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'contract_management')
    scope.setTag('contract_operation', operation || 'unknown')
    
    scope.setContext('contract_context', {
      contractId,
      operation,
      timestamp: new Date().toISOString(),
      ...additionalData,
    })
    
    Sentry.captureException(error)
  })
}

// Capture AI/LangChain errors
export function captureAIError(error: Error, aiOperation: string, model?: string, additionalData?: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'ai_processing')
    scope.setTag('ai_operation', aiOperation)
    scope.setTag('ai_model', model || 'unknown')
    
    scope.setContext('ai_context', {
      operation: aiOperation,
      model,
      timestamp: new Date().toISOString(),
      ...additionalData,
    })
    
    Sentry.captureException(error)
  })
}

// Performance monitoring helpers
export function startSentrySpan(name: string, operation: string, callback: () => any) {
  return Sentry.startSpan({
    name,
    op: operation,
  }, callback)
}

// Measure function execution time - simplified version
export function measureFunction<T>(
  name: string,
  fn: () => T | Promise<T>,
  operation = 'function'
): T | Promise<T> {
  // For now, just execute the function without tracing
  // Performance monitoring can be added later once Sentry is stable
  return fn()
}

// File upload error tracking
export function captureUploadError(error: Error, fileType: string, fileSize?: number) {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'file_upload')
    scope.setTag('file_type', fileType)
    
    scope.setContext('upload_context', {
      fileType,
      fileSize,
      timestamp: new Date().toISOString(),
    })
    
    Sentry.captureException(error)
  })
}

// Authentication error tracking
export function captureAuthError(error: Error, authAction: string, provider?: string) {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'authentication')
    scope.setTag('auth_action', authAction)
    scope.setTag('auth_provider', provider || 'email')
    
    scope.setContext('auth_context', {
      action: authAction,
      provider,
      timestamp: new Date().toISOString(),
    })
    
    Sentry.captureException(error)
  })
}

// Subscription/billing error tracking
export function captureSubscriptionError(error: Error, operation: string, tier?: string) {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'subscription')
    scope.setTag('subscription_operation', operation)
    scope.setTag('subscription_tier', tier || 'unknown')
    
    scope.setContext('subscription_context', {
      operation,
      tier,
      timestamp: new Date().toISOString(),
    })
    
    Sentry.captureException(error)
  })
}

// Export utility for manual error capture with automatic context
export function captureErrorWithContext(error: Error, context: {
  feature?: string
  operation?: string
  userId?: string
  additionalData?: Record<string, any>
}) {
  Sentry.withScope((scope) => {
    if (context.feature) scope.setTag('feature', context.feature)
    if (context.operation) scope.setTag('operation', context.operation)
    if (context.userId) scope.setUser({ id: context.userId })
    
    if (context.additionalData) {
      scope.setContext('custom_context', {
        ...context.additionalData,
        timestamp: new Date().toISOString(),
      })
    }
    
    Sentry.captureException(error)
  })
}