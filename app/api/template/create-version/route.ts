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
    const { templateId, variables, createdAt, vendorName } = await request.json()

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
      console.error('Template lookup error:', templateError)
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Generate template content with systematic variable replacement
    console.log('🔄 Starting template version generation with normalized content:', {
      templateId,
      originalLength: template.content?.length || 0,
      variableCount: variables.length
    })
    
    // Template content is already normalized with standardized {{Variable_Name}} format
    let generatedContent = template.content || ''
    
    // Replace standardized variables with user input
    variables.forEach((variable: any) => {
      if (variable.value && variable.value.trim()) {
        // Use the standardized variable format: {{Variable_Name}}
        const standardizedVariable = `{{${variable.label.replace(/\s+/g, '_')}}}`
        const standardizedPattern = new RegExp(standardizedVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        
        const beforeReplace = generatedContent
        generatedContent = generatedContent.replace(standardizedPattern, variable.value)
        
        if (beforeReplace !== generatedContent) {
          console.log('✅ Replaced standardized variable:', standardizedVariable, '→', variable.value)
        } else {
          console.warn('⚠️ Standardized variable not found in template:', standardizedVariable)
        }
      }
    })
    
    console.log('🔄 Template version generation completed:', {
      originalLength: template.content?.length || 0,
      generatedLength: generatedContent.length,
      hasChanges: generatedContent !== template.content,
      replacedVariables: variables.filter((v: any) => v.value?.trim()).length
    })

    // Create template version with variables - matching database schema
    const versionData = {
      template_id: templateId,
      version_name: `Version ${new Date().toLocaleString()}`,
      vendor_name: vendorName || 'Default Vendor', // Required field in schema
      version_data: variables, // Variable definitions
      generated_content: generatedContent, // Actual template with variables replaced
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