import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

// GET /api/template-folder - Get all template folders for authenticated user
export const GET = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const includeTemplateCount = searchParams.get('includeCount') === 'true'

  let query = supabase
    .from('template_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  const { data: folders, error } = await query

  if (error) {
    console.error('Error fetching template folders:', error)
    return NextResponse.json({ error: 'Failed to fetch template folders' }, { status: 500 })
  }

  // If requested, include template count for each folder
  if (includeTemplateCount && folders) {
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const { count } = await supabase
          .from('templates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('folder_id', folder.id)

        return {
          ...folder,
          template_count: count || 0
        }
      })
    )

    return NextResponse.json(foldersWithCount)
  }

  return NextResponse.json(folders || [])
})

// POST /api/template-folder - Create a new template folder
export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, parent_id } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
  }

  const supabase = createClient()

  // Check if folder with this name already exists for this user
  const { data: existingFolder } = await supabase
    .from('template_folders')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', name.trim())
    .eq('parent_id', parent_id || null)
    .single()

  if (existingFolder) {
    return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 })
  }

  // Template folders don't support nesting (parent_id should always be null)
  const { data: folder, error } = await supabase
    .from('template_folders')
    .insert({
      user_id: user.id,
      name: name.trim(),
      parent_id: null // Always null for template folders
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template folder:', error)
    return NextResponse.json({ error: 'Failed to create template folder' }, { status: 500 })
  }

  return NextResponse.json(folder, { status: 201 })
})