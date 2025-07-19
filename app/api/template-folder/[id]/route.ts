import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

// GET /api/template-folder/[id] - Get specific template folder by ID
export const GET = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const supabase = createClient()

  const { data: folder, error } = await supabase
    .from('template_folders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template folder not found' }, { status: 404 })
    }
    console.error('Error fetching template folder:', error)
    return NextResponse.json({ error: 'Failed to fetch template folder' }, { status: 500 })
  }

  return NextResponse.json(folder)
})

// PUT /api/template-folder/[id] - Update specific template folder
export const PUT = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const body = await request.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
  }

  const supabase = createClient()

  // Check if another folder with this name already exists for this user
  const { data: existingFolder } = await supabase
    .from('template_folders')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', name.trim())
    .neq('id', id)
    .single()

  if (existingFolder) {
    return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 })
  }

  const { data: folder, error } = await supabase
    .from('template_folders')
    .update({
      name: name.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template folder not found' }, { status: 404 })
    }
    console.error('Error updating template folder:', error)
    return NextResponse.json({ error: 'Failed to update template folder' }, { status: 500 })
  }

  return NextResponse.json(folder)
})

// DELETE /api/template-folder/[id] - Delete specific template folder
export const DELETE = apiErrorHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const supabase = createClient()

  // Check if folder has any templates
  const { count: templateCount } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('folder_id', id)

  if (templateCount && templateCount > 0) {
    return NextResponse.json({ 
      error: 'Cannot delete folder that contains templates. Please move or delete templates first.' 
    }, { status: 409 })
  }

  const { error } = await supabase
    .from('template_folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting template folder:', error)
    return NextResponse.json({ error: 'Failed to delete template folder' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})