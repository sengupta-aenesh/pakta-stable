import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    versionId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
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

    return NextResponse.json({
      success: true,
      version
    })

  } catch (error) {
    console.error('Template version fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
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
    const { version_name, vendor_name, notes } = body

    const { data: version, error: updateError } = await supabase
      .from('template_versions')
      .update({
        version_name,
        vendor_name,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.versionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Version update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update version' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      version
    })

  } catch (error) {
    console.error('Template version update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

    const { error: deleteError } = await supabase
      .from('template_versions')
      .delete()
      .eq('id', params.versionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Version delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete version' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Version deleted successfully'
    })

  } catch (error) {
    console.error('Template version delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}