import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    versionId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createClient()
    const { 
      data: { user }, 
      error: authError 
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .select('*')
      .eq('id', params.versionId)
      .eq('user_id', user.id)
      .single()

    if (versionError || !version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }

    // Update the main template with the version's content
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('templates')
      .update({
        content: version.content,
        analysis_cache: version.analysis_cache,
        resolved_risks: version.resolved_risks,
        updated_at: new Date().toISOString()
      })
      .eq('id', version.template_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Template restore error:', updateError)
      return NextResponse.json(
        { error: 'Failed to restore template from version' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: `Template restored from version "${version.version_name}"`
    })

  } catch (error) {
    console.error('Template restore error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}