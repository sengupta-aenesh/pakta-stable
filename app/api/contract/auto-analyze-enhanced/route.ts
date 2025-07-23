import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { captureContractError, addSentryBreadcrumb, setSentryUser } from '@/lib/sentry-utils'
import { performJurisdictionAwareAnalysis } from '@/lib/openai-enhanced'
import { extractMissingInfo } from '@/lib/openai'
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
    
    const analysisResult = await performEnhancedSequentialAnalysis(contractId, contract.content, user.id)
    
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

export async function performEnhancedSequentialAnalysis(contractId: string, content: string, userId: string) {
  const maxRetries = 2
  
  try {
    // Step 1: Fetch user profile for jurisdiction context
    addSentryBreadcrumb('Fetching user profile', 'contract', 'info', { contractId })
    await updateAnalysisStatus(contractId, 'in_progress', 5, null, 'Loading jurisdiction settings...')
    
    const subscriptionService = new SubscriptionServiceServer()
    const userProfile = await subscriptionService.getUserProfile(userId)
    
    // Step 2: Perform jurisdiction research if jurisdictions are configured
    let jurisdictionMessage = ''
    if (userProfile.primary_jurisdiction || userProfile.additional_jurisdictions?.length > 0) {
      await updateAnalysisStatus(contractId, 'in_progress', 10, null, 'Searching jurisdiction requirements...')
      jurisdictionMessage = ' with jurisdiction-specific analysis'
    }

    // Step 3: Summary & Risk Analysis with Jurisdiction Context (Progress: 10% -> 66%)
    addSentryBreadcrumb('Starting jurisdiction-aware analysis', 'contract', 'info', { 
      contractId,
      primaryJurisdiction: userProfile.primary_jurisdiction,
      additionalJurisdictions: userProfile.additional_jurisdictions?.length || 0
    })
    
    await updateAnalysisStatus(contractId, 'in_progress', 15, null, `Starting analysis${jurisdictionMessage}...`)
    
    const { summary, risks, jurisdictionResearch } = await performWithRetry(
      () => performJurisdictionAwareAnalysis(content, userProfile, 'both'),
      maxRetries,
      'jurisdiction_analysis',
      contractId
    )

    // Process and cache summary
    if (summary && !('error' in summary)) {
      await contractsApi.updateAnalysisCache(contractId, 'summary', summary)
      await updateAnalysisStatus(contractId, 'summary_complete', 33, null, 'Summary analysis complete')
    } else if (summary && 'error' in summary) {
      throw new Error(`Summary analysis failed: ${summary.message || 'Validation error'}`)
    }

    // Process and cache risk analysis
    if (risks) {
      // The enhanced analysis now returns properly formatted risks
      const riskAnalysisData: any = {
        overallRiskScore: risks.overallRiskScore,
        totalRisksFound: risks.totalRisksFound,
        highRiskCount: risks.highRiskCount,
        mediumRiskCount: risks.mediumRiskCount,
        lowRiskCount: risks.lowRiskCount,
        risks: risks.risks,
        recommendations: risks.recommendations,
        executiveSummary: risks.executiveSummary,
        jurisdictionAnalysis: risks.jurisdictionAnalysis,
        missingProtections: risks.missingProtections,
        jurisdictionConflicts: risks.jurisdictionConflicts
      }
      await contractsApi.updateAnalysisCache(contractId, 'risks', riskAnalysisData)
      await updateAnalysisStatus(contractId, 'risks_complete', 66, null, `Risk analysis complete - ${risks.totalRisksFound} risks found`)
    }

    // Step 4: Complete Analysis (Progress: 66% -> 100%)
    addSentryBreadcrumb('Starting complete analysis', 'contract', 'info', { contractId })
    await updateAnalysisStatus(contractId, 'in_progress', 75, null, 'Starting completeness analysis...')
    
    const completeResult = await performWithRetry(
      () => extractMissingInfo(content),
      maxRetries,
      'complete',
      contractId
    )

    // Cache complete result with jurisdiction research
    await contractsApi.updateAnalysisCache(contractId, 'complete', {
      missingInfo: completeResult.missingInfo || [],
      processingSteps: completeResult.processingSteps || {},
      processedContent: completeResult.processedContent || content,
      jurisdictionResearch: jurisdictionResearch || null
    })

    // Mark analysis as complete
    await updateAnalysisStatus(contractId, 'complete', 100, null, 'Analysis complete')

    addSentryBreadcrumb('Analysis completed successfully', 'contract', 'info', {
      contractId,
      hadJurisdictionContext: !!jurisdictionResearch
    })

    return { 
      message: 'Analysis completed successfully',
      progress: 100,
      status: 'complete',
      hadJurisdictionContext: !!jurisdictionResearch
    }

  } catch (error) {
    const errorMessage = (error as Error).message
    console.error('Sequential analysis error:', errorMessage)
    
    // Increment retry count
    const contract = await contractsApi.getById(contractId)
    const retryCount = (contract?.analysis_retry_count || 0) + 1
    
    await contractsApi.update(contractId, {
      analysis_status: 'failed',
      analysis_progress: 0,
      analysis_error: errorMessage,
      analysis_retry_count: retryCount
    })
    
    throw error
  }
}

// Helper functions
async function updateAnalysisStatus(
  contractId: string, 
  status: string, 
  progress: number, 
  error?: string | null,
  message?: string
) {
  await contractsApi.update(contractId, {
    analysis_status: status,
    analysis_progress: progress,
    analysis_error: error,
    last_analyzed_at: new Date().toISOString()
  })
}

async function performWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  operationType: string,
  contractId: string
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`${operationType} attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  throw lastError || new Error(`${operationType} failed after ${maxRetries} attempts`)
}