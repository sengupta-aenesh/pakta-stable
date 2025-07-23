import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { summarizeTemplate, identifyTemplateRisks, extractTemplateFields, compareTemplateRisks } from '@/lib/openai'
import { templatesApi } from '@/lib/supabase'
import { SubscriptionServiceServer } from '@/lib/services/subscription-server'
import { jurisdictionResearch, JurisdictionContext } from '@/lib/services/jurisdiction-research'
import { normalizeJurisdiction } from '@/lib/jurisdiction-utils'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId, forceRefresh = false } = await request.json()

  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

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
    if (!forceRefresh && template.analysis_status === 'complete' && template.analysis_cache) {
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
    await updateTemplateAnalysisStatus(templateId, 'in_progress', 0)
    
    const analysisResult = await performEnhancedTemplateAnalysis(templateId, template, user.id)
    
    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Template auto-analysis error:', error)
    
    // Update status to failed
    await updateTemplateAnalysisStatus(templateId, 'failed', 0, (error as Error).message)
    
    throw error
  }
})

export async function performEnhancedTemplateAnalysis(templateId: string, template: any, userId: string) {
  try {
    // Step 1: Fetch user profile for jurisdiction context
    await updateTemplateAnalysisStatus(templateId, 'in_progress', 5, null, 'Loading jurisdiction settings...')
    
    const subscriptionService = new SubscriptionServiceServer()
    const userProfile = await subscriptionService.getUserProfile(userId)
    
    // Prepare jurisdiction context
    let jurisdictionContext: JurisdictionContext | null = null
    let jurisdictionResearchText = ''
    
    if (userProfile.primary_jurisdiction || userProfile.additional_jurisdictions?.length > 0) {
      jurisdictionContext = {
        primary: userProfile.primary_jurisdiction || 'united-states',
        additional: Array.isArray(userProfile.additional_jurisdictions) 
          ? userProfile.additional_jurisdictions.map(j => 
              typeof j === 'string' 
                ? { code: j, name: j, purpose: 'general' }
                : j as any
            )
          : []
      }
      
      // Perform jurisdiction research for templates
      await updateTemplateAnalysisStatus(templateId, 'in_progress', 10, null, 'Searching template jurisdiction requirements...')
      const { research } = await jurisdictionResearch.researchJurisdictionRequirements(
        jurisdictionContext,
        'template',
        template.content
      )
      jurisdictionResearchText = jurisdictionResearch.formatResearchForAI(research)
    }

    // Step 2: Summary Analysis (Progress: 10% -> 33%)
    await updateTemplateAnalysisStatus(templateId, 'in_progress', 15, null, 'Analyzing template structure...')
    
    // Enhance prompts with jurisdiction context
    const enhancedContent = jurisdictionResearchText 
      ? `JURISDICTION CONTEXT:\n${jurisdictionResearchText}\n\nTEMPLATE CONTENT:\n${template.content}`
      : template.content
    
    const summaryResult = await summarizeTemplate(enhancedContent)
    
    // Cache summary result
    await templatesApi.updateAnalysisCache(templateId, 'summary', summaryResult)
    await updateTemplateAnalysisStatus(templateId, 'summary_complete', 33, null, 'Summary analysis complete')

    // Step 3: Risk Analysis (Progress: 33% -> 66%)
    await updateTemplateAnalysisStatus(templateId, 'in_progress', 40, null, 'Analyzing template risks...')
    
    const riskResult = await identifyTemplateRisks(enhancedContent)
    
    // If reanalysis, compare with resolved risks
    let filteredRisks = riskResult.risks || []
    let smartFilterInfo = null
    
    if (template.resolved_risks && template.resolved_risks.length > 0) {
      await updateTemplateAnalysisStatus(templateId, 'in_progress', 50, null, 'Comparing risks with resolved history...')
      
      const comparisonResult = await compareTemplateRisks(
        riskResult.risks || [],
        template.resolved_risks
      )
      
      filteredRisks = comparisonResult.uniqueRisks
      smartFilterInfo = {
        originalCount: riskResult.risks?.length || 0,
        filteredCount: filteredRisks.length,
        duplicatesRemoved: (riskResult.risks?.length || 0) - filteredRisks.length
      }
    }
    
    // Cache risk result with jurisdiction context
    const riskAnalysisData = {
      ...riskResult,
      risks: filteredRisks,
      smartFilterInfo,
      jurisdictionAnalysis: jurisdictionContext ? {
        primary: jurisdictionContext.primary,
        additional: jurisdictionContext.additional.map(j => j.name),
        hasJurisdictionContext: true
      } : null
    }
    
    await templatesApi.updateAnalysisCache(templateId, 'risks', riskAnalysisData)
    await updateTemplateAnalysisStatus(templateId, 'risks_complete', 66, null, 'Risk analysis complete')

    // Step 4: Template Fields Extraction (Progress: 66% -> 90%)
    await updateTemplateAnalysisStatus(templateId, 'in_progress', 75, null, 'Extracting template fields and variables...')
    
    const fieldsResult = await extractTemplateFields(template.content)
    
    // Cache fields result
    await templatesApi.updateAnalysisCache(templateId, 'fields', fieldsResult)
    await updateTemplateAnalysisStatus(templateId, 'in_progress', 90, null, 'Template fields extracted')

    // Step 5: Normalize template content with detected variables
    if (fieldsResult.detectedVariables && fieldsResult.detectedVariables.length > 0) {
      await updateTemplateAnalysisStatus(templateId, 'in_progress', 95, null, 'Normalizing template variables...')
      
      let normalizedContent = template.content
      
      // Sort variables by position (descending) to replace from end to start
      const sortedVariables = [...fieldsResult.detectedVariables].sort((a, b) => 
        (b.occurrences[0]?.position || 0) - (a.occurrences[0]?.position || 0)
      )
      
      // Replace each variable with standardized format
      for (const variable of sortedVariables) {
        const standardizedName = `{{${variable.name}}}`
        
        // Replace all occurrences
        for (const occurrence of variable.occurrences) {
          if (occurrence.position !== undefined && occurrence.length !== undefined) {
            const before = normalizedContent.substring(0, occurrence.position)
            const after = normalizedContent.substring(occurrence.position + occurrence.length)
            normalizedContent = before + standardizedName + after
          }
        }
      }
      
      // Update template content if it changed
      if (normalizedContent !== template.content) {
        await templatesApi.update(templateId, { 
          content: normalizedContent 
        })
      }
    }

    // Mark analysis as complete
    await updateTemplateAnalysisStatus(templateId, 'complete', 100, null, 'Analysis complete')

    return { 
      message: 'Analysis completed successfully',
      progress: 100,
      status: 'complete',
      hadJurisdictionContext: !!jurisdictionResearchText
    }

  } catch (error) {
    const errorMessage = (error as Error).message
    console.error('Template analysis error:', errorMessage)
    
    await templatesApi.update(templateId, {
      analysis_status: 'failed',
      analysis_progress: 0,
      analysis_error: errorMessage,
      analysis_retry_count: (template.analysis_retry_count || 0) + 1
    })
    
    throw error
  }
}

async function updateTemplateAnalysisStatus(
  templateId: string, 
  status: string, 
  progress: number, 
  error?: string | null,
  message?: string
) {
  await templatesApi.update(templateId, {
    analysis_status: status,
    analysis_progress: progress,
    analysis_error: error,
    last_analyzed_at: new Date().toISOString()
  })
}