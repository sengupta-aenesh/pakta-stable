import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { captureAPIError } from './sentry-utils'

export interface APIError extends Error {
  statusCode?: number
  code?: string
}

export function createAPIError(message: string, statusCode: number = 500, code?: string): APIError {
  const error = new Error(message) as APIError
  error.statusCode = statusCode
  error.code = code
  return error
}

export function handleAPIError(
  error: Error | APIError,
  request: Request,
  context?: Record<string, any>
) {
  const url = new URL(request.url)
  const method = request.method
  const pathname = url.pathname
  
  // Determine status code
  const statusCode = (error as APIError).statusCode || 500
  
  // Log error details
  console.error(`API Error [${method} ${pathname}]:`, {
    message: error.message,
    statusCode,
    stack: error.stack,
    context,
  })
  
  // Capture error with Sentry
  captureAPIError(error, pathname, method, statusCode)
  
  // Return appropriate error response
  const isProduction = process.env.NODE_ENV === 'production'
  
  return NextResponse.json(
    {
      error: isProduction && statusCode === 500 
        ? 'Internal server error' 
        : error.message,
      code: (error as APIError).code,
      ...(context && !isProduction && { context })
    },
    { status: statusCode }
  )
}

// Async wrapper for API routes with automatic error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Assume the first argument is always the Request object
      const request = args[0] as Request
      return handleAPIError(error as Error, request)
    }
  }
}

// HOC for API route handlers
export function apiErrorHandler(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleAPIError(error as Error, request, context)
    }
  }
}