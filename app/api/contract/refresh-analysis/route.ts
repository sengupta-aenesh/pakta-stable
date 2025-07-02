import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { addSentryBreadcrumb, setSentryUser } from '@/lib/sentry-utils'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  setSentryUser({
    id: user.id,
    email: user.email
  })

  const { contractId } = await request.json()

  if (!contractId) {
    return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
  }

  addSentryBreadcrumb('Refresh analysis requested', 'contract', 'info', {
    contractId,
    userId: user.id
  })

  try {
    // Call the auto-analyze endpoint with forceRefresh = true
    const autoAnalyzeUrl = new URL('/api/contract/auto-analyze', request.url)
    
    const response = await fetch(autoAnalyzeUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || ''
      },
      body: JSON.stringify({
        contractId,
        forceRefresh: true
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status })
    }

    addSentryBreadcrumb('Refresh analysis completed', 'contract', 'info', {
      contractId,
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Analysis refresh started successfully',
      ...result
    })

  } catch (error) {
    console.error('Refresh analysis error:', error)
    throw error
  }
})