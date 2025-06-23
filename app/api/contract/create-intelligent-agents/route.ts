import { NextRequest, NextResponse } from "next/server";

// Vercel serverless function configuration
export const maxDuration = 300; // 5 minutes - maximum allowed on Pro plan
export const dynamic = 'force-dynamic';
import { createExpertContractCreatorGraph } from "@/lib/agents/expert-contract-creator/graph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createClient } from "@/lib/supabase/server";

// Streaming wrapper to provide real-time agent status updates
function createStreamingWrapper(graph: any, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  const agentStatusMap = {
    'legal_intake': 'Legal Intake Agent: Senior Partner analyzing client requirements...',
    'jurisdiction_analysis': 'Jurisdiction Intelligence Agent: International law expert reviewing compliance...',
    'template_discovery': 'Template Research Agent: Legal research director discovering authoritative templates...',
    'contract_architecture': 'Contract Architecture Agent: Senior transactional attorney designing structure...',
    'contract_drafting': 'Drafting Specialist Agent: Corporate counsel creating comprehensive agreement...',
    'legal_review': 'Legal Review Agent: Senior legal advisor conducting quality assessment...'
  };

  return {
    invoke: async (input: any) => {
      // Add streaming interceptor to track agent progression
      const originalInvoke = graph.invoke.bind(graph);
      
      // Create a promise that resolves with the final result
      const resultPromise = originalInvoke(input);
      
      // Simulate agent progression updates (in a real implementation, this would hook into LangGraph's streaming)
      const agents = Object.keys(agentStatusMap);
      let currentAgentIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (currentAgentIndex < agents.length) {
          const currentAgent = agents[currentAgentIndex];
          const status = agentStatusMap[currentAgent];
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'thinking',
            data: { agent: currentAgent.replace('_', ' '), status }
          })}\n\n`));
          
          currentAgentIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 3000); // Update every 3 seconds
      
      try {
        const result = await resultPromise;
        clearInterval(progressInterval);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Intelligent Agents API called");
    
    // Track request start time for timeout handling
    const requestStartTime = Date.now();
    const MAX_PROCESSING_TIME = 280000; // 4 minutes 40 seconds (leaving buffer before 5min limit)
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("❌ Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    const body = await request.json();
    const { sessionId, message, streaming = false } = body;

    console.log("📝 Request body:", { sessionId, message, streaming });

    if (!message || typeof message !== 'string') {
      console.log("❌ Invalid message");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user's legal profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log("👤 User profile loaded:", profile?.id);

    // Handle streaming response
    if (streaming) {
      console.log("🌊 Starting streaming response...");
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send initial status
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'status',
              data: { message: 'Initializing legal AI team...' }
            })}\n\n`));

            // Check if we should use expert graph or fallback to simple
            const timeElapsed = Date.now() - requestStartTime;
            const shouldUseSimpleGraph = timeElapsed > 30000; // If already 30 seconds elapsed, use simple
            
            let graph;
            if (shouldUseSimpleGraph) {
              console.log("⚡ Using simple graph due to time constraints...");
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'status',
                data: { message: 'Optimizing for speed - using streamlined AI workflow...' }
              })}\n\n`));
              
              const { createSimpleContractCreatorGraph } = await import("@/lib/agents/contract-creator/simple-graph");
              graph = createSimpleContractCreatorGraph();
            } else {
              console.log("🏗️ Using expert multi-agent graph...");
              graph = createExpertContractCreatorGraph();
            }
            
            // Prepare conversation history (simplified for now)
            let conversationHistory: Array<{ role: string; content: string }> = [];
            
            const input = {
              messages: [
                ...conversationHistory.map(msg => 
                  msg.role === "human" 
                    ? new HumanMessage(msg.content)
                    : new AIMessage(msg.content)
                ),
                new HumanMessage(message),
              ],
              userProfile: profile,
              sessionId: sessionId || `session-${Date.now()}`,
            };

            // Send initial agent status
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'agent',
              data: { name: 'Legal Intake Agent', status: 'Analyzing your contract request...' }
            })}\n\n`));

            // Create a streaming wrapper that provides status updates
            const streamingGraph = createStreamingWrapper(graph, controller, encoder);
            
            // Run the graph with timeout protection
            const graphPromise = streamingGraph.invoke(input);
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Graph execution timeout - switching to fallback mode'));
              }, MAX_PROCESSING_TIME - (Date.now() - requestStartTime));
            });
            
            let result;
            try {
              result = await Promise.race([graphPromise, timeoutPromise]);
            } catch (timeoutError) {
              console.warn("⚠️ Graph timeout, attempting fallback...");
              
              // Send timeout notification
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'status',
                data: { message: 'Processing is taking longer than expected, generating basic contract...' }
              })}\n\n`));
              
              // Fallback to simple graph
              const { createSimpleContractCreatorGraph } = await import("@/lib/agents/contract-creator/simple-graph");
              const fallbackGraph = createSimpleContractCreatorGraph();
              result = await fallbackGraph.invoke(input);
            }
            
            console.log("🎯 Sophisticated legal team completed analysis");

            // Send final response
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'response',
              data: {
                message: result.messages?.[result.messages.length - 1]?.content || "Our legal team is ready to assist you. Could you provide more details about your contract requirements?",
                sessionId: sessionId || `session-${Date.now()}`
              }
            })}\n\n`));

            // Check if contract is complete
            if (result.generatedContract) {
              console.log("📄 Contract generated, creating database record...");
              
              try {
                const { data: contract } = await supabase
                  .from("contracts")
                  .insert({
                    user_id: user.id,
                    title: `${result.contractType || 'Legal'} Agreement - ${new Date().toLocaleDateString()}`,
                    content: result.generatedContract,
                    analysis_cache: {
                      editableFields: result.editableFields,
                      parameters: result.collectedParameters,
                      legalMetadata: {
                        contractType: result.contractType,
                        jurisdiction: result.jurisdiction,
                        complexity: result.contractComplexity,
                        agentInsights: result.agentInsights || {}
                      }
                    },
                  })
                  .select()
                  .single();

                console.log("✅ Contract created with ID:", contract?.id);

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'complete',
                  data: {
                    message: 'Your contract has been successfully created and is ready for review!',
                    contractId: contract?.id,
                    contractDraft: result.generatedContract
                  }
                })}\n\n`));
              } catch (dbError) {
                console.error("❌ Database error when creating contract:", dbError);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'error',
                  data: { message: 'Contract generated but failed to save. Please try again.' }
                })}\n\n`));
              }
            }

          } catch (error) {
            console.error("❌ Streaming error:", error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              data: { message: 'An error occurred while processing your request. Please try again.' }
            })}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Fallback to non-streaming response
    console.log("📦 Creating non-streaming response...");
    
    // For now, use simple graph as fallback
    const { createSimpleContractCreatorGraph } = await import("@/lib/agents/contract-creator/simple-graph");
    const graph = createSimpleContractCreatorGraph();
    
    const input = {
      messages: [new HumanMessage(message)],
      userProfile: profile,
    };

    const result = await graph.invoke(input);
    
    // If contract is complete, create a contract record
    if (result.generatedContract) {
      console.log("📄 Contract generated, creating database record...");
      
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

        console.log("✅ Contract created with ID:", contract?.id);

        return NextResponse.json({
          session: {
            ...result,
            id: sessionId || `temp-${Date.now()}`,
            messages: result.messages || [],
          },
          contractId: contract?.id,
          completed: true,
        });
      } catch (dbError) {
        console.error("❌ Database error when creating contract:", dbError);
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
    console.error("❌ Intelligent agents error:", error);
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