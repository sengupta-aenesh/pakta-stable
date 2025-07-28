import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { analyzeTemplate, normalizeTemplateContent } from '@/lib/openai-template-simple'
import { templatesApi } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🚀 Simple template analysis endpoint called')
  
  try {
    // Auth check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { templateId, forceRefresh = false } = await request.json()
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }
    
    // Get template
    const template = await templatesApi.getById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    if (!template.content || template.content.trim().length === 0) {
      return NextResponse.json({ error: 'Template has no content to analyze' }, { status: 400 })
    }
    
    // Check cache unless force refresh
    if (!forceRefresh && template.analysis_status === 'complete' && template.analysis_cache) {
      console.log('📦 Returning cached analysis')
      return NextResponse.json({
        status: 'complete',
        cached: true,
        data: template.analysis_cache
      })
    }
    
    // If force refresh, clear the cache first
    if (forceRefresh) {
      console.log('🔄 Force refresh requested, clearing cache...')
      await templatesApi.update(templateId, {
        analysis_cache: null,
        analysis_status: 'pending',
        analysis_progress: 0
      })
    }
    
    // Update status to in_progress
    await templatesApi.update(templateId, {
      analysis_status: 'in_progress',
      analysis_progress: 10,
      analysis_error: null
    })
    
    try {
      console.log('🔍 Starting template analysis...')
      console.log('Template details:', {
        id: templateId,
        contentLength: template.content.length,
        hasContent: !!template.content
      })
      
      // Perform the analysis
      const analysisResult = await analyzeTemplate(template.content)
      console.log('🎯 Analysis result received:', {
        hasVariables: analysisResult.variables?.length > 0,
        variableCount: analysisResult.variables?.length || 0
      })
      
      // Normalize the template content if variables were found
      let normalizedContent = template.content
      if (analysisResult.variables.length > 0) {
        normalizedContent = normalizeTemplateContent(template.content, analysisResult.variables)
        
        // Update template content if it changed
        if (normalizedContent !== template.content) {
          console.log('💾 Saving normalized template content')
          await templatesApi.update(templateId, { content: normalizedContent })
        }
      }
      
      // Format for UI compatibility
      const formattedCache = {
        summary: {
          overview: analysisResult.summary.overview,
          contract_type: analysisResult.summary.templateType,
          key_terms: {
            template_fields: `${analysisResult.summary.totalVariables} customizable fields`,
            variable_sections: 'Template sections ready for customization',
            reusability_score: '8/10'
          }
        },
        complete: {
          missingInfo: analysisResult.variables.map(v => ({
            id: v.id,
            label: v.label,
            description: v.description,
            placeholder: v.placeholder,
            fieldType: v.fieldType,
            importance: 'important',
            userInput: '',
            occurrences: v.occurrences
          }))
        }
      }
      
      // Save to cache
      await templatesApi.update(templateId, {
        analysis_status: 'complete',
        analysis_progress: 100,
        analysis_cache: formattedCache,
        last_analyzed_at: new Date().toISOString()
      })
      
      console.log('✅ Template analysis complete, variables detected:', formattedCache.complete.missingInfo.length)
      
      return NextResponse.json({
        status: 'complete',
        cached: false,
        data: formattedCache,
        variableCount: formattedCache.complete.missingInfo.length
      })
      
    } catch (analysisError) {
      console.error('❌ Analysis failed:', analysisError)
      console.error('Error details:', {
        message: (analysisError as Error).message,
        stack: (analysisError as Error).stack
      })
      
      // Update status to failed
      await templatesApi.update(templateId, {
        analysis_status: 'failed',
        analysis_progress: 0,
        analysis_error: (analysisError as Error).message
      })
      
      throw analysisError
    }
    
  } catch (error) {
    console.error('❌ Template analysis error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Analysis failed' },
      { status: 500 }
    )
  }
}

// Simple status check endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('templateId')
  
  if (!templateId) {
    return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
  }
  
  try {
    const template = await templatesApi.getById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      templateId,
      status: template.analysis_status || 'pending',
      progress: template.analysis_progress || 0,
      hasCache: !!template.analysis_cache,
      error: template.analysis_error
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}