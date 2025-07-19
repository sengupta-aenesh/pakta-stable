import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { templateId, version_name, vendor_name, notes } = body

    if (!templateId || !version_name) {
      return NextResponse.json(
        { error: 'Template ID and version name are required' },
        { status: 400 }
      )
    }

    // Get the current template content
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Create a new version entry
    const versionData = {
      template_id: templateId,
      user_id: user.id,
      version_name,
      vendor_name: vendor_name || null,
      content: template.content,
      analysis_cache: template.analysis_cache,
      resolved_risks: template.resolved_risks || [],
      notes: notes || null,
      created_at: new Date().toISOString()
    }

    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .insert(versionData)
      .select()
      .single()

    if (versionError) {
      console.error('Version creation error:', versionError)
      return NextResponse.json(
        { error: 'Failed to create version' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      version
    })

  } catch (error) {
    console.error('Template version creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const templateId = url.searchParams.get('templateId')

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Get all versions for the template
    const { data: versions, error: versionsError } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (versionsError) {
      console.error('Versions fetch error:', versionsError)
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      versions: versions || []
    })

  } catch (error) {
    console.error('Template versions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}