import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Test API called");
    
    const body = await request.json();
    console.log("Request body:", body);
    
    return NextResponse.json({
      success: true,
      message: "Test API is working",
      receivedData: body
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { 
        error: "Test API failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}