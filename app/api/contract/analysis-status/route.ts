import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { contractsApi } from '@/lib/supabase'

export const GET = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const contractId = searchParams.get('contractId')

  if (!contractId) {
    return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
  }

  try {
    // Get contract with analysis status
    const contract = await contractsApi.getById(contractId)
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({
      contractId,
      status: contract.analysis_status || 'pending',
      progress: contract.analysis_progress || 0,
      lastAnalyzed: contract.last_analyzed_at,
      retryCount: contract.analysis_retry_count || 0,
      error: contract.analysis_error,
      hasCache: {
        summary: !!(contract.analysis_cache?.summary),
        risks: !!(contract.analysis_cache?.risks),
        complete: !!(contract.analysis_cache?.complete)
      }
    })

  } catch (error) {
    console.error('Analysis status check error:', error)
    throw error
  }
})

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contractId, action } = await request.json()

  if (!contractId || !action) {
    return NextResponse.json({ 
      error: 'Contract ID and action are required' 
    }, { status: 400 })
  }

  try {
    const contract = await contractsApi.getById(contractId)
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (action === 'reset') {
      // Reset analysis status to pending
      await contractsApi.update(contractId, {
        analysis_status: 'pending',
        analysis_progress: 0,
        analysis_retry_count: 0,
        analysis_error: null,
        last_analyzed_at: null
      })

      return NextResponse.json({
        success: true,
        message: 'Analysis status reset to pending'
      })
    }

    if (action === 'clear_cache') {
      // Clear analysis cache
      await contractsApi.update(contractId, {
        analysis_cache: {},
        analysis_status: 'pending',
        analysis_progress: 0,
        analysis_retry_count: 0,
        analysis_error: null,
        last_analyzed_at: null
      })

      return NextResponse.json({
        success: true,
        message: 'Analysis cache cleared and status reset'
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use "reset" or "clear_cache"' 
    }, { status: 400 })

  } catch (error) {
    console.error('Analysis status update error:', error)
    throw error
  }
})