import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { captureContractError, addSentryBreadcrumb, setSentryUser } from '@/lib/sentry-utils'
import { summarizeTemplate, identifyTemplateRisks, extractTemplateFields, compareTemplateRisks } from '@/lib/openai'
import { templatesApi } from '@/lib/supabase'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  setSentryUser({
    id: user.id,
    email: user.email
  })

  const { templateId, forceRefresh = false } = await request.json()

  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  addSentryBreadcrumb('Template auto-analysis started', 'template', 'info', {
    templateId,
    userId: user.id,
    forceRefresh
  })

  try {
    // Get template details
    const template = await templatesApi.getById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (!template.content || template.content.trim().length === 0) {
      return NextResponse.json({ error: 'Template has no content to analyze' }, { status: 400 })
    }

    // Check if analysis is already complete and not forcing refresh
    if (!forceRefresh && template.analysis_status === 'complete') {
      addSentryBreadcrumb('Template analysis already complete', 'template', 'info', {
        templateId,
        status: template.analysis_status
      })
      return NextResponse.json({ 
        message: 'Analysis already complete',
        progress: 100,
        status: 'complete'
      })
    }

    // Check if analysis is currently in progress
    if (template.analysis_status === 'in_progress') {
      return NextResponse.json({ 
        message: 'Analysis already in progress',
        progress: template.analysis_progress || 0,
        status: 'in_progress'
      })
    }

    // Start the analysis process
    await updateAnalysisStatus(templateId, 'in_progress', 0)
    
    const analysisResult = await performSequentialTemplateAnalysis(templateId, template.content, user.id)
    
    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Template auto-analysis error:', error)
    
    // Update status to failed
    await updateAnalysisStatus(templateId, 'failed', 0, (error as Error).message)
    
    captureContractError(error as Error, templateId, 'template_auto_analysis', {
      userId: user.id
    })
    
    throw error
  }
})

