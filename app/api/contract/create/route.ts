import { NextRequest, NextResponse } from "next/server";

// Vercel serverless function configuration
export const maxDuration = 60; // 1 minute for simple contract creation
export const dynamic = 'force-dynamic';
import { createSimpleContractCreatorGraph } from "@/lib/agents/contract-creator/simple-graph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Contract creation API called");
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", user.id);

    const body = await request.json();
    const { sessionId, message } = body;

    console.log("Request body:", { sessionId, message });

    if (!message || typeof message !== 'string') {
      console.log("Invalid message");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // For now, use in-memory session management to avoid database issues
    let conversationHistory: Array<{ role: string; content: string }> = [];
    let currentState: any = {};

    console.log("Creating simple contract creator graph...");
    const graph = createSimpleContractCreatorGraph();
    
    // Prepare input
    const input = {
      ...currentState,
      messages: [
        ...conversationHistory.map(msg => 
          msg.role === "human" 
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        ),
        new HumanMessage(message),
      ],
    };

    console.log("Running graph with input:", JSON.stringify({
      ...input,
      messages: input.messages.map((m: any) => ({ type: m._getType(), content: m.content }))
    }, null, 2));
    
    // Run the graph
    const result = await graph.invoke(input);
    
    console.log("Graph result:", JSON.stringify({
      ...result,
      messages: result.messages?.map((m: any) => ({ type: m._getType(), content: m.content })) || []
    }, null, 2));

    // If contract is complete, create a contract record
    if (result.generatedContract) {
      console.log("Contract generated, creating database record...");
      
      try {
        const { data: contract } = await supabase
          .from("contracts")
          .insert({
            user_id: user.id,
            title: `${result.detectedContractType || 'Contract'} Agreement - ${new Date().toLocaleDateString()}`,
            content: result.generatedContract,
            analysis_cache: {
              editableFields: result.editableFields,
              parameters: result.collectedParameters,
            },
          })
          .select()
          .single();

        console.log("Contract created with ID:", contract?.id);

        return NextResponse.json({
          session: {
            ...result,
            id: `temp-${Date.now()}`, // Temporary session ID
            messages: result.messages || [],
          },
          contractId: contract?.id,
          completed: true,
        });
      } catch (dbError) {
        console.error("Database error when creating contract:", dbError);
        // Continue anyway, return the result without saving to DB
      }
    }

    return NextResponse.json({
      session: {
        ...result,
        id: sessionId || `temp-${Date.now()}`,
        messages: result.messages || [],
      },
    });
  } catch (error) {
    console.error("Contract creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "Unknown error");
    console.error("Error details:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}