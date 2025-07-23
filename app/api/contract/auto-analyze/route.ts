import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { captureContractError, addSentryBreadcrumb, setSentryUser } from '@/lib/sentry-utils'
import { summarizeContract, identifyRiskyTerms, extractMissingInfo } from '@/lib/openai'
import { performJurisdictionAwareAnalysis } from '@/lib/openai-enhanced'
import { contractsApi } from '@/lib/supabase'
import { SubscriptionServiceServer } from '@/lib/services/subscription-server'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  setSentryUser({
    id: user.id,
    email: user.email
  })

  const { contractId, forceRefresh = false } = await request.json()

  if (!contractId) {
    return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
  }

  addSentryBreadcrumb('Auto-analysis started', 'contract', 'info', {
    contractId,
    userId: user.id,
    forceRefresh
  })

  try {
    // Get contract details
    const contract = await contractsApi.getById(contractId)
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (!contract.content || contract.content.trim().length === 0) {
      return NextResponse.json({ error: 'Contract has no content to analyze' }, { status: 400 })
    }

    // Check if analysis is already complete and not forcing refresh
    if (!forceRefresh && contract.analysis_status === 'complete') {
      addSentryBreadcrumb('Analysis already complete', 'contract', 'info', {
        contractId,
        status: contract.analysis_status
      })
      return NextResponse.json({ 
        message: 'Analysis already complete',
        progress: 100,
        status: 'complete'
      })
    }

    // Check if analysis is currently in progress
    if (contract.analysis_status === 'in_progress') {
      return NextResponse.json({ 
        message: 'Analysis already in progress',
        progress: contract.analysis_progress || 0,
        status: 'in_progress'
      })
    }

    // Start the analysis process
    await updateAnalysisStatus(contractId, 'in_progress', 0)
    
    const analysisResult = await performSequentialAnalysis(contractId, contract.content, user.id)
    
    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Auto-analysis error:', error)
    
    // Update status to failed
    await updateAnalysisStatus(contractId, 'failed', 0, (error as Error).message)
    
    captureContractError(error as Error, contractId, 'auto_analysis', {
      userId: user.id
    })
    
    throw error
  }
})

