import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

// GET /api/template - Get all templates for authenticated user
export const GET = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  let query = supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Filter by folder if specified
  if (folderId) {
    query = query.eq('folder_id', folderId)
  } else if (folderId === null) {
    // Show only uncategorized templates (no folder)
    query = query.is('folder_id', null)
  }

  const { data: templates, error } = await query

  if (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }

  return NextResponse.json(templates || [])
})

// POST /api/template - Create a new template
export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, upload_url, file_key, folder_id } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Template title is required' }, { status: 400 })
  }

  const supabase = createClient()
  
  const { data: template, error } = await supabase
    .from('templates')
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content || null,
      upload_url: upload_url || null,
      file_key: file_key || null,
      folder_id: folder_id || null,
      analysis_cache: {},
      analysis_status: 'pending',
      analysis_progress: 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }

  return NextResponse.json(template, { status: 201 })
})