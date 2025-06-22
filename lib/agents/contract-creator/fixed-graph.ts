import { StateGraph, END } from "@langchain/langgraph";
import { ContractCreatorState } from "./state";
import * as ultraSimpleNodes from "./ultra-simple-nodes";

export function createFixedContractCreatorGraph() {
  try {
    console.log("Building fixed LangGraph workflow...");
    
    const workflow = new StateGraph(ContractCreatorState)
      .addNode("analyze_request", ultraSimpleNodes.ultraSimpleAnalyzeRequest)
      .addNode("collect_parameters", ultraSimpleNodes.ultraSimpleCollectParameters)
      .addNode("generate_contract", ultraSimpleNodes.ultraSimpleGenerateContract)
      .addNode("process_input", ultraSimpleNodes.ultraSimpleProcessUserInput);

    console.log("Added nodes to fixed workflow");

    // Simple linear flow to avoid recursion
    workflow.addEdge("analyze_request", "collect_parameters");
    workflow.addEdge("generate_contract", END);
    workflow.addEdge("process_input", END);
    
    console.log("Added linear edges");
    
    // Simplified conditional edges
    workflow.addConditionalEdges("collect_parameters", (state) => {
      console.log("Conditional edge - collect_parameters state:", {
        currentStep: state.currentStep,
        requiredParams: state.requiredParameters?.length || 0,
        collectedParams: Object.keys(state.collectedParameters || {}).length,
        missingCount: state.requiredParameters?.filter((p: any) => p.is_required && !state.collectedParameters[p.parameter_key]).length || 0
      });
      
      // If we have all required parameters, generate contract
      const missingParams = state.requiredParameters
        ?.filter((p: any) => p.is_required && !state.collectedParameters[p.parameter_key]) || [];
      
      if (missingParams.length === 0) {
        console.log("All parameters collected, generating contract");
        return "generate_contract";
      }
      
      // Otherwise, we need to ask for more parameters and END (let user respond)
      console.log("Missing parameters, ending to wait for user input");
      return END;
    });

    console.log("Added conditional edges");

    // Set entry point
    workflow.setEntryPoint("analyze_request");
    
    console.log("Set entry point, compiling fixed graph...");

    return workflow.compile();
  } catch (error) {
    console.error("Error creating fixed contract creator graph:", error);
    throw error;
  }
}