export async function performSequentialAnalysis(contractId: string, content: string, userId: string) {
  const maxRetries = 2
  let currentRetryCount = 0

  try {
    // Check if user has jurisdiction configuration
    const subscriptionService = new SubscriptionServiceServer()
    const userProfile = await subscriptionService.getUserProfile(userId)
    const hasJurisdictionConfig = !!(userProfile.primary_jurisdiction || userProfile.additional_jurisdictions?.length > 0)
    
    // If user has jurisdiction configuration, use enhanced analysis
    if (hasJurisdictionConfig) {
      addSentryBreadcrumb('Using enhanced jurisdiction-aware analysis', 'contract', 'info', { 
        contractId,
        primaryJurisdiction: userProfile.primary_jurisdiction 
      })
      
      // Redirect to enhanced analysis function
      const { performEnhancedSequentialAnalysis } = await import('../auto-analyze-enhanced/route')
      return await performEnhancedSequentialAnalysis(contractId, content, userId)
    }
    
    // Otherwise, continue with standard analysis
    addSentryBreadcrumb('Using standard analysis (no jurisdiction config)', 'contract', 'info', { contractId })
    
    // Step 1: Summary Analysis (Progress: 0% -> 33%)
    addSentryBreadcrumb('Starting summary analysis', 'contract', 'info', { contractId })
    await updateAnalysisStatus(contractId, 'in_progress', 10, null, 'Starting summary analysis...')
    
    const summaryResult = await performWithRetry(
      () => summarizeContract(content),
      maxRetries,
      'summary',
      contractId
    )

    if ('error' in summaryResult) {
      throw new Error(`Summary analysis failed: ${summaryResult.message || 'Validation error'}`)
    }

    // Cache summary result - store direct summary object
    await contractsApi.updateAnalysisCache(contractId, 'summary', summaryResult)
    await updateAnalysisStatus(contractId, 'summary_complete', 33, null, 'Summary analysis complete')

    // Step 2: Risk Analysis (Progress: 33% -> 66%)
    addSentryBreadcrumb('Starting risk analysis', 'contract', 'info', { contractId })
    await updateAnalysisStatus(contractId, 'in_progress', 40, null, 'Starting risk analysis...')
    
    const riskResult = await performWithRetry(
      () => identifyRiskyTerms(content),
      maxRetries,
      'risks',
      contractId
    )

    // Cache risk result - store complete RiskAnalysis object as expected by types
    const riskAnalysisData: any = {
      overallRiskScore: riskResult.overallRiskScore || 0,
      totalRisksFound: riskResult.risks?.length || 0,
      highRiskCount: riskResult.risks?.filter(r => r.riskLevel === 'high').length || 0,
      mediumRiskCount: riskResult.risks?.filter(r => r.riskLevel === 'medium').length || 0,
      lowRiskCount: riskResult.risks?.filter(r => r.riskLevel === 'low').length || 0,
      risks: riskResult.risks || [],
      recommendations: riskResult.recommendations || [],
      executiveSummary: riskResult.executiveSummary || 'Risk analysis completed'
    }
    await contractsApi.updateAnalysisCache(contractId, 'risks', riskAnalysisData)
    await updateAnalysisStatus(contractId, 'risks_complete', 66, null, 'Risk analysis complete')

    // Step 3: Complete Analysis (Progress: 66% -> 100%)
    addSentryBreadcrumb('Starting complete analysis', 'contract', 'info', { contractId })
    await updateAnalysisStatus(contractId, 'in_progress', 75, null, 'Starting completeness analysis...')
    
    const completeResult = await performWithRetry(
      () => extractMissingInfo(content),
      maxRetries,
      'complete',
      contractId
    )

    // Cache complete result
    await contractsApi.updateAnalysisCache(contractId, 'complete', {
      missingInfo: completeResult.missingInfo || [],
      processingSteps: completeResult.processingSteps || {},
      processedContent: completeResult.processedContent || content
    })

    // Mark as complete
    await updateAnalysisStatus(contractId, 'complete', 100, null, 'All analysis complete')

    addSentryBreadcrumb('Auto-analysis completed successfully', 'contract', 'info', { contractId })

    return {
      success: true,
      progress: 100,
      status: 'complete',
      message: 'All analysis completed successfully',
      results: {
        summary: summaryResult,
        risks: riskResult,
        complete: completeResult
      }
    }

  } catch (error) {
    console.error('Sequential analysis failed:', error)
    await updateAnalysisStatus(contractId, 'failed', 0, (error as Error).message)
    throw error
  }
}

async function performWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  operationType: string,
  contractId: string
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await operation()
      
      // Reset retry count on success
      if (attempt > 1) {
        await updateRetryCount(contractId, 0)
      }
      
      return result
    } catch (error) {
      lastError = error as Error
      console.error(`${operationType} analysis attempt ${attempt} failed:`, error)
      
      // Update retry count
      await updateRetryCount(contractId, attempt - 1)
      
      if (attempt <= maxRetries) {
        console.log(`Retrying ${operationType} analysis (attempt ${attempt + 1}/${maxRetries + 1})`)
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
      }
    }
  }
  
  throw lastError || new Error(`${operationType} analysis failed after ${maxRetries + 1} attempts`)
}

async function updateAnalysisStatus(
  contractId: string, 
  status: string, 
  progress: number, 
  error: string | null = null,
  statusMessage?: string
) {
  try {
    const updateData: any = {
      analysis_status: status,
      analysis_progress: progress,
      last_analyzed_at: new Date().toISOString()
    }

    if (error) {
      updateData.analysis_error = error
    } else if (status !== 'failed') {
      updateData.analysis_error = null
    }

    await contractsApi.update(contractId, updateData)

    // Log progress for debugging
    console.log(`Contract ${contractId}: ${status} (${progress}%)${statusMessage ? ` - ${statusMessage}` : ''}`)
    
  } catch (error) {
    console.error('Failed to update analysis status:', error)
  }
}

async function updateRetryCount(contractId: string, retryCount: number) {
  try {
    await contractsApi.update(contractId, {
      analysis_retry_count: retryCount
    })
  } catch (error) {
    console.error('Failed to update retry count:', error)
  }
}