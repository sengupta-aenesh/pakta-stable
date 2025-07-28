import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { captureContractError, addSentryBreadcrumb, setSentryUser } from '@/lib/sentry-utils'
import { summarizeTemplate, extractTemplateFields } from '@/lib/openai'
import { templatesApi } from '@/lib/supabase'
import { SubscriptionServiceServer } from '@/lib/services/subscription-server'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  console.log('🚀 Template auto-analyze endpoint called')
  
  const user = await getCurrentUser()
  if (!user) {
    console.error('❌ Template auto-analyze: User not authenticated')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  console.log('✅ User authenticated:', user.email)

  setSentryUser({
    id: user.id,
    email: user.email
  })

  const body = await request.json()
  const { templateId, forceRefresh = false } = body
  
  console.log('📋 Request body:', { templateId, forceRefresh })

  if (!templateId) {
    console.error('❌ Template ID is missing')
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  addSentryBreadcrumb('Template auto-analysis started', 'template', 'info', {
    templateId,
    userId: user.id,
    forceRefresh
  })

  try {
    // Get template details
    console.log('🔍 Fetching template:', templateId)
    const template = await templatesApi.getById(templateId)
    if (!template) {
      console.error('❌ Template not found:', templateId)
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    console.log('✅ Template found:', {
      id: template.id,
      title: template.title,
      hasContent: !!template.content,
      contentLength: template.content?.length || 0,
      analysisStatus: template.analysis_status
    })

    if (!template.content || template.content.trim().length === 0) {
      console.error('❌ Template has no content')
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
    
    // If forceRefresh is true, reset the analysis status and clear cache
    if (forceRefresh) {
      console.log('🔄 Force refresh requested, resetting analysis status and clearing cache')
      await templatesApi.update(templateId, {
        analysis_status: 'pending',
        analysis_progress: 0,
        analysis_cache: {},
        analysis_error: null
      })
      // Re-fetch template to get updated status
      template = await templatesApi.getById(templateId)
    }

    // Check if analysis is currently in progress
    if (!forceRefresh && template.analysis_status === 'in_progress') {
      return NextResponse.json({ 
        message: 'Analysis already in progress',
        progress: template.analysis_progress || 0,
        status: 'in_progress'
      })
    }

    // Start the analysis process
    await updateAnalysisStatus(templateId, 'in_progress', 5)
    
    // Start analysis in background
    performSequentialTemplateAnalysis(templateId, template, user.id)
      .then(result => {
        console.log('✅ Template analysis completed successfully')
      })
      .catch(error => {
        console.error('❌ Template analysis failed:', error)
        updateAnalysisStatus(templateId, 'failed', 0, error.message)
      })
    
    // Return immediately with in_progress status
    return NextResponse.json({
      status: 'in_progress',
      progress: 5,
      message: 'Template analysis started successfully'
    })

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

export async function performSequentialTemplateAnalysis(templateId: string, template: any, userId: string) {
  const maxRetries = 2
  let currentRetryCount = 0

  try {
    // Check if user has jurisdiction configuration
    const subscriptionService = new SubscriptionServiceServer()
    const userProfile = await subscriptionService.getUserProfile(userId)
    const hasJurisdictionConfig = !!(userProfile.primary_jurisdiction || userProfile.additional_jurisdictions?.length > 0)
    
    // If user has jurisdiction configuration, use enhanced analysis
    if (hasJurisdictionConfig) {
      addSentryBreadcrumb('Using enhanced jurisdiction-aware template analysis', 'template', 'info', { 
        templateId,
        primaryJurisdiction: userProfile.primary_jurisdiction 
      })
      
      // Redirect to enhanced analysis function
      const { performEnhancedTemplateAnalysis } = await import('../auto-analyze-enhanced/route')
      return await performEnhancedTemplateAnalysis(templateId, template, userId)
    }
    
    // Otherwise, continue with standard analysis
    addSentryBreadcrumb('Using standard template analysis (no jurisdiction config)', 'template', 'info', { templateId })
    const content = template.content
    
    // Step 1: Summary Analysis (Progress: 0% -> 33%)
    addSentryBreadcrumb('Starting template summary analysis', 'template', 'info', { templateId })
    await updateAnalysisStatus(templateId, 'in_progress', 10, null, 'Starting summary analysis...')
    
    const summaryResult = await performWithRetry(
      () => summarizeTemplate(content), // Template-specific summary analysis
      maxRetries,
      'summary',
      templateId
    )

    console.log('🔍 Template summary result:', {
      hasError: 'error' in summaryResult,
      resultKeys: Object.keys(summaryResult),
      contractType: summaryResult.contract_type,
      overview: summaryResult.overview?.substring(0, 100) + '...'
    })

    if ('error' in summaryResult) {
      throw new Error(`Template summary analysis failed: ${summaryResult.message || 'Validation error'}`)
    }

    // Cache summary result
    await templatesApi.updateAnalysisCache(templateId, 'summary', summaryResult)
    await updateAnalysisStatus(templateId, 'summary_complete', 50, null, 'Summary analysis complete')

    // Skip risk analysis - go directly to template field analysis
    // Step 2: Template Field Analysis (Progress: 50% -> 100%)
    addSentryBreadcrumb('Starting template field analysis', 'template', 'info', { templateId })
    await updateAnalysisStatus(templateId, 'in_progress', 75, null, 'Starting template field analysis...')
    
    const completeResult = await performWithRetry(
      () => extractTemplateFields(content), // Template-specific field extraction
      maxRetries,
      'complete',
      templateId
    )

    console.log('🔍 Template field extraction result:', {
      hasMissingInfo: !!completeResult.missingInfo,
      missingInfoCount: completeResult.missingInfo?.length || 0,
      hasVariableSections: !!completeResult.variableSections,
      variableSectionsCount: completeResult.variableSections?.length || 0,
      hasProcessedContent: !!completeResult.processedContent
    })

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
      message: 'Template analysis completed successfully - template fields and variables analyzed',
      results: {
        summary: summaryResult,
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