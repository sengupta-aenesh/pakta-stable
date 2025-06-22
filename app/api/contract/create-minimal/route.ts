import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Minimal contract creation API called");
    
    const supabase = await createClient();
    console.log("Supabase client created");
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User check completed:", user?.id);
    
    if (!user) {
      console.log("Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message } = body;
    console.log("Request parsed:", { sessionId, message });

    if (!message || typeof message !== 'string') {
      console.log("Invalid message");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Simple response without LangChain
    const response = {
      session: {
        id: sessionId || `temp-${Date.now()}`,
        messages: [
          {
            role: "ai",
            content: "I received your message: '" + message + "'. This is a minimal test response without LangChain."
          }
        ]
      }
    };

    console.log("Sending response:", response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Minimal contract creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "Unknown error");
    
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}