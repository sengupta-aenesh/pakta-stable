import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

// GET /api/template-version?templateId=xxx - Get all versions for a template
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

  const supabase = createClient()

  // First verify the template belongs to the user
  const { data: template } = await supabase
    .from('templates')
    .select('id')
    .eq('id', templateId)
    .eq('user_id', user.id)
    .single()

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Get all versions for this template
  const { data: versions, error } = await supabase
    .from('template_versions')
    .select('*')
    .eq('template_id', templateId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching template versions:', error)
    return NextResponse.json({ error: 'Failed to fetch template versions' }, { status: 500 })
  }

  return NextResponse.json(versions || [])
})

// POST /api/template-version - Create a new template version
export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { template_id, version_name, vendor_name, version_data, generated_content } = body

  if (!template_id || !version_name?.trim() || !vendor_name?.trim()) {
    return NextResponse.json({ 
      error: 'Template ID, version name, and vendor name are required' 
    }, { status: 400 })
  }

  const supabase = createClient()

  // Verify the template belongs to the user
  const { data: template } = await supabase
    .from('templates')
    .select('id')
    .eq('id', template_id)
    .eq('user_id', user.id)
    .single()

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Check if version name already exists for this template
  const { data: existingVersion } = await supabase
    .from('template_versions')
    .select('id')
    .eq('template_id', template_id)
    .eq('version_name', version_name.trim())
    .single()

  if (existingVersion) {
    return NextResponse.json({ 
      error: 'A version with this name already exists for this template' 
    }, { status: 409 })
  }

  // Create the new version
  const { data: newVersion, error } = await supabase
    .from('template_versions')
    .insert({
      template_id,
      version_name: version_name.trim(),
      vendor_name: vendor_name.trim(),
      version_data: version_data || {},
      generated_content: generated_content || null,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template version:', error)
    return NextResponse.json({ error: 'Failed to create template version' }, { status: 500 })
  }

  return NextResponse.json(newVersion, { status: 201 })
})