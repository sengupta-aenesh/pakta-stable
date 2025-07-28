import { NextRequest, NextResponse } from 'next/server'

// Redirect to the simplified analysis endpoint
export async function POST(request: NextRequest) {
  console.log('🔄 Redirecting to simplified template analysis')
  
  const body = await request.json()
  
  // Forward the request to the new simplified endpoint
  const baseUrl = request.nextUrl.origin
  const response = await fetch(`${baseUrl}/api/template/analyze-simple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward cookies for authentication
      'Cookie': request.headers.get('cookie') || ''
    },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  
  return NextResponse.json(data, { status: response.status })
}