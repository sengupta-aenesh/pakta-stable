import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { templatesApi } from '@/lib/supabase'

export const GET = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('templateId')

  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  try {
    // Get template with analysis status
    const template = await templatesApi.getById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({
      templateId,
      status: template.analysis_status || 'pending',
      progress: template.analysis_progress || 0,
      lastAnalyzed: template.last_analyzed_at,
      retryCount: template.analysis_retry_count || 0,
      error: template.analysis_error,
      hasCache: {
        summary: !!(template.analysis_cache?.summary),
        complete: !!(template.analysis_cache?.complete)
      }
    })

  } catch (error) {
    console.error('Template analysis status check error:', error)
    throw error
  }
})

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId, action } = await request.json()

  if (!templateId || !action) {
    return NextResponse.json({ 
      error: 'Template ID and action are required' 
    }, { status: 400 })
  }

  try {
    const template = await templatesApi.getById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (action === 'reset') {
      // Reset analysis status to pending
      await templatesApi.update(templateId, {
        analysis_status: 'pending',
        analysis_progress: 0,
        analysis_retry_count: 0,
        analysis_error: null,
        last_analyzed_at: null
      })

      return NextResponse.json({
        success: true,
        message: 'Template analysis status reset to pending'
      })
    }

    if (action === 'clear_cache') {
      // Clear analysis cache
      await templatesApi.update(templateId, {
        analysis_cache: {},
        analysis_status: 'pending',
        analysis_progress: 0,
        analysis_retry_count: 0,
        analysis_error: null,
        last_analyzed_at: null
      })

      return NextResponse.json({
        success: true,
        message: 'Template analysis cache cleared and status reset'
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use "reset" or "clear_cache"' 
    }, { status: 400 })

  } catch (error) {
    console.error('Template analysis status update error:', error)
    throw error
  }
})