export async function performSequentialTemplateAnalysis(templateId: string, content: string, userId: string) {
  const maxRetries = 2
  let currentRetryCount = 0

  try {
    // Step 1: Summary Analysis (Progress: 0% -> 33%)
    addSentryBreadcrumb('Starting template summary analysis', 'template', 'info', { templateId })
    await updateAnalysisStatus(templateId, 'in_progress', 10, null, 'Starting summary analysis...')
    
    const summaryResult = await performWithRetry(
      () => summarizeTemplate(content), // Template-specific summary analysis
      maxRetries,
      'summary',
      templateId
    )

    if ('error' in summaryResult) {
      throw new Error(`Template summary analysis failed: ${summaryResult.message || 'Validation error'}`)
    }

    // Cache summary result
    await templatesApi.updateAnalysisCache(templateId, 'summary', summaryResult)
    await updateAnalysisStatus(templateId, 'summary_complete', 33, null, 'Summary analysis complete')

    // Step 2: Risk Analysis (Progress: 33% -> 66%)
    addSentryBreadcrumb('Starting template risk analysis', 'template', 'info', { templateId })
    await updateAnalysisStatus(templateId, 'in_progress', 40, null, 'Starting risk analysis...')
    
    const riskResult = await performWithRetry(
      () => identifyTemplateRisks(content), // Template-specific risk analysis
      maxRetries,
      'risks',
      templateId
    )

    // Get current template to check for resolved risks
    const currentTemplate = await templatesApi.getById(templateId)
    const resolvedRisks = currentTemplate?.resolved_risks || []
    
    console.log('🔍 Smart risk detection check:', {
      templateId,
      newRisksFound: riskResult.risks?.length || 0,
      resolvedRisksCount: resolvedRisks.length,
      hasResolvedRisks: resolvedRisks.length > 0,
      shouldCompareRisks: resolvedRisks.length > 0 && (riskResult.risks?.length || 0) > 0
    })
    
    // Smart risk comparison: filter out risks that match previously resolved ones
    let finalRisks = riskResult.risks || []
    let duplicatesFiltered = 0
    
    if (resolvedRisks.length > 0 && finalRisks.length > 0) {
      console.log('🎯 Starting smart risk comparison process')
      addSentryBreadcrumb('Starting smart risk comparison', 'template', 'info', { 
        templateId,
        newRisksCount: finalRisks.length,
        resolvedRisksCount: resolvedRisks.length
      })
      
      await updateAnalysisStatus(templateId, 'in_progress', 50, null, 'Comparing risks with resolved history...')
      
      try {
        console.log('🔄 Calling compareTemplateRisks function...')
        const comparisonResult = await compareTemplateRisks(finalRisks, resolvedRisks)
        console.log('✅ Comparison result received:', {
          duplicateRiskIds: comparisonResult.duplicateRiskIds,
          uniqueRisksCount: comparisonResult.uniqueRisks.length
        })
        
        finalRisks = comparisonResult.uniqueRisks
        duplicatesFiltered = comparisonResult.duplicateRiskIds.length
        
        console.log('🎯 Smart risk filtering completed:', {
          originalRisks: riskResult.risks?.length || 0,
          duplicatesFiltered,
          finalUniqueRisks: finalRisks.length,
          duplicateIds: comparisonResult.duplicateRiskIds
        })
        
        addSentryBreadcrumb('Smart risk comparison completed', 'template', 'info', {
          templateId,
          duplicatesFiltered,
          uniqueRisksRemaining: finalRisks.length
        })
        
      } catch (error) {
        console.error('❌ Risk comparison failed:', error)
        console.warn('⚠️ Risk comparison failed, keeping all risks')
        // Keep all risks if comparison fails
        finalRisks = riskResult.risks || []
      }
    } else {
      console.log('ℹ️ Skipping smart risk comparison:', {
        reason: resolvedRisks.length === 0 ? 'No resolved risks to compare against' : 'No new risks to compare',
        resolvedRisksCount: resolvedRisks.length,
        newRisksCount: finalRisks.length
      })
    }

    // Cache risk result - store complete RiskAnalysis object with smart filtering applied
    const riskAnalysisData: any = {
      overallRiskScore: riskResult.overallRiskScore || 0,
      totalRisksFound: finalRisks.length,
      duplicatesFiltered: duplicatesFiltered,
      originalRisksFound: riskResult.risks?.length || 0,
      highRiskCount: finalRisks.filter(r => r.riskLevel === 'high').length || 0,
      mediumRiskCount: finalRisks.filter(r => r.riskLevel === 'medium').length || 0,
      lowRiskCount: finalRisks.filter(r => r.riskLevel === 'low').length || 0,
      risks: finalRisks,
      recommendations: riskResult.recommendations || [],
      executiveSummary: riskResult.executiveSummary || 'Template risk analysis completed',
      smartFilteringApplied: resolvedRisks.length > 0
    }
    await templatesApi.updateAnalysisCache(templateId, 'risks', riskAnalysisData)
    await updateAnalysisStatus(templateId, 'risks_complete', 66, null, `Risk analysis complete${duplicatesFiltered > 0 ? ` (${duplicatesFiltered} duplicates filtered)` : ''}`)

    // Step 3: Template Field Analysis (Progress: 66% -> 100%)
    addSentryBreadcrumb('Starting template field analysis', 'template', 'info', { templateId })
    await updateAnalysisStatus(templateId, 'in_progress', 75, null, 'Starting template field analysis...')
    
    const completeResult = await performWithRetry(
      () => extractTemplateFields(content), // Template-specific field extraction
      maxRetries,
      'complete',
      templateId
    )

    // CRITICAL: Normalize template content after variable detection
    console.log('🔧 Starting template content normalization after variable detection...')
    
    let normalizedContent = content
    const detectedVariables = completeResult.missingInfo || []
    
    if (detectedVariables.length > 0) {
      console.log('🔄 Normalizing', detectedVariables.length, 'detected variables to standard format')
      
      // Replace each detected variable with standardized format
      detectedVariables.forEach((variable, index) => {
        if (variable.occurrences && variable.occurrences.length > 0) {
          variable.occurrences.forEach(occurrence => {
            if (occurrence.text && occurrence.text.trim()) {
              // Replace the exact occurrence text with standardized format
              const escapedText = occurrence.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              const exactTextPattern = new RegExp(escapedText, 'gi')
              const standardizedVariable = `{{${variable.label.replace(/\s+/g, '_')}}}`
              
              const beforeReplace = normalizedContent
              normalizedContent = normalizedContent.replace(exactTextPattern, standardizedVariable)
              
              if (beforeReplace !== normalizedContent) {
                console.log(`✅ Normalized variable ${index + 1}:`, occurrence.text, '→', standardizedVariable)
              }
            }
          })
        }
      })
      
      console.log('🔧 Template normalization completed:', {
        originalLength: content.length,
        normalizedLength: normalizedContent.length,
        hasChanges: normalizedContent !== content,
        variablesProcessed: detectedVariables.length
      })
      
      // CRITICAL: Update the actual template content in the database with normalized version
      if (normalizedContent !== content) {
        console.log('💾 Persisting normalized template content to database...')
        await templatesApi.update(templateId, { content: normalizedContent })
        console.log('✅ Normalized template content saved to database')
      }
    } else {
      console.log('ℹ️ No variables detected, skipping normalization')
    }

    // Cache template field result with normalized content
    await templatesApi.updateAnalysisCache(templateId, 'complete', {
      missingInfo: completeResult.missingInfo || [],
      variableSections: completeResult.variableSections || [],
      processingSteps: completeResult.processingSteps || {},
      processedContent: normalizedContent // Use normalized content
    })

    // Mark as complete
    await updateAnalysisStatus(templateId, 'complete', 100, null, 'Template analysis complete')

    addSentryBreadcrumb('Template auto-analysis completed successfully', 'template', 'info', { templateId })

    return {
      success: true,
      progress: 100,
      status: 'complete',
      message: `Template analysis completed successfully - template fields, risks${duplicatesFiltered > 0 ? ` (${duplicatesFiltered} duplicates filtered)` : ''}, and version control analyzed`,
      results: {
        summary: summaryResult,
        risks: {
          ...riskResult,
          risks: finalRisks,
          smartFilteringApplied: resolvedRisks.length > 0,
          duplicatesFiltered: duplicatesFiltered
        },
        complete: completeResult
      }
    }

  } catch (error) {
    console.error('Template sequential analysis failed:', error)
    await updateAnalysisStatus(templateId, 'failed', 0, (error as Error).message)
    throw error
  }
}

