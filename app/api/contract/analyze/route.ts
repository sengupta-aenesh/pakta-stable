import { NextRequest, NextResponse } from 'next/server'
import { summarizeContract, identifyRiskyTerms, chatWithContract, extractMissingInfo } from '@/lib/openai'
import { contractsApi } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { captureContractError, addSentryBreadcrumb, setSentryUser } from '@/lib/sentry-utils'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Set user context for Sentry
  setSentryUser({
    id: user.id,
    email: user.email
  })

  const { contractId, content, type, messages, comprehensiveAnalysis, question, previousMessages } = await request.json()
  
  // Add breadcrumb for contract analysis
  addSentryBreadcrumb(`Contract analysis started: ${type}`, 'contract', 'info', {
    contractId,
    analysisType: type,
    userId: user.id
  })
    
  let result
  
  try {
    switch (type) {
      case 'summary':
        const summary = await summarizeContract(content)
        // Check if it's a validation error
        if ('error' in summary) {
          return NextResponse.json(summary, { status: 400 })
        }
        result = summary  // Store direct summary object, not wrapped
        break
        
      case 'risks':
        const riskAnalysis = await identifyRiskyTerms(content)
        // Store complete RiskAnalysis object as expected by types
        result = {
          overallRiskScore: riskAnalysis.overallRiskScore || 0,
          totalRisksFound: riskAnalysis.risks?.length || 0,
          highRiskCount: riskAnalysis.risks?.filter(r => r.riskLevel === 'high').length || 0,
          mediumRiskCount: riskAnalysis.risks?.filter(r => r.riskLevel === 'medium').length || 0,
          lowRiskCount: riskAnalysis.risks?.filter(r => r.riskLevel === 'low').length || 0,
          risks: riskAnalysis.risks || [],
          recommendations: riskAnalysis.recommendations || [],
          executiveSummary: riskAnalysis.executiveSummary || 'Risk analysis completed'
        }
        break
        
      case 'complete':
        const missingInfoAnalysis = await extractMissingInfo(content)
        // Handle the response format with processed content
        result = { 
          missingInfo: missingInfoAnalysis.missingInfo || [],
          processingSteps: missingInfoAnalysis.processingSteps || {},
          processedContent: missingInfoAnalysis.processedContent || content
        }
        break
        
      case 'chat':
        if (!question) {
          return NextResponse.json(
            { error: 'Question is required for chat' },
            { status: 400 }
          )
        }
        const response = await chatWithContract(content, question, previousMessages)
        result = { response }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        )
    }
    
    // Cache the results
    if (contractId && (type === 'summary' || type === 'risks' || type === 'complete')) {
      await contractsApi.updateAnalysisCache(contractId, type, result)
    }
    
    // Add success breadcrumb
    addSentryBreadcrumb(`Contract analysis completed: ${type}`, 'contract', 'info', {
      contractId,
      analysisType: type,
      success: true
    })
    
    return NextResponse.json(result)
    
  } catch (error) {
    // Capture contract-specific error
    captureContractError(error as Error, contractId, `analysis_${type}`, {
      analysisType: type,
      userId: user.id,
      contentLength: content?.length
    })
    throw error // Re-throw for apiErrorHandler to handle
  }
})