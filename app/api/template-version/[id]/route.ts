import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

// GET /api/template-version/[id] - Get specific template version by ID
export const GET = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const supabase = createClient()

  // Get the version and verify ownership through the template
  const { data: version, error } = await supabase
    .from('template_versions')
    .select(`
      *,
      templates!inner(user_id)
    `)
    .eq('id', id)
    .eq('templates.user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template version not found' }, { status: 404 })
    }
    console.error('Error fetching template version:', error)
    return NextResponse.json({ error: 'Failed to fetch template version' }, { status: 500 })
  }

  return NextResponse.json(version)
})

// PUT /api/template-version/[id] - Update specific template version
export const PUT = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const body = await request.json()
  const { version_name, vendor_name, version_data, generated_content } = body

  if (version_name && !version_name.trim()) {
    return NextResponse.json({ error: 'Version name cannot be empty' }, { status: 400 })
  }

  if (vendor_name && !vendor_name.trim()) {
    return NextResponse.json({ error: 'Vendor name cannot be empty' }, { status: 400 })
  }

  const supabase = createClient()

  // First verify ownership through the template
  const { data: existingVersion } = await supabase
    .from('template_versions')
    .select(`
      id,
      template_id,
      version_name,
      templates!inner(user_id)
    `)
    .eq('id', id)
    .eq('templates.user_id', user.id)
    .single()

  if (!existingVersion) {
    return NextResponse.json({ error: 'Template version not found' }, { status: 404 })
  }

  // Check if new version name conflicts with existing versions (if version name is being changed)
  if (version_name && version_name.trim() !== existingVersion.version_name) {
    const { data: conflictingVersion } = await supabase
      .from('template_versions')
      .select('id')
      .eq('template_id', existingVersion.template_id)
      .eq('version_name', version_name.trim())
      .neq('id', id)
      .single()

    if (conflictingVersion) {
      return NextResponse.json({ 
        error: 'A version with this name already exists for this template' 
      }, { status: 409 })
    }
  }

  // Build update object dynamically
  const updateData: any = {}
  if (version_name !== undefined) updateData.version_name = version_name.trim()
  if (vendor_name !== undefined) updateData.vendor_name = vendor_name.trim()
  if (version_data !== undefined) updateData.version_data = version_data
  if (generated_content !== undefined) updateData.generated_content = generated_content

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: updatedVersion, error } = await supabase
    .from('template_versions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating template version:', error)
    return NextResponse.json({ error: 'Failed to update template version' }, { status: 500 })
  }

  return NextResponse.json(updatedVersion)
})

// DELETE /api/template-version/[id] - Delete specific template version
export const DELETE = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const supabase = createClient()

  // Verify ownership through the template before deleting
  const { data: version } = await supabase
    .from('template_versions')
    .select(`
      id,
      templates!inner(user_id)
    `)
    .eq('id', id)
    .eq('templates.user_id', user.id)
    .single()

  if (!version) {
    return NextResponse.json({ error: 'Template version not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('template_versions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting template version:', error)
    return NextResponse.json({ error: 'Failed to delete template version' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})