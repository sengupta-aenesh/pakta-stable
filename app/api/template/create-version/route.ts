import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { createClient } from '@/lib/supabase/server'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { templateId, variables, createdAt } = await request.json()

    if (!templateId || !variables || !Array.isArray(variables)) {
      return NextResponse.json({ 
        error: 'Template ID and variables array are required' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify template exists and belongs to user
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, title, content')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create template version with variables
    const versionData = {
      template_id: templateId,
      version_name: `Version ${new Date().toLocaleString()}`,
      variables_data: variables,
      created_at: createdAt || new Date().toISOString(),
      created_by: user.id
    }

    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .insert(versionData)
      .select()
      .single()

    if (versionError) {
      console.error('Error creating template version:', versionError)
      throw versionError
    }

    console.log('✅ Template version created successfully:', {
      templateId,
      versionId: version.id,
      variableCount: variables.length
    })

    return NextResponse.json({
      success: true,
      version: version,
      message: `Template version created with ${variables.length} variables`
    })

  } catch (error) {
    console.error('Template version creation error:', error)
    throw error
  }
})