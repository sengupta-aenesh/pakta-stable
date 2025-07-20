import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

// GET /api/template/[id] - Get specific template by ID
export const GET = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    console.error('Error fetching template:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }

  return NextResponse.json(template)
})

// PUT /api/template/[id] - Update specific template
export const PUT = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  
  try {
    const body = await request.json()
    const { title, content, folder_id, resolved_risks } = body


    if (title && !title.trim()) {
      return NextResponse.json({ error: 'Template title cannot be empty' }, { status: 400 })
    }

    const supabase = await createClient()

    // Build update object dynamically
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content
    if (folder_id !== undefined) updateData.folder_id = folder_id
    if (resolved_risks !== undefined) {
      // Validate resolved_risks is an array
      if (!Array.isArray(resolved_risks)) {
        console.error('❌ resolved_risks must be an array, got:', typeof resolved_risks)
        return NextResponse.json({ error: 'Resolved risks must be an array' }, { status: 400 })
      }
      updateData.resolved_risks = resolved_risks
    }

    const { data: template, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error updating template:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      
      // Return more specific error information
      return NextResponse.json({ 
        error: 'Failed to update template', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json(template)
    
  } catch (requestError) {
    console.error('❌ Request processing error:', {
      message: requestError.message,
      stack: requestError.stack,
      name: requestError.name,
      cause: requestError.cause
    })
    
    // Return detailed error information for debugging
    return NextResponse.json({ 
      error: 'Request processing failed', 
      details: requestError.message,
      stack: process.env.NODE_ENV !== 'production' ? requestError.stack : undefined
    }, { status: 500 })
  }
})

// DELETE /api/template/[id] - Delete specific template
export const DELETE = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const supabase = await createClient()

  // First, delete all versions associated with this template
  const { error: versionsError } = await supabase
    .from('template_versions')
    .delete()
    .eq('template_id', id)

  if (versionsError) {
    console.error('Error deleting template versions:', versionsError)
    return NextResponse.json({ error: 'Failed to delete template versions' }, { status: 500 })
  }

  // Then delete the template itself
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})