async function performWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  operationType: string,
  templateId: string
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await operation()
      
      // Reset retry count on success
      if (attempt > 1) {
        await updateRetryCount(templateId, 0)
      }
      
      return result
    } catch (error) {
      lastError = error as Error
      console.error(`Template ${operationType} analysis attempt ${attempt} failed:`, error)
      
      // Update retry count
      await updateRetryCount(templateId, attempt - 1)
      
      if (attempt <= maxRetries) {
        console.log(`Retrying template ${operationType} analysis (attempt ${attempt + 1}/${maxRetries + 1})`)
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
      }
    }
  }
  
  throw lastError || new Error(`Template ${operationType} analysis failed after ${maxRetries + 1} attempts`)
}

async function updateAnalysisStatus(
  templateId: string, 
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

    await templatesApi.update(templateId, updateData)

    // Log progress for debugging
    console.log(`Template ${templateId}: ${status} (${progress}%)${statusMessage ? ` - ${statusMessage}` : ''}`)
    
  } catch (error) {
    console.error('Failed to update template analysis status:', error)
  }
}

async function updateRetryCount(templateId: string, retryCount: number) {
  try {
    await templatesApi.update(templateId, {
      analysis_retry_count: retryCount
    })
  } catch (error) {
    console.error('Failed to update template retry count:', error)
  }
}