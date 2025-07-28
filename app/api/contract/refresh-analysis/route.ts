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
    // Import the database functions
    const { contractsApi } = await import('@/lib/supabase')
    
    // Get contract details
    const contract = await contractsApi.getById(contractId)
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (!contract.content || contract.content.trim().length === 0) {
      return NextResponse.json({ error: 'Contract has no content to analyze' }, { status: 400 })
    }

    // Reset analysis status and clear cache to force refresh
    await contractsApi.update(contractId, {
      analysis_status: 'pending',
      analysis_progress: 0,
      analysis_retry_count: 0,
      analysis_error: null,
      analysis_cache: {} // Clear existing cache to force refresh
    })

    // Import the enhanced analysis function with superior risk detection
    const { performEnhancedSequentialAnalysis } = await import('../auto-analyze-enhanced/route')
    
    console.log('🚀 Starting enhanced background analysis for contract:', contractId)
    
    // Start the enhanced analysis in the background (don't await to avoid timeout)  
    performEnhancedSequentialAnalysis(contractId, contract.content, user.id).catch(error => {
      console.error('❌ Background analysis failed for contract:', contractId, error)
      // Update contract status to failed
      contractsApi.update(contractId, {
        analysis_status: 'failed',
        analysis_error: error.message,
        analysis_progress: 0
      }).catch(updateError => {
        console.error('Failed to update contract status to failed:', updateError)
      })
    })

    addSentryBreadcrumb('Refresh analysis started', 'contract', 'info', {
      contractId,
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Analysis refresh started successfully',
      status: 'in_progress',
      progress: 0
    })

  } catch (error) {
    console.error('Refresh analysis error:', error)
    throw error
  }
})